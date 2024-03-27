import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-consultar-plan',
  templateUrl: './consultar-plan.component.html',
  styleUrls: ['./consultar-plan.component.scss']
})
export class ConsultarPlanComponent implements OnInit{
  formConsultar: FormGroup | undefined;
  tipoPlanId: string = ""; // id tipo plan
  idPadre: string = ""; // id padre del objeto
  planes: any[] | undefined;
  planId: string = "";
  nombrePlan : string = "";
  tipo_plan_id: string = "";

  constructor(
    private formBuilder: FormBuilder,
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

   filterActivos(data: any[]) {
    return data.filter(e => e.activo == true);
  }

  volver(){
    this.router.navigate(['listar-plan']);
  }

  ngOnInit(): void {
    this.formConsultar = this.formBuilder.group({
      nombre: [this.nombrePlan, Validators.required],
      tipo_plan_id: [this.tipo_plan_id, Validators.required],
      plan_id: [this.planId, Validators.required]
    });
  }
}
