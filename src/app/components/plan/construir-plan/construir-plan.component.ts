import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RequestManager } from '../../services/requestManager';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { EditarDialogComponent } from './editar-dialog/editar-dialog.component';
import { AgregarDialogComponent } from './agregar-dialog/agregar-dialog.component';

@Component({
  selector: 'app-construir-plan',
  templateUrl: './construir-plan.component.html',
  styleUrls: ['./construir-plan.component.scss']
})
export class ConstruirPlanComponent implements OnInit{
  formConstruirPlan!: FormGroup;
  tipo_plan_id!: string; // id tipo plan
  nombrePlan!: string;
  nivel!: number; // nivel objeto
  planId!: string; // id padre del objeto
  uid!: string; // id objeto
  uid_n!: number; // nuevo nivel
  planes!: any[];
  dato: any;
  padreSub!: string;

  @Output() eventChange = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.nombrePlan = prm['nombrePlan'];
      this.tipo_plan_id = prm['tipo_plan_id'];
    });
  }

  actualizarEstructuraPlanes() {    
    Swal.fire({
      title: 'Actualizar Planes',
      text: `¿Desea actualizar las estructuras de los planes que están asociados a esta plantilla?`,
      icon: 'question',
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`,
      allowOutsideClick: false,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizando Planes',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        })
        this.request.put(environment.PLANES_MID, 'formulacion/estructura_planes', null, this.planId).subscribe(
          (data: any) => {
            if (data) {
              Swal.close()
              Swal.fire({
                title: 'Actualización correcta',
                text: 'Se actualizaron las estructuras actuales de los planes asociados a la plantilla',
                icon: 'info',
                showConfirmButton: false,
                timer: 2500
              }).then(() => {
                this.eventChange.emit(true);
              });
            }
          },
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `${JSON.stringify(error)}`,
              showConfirmButton: false,
              timer: 2500
            });
          }
        )
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          text: 'Se mantuvieron las estructuras actuales de los planes asociados a la plantilla',
          icon: 'info',
          showConfirmButton: false,
          timer: 2500
        }).then(() => {
          this.eventChange.emit(true);
        });
      }
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(AgregarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: { nivel: this.uid_n }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined) {
        return undefined;
      } else {
        this.postData(result);
      }
    });
  }

  postData(res: any) {
    if (this.uid_n == 1) {
      var dataSub: any  = {
        nombre: res.nombre,
        descripcion: res.descripcion,
        padre: this.planId,
        activo: JSON.parse(res.activo),
        bandera_tabla: JSON.parse(res.bandera)
      }
    } else if (this.uid_n > 1) {
      var dataSub: any  = {
        nombre: res.nombre,
        descripcion: res.descripcion,
        padre: this.uid,
        activo: JSON.parse(res.activo),
        bandera_tabla: JSON.parse(res.bandera)
      }
    }
    if (res.hasOwnProperty("opciones")) {
      var array = res.opciones.split(",");
      let jsonArray = []
      for (let val of array) {
        jsonArray.push({
          valor: val
        })
      }
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
        options: jsonArray
      }
    } else if (!res.hasOwnProperty("opciones")) {
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
      }
    }
    let subgrupo
    this.request.post(environment.PLANES_CRUD, 'subgrupo/registrar_nodo', dataSub).subscribe(
      (data: any) => {
        if (data) {
          var dataSubDetalle = {
            nombre: "subgrupo detalle " + res.nombre,
            descripcion: res.nombre,
            subgrupo_id: "" + data.Data._id,
            dato: JSON.stringify(this.dato),
            activo: JSON.parse(res.activo)
          }
          if (this.dato.type != "" && this.dato.required != "") {
            this.request.post(environment.PLANES_CRUD, 'subgrupo-detalle', dataSubDetalle).subscribe(
              (data: any) => {
                if (!data) {
                  Swal.fire({
                    title: 'Error en la operación',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2500
                  })
                }
              }
            )
          }
          subgrupo = data.Data
          Swal.fire({
            title: 'Registro correcto',
            text: `Se ingresaron correctamente los datos del nivel`,
            icon: 'success',
          }).then((result) => {
            if (result.value) {
              this.actualizarEstructuraPlanes()
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
  };

  openDialogEditar(sub: any, subDetalle: any): void {
    this.padreSub = sub.padre;    
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: { nivel: this.uid_n, ban: 'nivel', sub, subDetalle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined) {
        return undefined;
      } else {
        this.putData(result);
      }
    });
  }

  putData(res: any) {
    let subgrupo: any = {
      nombre: res.nombre,
      descripcion: res.descripcion,
      activo: res.activo,
      bandera_tabla: res.banderaTabla      
    }    
    if (res.hasOwnProperty("opciones")) {
      var array = res.opciones.split(",");
      let jsonArray = []
      for (let val of array) {
        jsonArray.push({
          valor: val
        })
      }
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
        options: jsonArray
      }
    } else if (!res.hasOwnProperty("opciones")) {
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
        //options: ""
      }
    }
    let subgrupoDetalle: any = {
      dato: JSON.stringify(this.dato)
    }
    this.request.get(environment.PLANES_CRUD, `subgrupo-detalle/detalle/` + this.uid).subscribe((data: any) => {
      subgrupoDetalle["fecha_creacion"] = data.Data[0].fecha_creacion;
      subgrupoDetalle["subgrupo_id"] = data.Data[0].subgrupo_id;
      subgrupoDetalle["activo"] = true;
      subgrupoDetalle["descripcion"] = subgrupo.descripcion;
      subgrupoDetalle["nombre"] = subgrupo.nombre;
      subgrupo["padre"] = this.padreSub;
      subgrupo["fecha_creacion"] = data.Data[0].fecha_creacion;      
      if (data.Data.length > 0) {
        this.request.put(environment.PLANES_CRUD, `subgrupo-detalle`, subgrupoDetalle, data.Data[0]._id).subscribe((data: any) => {
          this.request.put(environment.PLANES_CRUD, `subgrupo`, subgrupo, this.uid).subscribe((data: any) => {
            if (data.Data.activo == false) {
              this.request.delete(environment.PLANES_MID, `arbol/desactivar_nodo`, this.uid).subscribe((data: any) => {
                if (data) {
                  Swal.fire({
                    title: 'Actualización correcta',
                    text: `Se actualizaron correctamente los datos`,
                    icon: 'success',
                  }).then((result) => {
                    if (result.value) {
                      this.actualizarEstructuraPlanes()
                    }
                  })
                }
              })
            } else {
              this.request.put(environment.PLANES_MID, `arbol/activar_nodo`, subgrupo, this.uid).subscribe((data: any) => {
                if (data) {
                  Swal.fire({
                    title: 'Actualización correcta',
                    text: `Se actualizaron correctamente los datos`,
                    icon: 'success',
                  }).then((result) => {
                    if (result.value) {
                      this.actualizarEstructuraPlanes()
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
            };
        })
      } else {
        this.request.put(environment.PLANES_CRUD, `subgrupo`, subgrupo, this.uid).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Actualización correcta',
              text: `Se actualizaron correctamente los datos`,
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.actualizarEstructuraPlanes()
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
          };
      }
    })

  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  receiveMessage(event: any) {
    if (event.bandera == 'editar') {
      this.uid_n = event.fila.level + 1;
      this.uid = event.fila.id; // id del nivel a editar
      this.request.get(environment.PLANES_CRUD, `subgrupo/` + this.uid).subscribe((data: any) => {
        if (data) {
          this.request.get(environment.PLANES_CRUD, 'subgrupo-detalle/detalle/' + this.uid).subscribe((dataDetalle: any) => {
            if (dataDetalle) {
              if (dataDetalle.Data.length > 0) {
                let auxiliar = JSON.parse(dataDetalle.Data[0].dato)
                if (auxiliar.hasOwnProperty("options")) {
                  let auxOptions = auxiliar.options;
                  var result = auxOptions.map(function (val: any) {
                    return val.valor;
                  }).join(',');
                  let subDataDetalle = {
                    type: auxiliar.type,
                    required: auxiliar.required,
                    options: result
                  }
                  let subData = {
                    nombre: data.Data.nombre,
                    descripcion: data.Data.descripcion,
                    activo: data.Data.activo,
                    banderaTabla: data.Data.bandera_tabla,
                    padre: data.Data.padre
                  }
                  this.openDialogEditar(subData, subDataDetalle);
                } else if (!auxiliar.hasOwnProperty("options")) {
                  let subDataDetalle = {
                    type: auxiliar.type,
                    required: auxiliar.required,
                    options: ""
                  }
                  let subData = {
                    nombre: data.Data.nombre,
                    descripcion: data.Data.descripcion,
                    activo: data.Data.activo,
                    banderaTabla: data.Data.bandera_tabla,
                    padre: data.Data.padre
                  }
                  this.openDialogEditar(subData, subDataDetalle);
                }
              } else {
                let subDataDetalle = {
                  type: "",
                  required: "",
                  options: ""
                }
                let subData = {
                  nombre: data.Data.nombre,
                  descripcion: data.Data.descripcion,
                  activo: data.Data.activo,
                  banderaTabla: data.Data.bandera_tabla
                }
                this.openDialogEditar(subData, subDataDetalle);
              }
            }
          })
        }
      }),
        (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
    } else if (event.bandera == 'agregar') {
      this.uid_n = event.fila.level + 2; // el nuevo nivel
      this.uid = event.fila.id; // será el padre del nuevo nivel
      if ((event.fila.activo == true || event.fila.activo == 'activo' || event.fila.activo == 'Activo') && this.uid_n < 4) {
        this.openDialogAgregar();
      } else {
        if (this.uid_n >= 4) {
          Swal.fire({
            title: '¡Error en la creación!',
            text: 'No es posible agregar un nuevo nivel, por favor comuniquese con el administrador del sistema',
            icon: 'warning',
            showConfirmButton: false,
            timer: 3500
          })
        } else {
          Swal.fire({
            title: '¡Error en la creación!',
            text: 'No es posible agregar un nuevo nivel sobre un nivel inactivo',
            icon: 'warning',
            showConfirmButton: false,
            timer: 3200
          })
        }

      }

    }
  }

  agregarSub(niv: number) {
    this.uid_n = niv;
    this.openDialogAgregar()
  }

  loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe((data: any) => {
      if (data) {
        this.planes = data.Data;
        this.planes = this.filterActivos(this.planes);
      }
      this.request.get(environment.PLANES_CRUD, `plan?query=nombre:Plan%20Estrategico%20de%20Desarrollo`).subscribe((data: any) => {
        this.planes = this.planes.concat(data.Data);
        this.planes = this.filterActivos(this.planes);
      })
      this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:6239117116511e20405d408b`).subscribe((data: any) => {
        this.planes = this.planes.concat(data.Data);
        this.planes = this.filterActivos(this.planes);
      })
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  filterActivos(data: any) {
    return data.filter((e: { activo: boolean; }) => e.activo == true);
  }

  volver() {
    this.router.navigate(['construir-plan-proyecto']);
  }

  ngOnInit(): void {
    this.formConstruirPlan = this.formBuilder.group({
      planControl: ['', Validators.required],
    });
  }
}
