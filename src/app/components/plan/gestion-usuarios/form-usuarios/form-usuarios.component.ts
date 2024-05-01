import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Rol, ROL_ASISTENTE_DEPENDENCIA, ROL_JEFE_DEPENDENCIA, ROL_JEFE_UNIDAD_PLANEACION, ROL_PLANEACION, Usuario } from '../utils';
import { RequestManager } from 'src/app/components/services/requestManager';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-form-usuarios',
  templateUrl: './form-usuarios.component.html',
  styleUrls: ['./form-usuarios.component.scss']
})
export class FormUsuariosComponent implements OnInit{

  rolesUsuario: Rol[] = [];
  rolesSistema: Rol[] = [
    { rol: ROL_PLANEACION, selected: false },
    { rol: ROL_JEFE_UNIDAD_PLANEACION, selected: false },
    { rol: ROL_JEFE_DEPENDENCIA, selected: false },
    { rol: ROL_ASISTENTE_DEPENDENCIA, selected: false },
  ];

  @Input() usuario!: Usuario;
  @Output() errorEnPeticion = new EventEmitter<any>();

  constructor(
    private request: RequestManager,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.rolesUsuario = this.formatearRoles(this.usuario);
    this.rolesUsuario = this.rolesUsuario.filter(usuarioRol => { // Nos aseguramos de mostrar solo los roles de SISGPLAN
      return this.rolesSistema.some(sistemaRol => sistemaRol.rol === usuarioRol.rol);
    })
    this.validarRoles(this.rolesUsuario, this.rolesSistema);
  }

  seleccionarRol(item: Rol) {
    item.selected = !item.selected;
  }

  vincularRol() {
    const rolesSeleccionados = this.rolesSistema.filter(item => item.selected);
    if (rolesSeleccionados.length === 0) return;
    Swal.fire({
      title: 'Vincular Rol',
      text: `¿Está seguro de vincular el rol al usuario?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        const successfulResponses: any[] = []; // Variable para almacenar las respuestas exitosas
        
        rolesSeleccionados.reduce((promiseChain, rol, index) => {
          return promiseChain.then(() => {
            return new Promise((resolve, reject) => {
              let body = {
                "user": this.usuario.email,
                "rol": rol.rol
              };
              this.mostrarMensajeCarga();
        
              this.request.post(`${environment.AUTENTICACION_MID}/rol/add`, '', body)
                .subscribe((data: any) => {
                  if (data != null && data != undefined && data != "") {
                    this.cerrarMensajeCarga();
                    data.rolUsuario = rol; // Agregar el nombre del rol a la respuesta
                    successfulResponses.push(data); // Almacenar la respuesta exitosa
                    resolve();
                  }
                }, (error) => {
                  Swal.fire({
                    title: 'Error en la operación',
                    text: `No se pudo vincular el rol ${rol.rol} al usuario`,
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  }).then(() => {
                    this.enviarErrorPeticion();
                  });
                  reject(error);
                });
            });
          });
        }, Promise.resolve())
        .then(async () => {
          for (const response of successfulResponses) {
            if (response != null && response != undefined) {
              if (response.data != "" && response.status === 200) {
                if (!this.rolesUsuario.find(i => i.rol === response.rolUsuario.rol)) {
                  this.rolesUsuario.push({ ...response.rolUsuario });
                }
                this.rolesSistema = this.rolesSistema.filter(item => !item.selected);
                await this.mostrarMensajeExito(response.rolUsuario.rol, 'vincular');
              } else if (response.status === 400 && response.success == false) {
                this.mostrarMensajeError(`El usuario ya tiene el rol ${response.rolUsuario.rol} asignado`);
              } else {
                this.mostrarMensajeError(`No se pudo vincular el rol ${response.rolUsuario.rol} al usuario`);
              }
            }
          }
          this.clearSelection();
        })
        .catch(error => {
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  desvincularRol() {
    const rolesSeleccionados = this.rolesUsuario.filter(item => item.selected);
    if (rolesSeleccionados.length === 0) return;
    Swal.fire({
      title: 'Desvincular Rol',
      text: `¿Está seguro de desvincular el rol al usuario?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        const successfulResponses: any[] = []; // Variable para almacenar las respuestas exitosas
  
        rolesSeleccionados.reduce((promiseChain, rol, index) => {
          return promiseChain.then(() => {
            return new Promise((resolve, reject) => {
              let body = {
                "user": this.usuario.email,
                "rol": rol.rol
              };
              this.mostrarMensajeCarga();
  
              this.request.post(`${environment.AUTENTICACION_MID}/rol/remove`, '', body)
                .subscribe((data: any) => {
                  if (data != null && data != undefined && data != "") {
                    this.cerrarMensajeCarga();
                    data.rolUsuario = rol; // Agregar el nombre del rol a la respuesta
                    successfulResponses.push(data); // Almacenar la respuesta exitosa
                    resolve();
                  }
                }, (error) => {
                  Swal.fire({
                    title: 'Error en la operación',
                    text: 'No se pudo desvincular el rol del usuario',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  }).then(() => {
                    this.enviarErrorPeticion();
                  });;
                  reject(error);
                });
            });
          });
        }, Promise.resolve())
        .then(async () => {
          for (const response of successfulResponses) {
            if (response != null && response != undefined) {
              if (response.data != "" && response.status === 200) {
                if (!this.rolesSistema.find(i => i.rol === response.rolUsuario.rol)) {
                  this.rolesSistema.push({ ...response.rolUsuario });
                }
                this.rolesUsuario = this.rolesUsuario.filter(item => !item.selected);
                await this.mostrarMensajeExito(response.rolUsuario.rol, 'desvincular');
              } else if (response.status === 400 && response.success == false) {
                this.mostrarMensajeError(`El usuario no tiene el rol ${response.rolUsuario.rol} asignado`);
              } else {
                this.mostrarMensajeError(`No se pudo desvincular el rol ${response.rolUsuario.rol} del usuario`);
              }
            }
          }
          this.clearSelection();
        })
        .catch(error => {
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  mostrarMensajeCarga(): void {
    Swal.fire({
      title: 'Realizando petición...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  cerrarMensajeCarga(): void {
    Swal.close();
  }

  mostrarMensajeExito(rol: string, tipo: string) {
    let mensaje = '';
    tipo == 'vincular' ? mensaje = `Rol ${rol} vinculado correctamente` : mensaje = `Rol ${rol} desvinculado correctamente`;
  
    return new Promise(resolve => {
      Swal.fire({
        title: 'Operación exitosa',
        text: mensaje,
        icon: 'success',
        showConfirmButton: false,
        timer: 2500,
        willClose: () => resolve(true)
      });
    });
  }

  mostrarMensajeError(mensaje: any) {
    Swal.fire({
      title: 'Error en la operación',
      text: mensaje,
      icon: 'warning',
      showConfirmButton: false,
      timer: 2500
    });
  }

  clearSelection() {
    this.rolesUsuario.forEach(item => item.selected = false);
    this.rolesSistema.forEach(item => item.selected = false);
  }

  formatearRoles(usuario: Usuario) {
    return usuario.role.filter(rol => rol !== 'Internal/everyone' && rol !== 'Internal/selfsignup')
                              .map(rol => ({ "rol": rol, "selected": false }));
  }

  validarRoles(rolesUsuario: Rol[], rolesSistema: Rol[]) {
    // Crea un conjunto de roles del usuario para facilitar la búsqueda
    const rolesSet = new Set(rolesUsuario.map(role => JSON.stringify(role)));

    // Filtra los roles del sistema excluyendo los del usuario
    this.rolesSistema = rolesSistema.filter(role => !rolesSet.has(JSON.stringify(role)));
  }

  enviarErrorPeticion() {
    this.errorEnPeticion.emit(true);
  }
}
