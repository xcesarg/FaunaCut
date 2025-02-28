import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AnimalesComponent } from './pages/animales/animales.component';

export const routes: Routes = [
{path:'',component: HomeComponent },
{path:'animales', component: AnimalesComponent}


];
