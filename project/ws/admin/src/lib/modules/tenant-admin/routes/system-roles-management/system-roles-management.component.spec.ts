import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { SystemRolesManagementComponent } from './system-roles-management.component'

describe('SystemRolesManagementComponent', () => {
  let component: SystemRolesManagementComponent
  let fixture: ComponentFixture<SystemRolesManagementComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SystemRolesManagementComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SystemRolesManagementComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemRolesManagementComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
