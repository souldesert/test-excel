import { Component, ComponentFactory, ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core'
import { HotTableRegisterer } from '@handsontable/angular';
import { MatSnackBar } from '@angular/material';
import { MatDialog } from '@angular/material/dialog'
import Handsontable from 'handsontable';
import Papa from 'papaparse';

import { OriginService } from '../origin.service';
import { ResultComponent } from '../result/result.component';
import { DialogComponent } from '../dialog/dialog.component'


export interface DialogData {
  colCount: number;
  rowCount: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements AfterViewInit {

  settings = {
    startCols: 5,
    startRows: 5,
    colHeaders: true,
    rowHeaders: true,
    manualColumnResize: true,
    manualRowResize: true,
    validator: /^([a-z\d\-\+\*\/\(\)\s]|(\d\.\d))*$/i,
    afterValidate: (isValid, value, row, prop) => {
      // console.log("Validation: " + isValid + " " + value);
      if (!isValid) {
        this.snackBar.open(`Ошибка в выражении: ${value}. Строка: ${row + 1}, столбец ${prop + 1}`, null, {
          duration: 2000,
        })
      }
    },
    licenseKey: "non-commercial-and-evaluation"
  }

  instance: string = "sourceTable";
  private sourceTable: Handsontable;

  @ViewChild("resultContainer", { read: ViewContainerRef, static: false }) container;
  componentRef: ComponentRef<ResultComponent>;

  constructor(
    private originService: OriginService,
    private resolver: ComponentFactoryResolver,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngAfterViewInit() {
    this.sourceTable = new HotTableRegisterer().getInstance(this.instance);
  }

  exportToCSV(): void {
    this.sourceTable.getPlugin("exportFile").downloadFile('csv', { 
      filename: `output_${new Date().toISOString()}`,
      columnDelimiter: ";" 
    });
  }

  importFromCSV(files: FileList): void {
    if (files && files.length > 0) {
      let file: File = files.item(0);
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        let csv: string = reader.result as string;
        let results = Papa.parse(csv, {
          transform: (value: string) => {
            return (value == "") ? null : value;
          }
        }).data;
        this.sourceTable.loadData(results);
      }
    }
  }

  reshape(): void {

    let cols: number = this.sourceTable.countCols();
    let rows: number = this.sourceTable.countRows();

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

        this.sourceTable.alter(colAction, colStartPosition, Math.abs(colChange));
        this.sourceTable.alter(rowAction, rowStartPosition, Math.abs(rowChange));
      }
    })
  }

  compute(): void {
    this.container.clear();

    this.originService.data = this.sourceTable;

    const factory: ComponentFactory<ResultComponent> = this.resolver.resolveComponentFactory(ResultComponent);
    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.errorsOut.subscribe(errors => {
      for (let [row, col] of errors) {
        let cell: HTMLTableCellElement = this.sourceTable.getCell(row, col);
        cell.style.background = "#FF4C42";
      }
    });
  }
}
