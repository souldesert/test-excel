import { Injectable } from '@angular/core';
import Handsontable from 'handsontable';

@Injectable({
  providedIn: 'root'
})
export class OriginService {
  private _data: Handsontable;

  private _errors: number[][];

  set data(data: Handsontable) {
    this._data = data;
  }

  get data() {
    return this._data;
  }

  get errors(): number[][] {
    return this._errors;
  }

  set errors(errors: number[][]) {
    this._errors = errors;
  }

}
