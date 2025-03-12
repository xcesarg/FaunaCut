import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component'; 
import { HeaderComponent } from './components/header/header.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent ,FooterComponent], //parece que hay que ir añadiendo los componentes acá para que se muestren en la página
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent { }
