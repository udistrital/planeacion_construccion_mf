import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Vigencia } from './utils/habilitar-reportes.models';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';

@Component({
  selector: 'app-habilitar-reporte',
  templateUrl: './habilitar-reporte.component.html',
  styleUrls: ['./habilitar-reporte.component.scss']
})
export class HabilitarReporteComponent implements OnInit{
  formFechas!: FormGroup;
  vigencias!: Vigencia[];

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.loadVigencias();
    this.formFechas = this.formBuilder.group({
      fecha1: ['',],
      fecha2: ['',],
      fecha3: ['',],
      fecha4: ['',],
      fecha5: ['',],
      fecha6: ['',],
      fecha7: ['',],
      fecha8: ['',],
      fecha9: ['',],
      fecha10: ['',],
      fecha11: ['',],
      fecha12: ['',],
      fecha13: ['',],
      fecha14: ['',],
      fecha15: ['',],
      fecha16: ['',],
      fecha17: ['',],
      fecha18: ['',],
      fecha19: ['',],
      fecha20: ['',]
    });
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: DataRequest) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500,
      });
    });
  }
}
