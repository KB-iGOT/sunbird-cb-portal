import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UntypedFormBuilder } from '@angular/forms'
import { autoMock } from 'src/testing/auto-mock'

import { BreadcrumComponent } from './breadcrum.component'

describe('BreadcrumComponent', () => {
  let component: BreadcrumComponent
  let fixture: ComponentFixture<BreadcrumComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BreadcrumComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BreadcrumComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
