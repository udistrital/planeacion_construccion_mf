import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { RequestManager } from 'src/app/components/services/requestManager';
import { environment } from 'src/environments/environment';
import { HabilitarReporteService } from '../habilitar-reporte.service';

import { PROCESO_FUNCIONAMIENTO_FORMULACION, PROCESO_FUNCIONAMIENTO_SEGUIMIENTO, Periodo, PeriodoSeguimiento, PlanInteres, Seguimiento, Unidad, Usuario, Vigencia } from '../utils';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';

@Component({
  selector: 'app-funcionamiento',
  templateUrl: './funcionamiento.component.html',
  styleUrls: ['./funcionamiento.component.scss']
})
export class FuncionamientoComponent implements OnInit{
  vigenciaSelected: boolean;
  banderaUnidadesInteres!: boolean;
  banderaPlanesInteres!: boolean;
  banderaPlanesInteresPeriodoSeguimiento: boolean;
  tipoSelected!: boolean;
  filtroSelected: boolean;
  filtroUnidad!: boolean;
  filtroPlan!: boolean;
  reporteHabilitado!: boolean;
  periodos!: Periodo[];
  vigencia!: Vigencia | any;
  tipo!: string | any;
  guardarDisabled: boolean;
  unidadesInteres: Unidad[] | any;
  planesInteres!: PlanInteres[] | any;
  unidadesInteresPeriodoSeguimiento!: Unidad[];
  planesInteresPeriodoSeguimiento!: PlanInteres[];
  seguimiento!: Seguimiento;
  periodoSeguimiento!: PeriodoSeguimiento;
  periodoSeguimientoListarPlan: PeriodoSeguimiento;
  periodoSeguimientoListarUnidades: PeriodoSeguimiento;
  user!: Usuario;

  selectVigencia = new FormControl();
  selectTipo = new FormControl();
  selectFiltro = new FormControl();

  @Input() formFechas!: FormGroup | any; // Propiedad que se recibe desde el componente padre (habilitar-reporte.component.ts)
  @Input() vigencias!: Vigencia[]; // Propiedad que se recibe desde el componente padre (habilitar-reporte.component.ts)

  constructor(
    private request: RequestManager,
    private habilitarReporteService: HabilitarReporteService,
  ) {
    this.vigenciaSelected = false;
    this.guardarDisabled = false;
    this.filtroSelected = false;
    this.banderaPlanesInteresPeriodoSeguimiento = false;
    this.periodoSeguimientoListarPlan = {} as PeriodoSeguimiento;
    this.periodoSeguimientoListarUnidades = {} as PeriodoSeguimiento;
  }

  ngOnInit(): void {
    const storedData = localStorage.getItem('user')
    this.user =  storedData ? JSON.parse(atob(storedData)) : null;
  }

  // Función para manejar los cambios en las unidades de interés
  manejarCambiosUnidadesInteres(nuevasUnidades: Unidad[]) {
    this.unidadesInteres = nuevasUnidades;
    
    if(this.tipo == PROCESO_FUNCIONAMIENTO_FORMULACION) {
      this.periodoSeguimientoListarPlan.tipo_seguimiento_id = "6260e975ebe1e6498f7404ee";
      this.periodoSeguimientoListarPlan.periodo_id = this.vigencia.Id.toString();
    } else {
      this.periodoSeguimientoListarPlan.tipo_seguimiento_id = "61f236f525e40c582a0840d0";
      this.periodoSeguimientoListarPlan.periodo_id = this.periodos[0].Id.toString();
    }
    this.periodoSeguimientoListarPlan.unidades_interes = JSON.stringify(this.unidadesInteres);
    this.periodoSeguimientoListarPlan.activo = true;
  }

  // Función para manejar los cambios en los planes de interés
  manejarCambiosPlanesInteres(nuevosPlanes: PlanInteres[]) {
    this.planesInteres = nuevosPlanes;

    if(this.tipo == PROCESO_FUNCIONAMIENTO_FORMULACION) {
      this.periodoSeguimientoListarUnidades.tipo_seguimiento_id = "6260e975ebe1e6498f7404ee";
      this.periodoSeguimientoListarUnidades.periodo_id = this.vigencia.Id.toString();
    } else {
      this.periodoSeguimientoListarUnidades.tipo_seguimiento_id = "61f236f525e40c582a0840d0";
      this.periodoSeguimientoListarUnidades.periodo_id = this.periodos[0].Id.toString();
    }
    this.periodoSeguimientoListarUnidades.planes_interes = JSON.stringify(this.planesInteres);
    this.periodoSeguimientoListarUnidades.activo = true;
  }

  // Función para comparar dos registros de la interfaz Unidad
  sonIguales(unidad1: Unidad, unidad2: Unidad): boolean {
    return unidad1.Id === unidad2.Id && unidad1.Nombre === unidad2.Nombre;
  }

  // Función para verificar si hay dos registros iguales en los arrays
  hayRegistrosIguales(arr1: Unidad[], arr2: Unidad[]): boolean {
    return arr1.some((unidad1) => arr2.some((unidad2) => this.sonIguales(unidad1, unidad2)));
  }

  onChangeVigencia(vigencia: Vigencia) {
    if (vigencia == undefined) {
      this.guardarDisabled = true;
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.loadTrimestres(this.vigencia);
    }
  }

  onChangeProceso(tipo: string) {
    if (tipo == undefined) {
      this.tipoSelected = false;
    } else {
      this.tipoSelected = true;
      this.tipo = tipo;
    }
  }

  onChangeFiltro(filtro: string) {
    if (filtro == undefined) {
      this.filtroSelected = false;
    } else {
      if (filtro === 'unidad') {
        this.filtroUnidad = true;
        this.filtroPlan = false;
      } else if (filtro === 'plan') {
        this.filtroPlan = true;
        this.filtroUnidad = false;
      }
    }
  }

  banderaTabla(objeto: string) {
    //Objeto hace referencia a las unidades o proyectos
    switch (objeto) {
      case 'unidades':
        this.banderaUnidadesInteres = true;
        break;
      case 'planes_proyectos':
        this.banderaPlanesInteres = true;
        break;
      default:
        this.banderaUnidadesInteres = false;
        this.banderaPlanesInteres = false;
    }
  }

  loadFechas() {
    Swal.fire({
      title: 'Cargando Fechas',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    if (this.tipo === PROCESO_FUNCIONAMIENTO_FORMULACION) {
      this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe((data: DataRequest) => {
        if (data) {
          if (data.Data.length != 0) {
            this.seguimiento = data.Data[0];
            this.formFechas.get('fecha9').setValue(new Date(this.seguimiento.fecha_inicio));
            this.formFechas.get('fecha10').setValue(new Date(this.seguimiento.fecha_fin));
            if(this.habilitarReporteService.isValidObjectId(this.seguimiento.periodo_seguimiento_id)){
              this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,_id:${this.seguimiento.periodo_seguimiento_id}`).subscribe((data: DataRequest) => {
                if(data){
                  if(data.Data.length > 0){
                    this.periodoSeguimiento = data.Data[0];
                    this.unidadesInteresPeriodoSeguimiento = JSON.parse(this.periodoSeguimiento.unidades_interes);
                    Swal.close();
                  }
                }
              })
            }
            Swal.close();
          } else {
            Swal.close();
          }
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    } else if (this.tipo === PROCESO_FUNCIONAMIENTO_SEGUIMIENTO) {
      if (this.periodos && this.periodos.length > 0) {
        for (let i = 0; i < this.periodos.length; i++) {
          this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[i].Id + `,tipo_seguimiento_id:61f236f525e40c582a0840d0`).subscribe((data: DataRequest) => {
            if (data.Data.length != 0) {
              let seguimiento: PeriodoSeguimiento = data.Data[0];
              this.periodoSeguimiento = data.Data[0];
              let fechaInicio = new Date(seguimiento.fecha_inicio);
              let fechaFin = new Date(seguimiento.fecha_fin);
              this.unidadesInteresPeriodoSeguimiento = JSON.parse(this.periodoSeguimiento.unidades_interes);
              if (i == 0) {
                this.formFechas.get('fecha1').setValue(fechaInicio);
                this.formFechas.get('fecha2').setValue(fechaFin);
              } else if (i == 1) {
                this.formFechas.get('fecha3').setValue(fechaInicio);
                this.formFechas.get('fecha4').setValue(fechaFin);
              } else if (i == 2) {
                this.formFechas.get('fecha5').setValue(fechaInicio);
                this.formFechas.get('fecha6').setValue(fechaFin);
              } else if (i == 3) {
                this.formFechas.get('fecha7').setValue(fechaInicio);
                this.formFechas.get('fecha8').setValue(fechaFin);
                Swal.close();
              }
            } else {
              Swal.close();
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          })
        }
      } else {
        Swal.close();
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encuentran trimestres habilitados para esta vigencia`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    }
  }

  async loadTrimestres(vigencia: Vigencia) {
    await this.habilitarReporteService.loadTrimestres(vigencia);
    this.habilitarReporteService.getTrimestresSubject().subscribe(
      (data: any) => {
        if(data.error) {
          this.guardarDisabled = true;
          this.periodos = [];
          Swal.close();
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron trimestres para esta vigencia, por favor comunicarse con computo@udistrital.edu.co`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 3000
          })
        } else {
          if(data == null) {
            this.guardarDisabled = true;
            this.periodos = [];
            Swal.close();
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron trimestres para esta vigencia, por favor comunicarse con computo@udistrital.edu.co`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 3000
            })
          } else if (data.Data != null) {
            this.periodos = data.Data;
            this.guardarDisabled = false;
            Swal.close();
          }
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    );
  }

  guardar() {
    if(this.unidadesInteres == undefined || this.unidadesInteres.length == 0){
      Swal.fire({
        title: 'Error en la operación',
        text: `Por favor seleccione las unidades de interés para continuar`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }
    
    if (this.tipo == PROCESO_FUNCIONAMIENTO_FORMULACION) {
      const tipo_seguimiento_id: string = "6260e975ebe1e6498f7404ee"
      var periodo_seguimiento_formulacion: PeriodoSeguimiento = {} as PeriodoSeguimiento;
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha9').value != "" && this.formFechas.get('fecha10').value != "") {
            periodo_seguimiento_formulacion.periodo_id = this.vigencia.Id.toString();
            periodo_seguimiento_formulacion.fecha_inicio = this.formFechas.get('fecha9').value;
            periodo_seguimiento_formulacion.fecha_fin = this.formFechas.get('fecha10').value;
            periodo_seguimiento_formulacion.tipo_seguimiento_id = tipo_seguimiento_id;
            periodo_seguimiento_formulacion.unidades_interes = JSON.stringify(this.unidadesInteres);
            periodo_seguimiento_formulacion.planes_interes = JSON.stringify(this.planesInteres);
            periodo_seguimiento_formulacion.usuario_modificacion = this.user.userService.documento ? this.user.userService.documento : '';
            periodo_seguimiento_formulacion.activo = true;
            this.request.post(environment.PLANES_FORMULACION_MID, 'formulacion/habilitar_fechas', periodo_seguimiento_formulacion)
            .subscribe(
              (data: DataRequest) => {
                if (data && data.Success) {
                  Swal.fire({
                    title: 'Fechas Actualizadas',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2500
                  });
                  this.limpiarForm()
                } else {
                  Swal.fire({
                    title: 'Error al actualizar las fechas',
                    icon: 'error',
                    text: 'Hubo un error al realizar el proceso de actualización de fechas, inténtelo de nuevo.',
                    showConfirmButton: false,
                    timer: 2500,
                  });
                }
              }, (error) => {
                Swal.fire({
                  title: 'Error en la operación',
                  icon: 'error',
                  text: `Hubo un problema al procesar la solicitud. Por favor, inténtelo de nuevo.`,
                  showConfirmButton: false,
                  timer: 2500,
                });
              }
            );
          }
        }
      }), (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `${JSON.stringify(error)}`,
            showConfirmButton: false,
            timer: 2500,
          });
        };
    } else {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar el seguimiento de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (
            this.formFechas.get('fecha1').value != '' &&
            this.formFechas.get('fecha2').value != '' &&
            this.formFechas.get('fecha3').value != '' &&
            this.formFechas.get('fecha4').value != '' &&
            this.formFechas.get('fecha5').value != '' &&
            this.formFechas.get('fecha6').value != '' &&
            this.formFechas.get('fecha7').value != '' &&
            this.formFechas.get('fecha8').value != ''
          ) {
            for (let i = 0; i < this.periodos.length; i++) {
              this.actualizarPeriodo(i, this.periodos[i].Id);
            }
            Swal.fire({
              title: 'Fechas Actualizadas',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500,
            });
            this.limpiarForm()
          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las fechas para continuar`,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        }
      }), 
      (error: any) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500,
        });
      };
    }
  }

  actualizarPeriodo(i: number, periodoId: number) {
    const tipo_seguimiento_id: string = "61f236f525e40c582a0840d0"
    var periodo_seguimiento_seguimiento: PeriodoSeguimiento = {} as PeriodoSeguimiento;
    let fecha_inicio: any, fecha_fin: any;
    if (i === 0) {
      fecha_inicio = new Date(this.formFechas.get('fecha1').value);
      fecha_fin = new Date(this.formFechas.get('fecha2').value);
    } else if (i === 1) {
      fecha_inicio = new Date(this.formFechas.get('fecha3').value);
      fecha_fin = new Date(this.formFechas.get('fecha4').value);
    } else if (i === 2) {
      fecha_inicio = new Date(this.formFechas.get('fecha5').value);
      fecha_fin = new Date(this.formFechas.get('fecha6').value);
    } else if (i === 3) {
      fecha_inicio = new Date(this.formFechas.get('fecha7').value);
      fecha_fin = new Date(this.formFechas.get('fecha8').value);
    }

    if (fecha_fin.getHours() == 19) {
      fecha_fin.setHours(42, 59, 59);
    } else {
      fecha_fin.setHours(18, 59, 59);
    }

    periodo_seguimiento_seguimiento.periodo_id = periodoId.toString();
    periodo_seguimiento_seguimiento.fecha_inicio = fecha_inicio.toISOString();
    periodo_seguimiento_seguimiento.fecha_fin = fecha_fin.toISOString();
    periodo_seguimiento_seguimiento.tipo_seguimiento_id = tipo_seguimiento_id;
    periodo_seguimiento_seguimiento.unidades_interes = JSON.stringify(this.unidadesInteres);
    periodo_seguimiento_seguimiento.planes_interes = JSON.stringify(this.planesInteres);
    periodo_seguimiento_seguimiento.usuario_modificacion = this.user.userService.documento ? this.user.userService.documento : '';
    periodo_seguimiento_seguimiento.activo = true;

    this.request.post(environment.PLANES_FORMULACION_MID, `formulacion/habilitar_fechas`, periodo_seguimiento_seguimiento).subscribe((data: DataRequest) => {
      if (data) {
        Swal.fire({
          title: 'Fechas Actualizadas',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `Hubo un problema al procesar la solicitud. Por favor, inténtelo de nuevo.`,
          showConfirmButton: false,
          timer: 2500,
        });
      }
    );
  }

  limpiarForm() {
    this.vigenciaSelected = false;
    this.vigencia = undefined;
    this.tipo = undefined;
    this.tipoSelected = false;
    this.selectTipo.setValue('');
    this.selectVigencia.setValue('--');
    this.unidadesInteres = undefined;
    this.planesInteres = undefined;
    this.selectFiltro.setValue('');
    this.filtroSelected = false;
    this.filtroPlan = false;
    this.filtroUnidad = false;

    // Limpieza de fechas para proceso de formulacion
    this.formFechas.get('fecha9').setValue('');
    this.formFechas.get('fecha10').setValue('');

    // Limpieza de fechas para proceso de seguimiento
    this.formFechas.get('fecha1').setValue('');
    this.formFechas.get('fecha2').setValue('');
    this.formFechas.get('fecha3').setValue('');
    this.formFechas.get('fecha4').setValue('');
    this.formFechas.get('fecha5').setValue('');
    this.formFechas.get('fecha6').setValue('');
    this.formFechas.get('fecha7').setValue('');
    this.formFechas.get('fecha8').setValue('');
  }
}
