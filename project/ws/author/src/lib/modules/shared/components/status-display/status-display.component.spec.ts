import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { StatusDisplayComponent } from './status-display.component'

describe('StatusDisplayComponent', () => {
  let component: StatusDisplayComponent
  let fixture: ComponentFixture<StatusDisplayComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatusDisplayComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(StatusDisplayComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusDisplayComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
