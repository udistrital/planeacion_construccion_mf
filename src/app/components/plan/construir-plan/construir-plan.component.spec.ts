import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstruirPlanComponent } from './construir-plan.component';

describe('ConstruirPlanComponent', () => {
  let component: ConstruirPlanComponent;
  let fixture: ComponentFixture<ConstruirPlanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConstruirPlanComponent]
    });
    fixture = TestBed.createComponent(ConstruirPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
