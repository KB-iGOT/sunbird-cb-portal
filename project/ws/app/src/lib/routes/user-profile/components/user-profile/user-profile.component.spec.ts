import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { OtpService } from '../../services/otp.services'
import { UserProfileService } from '../../services/user-profile.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, EventService, MultilingualTranslationsService, PipeCertificateImageURL } from '@sunbird-cb/utils-v2'
import { LoaderService } from '@ws/author'
import { autoMock } from 'src/testing/auto-mock'

import { UserProfileComponent } from './user-profile.component'

describe('UserProfileComponent', () => {
  let component: UserProfileComponent
  let fixture: ComponentFixture<UserProfileComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: UserProfileService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: OtpService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: PipeCertificateImageURL, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(UserProfileComponent, '')
    .overrideComponent(UserProfileComponent, {
      set: { providers: [{ provide: PipeCertificateImageURL, useValue: autoMock() }] },
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
