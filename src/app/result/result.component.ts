import { Component, AfterViewChecked, AfterViewInit } from '@angular/core';
import { OriginService } from '../origin.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements AfterViewInit {

  private resultTableId: string = "resultTableId";
  private sourceTable: Handsontable;
  private resultTable: Handsontable;

  constructor( private originService: OriginService ) { 
    this.sourceTable = this.originService.getData();
    // this.resultTable = new HotTableRegisterer().getInstance(this.instance);
  }

  ngAfterViewInit() {

    this.resultTable = new HotTableRegisterer().getInstance(this.resultTableId);
    // console.log(this.resultTable);
    this.resultTable.loadData(testFunction(this.sourceTable.getData()));

  }



  // importArray(): void {
  //   this.resultTable = new HotTableRegisterer().getInstance(this.instance);
  //   console.log(this.resultTable);
  //   this.resultTable.loadData(this.sourceTable.getData());
  // }

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
