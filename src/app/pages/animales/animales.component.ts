import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { InaturalistService } from '../../services/inaturalist.service';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
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
    this.iNaturalistService.buscarAnimales(this.termino).subscribe((data: any) => {
      this.resultados = data.results;
    });
  }
}
