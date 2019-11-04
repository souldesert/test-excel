import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';

import { OriginService } from '../origin.service';
import { ExcelService } from '../excel.service';
import { ExcelRequest } from '../excel-request';
import { ExcelResponse, ExcelResult } from '../excel-response';


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements AfterViewInit {

  resultTableId: string = "resultTableId";
  private sourceTable: Handsontable;
  private resultTable: Handsontable;

  @Output() errorsOut: EventEmitter<number[][]> = new EventEmitter();

  settings: Handsontable.GridSettings = {
    colHeaders: true,
    rowHeaders: true,
    manualColumnResize: true,
    manualRowResize: true,
    licenseKey: "non-commercial-and-evaluation"
  }

  constructor( 
    private originService: OriginService,
    private excelService: ExcelService 
  ) { 
    this.sourceTable = this.originService.data;
  }

  ngAfterViewInit() {

    this.resultTable = new HotTableRegisterer().getInstance(this.resultTableId);

    let rows: number = this.sourceTable.countRows();
    let cols: number = this.sourceTable.countCols();

    let toBeComputed: string[][] = this.sourceTable.getData();
    let toBeComputedFormatted: ExcelRequest[] = [];

    for (let row: number = 0; row < rows; row++) {
      for (let cell: number = 0; cell < cols; cell++) {
        let address: string = this.sourceTable.getColHeader(cell).toString() 
          + this.sourceTable.getRowHeader(row).toString();

        let zeroCondition: boolean = toBeComputed[row][cell] == null || toBeComputed[row][cell].replace(/\s/g, "") == "";
        
        let cellValue: string = (zeroCondition) ? "0" : toBeComputed[row][cell].replace(/\s/g, "").toUpperCase();
        toBeComputedFormatted.push(new ExcelRequest(address, cellValue));
      }
    }
    
    this.excelService
      .computeTable(toBeComputedFormatted)
      .subscribe((excelResponse: ExcelResponse[]) => {
          let errors: number[][] = [];
          for (let element of excelResponse) {
        
            let cellNameParsed = this.parseCoords(element.name);
            let row: number = Number(cellNameParsed[1]) - 1;
            let col: number = this.resultTable.getColHeader().indexOf(cellNameParsed[0]);

            let excelResult: ExcelResult = element.result;
            if (excelResult.status == "ERROR") {
              errors.push([row, col]);
            }

            this.resultTable.setDataAtCell(row, col, excelResult.value);
            
          }
          
          console.log("Hello!");
          console.log(errors);
          this.errorsOut.emit(errors);

      })

  }

  exportToCSV(): void {
    this.resultTable.getPlugin("exportFile").downloadFile('csv', { 
      filename: `result_${new Date().toISOString()}`,
      columnDelimiter: ";" 
    });
  }

  // Выделение столбца и строки
  private parseCoords(rawCoords: string): string[] {
      return rawCoords.match(/[a-z]+|[^a-z]+/gi);
  }

}


