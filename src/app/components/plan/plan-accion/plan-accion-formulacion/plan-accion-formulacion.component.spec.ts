import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanAccionFormulacionComponent } from './plan-accion-formulacion.component';

describe('PlanAccionFormulacionComponent', () => {
  let component: PlanAccionFormulacionComponent;
  let fixture: ComponentFixture<PlanAccionFormulacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanAccionFormulacionComponent]
    });
    fixture = TestBed.createComponent(PlanAccionFormulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
