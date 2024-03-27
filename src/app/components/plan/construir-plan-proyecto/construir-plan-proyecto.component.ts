import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RequestManager } from '../../services/requestManager';
import { Router } from '@angular/router';
import { EditarDialogComponent } from '../construir-plan/editar-dialog/editar-dialog.component';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CrearPlanComponent } from '../crear-plan/crear-plan.component';

@Component({
  selector: 'app-construir-plan-proyecto',
  templateUrl: './construir-plan-proyecto.component.html',
  styleUrls: ['./construir-plan-proyecto.component.scss']
})
export class ConstruirPlanProyectoComponent implements OnInit{
  displayedColumns: string[] = ['nombre', 'descripcion', 'tipo_plan', 'activo', 'actions'];
  dataSource!: MatTableDataSource<any>;
  uid!: number; // id del objeto
  planes!: any[];
  plan: any;
  cargando = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
    private router: Router,
  ) {
    this.loadData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialogEditar(sub: any, subDetalle: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {ban: 'plan', sub, subDetalle}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined){
        return undefined;
      } else {
        this.putData(result, 'editar');
      }
    });
  }

  putData(res: any, bandera: any){
    if (bandera == 'editar'){
      this.request.put(environment.PLANES_CRUD, `plan`, res, this.uid).subscribe((data: any) => {
        if(data){
          Swal.fire({
            title: 'Actualización correcta',
            text: `Se actualizaron correctamente los datos`,
            icon: 'success',
          }).then((result) => {
            if (result.value) {
              window.location.reload();
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
    } else if (bandera == 'activo') {
      Swal.fire({
        title: 'Inhabilitar plan',
        text: `¿Está seguro de inhabilitar el plan?`,
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then((result) => {
          if (result.isConfirmed) {
            this.request.put(environment.PLANES_CRUD, `plan`, res, this.uid).subscribe((data: any) => {
              if (data){
                Swal.fire({
                  title: 'Cambio realizado', 
                  icon: 'success',
                }).then((result) => {
                  if (result.value) {
                    window.location.reload();
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
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: 'Cambio cancelado', 
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
      })
    } 
  }

  // Inactivar todo el árbol
  deleteData(){ 
    Swal.fire({
      title: 'Inhabilitar plan',
      text: `¿Está seguro de inhabilitar el plan?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
          this.request.delete(environment.PLANES_MID, `arbol/desactivar_plan/`, this.uid).subscribe((data: any) => {
            if(data){
              Swal.fire({
                title: 'Cambio realizado', 
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  window.location.reload();
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: 'Cambio cancelado', 
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })
        }
    })
  }

  construirPlan(plan_id: any, nombrePlan: any, tipo_plan_id: any) {
    this.router.navigate(['construir-plan/' + plan_id+ '/' + nombrePlan + '/' + tipo_plan_id]);
  }

  loadData(){
    this.mostrarMensajeCarga();

    this.request.get(environment.PLANES_MID, `formulacion/planes`).subscribe(
      (data: any) => {
        if (data){
          this.planes = data.Data;
          this.ajustarData();
          this.cerrarMensajeCarga();
        }
      },(error) => {
        Swal.fire({
          title: 'Error en la operación', 
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    )
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
    this.cargando = false;
    Swal.close();
  }

  ajustarData(){
    this.cambiarValor("activo", true, "Activo")
    this.cambiarValor("activo", false, "Inactivo")
    this.dataSource = new MatTableDataSource(this.planes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editar(fila: any): void{
    this.uid = fila._id;
    this.request.get(environment.PLANES_CRUD, `plan/`+this.uid).subscribe((data: any) => {
      if(data){
        this.plan = data.Data;
        let subgrupoDetalle={
          type: "",
          required: false
        }
        this.openDialogEditar(this.plan, subgrupoDetalle);  
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
  }

  inactivar(fila: any):void{
    this.uid = fila._id;
    if (fila.activo == 'Activo'){
      if (fila.tipo_plan_id != '611af8464a34b3599e3799a2'){
        this.deleteData();
      } else if (fila.tipo_plan_id == '611af8464a34b3599e3799a2'){
        let res = {
          activo: false,
        }
        this.putData(res, 'activo')
      } 
    } else if (fila.activo == 'Inactivo'){
      Swal.fire({
        title: 'Plan ya inactivo',
        text: `El plan ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    }
  }

  cambiarValor(valorABuscar: any, valorViejo: any, valorNuevo: any) {
    this.planes.forEach(function(elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }

  definir(): void {
    const dialogRef = this.dialog.open(CrearPlanComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined){
        return undefined;
      } else {
        this.putData(result, 'editar');
      }
    });
  }

  ngOnInit(): void {
    this.loadData();
  }
}
