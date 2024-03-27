import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionamientoComponent } from './funcionamiento.component';

describe('FuncionamientoComponent', () => {
  let component: FuncionamientoComponent;
  let fixture: ComponentFixture<FuncionamientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FuncionamientoComponent]
    });
    fixture = TestBed.createComponent(FuncionamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
