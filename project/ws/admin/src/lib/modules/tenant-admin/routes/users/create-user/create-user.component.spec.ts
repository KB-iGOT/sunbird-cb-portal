import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SystemRolesManagementService } from '../../system-roles-management/system-roles-management.service'
import { CreateUserService } from './create-user.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CreateUserComponent } from './create-user.component'

describe('CreateUserComponent', () => {
  let component: CreateUserComponent
  let fixture: ComponentFixture<CreateUserComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CreateUserComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: CreateUserService, useValue: autoMock() },
        { provide: SystemRolesManagementService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CreateUserComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUserComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
