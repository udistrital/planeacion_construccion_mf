import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Unidades } from '../utils/habilitar-reportes.models';
import { MatPaginator } from '@angular/material/paginator';
import { RequestManager } from 'src/app/components/services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tabla-unidades',
  templateUrl: './tabla-unidades.component.html',
  styleUrls: ['./tabla-unidades.component.scss']
})
export class TablaUnidadesComponent implements OnInit{
  dataUnidades: any;
  unidadesInteres: any;
  displayedColumns: string[] = ['index', 'Nombre', 'actions'];
  dataSource = new MatTableDataSource<Unidades>();
  banderaTodosSeleccionados: boolean;
  filtroDeBusquedaUnidades: string = '';

  @Output() unidadesInteresSeleccionadas = new EventEmitter<any[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private request: RequestManager) {
    this.unidadesInteres = [];
    this.loadUnidades();
    this.banderaTodosSeleccionados = false;
  }

  ngOnInit(): void { }

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
      .get(environment.PLANES_MID, `formulacion/get_unidades`)
      .subscribe((data: any) => {
        try {
          if (data) {
            if (data.Data.length != 0) {
              this.dataUnidades = data.Data;
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
              this.dataSource = new MatTableDataSource(this.dataUnidades);
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
    this.unidadesInteres = this.dataUnidades.map((element: any) => ({
      Id: element.Id,
      Nombre: element.Nombre,
    }));

    // Itera sobre los elementos y cambia el icono
    this.dataUnidades.forEach((element: any) => {
      element.iconSelected = 'done';
    });

    // Emite los cambios
    this.emitirCambiosUnidadesInteres();
  }

  borrarSeleccion() {
    this.banderaTodosSeleccionados = false;
    // Itera sobre los elementos y cambia el icono a 'compare_arrows'
    this.dataUnidades.forEach((element: any) => {
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
}
