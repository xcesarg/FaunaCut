import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { InaturalistService } from '../../services/inaturalist.service';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-animales',
  standalone: true,
  imports: [HeaderComponent, NgFor, NgIf],
  templateUrl: './animales.component.html',
  styleUrl: './animales.component.css'
})
export class AnimalesComponent implements OnInit {
  resultados: any[] = [];
  termino: string = '';
  error: string | null = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private iNaturalistService: InaturalistService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.termino = params['search'];
        this.buscarAnimales();
      }
    });
  }

  buscarAnimales() {
    this.loading = true;
    this.error = null;
    
    this.iNaturalistService.buscarAnimales(this.termino)
      .pipe(
        catchError(err => {
          this.error = 'No se pudieron cargar los animales. Intenta de nuevo.';
          this.loading = false;
          return of({ results: [] });
        })
      )
      .subscribe((data: any) => {
        this.resultados = data.results;
        this.loading = false;
        
        if (this.resultados.length === 0) {
          this.error = 'No se encontraron resultados para tu búsqueda.';
        }
      });
  }

  // Método para manejar errores de carga de imágenes
  handleImageError(event: any) {
    event.target.src = 'assets/placeholder-image.png';
  }
}