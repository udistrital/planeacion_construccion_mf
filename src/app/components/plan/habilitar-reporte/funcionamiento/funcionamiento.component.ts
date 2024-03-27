import { Component, Input } from '@angular/core';
import { Periodo, PeriodoSeguimiento, PlanInteres, Seguimiento, Unidad, Vigencia } from '../utils/habilitar-reportes.models';
import { FormControl, FormGroup } from '@angular/forms';
import { RequestManager } from 'src/app/components/services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { HabilitarReporteService } from '../habilitar-reporte.service';
import { PROCESO_FUNCIONAMIENTO_FORMULACION, PROCESO_FUNCIONAMIENTO_SEGUIMIENTO } from '../utils/constantes';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';

@Component({
  selector: 'app-funcionamiento',
  templateUrl: './funcionamiento.component.html',
  styleUrls: ['./funcionamiento.component.scss']
})
export class FuncionamientoComponent {
  vigenciaSelected: boolean;
  banderaUnidadesInteres!: boolean;
  banderaPlanesInteres!: boolean;
  banderaPlanesInteresPeriodoSeguimiento: boolean;
  tipoSelected!: boolean;
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

  selectVigencia = new FormControl();
  selectTipo = new FormControl();

  @Input() formFechas!: FormGroup | any; // Propiedad que se recibe desde el componente padre (habilitar-reporte.component.ts)
  @Input() vigencias!: Vigencia[]; // Propiedad que se recibe desde el componente padre (habilitar-reporte.component.ts)

  constructor(
    private request: RequestManager,
    private habilitarReporteService: HabilitarReporteService,
  ) {
    this.vigenciaSelected = false;
    this.guardarDisabled = false;
    this.banderaPlanesInteresPeriodoSeguimiento = false;
  }

  ngOnInit(): void { }

  // Función para manejar los cambios en las unidades de interés
  manejarCambiosUnidadesInteres(nuevasUnidades: Unidad[]) {
    this.unidadesInteres = nuevasUnidades;
    
    // Aquí se comparan this.unidadesInteres con las unidadesInteres del registro en la base de datos
    this.banderaPlanesInteresPeriodoSeguimiento = this.hayRegistrosIguales(this.unidadesInteres, this.unidadesInteresPeriodoSeguimiento);
    if(this.banderaPlanesInteresPeriodoSeguimiento){
      this.planesInteresPeriodoSeguimiento = JSON.parse(this.periodoSeguimiento.planes_interes);
      this.planesInteresPeriodoSeguimiento.forEach(plan => {
        plan.fecha_modificacion = this.periodoSeguimiento.fecha_modificacion;
      });
    } else {
      this.planesInteresPeriodoSeguimiento = [];
    }
  }

  // Función para manejar los cambios en los planes de interés
  manejarCambiosPlanesInteres(nuevosPlanes: PlanInteres[]) {
    this.planesInteres = nuevosPlanes;
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
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.loadTrimestres(this.vigencia);
      if (this.tipoSelected) this.loadFechas();
    }
  }

  onChangeProceso(tipo: string) {
    if (tipo == undefined) {
      this.tipoSelected = false;
    } else {
      this.tipoSelected = true;
      this.tipo = tipo;
      this.loadFechas();
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

  loadTrimestres(vigencia: Vigencia) {
    this.habilitarReporteService.loadTrimestres(vigencia);
    this.habilitarReporteService.getTrimestresSubject().subscribe(
      (data: DataRequest) => {
        if (data.Data != "") {
          this.periodos = data.Data;
          this.guardarDisabled = false;
          Swal.close();
        } else {
          this.guardarDisabled = true;
          this.periodos = [];
          Swal.close();
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron trimestres para esta vigencia`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
      },
      (error) => {
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
    if(this.planesInteres == undefined || this.planesInteres.length == 0){
      Swal.fire({
        title: 'Error en la operación',
        text: `Por favor seleccione los planes de interés para continuar`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }

    if (this.tipo == PROCESO_FUNCIONAMIENTO_FORMULACION) {
      var seguimiento: Seguimiento;
      var periodo_seguimiento_formulacion: PeriodoSeguimiento;
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha9').value != "" && this.formFechas.get('fecha10').value != "") {
            this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe(async (data: DataRequest) => {
              if (data) {
                if (data.Data.length > 0) {
                  seguimiento = data.Data[0];
                  seguimiento.fecha_inicio = this.formFechas.get('fecha9').value//.toISOString();
                  seguimiento.fecha_fin = this.formFechas.get('fecha10').value//.toISOString();
                  if(this.habilitarReporteService.isValidObjectId(seguimiento.periodo_seguimiento_id)){
                    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,_id:${seguimiento.periodo_seguimiento_id}`).subscribe((data: DataRequest) => {
                      if (data.Data.length > 0) {
                        periodo_seguimiento_formulacion = data.Data[0];
                        periodo_seguimiento_formulacion.periodo_id = "46";
                        periodo_seguimiento_formulacion.fecha_inicio = this.formFechas.get('fecha9').value;
                        periodo_seguimiento_formulacion.fecha_fin = this.formFechas.get('fecha10').value;
                        periodo_seguimiento_formulacion.unidades_interes = JSON.stringify(this.unidadesInteres);
                        periodo_seguimiento_formulacion.planes_interes = JSON.stringify(this.planesInteres);
                        this.request.put(environment.PLANES_CRUD, `periodo-seguimiento`, periodo_seguimiento_formulacion, seguimiento.periodo_seguimiento_id).subscribe((data: DataRequest) => {
                          if (data) {
                            this.request.put(environment.PLANES_CRUD, `seguimiento`, seguimiento, seguimiento._id).subscribe((data: DataRequest) => {
                              if (data) {
                                Swal.fire({
                                  title: 'Fechas Actualizadas',
                                  icon: 'success',
                                  showConfirmButton: false,
                                  timer: 2500
                                })
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
                    })
                  } else { // Si el ObjectId de periodo_seguimiendo_id no es válido, se crea un registro en periodo-seguimiento
                    seguimiento.periodo_seguimiento_id = "";
                    let bodySeguimientoPeriodoFormulacion = {
                      fecha_inicio: this.formFechas.get('fecha9').value,
                      fecha_fin: this.formFechas.get('fecha10').value,
                      periodo_id: "46", //Este periodo_id hace ref. al registro de fechas para proceso de seguimiento de los planes de acción de funcionamiento
                      tipo_seguimiento_id: "6260e975ebe1e6498f7404ee",
                      unidades_interes: JSON.stringify(this.unidadesInteres),
                      planes_interes: JSON.stringify(this.planesInteres),
                      activo: true,
                    }
                    await this.request.post(environment.PLANES_CRUD, `periodo-seguimiento`, bodySeguimientoPeriodoFormulacion).subscribe((data: DataRequest) => {
                      if (data) {
                        periodo_seguimiento_formulacion = data.Data;
                        seguimiento.periodo_seguimiento_id = periodo_seguimiento_formulacion._id;
                        this.request.put(environment.PLANES_CRUD, `seguimiento`, seguimiento, seguimiento._id).subscribe((data: DataRequest) => {
                          if (data) {
                            Swal.fire({
                              title: 'Fechas Actualizadas',
                              icon: 'success',
                              showConfirmButton: false,
                              timer: 2500
                            })
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
                    }, (error) => {
                      Swal.fire({
                        title: 'Error en la operación',
                        text: `Por favor intente de nuevo`,
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 2500
                      })
                    })
                  }
                } else { //Hay que implementar el código para insertar unidades y planes de interes
                  let seguimiento = {
                    nombre: "Seguimiento Formulación",
                    descripcion: "Fechas para control de formulación",
                    plan_id: "No aplica",
                    dato: "{}",
                    tipo_seguimiento_id: "6260e975ebe1e6498f7404ee",
                    estado_seguimiento_id: "No aplica",
                    periodo_seguimiento_id: "No aplica",
                    activo: true,
                    fecha_inicio: this.formFechas.get('fecha9').value.toISOString(),
                    fecha_fin: this.formFechas.get('fecha10').value.toISOString()
                  }
                  this.request.post(environment.PLANES_CRUD, `seguimiento`, seguimiento).subscribe((data: DataRequest) => {
                    if (data) {
                      Swal.fire({
                        title: 'Fechas Actualizadas',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2500
                      })
                    }
                  }, (error) => {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `Por favor intente de nuevo`,
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500
                    })
                  })

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
      }), (error: any) => {
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
    let body: { periodo_id: string; fecha_inicio: any; fecha_fin: any; unidades_interes: any, planes_interes: any};
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

    body = {
      periodo_id: periodoId.toString(),
      fecha_inicio: fecha_inicio.toISOString(),
      fecha_fin: fecha_fin.toISOString(),
      unidades_interes: JSON.stringify(this.unidadesInteres),
      planes_interes: JSON.stringify(this.planesInteres),
    };

    this.request.put(environment.PLANES_MID, `seguimiento/habilitar_reportes`, body, "").subscribe(), (error: any) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500,
      });
    };
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
    if (this.tipo === PROCESO_FUNCIONAMIENTO_FORMULACION) {
      this.formFechas.get('fecha9').setValue('');
      this.formFechas.get('fecha10').setValue('');
    } else if (this.tipo == PROCESO_FUNCIONAMIENTO_SEGUIMIENTO) {
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
}
