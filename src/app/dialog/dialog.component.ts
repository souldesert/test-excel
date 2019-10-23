import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../table/table.component'

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {

  dimensionsForm = this.fb.group({
    cols: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
    rows: ['', [Validators.required, Validators.min(0), Validators.max(20)]]
  });

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar,
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
    if (this.dimensionsForm.invalid) {
      this.snackBar.open("Неверный размер таблицы", null, {
        duration: 5000,
      })
    } else {
      this.dialogRef.close({
        colCount: Number(this.dimensionsForm.value.cols),
        rowCount: Number(this.dimensionsForm.value.rows)
      });
    }

    // this.dialogRef.close({
    //   colCount: Number(this.dimensionsForm.value.cols),
    //   rowCount: Number(this.dimensionsForm.value.rows)
    // });
  }
}
