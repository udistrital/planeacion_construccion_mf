import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanAccionComponent } from './plan-accion.component';

describe('PlanAccionComponent', () => {
  let component: PlanAccionComponent;
  let fixture: ComponentFixture<PlanAccionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanAccionComponent]
    });
    fixture = TestBed.createComponent(PlanAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
