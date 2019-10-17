import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../table/table.component'

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {

  // @Output() newSize: EventEmitter<number[]> = new EventEmitter();

  dimensionsForm = this.fb.group({
    // cols: [this.data.colCount.toString()],
    // rows: [this.data.rowCount.toString()]
    cols: [''],
    rows: ['']
  });

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<DialogComponent>) {
    this.dimensionsForm.setValue({
      cols: data.colCount,
      rows: data.rowCount
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onReshape(): void {
    // this.newSize.emit([
    //   Number(this.dimensionsForm.value.cols),
    //   Number(this.dimensionsForm.value.rows)
    // ])
    this.dialogRef.close({
      colCount: Number(this.dimensionsForm.value.cols),
      rowCount: Number(this.dimensionsForm.value.rows)
    });
  }
}
