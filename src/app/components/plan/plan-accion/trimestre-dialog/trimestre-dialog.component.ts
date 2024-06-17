import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-trimestre-dialog',
  templateUrl: './trimestre-dialog.component.html',
  styleUrls: ['./trimestre-dialog.component.scss']
})
export class TrimestreDialogComponent implements OnInit {
  columnasMostradas: string[] = [
    'trimestre',
    'estado',
    'brecha',
    'acciones',
  ];
  informacionTabla: MatTableDataSource<any>;
  trimestres: any[];
  plan: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialogRef: MatDialogRef<TrimestreDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.plan = data.plan;
    this.trimestres = data.trimestres;
    this.informacionTabla = new MatTableDataSource<any>(this.trimestres);
    this.informacionTabla.paginator = this.paginator;
  }

  ngOnInit(): void { }

  visualizar(trimestre: any) {
    const auxId = this.plan.id;
    const auxTrimestres = trimestre.codigo;
    this.router.navigate([`pages/seguimiento/gestion-seguimiento/` + auxId + `/` + auxTrimestres]);
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
