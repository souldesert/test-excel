// import { Component, ViewChild, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';
import { Component, NgModule, Input, ComponentFactory, ComponentRef, ComponentFactoryResolver, ViewContainerRef, ChangeDetectorRef, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { OriginService } from '../origin.service';
import Papa from 'papaparse';
import { ResultComponent } from '../result/result.component';
import { MatDialog } from '@angular/material/dialog'
import { DialogComponent } from '../dialog/dialog.component'

export interface DialogData {
  colCount: number;
  rowCount: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  outputs: ['errorsOut']
})
export class TableComponent {

  instance: string = "sourceTable";
  private hotRegisterer = new HotTableRegisterer();

  @ViewChild("resultContainer", { read: ViewContainerRef, static: false }) container;
  componentRef: ComponentRef<ResultComponent>;

  constructor(
    private originService: OriginService,
    private resolver: ComponentFactoryResolver,
    public dialog: MatDialog
  ) { }

  exportToCSV(): void {
    let sourceTable = this.hotRegisterer.getInstance(this.instance);
    sourceTable.getPlugin("exportFile").downloadFile('csv', { filename: 'output' });
  }

  importFromCSV(files: FileList): void {
    if (files && files.length > 0) {
      let file: File = files.item(0);
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        let csv: string = reader.result as string;
        let results = Papa.parse(csv, {
          transform: (value) => {
            return (value == "") ? null : value;
          }
        }).data;
        let sourceTable = this.hotRegisterer.getInstance(this.instance);
        sourceTable.loadData(results);
      }
    }
  }

  reshape(): void {
    let sourceTable: Handsontable = this.hotRegisterer.getInstance(this.instance);

    let cols: number = sourceTable.countCols();
    let rows: number = sourceTable.countRows();

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        colCount: cols,
        rowCount: rows
      }
    })

    dialogRef.afterClosed().subscribe(newSize => {
      if (newSize) {
        console.log(newSize);

        let colChange: number = newSize.colCount - cols;
        let rowChange: number = newSize.rowCount - rows;

        type Action = "insert_row" | "insert_col" | "remove_row" | "remove_col";

        let colAction: Action = (colChange > 0) ? "insert_col" : "remove_col";
        let rowAction: Action = (rowChange > 0) ? "insert_row" : "remove_row";

        let colStartPosition: number = (colAction == "insert_col") ? cols : cols - Math.abs(colChange);
        let rowStartPosition: number = (rowAction == "insert_row") ? rows : rows - Math.abs(rowChange);

        sourceTable.alter(colAction, colStartPosition, Math.abs(colChange));
        sourceTable.alter(rowAction, rowStartPosition, Math.abs(rowChange));
      }
    })
  }

  compute(): void {
    let sourceTable: Handsontable = this.hotRegisterer.getInstance(this.instance);
    console.log(sourceTable.getData());
    this.originService.addData(sourceTable);


    this.container.clear();
    const factory: ComponentFactory<ResultComponent> = this.resolver.resolveComponentFactory(ResultComponent);
    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.errorsOut.subscribe(errors => {
      for (let [row, col] of errors) {
        let cell: HTMLTableCellElement = sourceTable.getCell(row, col);
        cell.style.background = "#FA8072";
      }
    });
  }

  errorsOut(errors: number[][]) {
    let sourceTable: Handsontable = this.hotRegisterer.getInstance(this.instance);
    console.log("event!!");
    for (let [row, col] of errors) {
      let cell: HTMLTableCellElement = sourceTable.getCell(row, col);
      cell.style.background = "#FA8072";
      console.log("colored: " + row + col);
    }
  }
}
