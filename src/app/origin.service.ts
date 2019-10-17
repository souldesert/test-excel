import { Injectable } from '@angular/core';
import Handsontable from 'handsontable';

@Injectable({
  providedIn: 'root'
})
export class OriginService {
  private table: Handsontable;

  private _errors: number[][];

  addData(data) {
    this.table = data;
  }

  getData() {
    return this.table;
  }

  get errors(): number[][] {
    return this._errors;
  }

  set errors(errors: number[][]) {
    this._errors = errors;
  }

}
