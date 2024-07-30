import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Rol, ROL_ASISTENTE_DEPENDENCIA, ROL_ASISTENTE_PLANEACION, Usuario, Vinculacion } from '../utils';
import { RequestManager } from 'src/app/components/services/requestManager';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ParametroPeriodo } from '../../gestion-parametros/utils/gestion-parametros.models';
@Component({
  selector: 'app-form-usuarios',
  templateUrl: './form-usuarios.component.html',
  styleUrls: ['./form-usuarios.component.scss']
})
export class FormUsuariosComponent implements OnInit {

  rolesUsuario: Rol[] = [];
  rolesSistema: Rol[] = [
    { rol: ROL_ASISTENTE_DEPENDENCIA, selected: false },
    { rol: ROL_ASISTENTE_PLANEACION, selected: false }
  ];

  correoPlaneacion!: string;
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
    this.correoPlaneacion = '';
    this.obtenerCorreoPlaneacion();
    this.validarRoles(this.rolesUsuario, this.rolesSistema);
  }

  seleccionarRolVincular(item: Rol) {
    this.rolesSistema.forEach(role => role.selected = false);
    item.selected = !item.selected;
  }

  seleccionarRolDesvincular(item: Rol) {
    this.rolesUsuario.forEach(role => role.selected = false);
    item.selected = !item.selected;
  }

  vincularRol() {
    const rolesSeleccionados = this.rolesSistema.filter(item => item.selected);
    if (rolesSeleccionados.length === 0) return;

    if (!this.validacionVinculacion(rolesSeleccionados)) {
      return; // NO pasa la validación
    }

    Swal.fire({
      title: 'Vincular Rol',
      icon: 'warning',
      text: `¿Está seguro de vincular el rol al usuario?, si el usuario tiene otra vinculación se verá afectada con el cambio de rol`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        const successfulResponses: any[] = []; // Variable para almacenar las respuestas exitosas

        // Promesas para cambio de CargoId en VinculacionTercero
        const promisesCambioCargo = rolesSeleccionados.map((rol) => {
          if (this.usuario.VinculacionSeleccionadaId != undefined) {
            return new Promise((resolve, reject) => {
              let bodyVinculacion = {
                "user": this.usuario,
                "rol": rol.rol,
                "vincular": true
              };
              this.request.put(environment.PLANES_FORMULACION_MID, `formulacion/cargo_vinculacion`, bodyVinculacion, this.usuario.VinculacionSeleccionadaId)
                .subscribe((data: any) => {
                  if (data != null && data != undefined && data != "") {
                    this.cerrarMensajeCarga();
                    data.rolUsuario = rol; // Agregar el nombre del rol a la respuesta
                    resolve(data);
                  } else {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `No se pudo vincular el rol ${rol.rol} al usuario`,
                      icon: 'warning',
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                      showConfirmButton: false,
                      timer: 3500
                    }).then(() => {
                      this.enviarErrorPeticion();
                    });
                    reject(new Error(`No se pudo vincular el rol ${rol.rol} al usuario`)); // Rechazar si la respuesta es nula
                  }
                }, (error) => {
                  console.error('Error en la petición para cambiar CargoId:', error);
                  Swal.fire({
                    title: 'Error en la operación',
                    text: `No se pudo vincular el rol ${rol.rol} al usuario: ${error.error.Data}`,
                    icon: 'warning',
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 3500
                  }).then(() => {
                    this.enviarErrorPeticion();
                  });
                  reject(error); // Rechazar la promesa en caso de error
                });
            });
          }
          return undefined;
        });

        // Ejecutar todas las promesas en paralelo para cambio de CargoId
        Promise.all(promisesCambioCargo)
          .then(() => {
            // Crear las promesas para vincular roles
            const vincularPromises = rolesSeleccionados.map((rol) => {
              return new Promise((resolve, reject) => {
                let body = {
                  "user": this.usuario.encodedEmail,
                  "rol": rol.rol
                };
                this.mostrarMensajeCarga();

                this.request.post(`${environment.AUTENTICACION_MID}rol/add`, '', body)
                  .subscribe((data: any) => {
                    if (data != null && data != undefined && data != "") {
                      this.cerrarMensajeCarga();
                      data.rolUsuario = rol; // Agregar el nombre del rol a la respuesta
                      successfulResponses.push(data); // Almacenar la respuesta exitosa
                      resolve(data); // Resolver la promesa con los datos
                    } else {
                      Swal.fire({
                        title: 'Error en la operación',
                        text: `No se pudo vincular el rol ${rol.rol} al usuario`,
                        icon: 'warning',
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        timer: 3500
                      }).then(() => {
                        this.enviarErrorPeticion();
                      });
                      reject(new Error(`No se pudo vincular el rol ${rol.rol} al usuario`)); // Rechazar si la respuesta es nula
                    }
                  }, (error) => {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `No se pudo vincular el rol ${rol.rol} al usuario`,
                      icon: 'warning',
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                      showConfirmButton: false,
                      timer: 3500
                    }).then(() => {
                      this.enviarErrorPeticion();
                    });
                    reject(error); // Rechazar la promesa en caso de error
                  });
              });
            });

            // Ejecutar todas las promesas en paralelo para vincular roles
            return Promise.all(vincularPromises);
          })
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
            console.error('Error en alguna de las peticiones para vincular roles:', error);
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
      icon: 'warning',
      text: `¿Está seguro de desvincular el rol al usuario?, si el usuario tiene otra vinculación se verá afectada con el cambio de rol`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        const successfulResponses: any[] = []; // Variable para almacenar las respuestas exitosas

        // Crear las promesas para cambiar CargoId en VinculacionTercero
        const promisesCambioCargo = rolesSeleccionados.map((rol) => {
          if (this.usuario.VinculacionSeleccionadaId != undefined) {
            return new Promise((resolve, reject) => {
              let bodyVinculacion = {
                "user": this.usuario,
                "rol": rol.rol,
                "vincular": false
              };
              this.request.put(environment.PLANES_FORMULACION_MID, `formulacion/cargo_vinculacion`, bodyVinculacion, this.usuario.VinculacionSeleccionadaId)
                .subscribe((data: any) => {
                  if (data != null && data != undefined && data != "") {
                    this.cerrarMensajeCarga();
                    data.rolUsuario = rol; // Agregar el nombre del rol a la respuesta
                    resolve(data);
                  } else {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `No se pudo desvincular el rol ${rol.rol} al usuario`,
                      icon: 'warning',
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                      showConfirmButton: false,
                      timer: 2500
                    }).then(() => {
                      this.enviarErrorPeticion();
                    });
                    reject(new Error(`No se pudo desvincular el rol ${rol.rol} al usuario`)); // Rechazar si la respuesta es nula
                  }
                }, (error) => {
                  Swal.fire({
                    title: 'Error en la operación',
                    text: `No se pudo desvincular el rol ${rol.rol} al usuario: ${error.error.Data}`,
                    icon: 'warning',
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 3500
                  }).then(() => {
                    this.enviarErrorPeticion();
                  });
                  reject(error);
                });
            });
          }
          return Promise.resolve(); // Resolver con una promesa vacía si VinculacionSeleccionadaId es undefined
        });

        // Ejecutar todas las promesas de cambio de CargoId en paralelo
        Promise.all(promisesCambioCargo)
          .then(() => {
            // Crear las promesas para desvincular roles
            const desvincularPromises = rolesSeleccionados.map((rol) => {
              return new Promise((resolve, reject) => {
                let body = {
                  "user": this.usuario.encodedEmail,
                  "rol": rol.rol
                };
                this.mostrarMensajeCarga();

                this.request.post(`${environment.AUTENTICACION_MID}rol/remove`, '', body)
                  .subscribe((data: any) => {
                    if (data != null && data != undefined && data != "") {
                      this.cerrarMensajeCarga();
                      data.rolUsuario = rol; // Agregar el nombre del rol a la respuesta
                      successfulResponses.push(data); // Almacenar la respuesta exitosa
                      resolve(data); // Resolver la promesa con los datos
                    } else {
                      Swal.fire({
                        title: 'Error en la operación',
                        text: `No se pudo desvincular el rol ${rol.rol} del usuario`,
                        icon: 'warning',
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        timer: 2500
                      }).then(() => {
                        this.enviarErrorPeticion();
                      });
                      reject(new Error(`No se pudo desvincular el rol ${rol.rol} del usuario`)); // Rechazar si la respuesta es nula
                    }
                  }, (error) => {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `No se pudo desvincular el rol ${rol.rol} del usuario`,
                      icon: 'warning',
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                      showConfirmButton: false,
                      timer: 2500
                    }).then(() => {
                      this.enviarErrorPeticion();
                    });
                    reject(error); // Rechazar la promesa en caso de error
                  });
              });
            });

            // Ejecutar todas las promesas de desvinculación en paralelo
            return Promise.all(desvincularPromises);
          })
          .then(async () => {
            // Procesar las respuestas exitosas
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
            console.error('Error en alguna de las peticiones para cambiar CargoId o desvincular roles:', error);
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

  async obtenerCorreoPlaneacion() {
    await new Promise((resolve) => {
      this.request
        .get(
          environment.PARAMETROS_SERVICE, `parametro_periodo?query=ParametroId.CodigoAbreviacion:CORREO_OAP,ParametroId.TipoParametroId.CodigoAbreviacion:P_SISGPLAN,Activo:true`
        )
        .subscribe((data: any) => {
          if (data?.Data) {
            let parametroPeriodo: ParametroPeriodo = data.Data[0];
            if (parametroPeriodo.Valor != undefined && parametroPeriodo.Valor != null && parametroPeriodo.Valor != "") {
              this.correoPlaneacion = JSON.parse(parametroPeriodo.Valor).Valor;
              resolve(this.correoPlaneacion);
            } else {
              Swal.fire({
                title: 'Error en la operación',
                text: `No se pudo obtener el correo de la Oficina de Asesora de Planeación del módulo de parámetros, comuníquese con computo@udistrital.edu.co`,
                icon: 'warning',
                allowEscapeKey: false,
                allowOutsideClick: false,
                showConfirmButton: false,
                timer: 3500
              });
              this.enviarErrorPeticion();
            }
          } else {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se pudo obtener el correo de la Oficina de Asesora de Planeación del módulo de parámetros`,
              icon: 'warning',
              allowEscapeKey: false,
              allowOutsideClick: false,
              showConfirmButton: false,
              timer: 3500
            });
            this.enviarErrorPeticion();
          }
        });
    });
  }

  validacionVinculacion(rolesSeleccionados: Rol[]): boolean { //? Funcion que define si pasa o no la validacion de ASISTENTE_PLANEACION
    const rolAsistentePlaneacion = rolesSeleccionados.find(rol => rol.rol === ROL_ASISTENTE_PLANEACION);
    const vinculacionSeleccionada: Vinculacion = this.usuario.Vinculacion!.find(vinculacion => vinculacion.Id === this.usuario.VinculacionSeleccionadaId)!;
    const vinculacionPlaneacion: boolean = vinculacionSeleccionada.DependenciaCorreo === this.correoPlaneacion ? true : false;

    if (rolAsistentePlaneacion && vinculacionPlaneacion && rolesSeleccionados.length === 1) {
      return true; // El usuario desea vincular el rol de ASISTENTE_PLANEACION a un usuario de la Oficina de Asesora de Planeación
    }

    if (rolAsistentePlaneacion == undefined && !vinculacionPlaneacion) {
      return true; // El usuario NO desea vincular el rol de ASISTENTE_PLANEACION
    }

    if (rolAsistentePlaneacion == undefined && vinculacionPlaneacion) {
      return true; // El usuario desea vincular OTRO rol a un usuario que pertenece a la Oficina de Asesora de Planeación
    }

    if (rolAsistentePlaneacion && vinculacionPlaneacion && rolesSeleccionados.length > 1) {
      Swal.fire({
        title: 'Error en la operación',
        text: `El usuario no puede tener más de un rol por vinculación`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
      return false; // El usuario desea vincular más de un rol a un usuario de la Oficina de Asesora de Planeación
    }

    if (rolAsistentePlaneacion && !vinculacionPlaneacion) { // El usuario desea vincular el rol de ASISTENTE_PLANEACION a un usuario que NO pertenece a la Oficina de Asesora de Planeación
      Swal.fire({
        title: 'Error en la operación',
        text: `El usuario no puede tener el rol de ${ROL_ASISTENTE_PLANEACION} si no pertenece a la Oficina de Asesora de Planeación`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
      return false;
    }
    return false;
  }
}
