import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrimestreDialogComponent } from './trimestre-dialog.component';

describe('TrimestreDialogComponent', () => {
  let component: TrimestreDialogComponent;
  let fixture: ComponentFixture<TrimestreDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrimestreDialogComponent]
    });
    fixture = TestBed.createComponent(TrimestreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
