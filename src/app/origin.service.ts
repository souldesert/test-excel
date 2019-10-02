import { Injectable } from '@angular/core';
import Handsontable from 'handsontable';

@Injectable({
  providedIn: 'root'
})
export class OriginService {
  table: Handsontable;

  addData(data) {
    this.table = data;
  }

  getData() {
    return this.table;
  }

}
