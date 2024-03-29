import { Component, Input, OnInit } from '@angular/core';
import { Periodo, PeriodoSeguimiento, Unidad, Vigencia } from '../utils/habilitar-reportes.models';
import { FormControl, FormGroup } from '@angular/forms';
import { RequestManager } from 'src/app/components/services/requestManager';
import { HabilitarReporteService } from '../habilitar-reporte.service';
import Swal from 'sweetalert2';
import { PROCESO_INVERSION_FORMULACION, PROCESO_INVERSION_SEGUIMIENTO } from '../utils/constantes';
import { environment } from 'src/environments/environment';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';

@Component({
  selector: 'app-inversion',
  templateUrl: './inversion.component.html',
  styleUrls: ['./inversion.component.scss']
})
export class InversionComponent implements OnInit{
  vigenciaSelected: boolean;
  tipoSelected!: boolean;
  reporteHabilitado!: boolean;
  periodos!: Periodo[];
  vigencia!: Vigencia | any;
  tipo!: string | any;
  guardarDisabled: boolean;
  unidadesInteres: Unidad[] | any;

  selectVigencia = new FormControl();
  selectTipo = new FormControl();

  @Input() formFechas!: FormGroup | any; // Propiedad que se recibe desde el componente padre habilitar-reporte.component.ts
  @Input() vigencias!: Vigencia[]; // Propiedad que se recibe desde el componente padre habilitar-reporte.component.ts

  constructor(
    private request: RequestManager,
    private habilitarReporteService: HabilitarReporteService,
  ) {
    this.vigenciaSelected = false;
    this.guardarDisabled = false;
  }

  ngOnInit(): void {
    this.unidadesInteres = [];
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

  loadFechas() {
    Swal.fire({
      title: 'Cargando Fechas',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    if (this.tipo === PROCESO_INVERSION_FORMULACION) {
      if (this.periodos && this.periodos.length > 0) {
        this.readUnidadesForm();
      } else {
        Swal.close();
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500,
        });
      }
      this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,tipo_seguimiento_id:6389efac6a0d190ffb883f71`).subscribe((data: DataRequest) => {
        if (data) {
          if (data.Data.length != 0) {
            let formulacionSeguimiento: PeriodoSeguimiento = data.Data[0];
            let fechaInicio = new Date(formulacionSeguimiento.fecha_inicio);
            let fechaFin = new Date(formulacionSeguimiento.fecha_fin);
            this.formFechas.get('fecha19').setValue(fechaInicio);
            this.formFechas.get('fecha20').setValue(fechaFin);
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
    } else if (this.tipo === PROCESO_INVERSION_SEGUIMIENTO) {
      if (this.periodos && this.periodos.length > 0) {
        this.readUnidades();
        for (let i = 0; i < this.periodos.length; i++) {
          this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[i].Id + `,tipo_seguimiento_id:6385fa136a0d19d7888837ed`).subscribe((data: DataRequest) => {
            if (data.Data.length != 0) {
              let seguimiento: PeriodoSeguimiento = data.Data[0];
              let fechaInicio = new Date(seguimiento.fecha_inicio);
              let fechaFin = new Date(seguimiento.fecha_fin);

              if (i == 0) {
                this.formFechas.get('fecha11').setValue(fechaInicio);
                this.formFechas.get('fecha12').setValue(fechaFin);
              } else if (i == 1) {
                this.formFechas.get('fecha13').setValue(fechaInicio);
                this.formFechas.get('fecha14').setValue(fechaFin);
              } else if (i == 2) {
                this.formFechas.get('fecha15').setValue(fechaInicio);
                this.formFechas.get('fecha16').setValue(fechaFin);
              } else if (i == 3) {
                this.formFechas.get('fecha17').setValue(fechaInicio);
                this.formFechas.get('fecha18').setValue(fechaFin);
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

  readUnidadesForm() {
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[0].Id + `,tipo_seguimiento_id:6389efac6a0d190ffb883f71`).subscribe((data: DataRequest) => {
      if (data) {
        if (data.Data.length != 0) {
          this.unidadesInteres = JSON.parse(data.Data[0].unidades_interes);
          if (data.Data[0].unidades_interes == undefined) {
            this.unidadesInteres = ' ';
          }
        } else if (data.Data.length == 0) {
          this.unidadesInteres = ' ';
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
    });
  }

  readUnidades() {
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[0].Id + `,tipo_seguimiento_id:6385fa136a0d19d7888837ed`).subscribe((data: DataRequest) => {
      if (data) {
        if (data.Data.length != 0) {
          this.unidadesInteres = JSON.parse(data.Data[0].unidades_interes);
          if (data.Data[0].unidades_interes == undefined) {
            this.unidadesInteres = ' ';
          }
        } else if (data.Data.length == 0) {
          this.unidadesInteres = ' ';
        }
      }
    }, (error) => {
    Swal.fire({
      title: 'Error en la operación',
      text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
      icon: 'warning',
      showConfirmButton: false,
          timer: 2500,
        });
      }
    );
  }

  guardar() {
    if (this.tipo == PROCESO_INVERSION_FORMULACION) {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha19').value != "" && this.formFechas.get('fecha20').value != "") {
            this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,tipo_seguimiento_id:6389efac6a0d190ffb883f71`).subscribe((data: DataRequest) => {
              if (data) {
                if (data.Data.length > 0) {
                  let seguimientoFormulacion: PeriodoSeguimiento = data.Data[0];
                  seguimientoFormulacion.periodo_id = this.periodos[0].Id.toString();
                  seguimientoFormulacion.fecha_inicio = this.formFechas.get('fecha19').value.toISOString();
                  seguimientoFormulacion.fecha_fin = this.formFechas.get('fecha20').value.toISOString();
                  seguimientoFormulacion.unidades_interes = JSON.stringify(this.unidadesInteres);
                  seguimientoFormulacion.planes_interes = JSON.stringify([]);
                  this.request.put(environment.PLANES_CRUD, `periodo-seguimiento`, seguimientoFormulacion, seguimientoFormulacion["_id"]).subscribe((data: DataRequest) => {
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
                } else {
                  let seguimientoFormulacion = {
                    //nombre: "Seguimiento Formulación",
                    //descripcion: "Fechas para control de formulación de inversión",
                    //plan_id: "No aplica",
                    //dato: "{}",
                    periodo_id: this.periodos[0].Id,
                    tipo_seguimiento_id: "6389efac6a0d190ffb883f71",
                    //estado_seguimiento_id: "No aplica",
                    //periodo_seguimiento_id: "No aplica",
                    activo: true,
                    fecha_inicio: this.formFechas.get('fecha19').value.toISOString(),
                    fecha_fin: this.formFechas.get('fecha20').value.toISOString(),
                    unidades_interes: JSON.stringify(this.unidadesInteres),
                    planes_interes: JSON.stringify([]),
                  }
                  this.request.post(environment.PLANES_CRUD, `periodo-seguimiento`, seguimientoFormulacion).subscribe((data: DataRequest) => {
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
    } else if (this.tipo == PROCESO_INVERSION_SEGUIMIENTO) {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar el seguimiento de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (
            this.formFechas.get('fecha11').value != '' &&
            this.formFechas.get('fecha12').value != '' &&
            this.formFechas.get('fecha13').value != '' &&
            this.formFechas.get('fecha14').value != '' &&
            this.formFechas.get('fecha15').value != '' &&
            this.formFechas.get('fecha16').value != '' &&
            this.formFechas.get('fecha17').value != '' &&
            this.formFechas.get('fecha18').value != ''
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
    let fecha_In: any;
    let fecha_Fin: any;

    if (i === 0) {
      fecha_In = this.formFechas.get('fecha11').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha12').value.toISOString();
    } else if (i === 1) {
      fecha_In = this.formFechas.get('fecha13').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha14').value.toISOString();
    } else if (i === 2) {
      fecha_In = this.formFechas.get('fecha15').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha16').value.toISOString();
    } else if (i === 3) {
      fecha_In = this.formFechas.get('fecha17').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha18').value.toISOString();
    }
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + periodoId + `,tipo_seguimiento_id:6385fa136a0d19d7888837ed`).subscribe((data: DataRequest) => {
      if (data) {
        let seguimientoFormulacionGlobal: PeriodoSeguimiento = data.Data[0];
        if (data.Data.length == 0) {
          let body = {
            periodo_id: periodoId.toString(),
            fecha_inicio: fecha_In,
            fecha_fin: fecha_Fin,
            activo: true,
            tipo_seguimiento_id: '6385fa136a0d19d7888837ed',
            unidades_interes: JSON.stringify(this.unidadesInteres),
            planes_interes: JSON.stringify([]),
          };
          this.request.post(environment.PLANES_CRUD, `periodo-seguimiento`, body).subscribe((data: DataRequest) => {
            if (data) {
              Swal.fire({
                title: 'Error en la operación',
                text: `No se creó el registro`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            }
          })
        } else if (data.Data.length > 0) {
          seguimientoFormulacionGlobal.fecha_fin = fecha_In;
          seguimientoFormulacionGlobal.fecha_fin = fecha_Fin;
          seguimientoFormulacionGlobal.tipo_seguimiento_id = '6385fa136a0d19d7888837ed';
          seguimientoFormulacionGlobal.unidades_interes = JSON.stringify(this.unidadesInteres);
          seguimientoFormulacionGlobal.planes_interes = JSON.stringify([]);
          this.request.put(environment.PLANES_CRUD, `periodo-seguimiento`, seguimientoFormulacionGlobal, seguimientoFormulacionGlobal._id).subscribe((data: DataRequest) => {
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
              text: `No se actualizo el registro ${JSON.stringify(error)}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          })
        }
      }
    })
  }

  limpiarForm() {
    this.vigencia = undefined;
    this.vigenciaSelected = false;
    this.tipo = undefined;
    this.tipoSelected = false;
    this.selectTipo.setValue('');
    this.selectVigencia.setValue('--');
    this.unidadesInteres = undefined;
    if (this.tipo === PROCESO_INVERSION_FORMULACION) {
      this.formFechas.get('fecha19').setValue('');
      this.formFechas.get('fecha20').setValue('');
    } else if (this.tipo == PROCESO_INVERSION_SEGUIMIENTO) {
      this.formFechas.get('fecha11').setValue('');
      this.formFechas.get('fecha12').setValue('');
      this.formFechas.get('fecha13').setValue('');
      this.formFechas.get('fecha14').setValue('');
      this.formFechas.get('fecha15').setValue('');
      this.formFechas.get('fecha16').setValue('');
      this.formFechas.get('fecha17').setValue('');
      this.formFechas.get('fecha18').setValue('');
    }
  }
}
