import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Usuario } from './utils/gestion-usuarios.models';
import { ROL_ASISTENTE_DEPENDENCIA, ROL_JEFE_DEPENDENCIA, ROL_JEFE_UNIDAD_PLANEACION, ROL_PLANEACION } from './utils';
import { RequestManager } from '../../services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent implements OnInit{

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

  constructor(
    private request: RequestManager,
    private fb: FormBuilder) {
    this.formUsuarios = this.fb.group({
      correo: ['', Validators.required],
      selectRol: ['']
    });
  }

  ngOnInit(): void {
    this.displayedColumns = ['Usuario', 'Roles', 'actions'];
    this.roles = [ROL_PLANEACION, ROL_JEFE_UNIDAD_PLANEACION, ROL_JEFE_DEPENDENCIA, ROL_ASISTENTE_DEPENDENCIA];
    this.usuarios = [];
    this.banderaTabla = false;
    this.rolSelected = false;
    this.banderaFormEdicion = false;
    this.errorEnPeticion = false;
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

  buscar(){
    this.errorEnPeticion = false;
    this.banderaFormEdicion = false;
    if(this.validarEmail(this.formUsuarios.get('correo').value)){
      let body = {
        "user": this.formUsuarios.get('correo').value
      }
      this.mostrarMensajeCarga();
      this.request.post(`${environment.AUTENTICACION_MID}token/userRol`, '', body).subscribe(
        (data: any) => {
          if (data != null && data != undefined && data != "") {
            this.usuarios = [];
            this.usuarios.push(data);
            this.cerrarMensajeCarga()
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
      );
    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: 'El correo no es válido',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
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

  limpiarForm(){
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
    this.errorEnPeticion = false;
    this.usuario = usuario;
    this.banderaFormEdicion = true;
  }

  recibirErrorPeticion(error: any) {
    this.errorEnPeticion = error;
  }
}
