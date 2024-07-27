import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Dependencia, ROL_ASISTENTE_DEPENDENCIA, ROL_ASISTENTE_PLANEACION, ROL_JEFE_DEPENDENCIA, ROL_PLANEACION, Usuario, Vinculacion } from './utils';
import { Vigencia } from '../habilitar-reporte/utils';
import { RequestManager } from '../../services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent implements OnInit {

  formUsuarios!: FormGroup | any;
  displayedColumns!: string[];
  usuario!: Usuario;
  usuarios!: Usuario[];
  banderaTabla!: boolean;
  roles!: string[];
  rol!: string | undefined;
  rolSelected!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: MatTableDataSource<any>;
  banderaFormEdicion!: boolean;
  errorEnPeticion!: boolean;
  vinculacionesUsuario!: Vinculacion[];

  constructor(
    private request: RequestManager,
    private fb: FormBuilder) {
    this.formUsuarios = this.fb.group({
      identificacion: ['', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      selectRol: ['']
    });
  }

  ngOnInit(): void {
    this.displayedColumns = ['Usuario', 'Roles', 'Vinculacion', 'actions'];
    this.roles = [ROL_PLANEACION, ROL_JEFE_DEPENDENCIA, ROL_ASISTENTE_DEPENDENCIA, ROL_ASISTENTE_PLANEACION];
    this.usuarios = [];
    this.banderaTabla = false;
    this.rolSelected = false;
    this.banderaFormEdicion = false;
    this.errorEnPeticion = false;
    this.vinculacionesUsuario = [];
  }

  mostrarMensajeCarga(): void {
    Swal.fire({
      title: 'Cargando datos...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  cerrarMensajeCarga(): void {
    this.banderaTabla = true;
    this.usuarios[0].Vinculacion = this.vinculacionesUsuario;
    this.usuarios.forEach(row => {
      row.VinculacionSeleccionadaId = undefined;
    });
    this.dataSource = new MatTableDataSource(this.usuarios);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    Swal.close();
  }

  onChangeRol(rol: string) {
    if (rol == undefined) {
      this.rolSelected = false;
    } else {
      this.rolSelected = true;
      this.rol = rol;
    }
  }

  buscar() {
    this.errorEnPeticion = false;
    this.banderaFormEdicion = false;
    let identificacion: string = this.formUsuarios.get('identificacion').value;

    if (this.validarIdentificacion(identificacion)) {

      this.mostrarMensajeCarga();
      this.request.get(environment.PLANES_FORMULACION_MID, `formulacion/vinculacion_tercero_identificacion/${identificacion}`).subscribe(
        (data: any) => {
          if (data != null && data != undefined && data != "") {
            if (data.Data && data.Data != null && data.Data != undefined && data.Data != "") {
              this.vinculacionesUsuario = data.Data;
              let body = {
                "user": this.vinculacionesUsuario[0].TerceroPrincipalId.UsuarioWSO2
              }
              this.request.post(`${environment.AUTENTICACION_MID}token/userRol`, '', body).subscribe(
                (data: any) => {
                  if (data != null && data != undefined && data != "") {
                    this.usuarios = [];
                    this.usuarios.push(data);
                    for (const vinculacion of this.vinculacionesUsuario) {
                      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Activo:true,Id:${vinculacion.PeriodoId}`).subscribe((data: any) => {
                        if (data != null && data != undefined && data != "") {
                          let vigencia: Vigencia = data.Data[0];
                          this.vinculacionesUsuario.find(vinculacionUsuario => vinculacionUsuario.Id == vinculacion.Id)!.Periodo = vigencia.Nombre;
                          this.cerrarMensajeCarga()
                        }
                      }, (error) => {
                        Swal.fire({
                          title: 'Error en la operación',
                          text: 'No se encontraron datos registrados',
                          icon: 'warning',
                          showConfirmButton: false,
                          timer: 2500
                        });
                      }
                      );
                      this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion.DependenciaId).subscribe((dataUnidad: any) => {
                        if (dataUnidad) {
                          let unidad: Dependencia = dataUnidad[0];
                          let vinculacionEncontrada = this.vinculacionesUsuario.find(vinculacionUsuario => vinculacionUsuario.Id == vinculacion.Id);
                          vinculacionEncontrada!.Dependencia = unidad.DependenciaId.Nombre;
                          vinculacionEncontrada!.DependenciaCorreo = unidad.DependenciaId.CorreoElectronico;
                          Swal.close();
                        }
                      });
                    }
                  } else {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: 'No se encontraron datos registrados',
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500
                    });
                  }
                }, (error) => {
                  Swal.fire({
                    title: 'Error en la operación',
                    text: 'No se encontraron datos registrados',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  });
                }
              );
            } else {
              Swal.fire({
                title: 'Error en la operación',
                text: 'No se encontraron datos registrados',
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              });
            }
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          });
        }
      );

    } else {

      Swal.fire({
        title: 'Error en la operación',
        text: 'El número de identificacion no es válido',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });

    }
  }

  formatearRoles(roles: Array<any>): string {
    roles = roles.filter(role => this.roles.includes(role));
    return roles.toString().split(',').join(', ');
  }

  validarEmail(email: string) { // Función para validar el email, devuelve true si es correcto y false si no lo es
    const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valido = emailRegex.test(email);
    return valido ? true : false;
  }

  validarIdentificacion(identificacion: string) { // Función para validar la identificacion, devuelve true si es correcto y false si no lo es
    const identificacionRegex: RegExp = /^[0-9]*$/;
    const valido = identificacionRegex.test(identificacion);
    return valido ? true : false;
  }

  limpiarForm() {
    this.formUsuarios.reset();
    this.banderaTabla = false;
    this.rol = undefined;
    this.rolSelected = false;
    this.usuarios = [];
    this.dataSource = new MatTableDataSource(this.usuarios);
    this.banderaFormEdicion = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editar(usuario: Usuario) {
    if (usuario.VinculacionSeleccionadaId == null) {
      this.banderaFormEdicion = false;
      Swal.fire({
        title: 'Error en la operación',
        text: 'Debe seleccionar la vinculación del usuario',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    } else {
      this.errorEnPeticion = false;
      this.usuario = usuario;
      this.usuario.encodedEmail = encodeURIComponent(this.usuario.email);
      this.banderaFormEdicion = true;
    }
  }

  recibirErrorPeticion(error: any) {
    this.errorEnPeticion = error;
  }

  capturarVinculacion(row: any): void {
    this.usuario.VinculacionSeleccionadaId = row.Id;
  }
}
