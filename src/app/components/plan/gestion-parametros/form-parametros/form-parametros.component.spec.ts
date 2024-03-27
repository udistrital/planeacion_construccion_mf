import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormParametrosComponent } from './form-parametros.component';

describe('FormParametrosComponent', () => {
  let component: FormParametrosComponent;
  let fixture: ComponentFixture<FormParametrosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormParametrosComponent]
    });
    fixture = TestBed.createComponent(FormParametrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
