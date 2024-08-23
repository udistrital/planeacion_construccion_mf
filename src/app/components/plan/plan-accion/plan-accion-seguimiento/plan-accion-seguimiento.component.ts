import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('root', { static: false }) root!: ElementRef;

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
    } else {
      await this.cargarPlanes("");
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
    this.inputsFiltros = this.root.nativeElement.querySelectorAll('th.mat-header-cell input');
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
      if (this.rol == 'PLANEACION') {
        this.request.get(environment.PLANES_FORMULACION_MID, `formulacion/planes_accion`).subscribe(
          (data) => {
            const allData: any[] = data.Data;
            const seenPlans = new Set();
            this.planes = [];
            allData.forEach(plan => {
              if (plan.fase === "Seguimiento" && plan.dependencia_nombre === unidad) {
                if (!seenPlans.has(plan.nombre)) { // Verifica si el nombre del plan ya ha sido visto
                  this.planes.push(plan); // Añade el plan a la lista de planes
                  seenPlans.add(plan.nombre); // Marca el nombre del plan como visto
                }
              }
            });
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
                        const vinculaciones = data.Data;
                        let promesas = [];

                        for (let i = 0; i < vinculaciones.length; i++) {
                          promesas.push(new Promise((PromesaResolve, PromesaReject) => {
                            idDependencia = vinculaciones[i].DependenciaId;

                            this.request.get(environment.PLANES_FORMULACION_MID, `/formulacion/planes_accion/${idDependencia}`).subscribe((data) => {
                              if (data && data.Success) {
                                PromesaResolve(data.Data)
                              } else {
                                Swal.close();
                                this.estadoDescarga = false;
                                Swal.fire({
                                  title:
                                    'Error al intentar obtener los planes de acción',
                                  icon: 'error',
                                  text: 'Ingresa más tarde',
                                  showConfirmButton: false,
                                  timer: 2500,
                                });
                                PromesaReject();
                              }
                            }, (error) => {
                              Swal.close();
                              this.estadoDescarga = false;
                              console.error(error);
                              Swal.fire({
                                title:
                                  'Error al intentar obtener los planes de acción',
                                icon: 'error',
                                text: 'Ingresa más tarde',
                                showConfirmButton: false,
                                timer: 2500,
                              });
                              PromesaReject();
                            }
                            );
                          }));
                        }
                        Promise.all(promesas).then(resultados => {
                          let resultadoPlanes: any = [];

                          if (resultados.length != 0) {
                            for (let i = 0; i < resultados.length; i++) {
                              let resultadoUnico: any = [];
                              const nombresUnidades: { [key: string]: boolean } = {};

                              (resultados[i] as any[]).forEach(plan => {
                                if (plan.fase === "Seguimiento") {
                                  const clave = `${plan.nombre}-${plan.unidad}`;
                                  if (!nombresUnidades[clave]) {
                                    nombresUnidades[clave] = true;
                                    resultadoUnico.push(plan);
                                  }
                                }
                              });

                              resultadoPlanes = [...resultadoPlanes, ...resultadoUnico];
                            }
                            this.planes = resultadoPlanes;
                            resolve(this.planes);
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
                        }).catch(error => {
                          Swal.fire({
                            title:
                              'Error al intentar obtener los planes de acción',
                            icon: 'error',
                            text: 'Ingresa más tarde',
                            showConfirmButton: false,
                            timer: 2500,
                          });
                          console.error('Ocurrió un error:', error);
                          reject()
                        })

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
    let trimestres: any[] = []
    let body = {
      nombre: plan.nombre,
      id: plan.id,
      vigencia: plan.vigencia_id,
      dependencia: plan.dependencia_id
    }
    await new Promise((resolve, reject) => {
      this.request
        .post(environment.PLANES_SEGUIMIENTO_MID, `seguimiento/brecha-estado`, body)
        .subscribe(
          (data: any) => {
            if (data.Data) {
              trimestres = data.Data
              if (mostrar) {
                Swal.close();
                this.dialog.open(TrimestreDialogComponent, {
                  width: 'calc(85vw - 65px)',
                  height: 'calc(45vw - 65px)',
                  data: { plan, trimestres }
                });
              }
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

    let originalPlanes = [];

    if (this.informacionTabla.filteredData) {
      originalPlanes = this.informacionTabla.filteredData;
    } else {
      originalPlanes = this.planes;
    }

    // Array de promesas de consultas
    const promesasConsultas = originalPlanes.map(pl => {
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
