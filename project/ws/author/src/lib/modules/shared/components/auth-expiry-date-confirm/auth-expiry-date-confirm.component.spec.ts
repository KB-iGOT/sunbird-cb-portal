import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NotificationService } from '../../../../services/notification.service'
import { AccessControlService } from '../../services/access-control.service'
import { ApiService } from '../../services/api.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AuthExpiryDateConfirmComponent } from './auth-expiry-date-confirm.component'

describe('AuthExpiryDateConfirmComponent', () => {
  let component: AuthExpiryDateConfirmComponent
  let fixture: ComponentFixture<AuthExpiryDateConfirmComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AuthExpiryDateConfirmComponent],
      providers: [
        { provide: AccessControlService, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ApiService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: NotificationService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AuthExpiryDateConfirmComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthExpiryDateConfirmComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
