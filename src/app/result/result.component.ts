import { Component, AfterViewChecked, AfterViewInit, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { OriginService } from '../origin.service';
import { ExcelService } from '../excel.service';
import { Cell } from '../excel.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { from } from 'rxjs';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements AfterViewInit {

  private resultTableId: string = "resultTableId";
  private sourceTable: Handsontable;
  private resultTable: Handsontable;

  @Output() errorsOut: EventEmitter<number[][]> = new EventEmitter();

  settings = {
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
    this.sourceTable = this.originService.getData();
    // this.resultTable = new HotTableRegisterer().getInstance(this.instance);
  }

  ngAfterViewInit() {

    this.resultTable = new HotTableRegisterer().getInstance(this.resultTableId);

    let rows: number = this.sourceTable.countRows();
    let cols: number = this.sourceTable.countCols();
    // this.resultTable.loadData(testFunction(this.sourceTable.getData()));

    let toBeComputed: string[][] = this.sourceTable.getData();
    let toBeComputedFormatted: Map<string, string> = new Map();

    for (let row: number = 0; row < rows; row++) {
      for (let cell: number = 0; cell < cols; cell++) {
        let address: string = this.sourceTable.getColHeader(cell).toString() 
          + this.sourceTable.getRowHeader(row).toString();

        let zeroCondition: boolean = toBeComputed[row][cell] == null || this.excelService.normalize(toBeComputed[row][cell]) == "";
        
        let cellValue: string = (zeroCondition) ? "0" : toBeComputed[row][cell];
        toBeComputedFormatted.set(address, cellValue);
      }
    }

    let computedTable: Map<string, Cell> = this.excelService.computeTable(toBeComputedFormatted);

    let result: string[][] = [];
    let errors: number[][] = [];

    let iter: IterableIterator<Cell> = computedTable.values();

    for (let row: number = 0; row < rows; row++) {
      let rowBuffer: string[] = [];
      
      for (let cell: number = 0; cell < cols; cell++) {
        let curCell: Cell = iter.next().value;
        if (curCell.status == "done") {
          rowBuffer.push(curCell.result);
        } else {
          rowBuffer.push(curCell.errorMsg);
          errors.push([row, cell]);
        }
        // let valueToShow: string = (curCell.status == "done") ? curCell.result : curCell.errorMsg;
        // rowBuffer.push(valueToShow); 
      }
      result.push(rowBuffer);
    }

    this.resultTable.loadData(result);
    // this.originService.errors = errors;
    this.errorsOut.emit(errors);
  }

  exportToCSV(): void {
    this.resultTable.getPlugin("exportFile").downloadFile('csv', { filename: 'result' });
  }

}


