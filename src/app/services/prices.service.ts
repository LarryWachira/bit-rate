import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PriceResponse } from '../models/price-response.model'

@Injectable({
  providedIn: 'root'
})
export class PricesService {
  private apiRoot: string = environment.apiRoot;

  constructor(private http: HttpClient) { }

  getPrices(
    latest: boolean = true,
    currency: string = 'btc'
  ): Observable<PriceResponse> {
    return this.http.get<PriceResponse>(
      `${this.apiRoot}/prices/${currency}/${latest ? 'latest' : ''}`,
      { responseType: 'json' }
    );
  }
}
