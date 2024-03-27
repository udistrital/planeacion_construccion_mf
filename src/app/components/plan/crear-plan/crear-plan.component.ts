import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/userService';
import { UtilService } from '../../services/utilService';

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.component.html',
  styleUrls: ['./crear-plan.component.scss'],
})
export class CrearPlanComponent implements OnInit{
  formCrearPlan: any;
  tipos!: any[]
  tipoPlan: any;
  nombrePlan!: string;
  banderaFormato: boolean = false;
  vigencias!: any[];
  documento: any;
  auxDocumento!: string;

  constructor(
    private request: RequestManager,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
    private formBuilder: FormBuilder,
    private diagog: MatDialog,
    private dialogRef: MatDialogRef<CrearPlanComponent>
  ) {
    this.loadTipos();
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  createPlan() {
    let dataPlan;
    if (this.formCrearPlan.get('radioFormato').disabled) {
      this.cargarDocumento().then(() => {
        dataPlan = {
          nombre: this.formCrearPlan.get('nombre').value,
          descripcion: this.formCrearPlan.get('desc').value,
          tipo_plan_id: this.tipoPlan._id,
          aplicativo_id: "idPlaneacion", // Valor por revisar
          activo: JSON.parse(this.formCrearPlan.get('radioEstado').value),
          documento_id: this.auxDocumento,
          vigencia: (this.formCrearPlan.get('vigencia').value)["Id"]
        }

        this.request.post(environment.PLANES_CRUD, 'plan', dataPlan).subscribe(
          (data) => {
            if (data) {
              Swal.fire({
                title: 'Registro correcto',
                text: `Se ingresaron correctamente los datos`,
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.dialogRef.close();
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['pages/plan/construir-plan-proyecto']);
                  });                }
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
      })
    } else {
      dataPlan = {
        nombre: this.formCrearPlan.get('nombre').value,
        descripcion: this.formCrearPlan.get('desc').value,
        tipo_plan_id: this.tipoPlan._id,
        aplicativo_id: "idPlaneacion", // Valor por revisar
        activo: JSON.parse(this.formCrearPlan.get('radioEstado').value),
        formato: JSON.parse(this.formCrearPlan.get('radioFormato').value)
      }
      this.request.post(environment.PLANES_CRUD, 'plan', dataPlan).subscribe(
        (data) => {
          if (data) {
            Swal.fire({
              title: 'Registro correcto',
              text: `Se ingresaron correctamente los datos`,
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.dialogRef.close();
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['pages/plan/construir-plan-proyecto']);
                });
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
    }
  }

  select(tipo: any) {
    this.tipoPlan = tipo;
    if (tipo._id !== "611af8464a34b3599e3799a2" && tipo._id !== "623cb06616511e41ef5d798c") { // diferente de proyecto
      this.nombrePlan = tipo.nombre;
      this.banderaFormato = true;
      this.formCrearPlan.get('radioFormato').enable();
      this.formCrearPlan.get('vigencia').disable();
    } else {
      this.nombrePlan = tipo.nombre;
      this.banderaFormato = false;
      this.formCrearPlan.get('vigencia').enable();
      this.formCrearPlan.get('radioFormato').disable();
      this.loadPeriodos();
    }
  }

  loadTipos() {
    this.request.get(environment.PLANES_CRUD, `tipo-plan`).subscribe((data: any) => {
      if (data) {
        this.tipos = data.Data;
      }
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

  loadPeriodos() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
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

  onChangeDocumento(event: any) {
    if (event != undefined) {
      let aux = event.files[0];
      if (this.documento == undefined || this.documento.name != aux.name) {
        this.documento = aux;
        Swal.fire({
          title: 'Documento Cargado',
          text: `Revise el campo de soportes para visualizar o eliminar`,
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        })
      } else {
        Swal.fire({
          title: 'Error en la operación',
          text: `El documento ya se encuentra cargado`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2000
        })
      }
    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se pudo subir el documento`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
  }

  eliminarDocumento() {
    this.documento = undefined;
  }

  cargarDocumento() {
    let message: string = '';
    let resolveRef: any;
    let rejectRef: any;
    let bodyPost;
    let dataPromise: Promise<string> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });
    if (this.documento != undefined) {
      let header = "data:application/pdf;base64,";
      let documentoBase64: string;
      const file = this.documento;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {

        let aux = new String(reader.result);
        documentoBase64 = aux.replace(header, "")
        bodyPost = {
          IdTipoDocumento: 65,
          nombre: this.documento.name,
          metadatos: {
            dato_a: "Soporte Proyecto Universitario Institucional"
          },
          descripcion: "Documento de soporte para Proyecto Universitario Institucional",
          file: documentoBase64
        }

        let body: any[] = [];
        body.push(bodyPost);
        this.request.post(environment.GESTOR_DOCUMENTAL_MID, `document/upload`, body).subscribe((data: any) => {
          if (data) {

            this.auxDocumento = data.res.Enlace;
            resolveRef(message);
          } else {

            Swal.fire({
              title: 'Error al cargar documento. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
            rejectRef(message);

          }
        })
      };

    } else {
      this.auxDocumento = '';
      resolveRef(message);
    }
    return dataPromise;
  }

  ngOnInit(): void {
    this.formCrearPlan = this.formBuilder.group({
      nombre: ['', Validators.required],
      desc: ['', Validators.required],
      tipo: ['', Validators.required],
      radioEstado: ['', Validators.required],
      radioFormato: ['', Validators.required],
      vigencia: ['', Validators.required],
    });
  }
}
