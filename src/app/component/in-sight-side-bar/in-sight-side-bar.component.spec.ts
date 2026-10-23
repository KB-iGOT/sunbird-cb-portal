import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SignupService } from '../../routes/public/public-signup/signup.service'
import { CommonDataService } from '../../services/common-data.service'
import { HomePageService } from '../../services/home-page.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, EventService, MultilingualTranslationsService, DomainConfService } from '@sunbird-cb/utils-v2'
import { ProfileV2Service, UserProfileService } from '@ws/app'
import { autoMock } from 'src/testing/auto-mock'

import { InsightSideBarComponent } from './in-sight-side-bar.component'

// the @ws/app barrel transitively pulls in learn-search.component, which does not compile
// against the installed @sunbird-cb/utils-v2, so only the tokens used here are provided
jest.mock('@ws/app', () => ({
  ProfileV2Service: class ProfileV2Service { },
  UserProfileService: class UserProfileService { },
}))

describe('IngsightSideBarComponent', () => {
  let component: InsightSideBarComponent
  let fixture: ComponentFixture<InsightSideBarComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InsightSideBarComponent],
      providers: [
        { provide: HomePageService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: SignupService, useValue: autoMock() },
        { provide: ProfileV2Service, useValue: autoMock() },
        { provide: UserProfileService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: CommonDataService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(InsightSideBarComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InsightSideBarComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
