import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanAccionSeguimientoComponent } from './plan-accion-seguimiento.component';

describe('PlanAccionSeguimientoComponent', () => {
  let component: PlanAccionSeguimientoComponent;
  let fixture: ComponentFixture<PlanAccionSeguimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanAccionSeguimientoComponent]
    });
    fixture = TestBed.createComponent(PlanAccionSeguimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
