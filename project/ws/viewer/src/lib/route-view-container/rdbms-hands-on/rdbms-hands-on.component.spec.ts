import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { RdbmsHandsOnComponent } from './rdbms-hands-on.component'

describe('RdbmsHandsOnComponent', () => {
  let component: RdbmsHandsOnComponent
  let fixture: ComponentFixture<RdbmsHandsOnComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RdbmsHandsOnComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(RdbmsHandsOnComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RdbmsHandsOnComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
