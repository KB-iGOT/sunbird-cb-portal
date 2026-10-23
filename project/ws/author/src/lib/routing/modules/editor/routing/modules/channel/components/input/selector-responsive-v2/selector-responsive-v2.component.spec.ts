import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { SelectorResponsiveV2Component } from './selector-responsive-v2.component'

describe('SelectorResponsiveV2Component', () => {
  let component: SelectorResponsiveV2Component
  let fixture: ComponentFixture<SelectorResponsiveV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectorResponsiveV2Component],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SelectorResponsiveV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorResponsiveV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
