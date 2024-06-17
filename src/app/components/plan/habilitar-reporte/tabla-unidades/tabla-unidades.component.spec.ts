import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaUnidadesComponent } from './tabla-unidades.component';

describe('TablaUnidadesComponent', () => {
  let component: TablaUnidadesComponent;
  let fixture: ComponentFixture<TablaUnidadesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaUnidadesComponent]
    });
    fixture = TestBed.createComponent(TablaUnidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
