import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ParametroPeriodo } from './utils/gestion-parametros.models';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Vigencia } from '../habilitar-reporte/utils/habilitar-reportes.models';
import { RequestManager } from '../../services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';

@Component({
  selector: 'app-gestion-parametros',
  templateUrl: './gestion-parametros.component.html',
  styleUrls: ['./gestion-parametros.component.scss']
})
export class GestionParametrosComponent implements OnInit, OnDestroy{
  displayedColumns!: string[];
  parametros!: ParametroPeriodo[] | any;
  banderaAdicion!: boolean;
  banderaEdicion!: boolean;
  parametroPeriodoEdicion!: ParametroPeriodo;

  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  vigencias!: Vigencia[];

  constructor(
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.banderaAdicion = false;
    this.banderaEdicion = false;
    this.displayedColumns = ['Id', 'Nombre', 'Valor', 'Vigencia', 'actions'];
    this.loadData();
  }

  ngOnDestroy(): void { }

  mostrarMensajeCarga(): void {
    Swal.fire({
      title: 'Cargando datos...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  cerrarMensajeCarga(): void {
    this.dataSource = new MatTableDataSource(this.parametros);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    //this.sort.sort({
     // id: 'Id', start: 'asc',
     // disableClear: false
    //});
    Swal.close();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onChange(event: any) {
    if(event == 'agregarParametro') {
      this.banderaAdicion = true;
      this.banderaEdicion = false;
    } else if (event == 'editarParametro') {
      this.banderaEdicion = true;
      this.banderaAdicion = false;
    }
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

  loadData() {
    this.mostrarMensajeCarga();
    this.loadVigencias();
    this.request.get(environment.PARAMETROS_SERVICE, `/parametro_periodo?query=ParametroId.TipoParametroId.CodigoAbreviacion:P_SISGPLAN,Activo:true`).subscribe(
      (data: DataRequest) => {
        if (data) {
          this.parametros = data.Data;
          this.cerrarMensajeCarga()
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    );
  }

  editar(parametroPeriodo: ParametroPeriodo) {
    this.parametroPeriodoEdicion = parametroPeriodo;
    this.banderaEdicion = true;
    this.banderaAdicion = false;
  }

  inactivar(parametroPeriodo: ParametroPeriodo) {
    Swal.fire({
      title: 'Inactivar Parámetro',
      text: `¿Está seguro de inactivar el parámetro?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.delete(environment.PARAMETROS_SERVICE, `parametro_periodo/`, parametroPeriodo.Id).subscribe((data: any) => {
          if (data) {
            this.request.delete(environment.PARAMETROS_SERVICE, `parametro/`, parametroPeriodo.ParametroId.Id).subscribe((data: any) => {
              if (data) {
                Swal.fire({
                  title: 'Cambio realizado',
                  icon: 'success',
                }).then((result) => {
                  if (result.value) {
                    window.location.reload();
                  }
                })
              }
            })
          }
        }),
          (error: any) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  ocultarComponenteHijo() {
    this.banderaAdicion = false;
    this.banderaEdicion = false;
  }
}
