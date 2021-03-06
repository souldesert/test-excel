import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExcelRequest } from './excel-request';
import { ExcelResponse } from './excel-response';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  apiUrl: string = 'http://127.0.0.1:8080/excel-backend/compute';  // URL REST-api

  constructor(
    private http: HttpClient
  ) {}


  computeTable(data: ExcelRequest[]): Observable<ExcelResponse[]> {
    return this.http.post<ExcelResponse[]>(this.apiUrl, data, httpOptions);
  }

}


