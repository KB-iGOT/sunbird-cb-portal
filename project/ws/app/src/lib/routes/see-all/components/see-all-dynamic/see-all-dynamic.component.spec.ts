import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeAllDynamicComponent } from './see-all-dynamic.component';

describe('SeeAllDynamicComponent', () => {
  let component: SeeAllDynamicComponent;
  let fixture: ComponentFixture<SeeAllDynamicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeeAllDynamicComponent]
    });
    fixture = TestBed.createComponent(SeeAllDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
