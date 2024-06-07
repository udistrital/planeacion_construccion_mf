import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';
import { ImplicitAutenticationService } from '@udistrital/planeacion-utilidades-module';
import { Router } from '@angular/router';
import { TrimestreDialogComponent } from '../trimestre-dialog/trimestre-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'sheetjs-style';
import { RequestManager } from 'src/app/components/services/requestManager';
import { Periodo } from '../../../../@core/interfaces/Periodo.interface';

@Component({
  selector: 'app-plan-accion-seguimiento',
  templateUrl: './plan-accion-seguimiento.component.html',
  styleUrls: ['./plan-accion-seguimiento.component.scss']
})
export class PlanAccionSeguimientoComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'fase',
    'estado',
    'acciones',
  ];
  informacionTabla!: MatTableDataSource<ResumenPlan>;
  inputsFiltros!: NodeListOf<HTMLInputElement>;
  planes!: ResumenPlan[];
  periodos: any[] = [];
  auxUnidades: any[] = [];
  estadoDescarga: boolean = false;

  rol!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private autenticationService = new ImplicitAutenticationService();

  constructor(
    private request: RequestManager,
    public dialog: MatDialog,
    private router: Router
  ) {
    let roles: any = this.autenticationService.getRoles();
    if (roles.__zone_symbol__value.find((x: any) => x == 'PLANEACION' || x == 'ASISTENTE_PLANEACION')) {
      this.rol = 'PLANEACION';
    } else if (
      roles.__zone_symbol__value.find(
        (x: any) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA'
      )
    ) {
      this.rol = 'JEFE_DEPENDENCIA';
    }
  }

  async ngOnInit() {
    if (this.rol == 'PLANEACION') {
      await this.loadUnidades();
    }
    // await this.cargarPlanes("");
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(this.planes);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan | any, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre.toLowerCase(),
        plan.vigencia.toString(),
        plan.nombre.toLowerCase(),
        plan.fase.toLowerCase(),
        plan.estado.toLowerCase(),
      ];
      this.inputsFiltros.forEach((input, posicion) => {
        if (valoresAComparar[posicion].includes(input.value.toLowerCase())) {
          filtrosPasados++;
        }
      });
      return filtrosPasados === valoresAComparar.length;
    };
    this.informacionTabla.paginator = this.paginator;
  }

  ngAfterViewInit(): void {
    this.inputsFiltros = document.querySelectorAll('th.mat-header-cell input');
  }

  aplicarFiltro(event: Event): void {
    let filtro: string = (event.target as HTMLInputElement).value;

    if (filtro === '') {
      this.inputsFiltros.forEach((input) => {
        if (input.value !== '') {
          filtro = input.value;
          return;
        }
      });
    }
    // Se debe poner algún valor que no sea vacio  para que se accione el filtro la tabla
    this.informacionTabla.filter = filtro.trim().toLowerCase();
  }

  async cargarPlanes(unidad: string): Promise<void> {
    Swal.fire({
      title: 'Cargando planes de acción',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.estadoDescarga = true;
    await new Promise((resolve, reject) => {
      if (this.rol == 'PLANEACION' || this.rol == 'JEFE_DEPENDENCIA') {
        this.request.get(environment.PLANES_FORMULACION_MID, `formulacion/planes_accion`).subscribe(
          (data) => {
            const allData: any[] = data.Data;
            this.planes = allData.filter(plan => plan.fase === "Seguimiento" && plan.dependencia_nombre === unidad);
            if (this.planes.length != 0) {
              Swal.close();
            } else {
              this.estadoDescarga = false;
              Swal.close();
              Swal.fire({
                title: 'No existen registros',
                icon: 'info',
                text: 'No existen proyectos con registros en fase de seguimiento asociados a la unidad seleccionada',
                showConfirmButton: true,
              });
            }
            resolve(this.planes);
          },
          (error) => {
            Swal.close();
            this.estadoDescarga = false;
            this.planes = [];
            console.error(error);
            Swal.fire({
              title: 'Error al intentar obtener los planes de acción',
              icon: 'error',
              text: 'Ingresa más tarde',
              showConfirmButton: false,
              timer: 2500,
            });
            reject();
          }
        );
      } else {
        // 'JEFE_DEPENDENCIA'
        //let documento: string = this.autenticationService.getDocument()['__zone_symbol__value'];
        let documento: string =
          this.autenticationService.getPayload()['documento'];
        let idTercero: number;
        let idDependencia: string;
        this.request
          .get(
            environment.TERCEROS_SERVICE,
            'datos_identificacion/?query=Numero:' + documento
          )
          .subscribe(
            (data) => {
              if (data.length == 0) {
                this.estadoDescarga = false;
                Swal.close();
                Swal.fire({
                  title:
                    'Han habido problemas trayendo información del usuario',
                  icon: 'info',
                  text: 'Intente más tarde',
                  showConfirmButton: false,
                  timer: 2500,
                });
              } else {
                idTercero = data[0]['TerceroId']['Id'];
                this.request
                  .get(
                    environment.PLANES_FORMULACION_MID,
                    'formulacion/tercero/' + idTercero
                  )
                  .subscribe(
                    (data) => {
                      if (data.Data == null) {
                        this.estadoDescarga = false;
                        Swal.close();
                        Swal.fire({
                          title:
                            'Han habido problemas trayendo información del usuario',
                          icon: 'info',
                          text: 'Intente más tarde',
                          showConfirmButton: false,
                          timer: 2500,
                        });
                      } else {
                        idDependencia = data.Data['DependenciaId'];
                        this.request
                        .get(
                          environment.PLANES_FORMULACION_MID,
                          `/formulacion/planes_accion/${idDependencia}`
                        )
                          .subscribe(
                            (data) => {
                              const allData = data.Data;
                              this.planes = allData.filter((plan: { fase: string; }) => plan.fase === "Seguimiento");
                              if (this.planes.length != 0) {
                                Swal.close();
                              } else {
                                this.estadoDescarga = false;
                                Swal.close();
                                Swal.fire({
                                  title: 'No existen registros',
                                  icon: 'info',
                                  text: 'No existen proyectos con registros en fase de seguimiento asociados a la unidad seleccionada',
                                  showConfirmButton: true,
                                });
                              }
                              resolve(this.planes);
                            },
                            (error) => {
                              Swal.close();
                              this.estadoDescarga = false;
                              this.planes = [];
                              console.error(error);
                              Swal.fire({
                                title:
                                  'Error al intentar obtener los planes de acción',
                                icon: 'error',
                                text: 'Ingresa más tarde',
                                showConfirmButton: false,
                                timer: 2500,
                              });
                              reject();
                            }
                          );
                      }
                    },
                    (error) => {
                      Swal.close();
                      this.estadoDescarga = false;
                      this.planes = [];
                      console.error(error);
                      Swal.fire({
                        title:
                          'Error al intentar traer información del usuario',
                        icon: 'error',
                        text: 'Ingresa más tarde',
                        showConfirmButton: false,
                        timer: 2500,
                      });
                      reject();
                    }
                  );
              }
            },
            (error) => {
              Swal.close();
              this.estadoDescarga = false;
              this.planes = [];
              console.error(error);
              Swal.fire({
                title: 'Error al intentar traer información del usuario',
                icon: 'error',
                text: 'Ingresa más tarde',
                showConfirmButton: false,
                timer: 2500,
              });
              reject();
            }
          );
      }
    });
  }

  // @ts-ignore
  async consultar(plan: any, mostrar: boolean): Promise<any[]> {
    if (mostrar) {
      Swal.fire({
        title: 'Cargando Trimestres',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
    }
    const trimestres: any = [];
    await new Promise((resolve, reject) => {
      this.request
        .get(environment.PLANES_SEGUIMIENTO_MID, `periodos/` + plan.vigencia_id)
        .subscribe(
          (data: any) => {
            if (data.Data) {
              const Periodos: Periodo[] = data.Data;
              Periodos.forEach(element => {
                const trimestre = {
                  codigo: element["ParametroId"].CodigoAbreviacion,
                  nombre: element["ParametroId"].Nombre
                }
                trimestres.push(trimestre);
              });
              // @ts-ignore
              const promises = trimestres.map(tr => {
                return new Promise((innerResolve, innerReject) => {
                  this.request.get(environment.PLANES_SEGUIMIENTO_MID, `seguimiento/` + plan.id + "/" + tr.codigo + "/estado").subscribe(
                    (datos: any) => {
                      if (datos) {
                        tr.estado = datos.Data["estado_seguimiento_id"].nombre;
                      }
                      innerResolve("Success")
                    }, (error) => {
                      if (mostrar) { Swal.close(); }
                      Swal.fire({
                        title: 'Error en la operación',
                        text: `No se encontraron datos registrados ${JSON.stringify(
                          error
                        )}`,
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 2500,
                      });
                      innerReject(error);
                    }
                  )
                });
              });
              Promise.all(promises).then(() => {
                this.request.get(environment.PLANES_EVALUACION_MID, `unidades/` + plan.nombre + "/" + plan.vigencia_id).subscribe(
                  (datosEval: any) => {
                    if (datosEval) {
                      if (datosEval.Data.length !== 0) {
                        this.request.get(environment.PLANES_EVALUACION_MID, `evaluacion/planes_periodo/` + plan.vigencia_id + "/" + plan.dependencia_id).subscribe(
                          (datosP: any) => {
                            if (datosP.Data.length !== 0) {
                              // @ts-ignore
                              const planEspecifico = datosP.Data.find(objeto => objeto.plan === plan.nombre);
                              if (planEspecifico) {
                                const idUltimoTrimestre = planEspecifico["periodos"][planEspecifico["periodos"].length - 1].id;
                                this.request.get(environment.PLANES_EVALUACION_MID, `/` + plan.vigencia_id + "/" + datosP.Data[0].id + "/" + idUltimoTrimestre).subscribe(
                                  (datosB: any) => {
                                    if (datosB) {
                                      // @ts-ignore
                                      const brechasT1 = [];
                                      // @ts-ignore
                                      const brechasT2 = [];
                                      // @ts-ignore
                                      const brechasT3 = [];
                                      // @ts-ignore
                                      const brechasT4 = [];
                                      // @ts-ignore
                                      datosB.Data.map(br => {
                                        if (br.trimestre1 && Object.keys(br.trimestre1).length !== 0) {
                                          brechasT1.push(br.trimestre1.brecha);
                                        }
                                        if (br.trimestre2 && Object.keys(br.trimestre2).length !== 0) {
                                          brechasT2.push(br.trimestre2.brecha);
                                        }
                                        if (br.trimestre3 && Object.keys(br.trimestre3).length !== 0) {
                                          brechasT3.push(br.trimestre3.brecha);
                                        }
                                        if (br.trimestre4 && Object.keys(br.trimestre4).length !== 0) {
                                          brechasT4.push(br.trimestre4.brecha);
                                        }
                                      });
                                      // @ts-ignore
                                      trimestres.map(tri => {
                                        if (tri.codigo === 'T1' && brechasT1.length !== 0) {
                                          // @ts-ignore
                                          tri.promedioBrechas = ((brechasT1.reduce((total, numero) => total + numero, 0)) / brechasT1.length).toFixed(2);
                                        }
                                        else if (tri.codigo === 'T2' && brechasT2.length !== 0) {
                                          // @ts-ignore
                                          tri.promedioBrechas = ((brechasT2.reduce((total, numero) => total + numero, 0)) / brechasT2.length).toFixed(2);
                                        }
                                        else if (tri.codigo === 'T3' && brechasT3.length !== 0) {
                                          // @ts-ignore
                                          tri.promedioBrechas = ((brechasT3.reduce((total, numero) => total + numero, 0)) / brechasT3.length).toFixed(2);
                                        }
                                        else if (tri.codigo === 'T4' && brechasT4.length !== 0) {
                                          // @ts-ignore
                                          tri.promedioBrechas = ((brechasT4.reduce((total, numero) => total + numero, 0)) / brechasT4.length).toFixed(2);
                                        } else {
                                          tri.promedioBrechas = 0;
                                        }
                                      });
                                      this.periodos.push(trimestres);
                                      if (mostrar) {
                                        this.dialog.open(TrimestreDialogComponent, {
                                          width: 'calc(85vw - 65px)',
                                          height: 'calc(45vw - 65px)',
                                          data: { plan, trimestres }
                                        });
                                      }
                                      if (mostrar) { Swal.close(); }
                                    }
                                  }, (error) => {
                                    if (mostrar) { Swal.close(); }
                                    Swal.fire({
                                      title: 'Error en la operación',
                                      text: `No se encontraron datos registrados ${JSON.stringify(
                                        error
                                      )}`,
                                      icon: 'warning',
                                      showConfirmButton: false,
                                      timer: 2500,
                                    });
                                  }
                                )
                              } else {
                                // @ts-ignore
                                trimestres.map(tri => {
                                  tri.promedioBrechas = 0;
                                });
                                this.periodos.push(trimestres);
                                if (mostrar) {
                                  this.dialog.open(TrimestreDialogComponent, {
                                    width: 'calc(85vw - 65px)',
                                    height: 'calc(45vw - 65px)',
                                    data: { plan, trimestres }
                                  });
                                }
                                if (mostrar) { Swal.close(); }
                              }
                            }
                          }, (error) => {
                            if (mostrar) { Swal.close(); }
                            Swal.fire({
                              title: 'Error en la operación',
                              text: `No se encontraron datos registrados ${JSON.stringify(
                                error
                              )}`,
                              icon: 'warning',
                              showConfirmButton: false,
                              timer: 2500,
                            });
                          }
                        )
                      } else {
                        // @ts-ignore
                        trimestres.map(tri => {
                          tri.promedioBrechas = 0;
                        });
                        this.periodos.push(trimestres);
                        if (mostrar) {
                          this.dialog.open(TrimestreDialogComponent, {
                            width: 'calc(85vw - 65px)',
                            height: 'calc(45vw - 65px)',
                            data: { plan, trimestres }
                          });
                        }
                        if (mostrar) { Swal.close(); }
                      }
                    }
                  }, (error) => {
                    if (mostrar) { Swal.close(); }
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `No se encontraron datos registrados ${JSON.stringify(
                        error
                      )}`,
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500,
                    });
                  }
                )
                return trimestres;
              })
              resolve("trimestres");
            } else {
              this.periodos.push(trimestres);
              if (mostrar) {
                Swal.close();
                Swal.fire({
                  title: 'Error en la operación',
                  text: 'No se encontraron trimestres para esta vigencia',
                  icon: 'warning',
                  showConfirmButton: true,
                });
              }
              resolve("trimestres");
            }
          },
          (error) => {
            if (mostrar) { Swal.close(); }
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron datos registrados ${JSON.stringify(
                error
              )}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500,
            });
            reject(error);
          }
        );
    });
    return trimestres;
  }

  async loadUnidades() {
    Swal.fire({
      title: 'Cargando Unidades',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    return new Promise((resolve, reject) => {
      this.request
        .get(environment.PLANES_FORMULACION_MID, `formulacion/unidades`)
        .subscribe(
          (data: any) => {
            if (data) {
              this.auxUnidades = data.Data;
              Swal.close();
              resolve(this.auxUnidades);
            }
          },
          (error) => {
            Swal.close();
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron datos registrados ${JSON.stringify(
                error
              )}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500,
            });
            reject(error);
          }
        );
    });
  }

  async ajustarData(event: any) {
    await this.cargarPlanes(event.value);
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(this.planes);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar: string[] = [
        plan.dependencia_nombre!.toLowerCase(),
        plan.vigencia!.toString(),
        plan.nombre.toLowerCase(),
        plan.fase!.toLowerCase(),
        plan.estado!.toLowerCase(),
      ];
      this.inputsFiltros.forEach((input, posicion) => {
        if (valoresAComparar[posicion].includes(input.value.toLowerCase())) {
          filtrosPasados++;
        }
      });
      return filtrosPasados === valoresAComparar.length;
    };
    this.informacionTabla.paginator = this.paginator;
  }

  prepararDocumento(data: any) {
    const headerStyles = {
      alignment: {
        horizontal: 'center',
        vertical: 'center',
      },
      fill: { fgColor: { rgb: '731514' } },
      font: {
        bold: true,
        sz: '13',
        color: { rgb: 'FFFFFF' }
      },
      border: {
        bottom: { style: 'medium', color: { rgb: 'FFFFFF' } },
        left: { style: 'medium', color: { rgb: 'FFFFFF' } },
        right: { style: 'medium', color: { rgb: 'FFFFFF' } }
      }
    };

    //Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.aoa_to_sheet([[]]);
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A6' });

    XLSX.utils.sheet_add_aoa(worksheet, [[
      'Plan de acción',
      'Unidad',
      'Vigencia',
      'Brecha',
      'Estado',
      'Brecha',
      'Estado',
      'Brecha',
      'Estado',
      'Brecha',
      'Estado',
    ]], { origin: "A6" });

    worksheet['A2'] = {
      v: 'Tabla de procesos de seguimiento realizados', t: 's', s: {
        font: {
          bold: true,
          sz: '20',
          color: { rgb: '731514' }
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        }
      }
    };
    worksheet['D5'] = { v: 'Trimestre Uno', t: 's' };
    worksheet['F5'] = { v: 'Trimestre Dos', t: 's' };
    worksheet['H5'] = { v: 'Trimestre Tres', t: 's' };
    worksheet['J5'] = { v: 'Trimestre Cuatro', t: 's' };

    worksheet['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 4, c: 3 }, e: { r: 4, c: 4 } },
      { s: { r: 4, c: 5 }, e: { r: 4, c: 6 } },
      { s: { r: 4, c: 7 }, e: { r: 4, c: 8 } },
      { s: { r: 4, c: 9 }, e: { r: 4, c: 10 } },
    ];

    worksheet['!cols'] = [
      { width: 40 },
      { width: 40 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ]

    //Estilo alto de las celdas
    const defaultRowHeight = 20;
    const filas = [];
    const regex = /(\d+)$/;
    const resultado = regex.exec(worksheet['!ref']!);
    const filaFinal = parseInt(resultado![1]);
    for (let i = 0; i < filaFinal; i++) {
      filas.push({ hpx: defaultRowHeight });
    }
    if (filas.length > 0) {
      worksheet['!rows'] = filas;
    }

    //Estilo color celdas
    for (let j = 0; j < 11; j++) {
      const cellAddressF = XLSX.utils.encode_cell({ r: 4, c: j });
      const cellAddressH = XLSX.utils.encode_cell({ r: 5, c: j });
      if (j >= 3) {
        if (worksheet[cellAddressF]) {
          worksheet[cellAddressF].s = headerStyles;
        }
        worksheet[cellAddressH].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
          fill: { fgColor: { rgb: '753E3D' } },
          font: {
            bold: true,
            sz: '13',
            color: { rgb: 'FFFFFF' }
          },
          border: {
            top: { style: 'medium', color: { rgb: 'FFFFFF' } },
            bottom: { style: 'medium', color: { rgb: 'FFFFFF' } },
            left: { style: 'medium', color: { rgb: 'FFFFFF' } },
            right: { style: 'medium', color: { rgb: 'FFFFFF' } }
          }
        };
      } else {
        worksheet[cellAddressH].s = headerStyles;
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Procesos de seguimiento');

    XLSX.writeFile(workbook, 'Procesos de seguimiento.xlsx');
  }

  async descargarData() {
    Swal.fire({
      title: 'Preparando Documento',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    const listaPlanes = [];
    const auxPlanes: any = [];
    const malos = [];

    // Array de promesas de consultas
    const promesasConsultas = this.planes.map(pl => {
      const planDañado = pl.nombre !== "Plan de acción 2023 Prod Seguimiento" || pl.dependencia_nombre !== "VICERRECTORIA ACADEMICA";
      if (pl.vigencia !== 0 && planDañado) {
        auxPlanes.push(pl);
        return this.consultar(pl, false);
      } else {
        malos.push(pl.nombre + " " + pl.vigencia);
        return Promise.resolve([]);
      }
    });

    // Esperar a que todas las consultas se completen
    const resultadosConsultas = await Promise.all(promesasConsultas);

    for (const [index, pl] of auxPlanes.entries()) {
      let sinTrimestres = {};
      const trimestres = resultadosConsultas[index]; // Obtener los trimestres para el plan actual
      if (trimestres.length !== 0) {
        sinTrimestres = {
          t1_brecha: trimestres[0].promedioBrechas === 0 ? "N/A" : trimestres[0].promedioBrechas,
          t1_estado: trimestres[0].estado,
          t2_brecha: trimestres[1].promedioBrechas === 0 ? "N/A" : trimestres[1].promedioBrechas,
          t2_estado: trimestres[1].estado,
          t3_brecha: trimestres[2].promedioBrechas === 0 ? "N/A" : trimestres[2].promedioBrechas,
          t3_estado: trimestres[2].estado,
          t4_brecha: trimestres[3].promedioBrechas === 0 ? "N/A" : trimestres[3].promedioBrechas,
          t4_estado: trimestres[3].estado
        };
      } else {
        sinTrimestres = {
          t1_brecha: "N/A",
          t1_estado: "N/A",
          t2_brecha: "N/A",
          t2_estado: "N/A",
          t3_brecha: "N/A",
          t3_estado: "N/A",
          t4_brecha: "N/A",
          t4_estado: "N/A",
        };
      }

      listaPlanes.push({
        nombre: pl.nombre,
        unidad: pl.dependencia_nombre,
        vigencia: pl.vigencia.toString(),
        ...sinTrimestres
      });
    }

    this.prepararDocumento(listaPlanes);
    Swal.close();
    const actualUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([actualUrl]);
    });
  }
}
