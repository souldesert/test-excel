import { Component, AfterViewChecked, AfterViewInit } from '@angular/core';
import { OriginService } from '../origin.service';
import { ExcelService } from '../excel.service';
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

  constructor( 
    private originService: OriginService,
    private excelService: ExcelService 
  ) { 
    this.sourceTable = this.originService.getData();
    // this.resultTable = new HotTableRegisterer().getInstance(this.instance);
  }

  ngAfterViewInit() {

    this.resultTable = new HotTableRegisterer().getInstance(this.resultTableId);
    // this.resultTable.loadData(testFunction(this.sourceTable.getData()));

    let toBeComputed: string[][] = this.sourceTable.getData();
    let result: string[][] = [];

    for (let row of toBeComputed) {
      let rowBuffer: string[] = [];
      for (let cell of row) {
        let computedCell: string = this.excelService.computeCell(cell);
        rowBuffer.push(computedCell);
      }
      result.push(rowBuffer);
    }

    this.resultTable.loadData(result);


  }

}

function testFunction(input: string[][]): string[][] {
    let output: string[][] = [];
    for (let row of input) {
      let rowBuffer: string[] = [];
      for (let cell of row) {
        let newValue: number = Number(cell) + 1;
        rowBuffer.push(newValue.toString())
      }
      output.push(rowBuffer);
    }
    return output;
}


