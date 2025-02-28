import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteMapComponent } from './site-map.component';

describe('SiteMapComponent', () => {
  let component: SiteMapComponent;
  let fixture: ComponentFixture<SiteMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteMapComponent]
    });
    fixture = TestBed.createComponent(SiteMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
