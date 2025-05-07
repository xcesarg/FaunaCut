// animales.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { InaturalistService, TaxonDisplay } from '../../services/inaturalist.service';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-animales',
  standalone: true,
  imports: [HeaderComponent, NgFor, NgIf],
  templateUrl: './animales.component.html',
  styleUrls: ['./animales.component.css']
})
export class AnimalesComponent implements OnInit, OnDestroy {
  resultados: TaxonDisplay[] = [];
  termino: string = '';
  error: string | null = null;
  loading = false;
  
  // Para limpieza de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private svc: InaturalistService
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['search']) {
          this.termino = params['search'];
          this.buscar();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buscar() {
    if (!this.termino.trim()) return;
    
    this.loading = true;
    this.error = null;
    this.resultados = [];
  
    // Verificamos si es una búsqueda especial por tipo
    const termino = this.termino.trim().toLowerCase();
    let iconicGroup: string | undefined;
    
    // Términos comunes de animales domésticos (serán manejados directamente por el servicio)
    const animalesDomesticos = ['perro', 'gato', 'caballo', 'vaca'];
    
    // Mapeo de términos comunes a grupos taxonómicos
    if (['pez', 'peces', 'fish'].includes(termino)) {
      iconicGroup = 'Actinopterygii';
    } else if (['ave', 'aves', 'pájaro', 'pájaros', 'bird', 'birds'].includes(termino)) {
      iconicGroup = 'Aves';
    } else if (['mamífero', 'mamifero', 'mamíferos', 'mamiferos', 'mammal', 'mammals'].includes(termino)) {
      iconicGroup = 'Mammalia';
    } else if (['reptil', 'reptiles', 'reptile'].includes(termino)) {
      iconicGroup = 'Reptilia';
    } else if (['anfibio', 'anfibios', 'amphibian'].includes(termino)) {
      iconicGroup = 'Amphibia';
    } else if (['insecto', 'insectos', 'insect', 'insects'].includes(termino)) {
      iconicGroup = 'Insecta';
    } else if (['araña', 'arañas', 'arácnido', 'aracnido', 'arachnid'].includes(termino)) {
      iconicGroup = 'Arachnida';
    } else if (['planta', 'plantas', 'plant', 'plants'].includes(termino)) {
      iconicGroup = 'Plantae';
    } else if (['hongo', 'hongos', 'fungi', 'fungus'].includes(termino)) {
      iconicGroup = 'Fungi';
    }
  
    // Para búsquedas por grupo taxonómico, pasamos el término vacío y el grupo
    // Para animales domésticos y búsquedas normales, pasamos el término completo
    const textoConsulta = iconicGroup ? '' : this.termino;
  
    // Si intentamos múltiples búsquedas, utilizamos un contador para reducir mensajes de error
    let searchAttempts = 0;
    const maxAttempts = animalesDomesticos.includes(termino) ? 2 : 1;
  
    this.svc.buscarEspecies(textoConsulta, iconicGroup)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error en búsqueda:', err);
          this.error = 'Error al cargar especies. Por favor intente nuevamente.';
          this.loading = false;
          return [];
        })
      )
      .subscribe(list => {
        searchAttempts++;
        
        // Si encontramos resultados, los mostramos
        if (list.length > 0) {
          this.resultados = list;
          this.loading = false;
          this.error = null;
          return;
        }
        
        // Si es un término de animal doméstico y el primer intento falló, probar búsqueda en Mammalia
        if (animalesDomesticos.includes(termino) && searchAttempts === 1) {
          console.log('Intentando búsqueda alternativa para animal doméstico');
          this.svc.buscarEspecies('', 'Mammalia')
            .pipe(
              takeUntil(this.destroy$),
              catchError(() => [])
            )
            .subscribe(mammalsResults => {
              // Filtramos resultados que contengan el término buscado
              const filteredResults = mammalsResults.filter(animal => 
                animal.name.toLowerCase().includes(termino) || 
                (animal.commonName && animal.commonName.toLowerCase().includes(termino))
              );
              
              if (filteredResults.length > 0) {
                this.resultados = filteredResults;
                this.error = null;
              } else {
                this.mostrarMensajeNoResultados(iconicGroup);
              }
              this.loading = false;
            });
        } else {
          // Si no hay resultados y no hay más intentos, mostrar mensaje
          this.resultados = [];
          this.loading = false;
          this.mostrarMensajeNoResultados(iconicGroup);
        }
      });
  }

  /**
   * Método auxiliar para mostrar mensajes de error cuando no hay resultados
   */
  private mostrarMensajeNoResultados(iconicGroup?: string) {
    if (iconicGroup) {
      // Mensajes personalizados según el grupo
      const mensajes: {[key: string]: string} = {
        'Actinopterygii': 'peces',
        'Aves': 'aves',
        'Mammalia': 'mamíferos',
        'Reptilia': 'reptiles',
        'Amphibia': 'anfibios',
        'Insecta': 'insectos',
        'Arachnida': 'arácnidos',
        'Plantae': 'plantas',
        'Fungi': 'hongos'
      };
      
      this.error = `No se encontraron ${mensajes[iconicGroup] || 'especies'} en Tonalá.`;
    } else {
      this.error = `No se encontraron especies para "${this.termino}" en Tonalá.`;
    }
  }
  
  handleImageError(e: any) {
    e.target.src = 'assets/placeholder-image.png';
  }
}