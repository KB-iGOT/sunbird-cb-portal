import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BreakpointObserver } from '@angular/cdk/layout'
import { autoMock } from 'src/testing/auto-mock'

import { SelectorResponsiveComponent } from './selector-responsive.component'

describe('SelectorResponsiveComponent', () => {
  let component: SelectorResponsiveComponent
  let fixture: ComponentFixture<SelectorResponsiveComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectorResponsiveComponent],
      providers: [
        { provide: BreakpointObserver, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SelectorResponsiveComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorResponsiveComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
