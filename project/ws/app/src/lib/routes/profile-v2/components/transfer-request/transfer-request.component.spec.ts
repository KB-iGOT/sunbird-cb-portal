import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
import { ProfileV2RevampService } from '../../services/profile-v2-revamp.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { SignupService } from 'src/app/routes/public/public-signup/signup.service'
import { autoMock } from 'src/testing/auto-mock'

import { TransferRequestComponent } from './transfer-request.component'

describe('TransferRequestComponent', () => {
  let component: TransferRequestComponent
  let fixture: ComponentFixture<TransferRequestComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TransferRequestComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: UserProfileService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ProfileV2RevampService, useValue: autoMock() },
        { provide: SignupService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(TransferRequestComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferRequestComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
