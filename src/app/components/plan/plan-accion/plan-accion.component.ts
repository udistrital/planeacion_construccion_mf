import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';
import { RequestManager } from '../../services/requestManager';
import { ImplicitAutenticationService, ServiceCookies } from '@udistrital/planeacion-utilidades-module';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import * as singleSpa from 'single-spa'

@Component({
  selector: 'app-plan-accion',
  templateUrl: './plan-accion.component.html',
  styleUrls: ['./plan-accion.component.scss']
})
export class PlanAccionComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'version',
    'fase',
    'estado',
    'acciones',
  ];
  informacionTabla!: MatTableDataSource<ResumenPlan>;
  inputsFiltros!: NodeListOf<HTMLInputElement>;
  planes!: ResumenPlan[];

  rol!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private autenticationService = new ImplicitAutenticationService();
  private serviceCookies = new ServiceCookies();

  constructor(
    private request: RequestManager,
    private router: Router,
  ) {
    let roles: any = this.autenticationService.getRoles();
    if (roles.__zone_symbol__value.find((x: any) => x == 'PLANEACION')) {
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
    await this.cargarPlanes();
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(this.planes);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan | any, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre.toLowerCase(),
        plan.vigencia.toString(),
        plan.nombre.toLowerCase(),
        plan.version == undefined ? 'n/a' : plan.version.toString(),
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

  async cargarPlanes(): Promise<void> {
    Swal.fire({
      title: 'Cargando planes de acción',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    await new Promise((resolve, reject) => {
      if (this.rol == 'PLANEACION' || this.rol == 'JEFE_DEPENDENCIA') {
        this.request.get(environment.PLANES_FORMULACION_MID, `/formulacion/planes_accion`).subscribe(
          (data) => {
            const allData: ResumenPlan[] = data.data;
            this.planes = allData.filter(plan => plan.fase === "Formulación");
            if (this.planes.length != 0) {
              Swal.close();
            } else {
              Swal.close();
              Swal.fire({
                title: 'No existen registros',
                icon: 'info',
                text: 'No hay planes en formulación',
                showConfirmButton: false,
                timer: 2500,
              });
            }
            resolve(this.planes);
          },
          (error) => {
            Swal.close();
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
        //let documento: string = this.autenticationService.getDocumento()['__zone_symbol__value'];
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
                              this.planes = data.Data;
                              if (this.planes.length != 0) {
                                Swal.close();
                              } else {
                                Swal.close();
                                Swal.fire({
                                  title: 'No existen registros',
                                  icon: 'info',
                                  text: 'No hay planes en formulación',
                                  showConfirmButton: false,
                                  timer: 2500,
                                });
                              }
                              resolve(this.planes);
                            },
                            (error) => {
                              Swal.close();
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
  consultar(plan: ResumenPlan | any) {
    this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + plan.dependencia_id).subscribe((dataUnidad: any) => {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Id:` + plan.vigencia_id).subscribe((dataVigencia: any) => {
        if (plan.fase.includes('Formulación')) {
          this.serviceCookies.setCookie("plan", JSON.stringify(plan));
          this.serviceCookies.setCookie("vigencia", JSON.stringify(dataVigencia.Data[0]));
          this.serviceCookies.setCookie("unidad", JSON.stringify(dataUnidad[0]['DependenciaId']));
          singleSpa.navigateToUrl(`/formulacion/`);

        } else if (plan.fase == 'Seguimiento') {
          singleSpa.navigateToUrl(
            '/seguimiento/listar-plan-accion-anual/' + plan.vigencia_id
            + "/" + plan.nombre
            + "/" + plan.dependencia_id
          );
        }
      });
    });

  }
}
