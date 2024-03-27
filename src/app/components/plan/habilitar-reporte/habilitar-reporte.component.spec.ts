import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabilitarReporteComponent } from './habilitar-reporte.component';

describe('HabilitarReporteComponent', () => {
  let component: HabilitarReporteComponent;
  let fixture: ComponentFixture<HabilitarReporteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HabilitarReporteComponent]
    });
    fixture = TestBed.createComponent(HabilitarReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
