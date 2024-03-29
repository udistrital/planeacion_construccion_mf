import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlanComponent } from './components/plan/plan.component';
import { CrearPlanComponent } from './components/plan/crear-plan/crear-plan.component';
import { ConstruirPlanProyectoComponent } from './components/plan/construir-plan-proyecto/construir-plan-proyecto.component';
import { ConsultarPlanComponent } from './components/plan/consultar-plan/consultar-plan.component';
import { HabilitarReporteComponent } from './components/plan/habilitar-reporte/habilitar-reporte.component';
import { ListarPlanComponent } from './components/plan/listar-plan/listar-plan.component';
import { ArbolComponent } from './components/arbol/arbol.component';
import { ConstruirPlanComponent } from './components/plan/construir-plan/construir-plan.component';
import { EditarDialogComponent } from './components/plan/construir-plan/editar-dialog/editar-dialog.component';
import { AgregarDialogComponent } from './components/plan/construir-plan/agregar-dialog/agregar-dialog.component';
import { FuncionamientoComponent } from './components/plan/habilitar-reporte/funcionamiento/funcionamiento.component';
import { InversionComponent } from './components/plan/habilitar-reporte/inversion/inversion.component';
import { TablaUnidadesComponent } from './components/plan/habilitar-reporte/tabla-unidades/tabla-unidades.component';
import { GestionParametrosComponent } from './components/plan/gestion-parametros/gestion-parametros.component';
import { FormParametrosComponent } from './components/plan/gestion-parametros/form-parametros/form-parametros.component';
import { PlanAccionComponent } from './components/plan/plan-accion/plan-accion.component';


@NgModule({
  declarations: [
    AppComponent,
    PlanComponent,
    CrearPlanComponent,
    ConstruirPlanProyectoComponent,
    ConsultarPlanComponent,
    HabilitarReporteComponent,
    ListarPlanComponent,
    ArbolComponent,
    ConstruirPlanComponent,
    EditarDialogComponent,
    AgregarDialogComponent,
    FuncionamientoComponent,
    InversionComponent,
    TablaUnidadesComponent,
    GestionParametrosComponent,
    FormParametrosComponent,
    PlanAccionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatDialogModule,
    MatRadioModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
