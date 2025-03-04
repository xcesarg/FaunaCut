import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InaturalistService {
  private url = 'https://api.inaturalist.org/v1/observations';

  constructor(private http: HttpClient) { }

  buscarAnimales(termino: string): Observable<any> {
    return this.http.get(`${this.url}`, {
      params: {
        q: termino,
        per_page: '50',
        locale: 'es',
        verifiable: 'true',
        photos: 'true',
        order: 'desc',
        order_by: 'created_at',
        lat: '20.6295',
        lng: '-103.2385',
        radius: '50',
      }
    }).pipe(
      map((response: any) => {
        // Remove duplicates based on taxon ID
        const uniqueResults = Array.from(
          new Map(
            response.results
              .filter((result: any) => result.photos && result.photos.length > 0)
              .map((result: any) => [result.taxon.id, result])
          ).values()
        ).slice(0, 20);

        return {
          ...response,
          results: uniqueResults
        };
      })
    );
  }
}