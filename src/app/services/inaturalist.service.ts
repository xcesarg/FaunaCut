import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InaturalistService {
  private apiUrl = 'https://api.inaturalist.org/v1/observations';

  constructor(private http: HttpClient) { }
  buscarAnimales(termino: string): Observable<any> {
    const searchTerm = termino.trim().toLowerCase();
    
    return this.http.get(this.apiUrl, {
      params: {
        q: searchTerm,
        photos: 'true',
        verifiable: 'true',
        per_page: '100',
        lat: '20.6234',       // Coordenadas de Tonalá
        lng: '-103.2347',
        radius: '50',         // Radio de 50 km
        order_by: 'observed_on', // Resultados recientes primero
        locale: 'es',
        taxon_is_active: 'true',
        quality_grade: 'research,needs_id', // Solo observaciones verificadas o que necesitan ID
        // iconic_taxa: 'Mammalia', // Descomenta esto si solo quieres mamíferos
      }
    }).pipe(
      map(response => this.filtrarResultados(response, searchTerm)),
      catchError(error => {
        console.error('Error en la API:', error);
        return of({ results: [] });
      })
    );
  }
  
  private filtrarResultados(response: any, searchTerm: string): any {
    const resultadosFiltrados = (response.results || []).filter((obs: any) => {
      if (!obs.photos?.length) return false;
      
      // Búsqueda ampliada en múltiples campos
      const camposBusqueda = [
        obs.taxon?.preferred_common_name,
        obs.taxon?.name,
        obs.species_guess,
        obs.description
      ].filter(Boolean).join(' ').toLowerCase();
  
      return camposBusqueda.includes(searchTerm);
    });
  
    // Eliminar duplicados por taxón (especie)
    const uniqueResults = Array.from(new Map(
      resultadosFiltrados.map((obs: any) => [obs.taxon?.id || obs.id, obs])
    ).values());
  
    return {
      ...response,
      results: uniqueResults.slice(0, 20)
    };
  }}