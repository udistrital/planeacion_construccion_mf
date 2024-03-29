import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarDialogComponent } from './agregar-dialog.component';

describe('AgregarDialogComponent', () => {
  let component: AgregarDialogComponent;
  let fixture: ComponentFixture<AgregarDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarDialogComponent]
    });
    fixture = TestBed.createComponent(AgregarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
