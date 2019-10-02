// import { Component, ViewChild, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';
import {Component, NgModule,Input,ComponentFactory,ComponentRef, ComponentFactoryResolver, ViewContainerRef, ChangeDetectorRef, TemplateRef, ViewChild, Output, EventEmitter} from '@angular/core'
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { OriginService } from '../origin.service';
import Papa from 'papaparse';
import { ResultComponent } from '../result/result.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {

  instance: string = "sourceTable";
  private hotRegisterer = new HotTableRegisterer();

  @ViewChild("resultContainer", { read: ViewContainerRef, static: false }) container;
  componentRef: ComponentRef<ResultComponent>;

  constructor(
    private originService: OriginService,
    private resolver: ComponentFactoryResolver
  ) { }

  exportToCSV(): void {
    let sourceTable = this.hotRegisterer.getInstance(this.instance);
    sourceTable.getPlugin("exportFile").downloadFile('csv', {filename: 'output'});
  }

  importFromCSV(): void {
      let testData: string[][] = [
        ['1', '2', '3', '4'],
        ['1', '2', '3', '4']
      ];
      let sourceTable = this.hotRegisterer.getInstance(this.instance);
      sourceTable.loadData(testData)
  }

  changeListener(files: FileList): void {
    if (files && files.length > 0) {
       let file : File = files.item(0); 
         let reader: FileReader = new FileReader();
         reader.readAsText(file);
        //  let results: any[] = [];
         reader.onload = (e) => {
            let csv: string = reader.result as string;
            let results = Papa.parse(csv).data;
            let sourceTable = this.hotRegisterer.getInstance(this.instance);
            sourceTable.loadData(results)
            // console.log(results.data);
         }
        //  console.log(results);
      }
  }

  compute() {
    this.originService.addData(this.hotRegisterer.getInstance(this.instance));


    this.container.clear();
    const factory: ComponentFactory<ResultComponent> = this.resolver.resolveComponentFactory(ResultComponent);
    this.componentRef = this.container.createComponent(factory);
  }

  
  
  // constructor(private hotRegisterer: HotTableRegisterer) {}

  // constructor() { }

  // private hotRegisterer = new HotTableRegisterer();
  // id = "hotInstance";
  // swapHotData() {
    // let tableContents: any[] = this.hotRegisterer.getInstance(this.id).getData() 
    // console.log(tableContents)
    // alert(tableContents)
      


  // }


  // dataset: any[] = Handsontable.default.helper.createSpreadsheetData(5, 5)

}
