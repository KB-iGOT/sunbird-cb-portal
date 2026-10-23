import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TenantAdminService } from '../../tenant-admin.service'
import { FormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { UserRegistrationComponent } from './user-registration.component'

describe('UserRegistrationComponent', () => {
  let component: UserRegistrationComponent
  let fixture: ComponentFixture<UserRegistrationComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UserRegistrationComponent],
      providers: [
        { provide: TenantAdminService, useValue: autoMock() },
        { provide: FormBuilder, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(UserRegistrationComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRegistrationComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
