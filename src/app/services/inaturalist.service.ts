import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export interface TaxonDisplay {
  id: number;
  name: string;
  commonName: string;
  imageUrl?: string;
  iconic_taxon_name?: string;
}

@Injectable({ providedIn: 'root' })
export class InaturalistService {
  private readonly BASE_URL = 'https://api.inaturalist.org/v1';
  private readonly PLACE_ID = '36990'; // Tonalá Municipio

  constructor(private http: HttpClient) {}

  /**
   * Busca especies basadas en texto de búsqueda y/o grupo taxonómico icónico
   * @param texto Texto de búsqueda (puede estar vacío si se usa iconicGroup)
   * @param iconicGroup Grupo taxonómico icónico opcional (ej: 'Aves', 'Actinopterygii')
   */
  buscarEspecies(texto: string, iconicGroup?: string): Observable<TaxonDisplay[]> {
    if (!texto && !iconicGroup) return of([]);

    // Parámetros base para la búsqueda de observaciones
    const baseParams = new HttpParams()
      .set('place_id', this.PLACE_ID)
      .set('quality_grade', 'research,needs_id,casual') // Incluimos observaciones casuales
      .set('has', 'photos')
      .set('per_page', '200')
      .set('order_by', 'observed_on')
      .set('locale', 'es')
      .set('d1', '2000-01-01')
      .set('d2', new Date().toISOString().slice(0, 10));

    // Mapeo especial para términos comunes que podrían no dar resultados directos
    const termMap: {[key: string]: string} = {
      'perro': 'Canis lupus familiaris',
      'gato': 'Felis catus',
      'caballo': 'Equus caballus',
      'vaca': 'Bos taurus'
    };
    
    // Buscar animales comunes domésticos sin necesidad de autocompletar
    const terminoNormalizado = texto.trim().toLowerCase();
    if (termMap[terminoNormalizado]) {
      return this.http
        .get<{ results: any[] }>(`${this.BASE_URL}/taxa`, {
          params: new HttpParams()
            .set('q', termMap[terminoNormalizado])
            .set('locale', 'es')
        })
        .pipe(
          switchMap(res => {
            if (!res.results.length) return of([]);
            
            // Obtenemos el ID del taxón para el animal doméstico
            const taxonId = res.results[0].id;
            const params = baseParams.set('taxon_id', taxonId.toString());
            
            return this.buscarPorParams(params);
          }),
          catchError(err => {
            console.error('Error al obtener taxon_id para animal doméstico:', err);
            return of([]);
          })
        );
    }

    // Si tenemos un grupo icónico específico, buscamos directamente por ese grupo
    if (iconicGroup) {
      const params = baseParams.set('iconic_taxa', iconicGroup);
      return this.buscarPorParams(params);
    }

    // Si no hay grupo icónico pero sí hay texto, primero buscamos el taxón
    return this.http
      .get<{ results: any[] }>(`${this.BASE_URL}/taxa/autocomplete`, {
        params: new HttpParams()
          .set('q', texto.trim())
          .set('locale', 'es')
      })
      .pipe(
        switchMap(res => {
          if (!res.results.length) {
            // Si no hay resultados con autocompletar, intentamos búsqueda directa de nombre
            return this.buscarPorTextoDirecto(texto, baseParams);
          }
          
          // Obtenemos el ID del primer resultado de la autocompleción
          const taxonId = res.results[0].id;
          const params = baseParams.set('taxon_id', taxonId.toString());
          
          return this.buscarPorParams(params);
        }),
        catchError(err => {
          console.error('Error al obtener taxon_id:', err);
          // Intentamos búsqueda directa como fallback
          return this.buscarPorTextoDirecto(texto, baseParams);
        })
      );
  }

  /**
   * Búsqueda directa por texto en observaciones
   */
  private buscarPorTextoDirecto(texto: string, baseParams: HttpParams): Observable<TaxonDisplay[]> {
    const params = baseParams.set('q', texto.trim());
    return this.buscarPorParams(params);
  }
  
  /**
   * Método privado para buscar observaciones con parámetros específicos
   */
  private buscarPorParams(params: HttpParams): Observable<TaxonDisplay[]> {
    return this.http.get<{ results: any[] }>(`${this.BASE_URL}/observations`, { params }).pipe(
      map(obsRes => {
        const mapa = new Map<number, TaxonDisplay>();
        
        if (!obsRes.results || obsRes.results.length === 0) {
          return [];
        }
        
        obsRes.results.forEach(obs => {
          const t = obs.taxon;
          if (!t) return;
          
          // Solo guardamos una vez cada taxón por su ID
          if (!mapa.has(t.id)) {
            // Intentamos obtener la mejor foto disponible
            let imageUrl = t.default_photo?.medium_url;
            if (!imageUrl && obs.photos?.length > 0) {
              imageUrl = obs.photos[0].url || obs.photos[0].medium_url;
            }
            
            mapa.set(t.id, {
              id: t.id,
              name: t.name,
              commonName: t.preferred_common_name || t.name,
              imageUrl: imageUrl,
              iconic_taxon_name: t.iconic_taxon_name
            });
          }
        });
        
        return Array.from(mapa.values());
      }),
      catchError(err => {
        console.error('Error al obtener observaciones:', err);
        return of([]);
      })
    );
  }
}