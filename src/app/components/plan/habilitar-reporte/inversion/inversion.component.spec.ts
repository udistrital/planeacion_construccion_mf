import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InversionComponent } from './inversion.component';

describe('InversionComponent', () => {
  let component: InversionComponent;
  let fixture: ComponentFixture<InversionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InversionComponent]
    });
    fixture = TestBed.createComponent(InversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
