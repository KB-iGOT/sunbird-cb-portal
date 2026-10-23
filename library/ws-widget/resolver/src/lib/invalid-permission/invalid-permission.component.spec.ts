import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { InvalidPermissionComponent } from './invalid-permission.component'

describe('InvalidPermissionComponent', () => {
  let component: InvalidPermissionComponent
  let fixture: ComponentFixture<InvalidPermissionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InvalidPermissionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(InvalidPermissionComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidPermissionComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
