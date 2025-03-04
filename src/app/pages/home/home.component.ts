import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, FormsModule, HeaderComponent, CommonModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  busqueda: string ='';
cargando: any;
termino: string = '';
  constructor(private router: Router) {}

  buscar(){

    if (this.busqueda.trim() !== '') {
      this.router.navigate(['/animales'], { queryParams: { search: this.busqueda } });
    }
  }
}


