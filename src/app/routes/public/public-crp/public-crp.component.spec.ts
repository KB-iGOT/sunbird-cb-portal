import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import {
  ConfigurationsService,
  EventService,
  LoggerService,
  MultilingualTranslationsService,
  TelemetryService,
} from '@sunbird-cb/utils-v2'
import { SignupService } from '../public-signup/signup.service'
import { ZohoSupportService } from '../../../services/zoho-support.service'
import { MobileAppsService } from '../../../services/mobile-apps.service'
import { autoMock } from 'src/testing/auto-mock'

import { PublicCrpComponent } from './public-crp.component'

// the @ws/app barrel transitively pulls in learn-search.component, which does not compile
// against the installed @sunbird-cb/utils-v2, so only the tokens used here are provided
jest.mock('@ws/app', () => ({
  DialogBoxComponent: class DialogBoxComponent { },
}))

describe('PublicCrpComponent', () => {
  let component: PublicCrpComponent
  let fixture: ComponentFixture<PublicCrpComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PublicCrpComponent],
      providers: [
        { provide: SignupService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: ZohoSupportService, useValue: autoMock() },
        { provide: MobileAppsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: TelemetryService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PublicCrpComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicCrpComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
