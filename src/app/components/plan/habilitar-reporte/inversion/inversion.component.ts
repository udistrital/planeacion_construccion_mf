import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';
import { RequestManager } from 'src/app/components/services/requestManager';
import { HabilitarReporteService } from '../habilitar-reporte.service';
import { Periodo, PeriodoSeguimiento, PlanInteres, PROCESO_INVERSION_FORMULACION, PROCESO_INVERSION_SEGUIMIENTO, Unidad, Usuario, Vigencia } from '../utils';

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
  filtroSelected!: boolean;
  filtroUnidad!: boolean;
  filtroPlan!: boolean;
  planesInteres!: PlanInteres[] | undefined;
  periodoSeguimientoListarPlan!: PeriodoSeguimiento;
  periodoSeguimientoListarUnidades!: PeriodoSeguimiento;
  banderaUnidadesInteres!: boolean;
  banderaPlanesInteres!: boolean;
  banderaPlanesInteresPeriodoSeguimiento!: boolean;
  user!: Usuario;

  selectVigencia = new FormControl();
  selectTipo = new FormControl();
  selectFiltro = new FormControl();

  @Input() formFechas!: FormGroup | any; // Propiedad que se recibe desde el componente padre habilitar-reporte.component.ts
  @Input() vigencias!: Vigencia[]; // Propiedad que se recibe desde el componente padre habilitar-reporte.component.ts

  constructor(
    private request: RequestManager,
    private habilitarReporteService: HabilitarReporteService,
  ) {
    this.filtroSelected = false;
    this.vigenciaSelected = false;
    this.guardarDisabled = false;
    this.banderaPlanesInteresPeriodoSeguimiento = false;
    this.periodoSeguimientoListarPlan = {} as PeriodoSeguimiento;
    this.periodoSeguimientoListarUnidades = {} as PeriodoSeguimiento;
  }

  ngOnInit(): void {
    const storedData = localStorage.getItem('user')
    this.user =  storedData ? JSON.parse(atob(storedData)) : null;
  }

  manejarCambiosUnidadesInteres(nuevasUnidades: Unidad[]) {
    this.unidadesInteres = nuevasUnidades;
    if(this.tipo == PROCESO_INVERSION_FORMULACION) {
      this.periodoSeguimientoListarPlan.tipo_seguimiento_id = "6389efac6a0d190ffb883f71";
      this.periodoSeguimientoListarPlan.periodo_id = this.vigencia.Id.toString();
    } else {
      this.periodoSeguimientoListarPlan.tipo_seguimiento_id = "6385fa136a0d19d7888837ed";
      this.periodoSeguimientoListarPlan.periodo_id = this.periodos[0].Id.toString();
    }
    this.periodoSeguimientoListarPlan.unidades_interes = JSON.stringify(this.unidadesInteres);
    this.periodoSeguimientoListarPlan.activo = true;
  }

  // Función para manejar los cambios en los planes de interés
  manejarCambiosPlanesInteres(nuevosPlanes: PlanInteres[]) {
    this.planesInteres = nuevosPlanes;
    if(this.tipo == PROCESO_INVERSION_FORMULACION) {
      this.periodoSeguimientoListarUnidades.tipo_seguimiento_id = "6389efac6a0d190ffb883f71";
      this.periodoSeguimientoListarUnidades.periodo_id = this.vigencia.Id.toString();
    } else {
      this.periodoSeguimientoListarUnidades.tipo_seguimiento_id = "6385fa136a0d19d7888837ed";
      this.periodoSeguimientoListarUnidades.periodo_id = this.periodos[0].Id.toString();
    }
    this.periodoSeguimientoListarUnidades.planes_interes = JSON.stringify(this.planesInteres);
    this.periodoSeguimientoListarUnidades.activo = true;
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
      (data: any) => {
        if (data.error) {
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
          if (data == null) {
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

    if (this.tipo == PROCESO_INVERSION_FORMULACION) {
      const tipo_seguimiento_id: string = "6389efac6a0d190ffb883f71";
      var periodo_seguimiento_inversion: PeriodoSeguimiento = {} as PeriodoSeguimiento; // Declara el objeto periodo_seguimiento_inversion
      
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha19').value != "" && this.formFechas.get('fecha20').value != "") {
            periodo_seguimiento_inversion.periodo_id = this.vigencia.Id.toString();
            periodo_seguimiento_inversion.fecha_inicio = this.formFechas.get('fecha19').value.toISOString();
            periodo_seguimiento_inversion.fecha_fin = this.formFechas.get('fecha20').value.toISOString();
            periodo_seguimiento_inversion.tipo_seguimiento_id = tipo_seguimiento_id;
            periodo_seguimiento_inversion.unidades_interes = JSON.stringify(this.unidadesInteres);
            periodo_seguimiento_inversion.planes_interes = JSON.stringify(this.planesInteres);
            periodo_seguimiento_inversion.usuario_modificacion = this.user.userService.documento ? this.user.userService.documento : '';
            periodo_seguimiento_inversion.activo = true;
    
            this.request.post(environment.PLANES_FORMULACION_MID, 'formulacion/habilitar_fechas_funcionamiento', periodo_seguimiento_inversion).subscribe((data: DataRequest) => {
              if (data) {
                Swal.fire({
                  title: 'Fechas Actualizadas',
                  icon: 'success',
                  showConfirmButton: false,
                  timer: 2500
                });
                this.limpiarForm();
              }
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                text: `Por favor intente de nuevo`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              });
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
      }, (error: any) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500,
        });
      });
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
    const tipo_seguimiento_id: string = "6385fa136a0d19d7888837ed"
    var periodo_seguimiento_seguimiento: PeriodoSeguimiento = {} as PeriodoSeguimiento;
    let fecha_inicio: any;
    let fecha_fin: any;

    if (i === 0) {
      fecha_inicio = new Date(this.formFechas.get('fecha11').value);
      fecha_fin = new Date(this.formFechas.get('fecha12').value);
    } else if (i === 1) {
      fecha_inicio = new Date(this.formFechas.get('fecha13').value);
      fecha_fin = new Date(this.formFechas.get('fecha14').value);
    } else if (i === 2) {
      fecha_inicio = new Date(this.formFechas.get('fecha15').value);
      fecha_fin = new Date(this.formFechas.get('fecha16').value);
    } else if (i === 3) {
      fecha_inicio = new Date(this.formFechas.get('fecha17').value);
      fecha_fin = new Date(this.formFechas.get('fecha18').value);
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

    this.request.post(environment.PLANES_FORMULACION_MID, `formulacion/habilitar_fechas_funcionamiento`, periodo_seguimiento_seguimiento).subscribe((data: DataRequest) => {
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
    this.vigencia = undefined;
    this.vigenciaSelected = false;
    this.tipo = undefined;
    this.tipoSelected = false;
    this.filtroSelected = false;
    this.filtroUnidad = false;
    this.filtroPlan = false;
    this.selectTipo.setValue('');
    this.selectVigencia.setValue('--');
    this.selectFiltro.setValue('');
    this.unidadesInteres = undefined;
    this.planesInteres = undefined;
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