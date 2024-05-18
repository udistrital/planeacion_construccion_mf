import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RequestManager } from 'src/app/components/services/requestManager';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { PeriodoSeguimiento, Unidades } from '../utils/habilitar-reporte.models';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';

@Component({
  selector: 'app-tabla-unidades',
  templateUrl: './tabla-unidades.component.html',
  styleUrls: ['./tabla-unidades.component.scss']
})
export class TablaUnidadesComponent implements OnInit{
  dataUnidades: any;
  unidadesInteres: any;
  displayedColumns!: string[];
  unidadesMostrar!: any[];

  dataSource = new MatTableDataSource<Unidades>();
  banderaTodosSeleccionados: boolean;
  filtroDeBusquedaUnidades: string = '';
  textBotonMostrarData: string = 'Mostrar Unidades Interés Habilitadas/Reporte';

  @Input() periodoSeguimiento!: PeriodoSeguimiento;
  @Input() filtroPlan!: boolean;
  @Output() unidadesInteresSeleccionadas = new EventEmitter<any[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private request: RequestManager) {
    this.unidadesInteres = [];
    this.loadUnidades();
    this.banderaTodosSeleccionados = false;
  }

  ngOnInit(): void {
    this.displayedColumns = ['index', 'Nombre', 'actions'];
  }

  async loadUnidades() {
    const loadingSwal = Swal.fire({
      title: 'Cargando unidades',
      timerProgressBar: true,
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    await this.request
      .get(environment.PLANES_FORMULACION_MID, `formulacion/unidades`)
      .subscribe((data: any) => {
        try {
          if (data) {
            if (data.data.length != 0) {
              this.dataUnidades = data.data;
              if (
                this.unidadesInteres.length == 0 ||
                this.unidadesInteres.length == undefined ||
                this.unidadesInteres == ' '
              ) {
                for (let i = 0; i < this.dataUnidades.length; i++) {
                  this.dataUnidades[i].iconSelected = 'compare_arrows';
                  this.dataUnidades[i].posicion = i + 1;
                }
              } else {
                for (let i = 0; i < this.dataUnidades.length; i++) {
                  for (let j = 0; j < this.unidadesInteres.length; j++) {
                    if (this.unidadesInteres[j].Id == this.dataUnidades[i].Id) {
                      if (
                        this.dataUnidades[i].iconSelected == 'compare_arrows' ||
                        this.dataUnidades[i].iconSelected == '' ||
                        this.dataUnidades[i].iconSelected == undefined
                      ) {
                        this.dataUnidades[i].iconSelected = 'done';
                        this.dataUnidades[i].posicion = i + 1;
                      }
                    } else if (
                      this.unidadesInteres[j].Id != this.dataUnidades[i].Id
                    ) {
                      if (this.dataUnidades[i].iconSelected == 'done') {
                        this.dataUnidades[i].posicion = i + 1;
                      } else if (
                        this.dataUnidades.iconSelected == '' ||
                        this.dataUnidades.iconSelected == undefined
                      ) {
                        this.dataUnidades[i].iconSelected = 'compare_arrows';
                        this.dataUnidades[i].posicion = i + 1;
                      }
                    }
                  }
                }
              }
              this.unidadesMostrar = this.dataUnidades;
              this.unidadesMostrar = this.eliminarDuplicadosYOrdenar(this.unidadesMostrar);
              this.dataSource = new MatTableDataSource(this.unidadesMostrar);
              this.dataSource.paginator = this.paginator;
            }
          }
        } catch (error) {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(
              error
            )}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500,
          });
        } finally {
          Swal.close();
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  changeIcon(row: Unidades) {
    if (row.iconSelected == 'compare_arrows') {
      row.iconSelected = 'done';

      const nuevaUnidad = {
        Id: row.Id,
        Nombre: row.Nombre,
      };

      this.unidadesInteres = [...this.unidadesInteres, nuevaUnidad];
      this.unidadesInteres = this.eliminarDuplicadosYOrdenar(this.unidadesInteres);
    } else if (row.iconSelected == 'done') {
      row.iconSelected = 'compare_arrows';
      let unidadEliminar = row.Id;
      const index = this.unidadesInteres.findIndex(
        (x: { Id: any }) => x.Id == unidadEliminar
      );
      this.unidadesInteres.splice(index, 1);
    }
    this.emitirCambiosUnidadesInteres();
  }

  seleccionarTodos() {
    this.banderaTodosSeleccionados = true;
    this.unidadesInteres = this.unidadesMostrar.map((element) => ({
      Id: element.Id,
      Nombre: element.Nombre,
    }));

    // Itera sobre los elementos y cambia el icono
    this.unidadesMostrar.forEach((element) => {
      element.iconSelected = 'done';
    });
    this.unidadesInteres = this.eliminarDuplicadosYOrdenar(this.unidadesInteres);
    // Emite los cambios
    this.emitirCambiosUnidadesInteres();
  }

  borrarSeleccion() {
    this.banderaTodosSeleccionados = false;
    // Itera sobre los elementos y cambia el icono a 'compare_arrows'
    this.unidadesMostrar.forEach((element) => {
      element.iconSelected = 'compare_arrows';
    });

    // Limpia el array de unidades de interés
    this.unidadesInteres = [];

    // Emite los cambios
    this.emitirCambiosUnidadesInteres();
  }

  emitirCambiosUnidadesInteres() {
    this.unidadesInteresSeleccionadas.emit(this.unidadesInteres);
  }

  cambiarDataTabla() {
    if(this.textBotonMostrarData === 'Mostrar Unidades Interés Habilitadas/Reporte'){
      Swal.fire({
        title: 'Cargando datos...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      this.request.post(environment.PLANES_CRUD, 'periodo-seguimiento/buscar-unidad-planes/6', this.periodoSeguimiento).subscribe(
        (data: DataRequest) => {
          if (data) {
            if(data.Data !== null){
              var periodoSeguimiento = data.Data;
              this.textBotonMostrarData = 'Mostrar todas las unidades';
              let unidadesMostrar = [];

              const unidadesDeInteres = periodoSeguimiento.map((registro: { unidades_interes: string; fecha_modificacion: string; }) => {
                const unidades = JSON.parse(registro.unidades_interes);
                unidades.forEach((unidad: { fecha_modificacion: string; iconSelected: string; Id: any; }) => {
                    unidad.fecha_modificacion = this.formatearFecha(registro.fecha_modificacion);
                    unidad.iconSelected = 'compare_arrows';
                    unidad.Id = unidad.Id;
                });
                return unidades;
              });

              // Encontrar la intersección de las unidades de interés
              unidadesMostrar = unidadesDeInteres.reduce((acumulador: any[], unidades: any[], index: number) => {
                if (index === 0) {
                    return unidades;
                }
                return acumulador.filter(item => unidades.some(unidad => unidad.Id === item.Id));
              }, []);
              if(unidadesMostrar.length === 0){
                this.unidadesMostrar = this.dataUnidades;
                this.textBotonMostrarData = 'Mostrar Unidades Interés Habilitadas/Reporte';
                this.dataSource = new MatTableDataSource(this.unidadesMostrar);
                this.dataSource.paginator = this.paginator;
                Swal.fire({
                  title: 'Error en la operación',
                  text: 'Las planes/proyectos escogidos no cuentan con unidades con fechas parametrizadas',
                  icon: 'warning',
                  showConfirmButton: false,
                  timer: 2500
                })
              } else {
                unidadesMostrar = [...new Set(unidadesMostrar)];
                this.unidadesMostrar = unidadesMostrar;
                this.dataSource = new MatTableDataSource(this.unidadesMostrar);
                this.dataSource.paginator = this.paginator;
                Swal.close();
              }
            } else {
              Swal.fire({
                title: 'Error en la operación',
                text: 'Las planes/proyectos escogidos no cuentan con unidades con fechas parametrizadas',
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            }
          }
        },
        (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
      );
    } else {
      this.unidadesMostrar = this.dataUnidades;
      this.textBotonMostrarData = 'Mostrar Unidades Interés Habilitadas/Reporte';
      this.dataSource = new MatTableDataSource(this.unidadesMostrar);
      this.dataSource.paginator = this.paginator;
    }
  }

  formatearFecha(fechaOriginal: string): string {
    const fechaObjeto = new Date(fechaOriginal);

    const dia = fechaObjeto.getDate().toString().padStart(2, '0');
    const mes = (fechaObjeto.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObjeto.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  eliminarDuplicadosYOrdenar(array: Array<any>) {
    const mapa: any = {};
    const arraySinDuplicados = [];

    for (const item of array) {
        const key = JSON.stringify(item);
        if (!mapa[key]) {
            arraySinDuplicados.push(item);
            mapa[key] = true;
        }
    }

    // Ordenar el array por Id
    arraySinDuplicados.sort((unidadA, unidadB) => unidadA.Id - unidadB.Id);

    return arraySinDuplicados;
  }
}
