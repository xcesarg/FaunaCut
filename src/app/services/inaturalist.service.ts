// src/app/inaturalist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from '../animal';

@Injectable({
  providedIn: 'root'
})
export class InaturalistService {
  private url = 'https://api.inaturalist.org/v1/observations'; // La URL de la API de iNaturalist

  constructor(private http: HttpClient) { }

  buscarAnimales(termino: string): Observable<any> {
    return this.http.get(`${this.url}?q=${termino}&per_page=10`);
  }
}
