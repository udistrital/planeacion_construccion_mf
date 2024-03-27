import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ConsultarPlanComponent } from './components/plan/consultar-plan/consultar-plan.component';
import { ListarPlanComponent } from './components/plan/listar-plan/listar-plan.component';
import { ConstruirPlanProyectoComponent } from './components/plan/construir-plan-proyecto/construir-plan-proyecto.component';
import { ConstruirPlanComponent } from './components/plan/construir-plan/construir-plan.component';
import { CrearPlanComponent } from './components/plan/crear-plan/crear-plan.component';
import { HabilitarReporteComponent } from './components/plan/habilitar-reporte/habilitar-reporte.component';
import { GestionParametrosComponent } from './components/plan/gestion-parametros/gestion-parametros.component';
import { PlanAccionComponent } from './components/plan/plan-accion/plan-accion.component';

const routes: Routes = [
  {
    path: "consultar-plan/:plan_id/:nombrePlan/:tipo_plan_id",
    component: ConsultarPlanComponent
  },
  {
    path: "listar-plan",
    component: ListarPlanComponent
  },
  {
    path: "construir-plan-proyecto",
    component: ConstruirPlanProyectoComponent
  },
  {
    path: "construir-plan/:plan_id/:nombrePlan/:tipo_plan_id",
    component: ConstruirPlanComponent
  },
  {
    path: "crear-plan",
    component: CrearPlanComponent
  },
  {
    path: 'habilitar-reporte',
    component: HabilitarReporteComponent,
  },
  {
    path: 'gestion-parametros',
    component: GestionParametrosComponent
  },
  {
    path: 'consultar-plan',
    component: PlanAccionComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/construccion/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch())
  ]
})
export class AppRoutingModule { }
