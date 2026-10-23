import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HomePageService } from '../../services/home-page.service'
import { NotificationsService } from '../../services/notifications.service'
import { ZohoSupportService } from '../../services/zoho-support.service'
import { RootService } from '../root/root.service'
import { MatDialog, MatDialog as MatDialogNew } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { LibNotificationsService } from '@sunbird-cb/notification'
import { ConfigurationsService, MultilingualTranslationsService, EventService, DomainConfService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { TopRightNavBarComponent } from './top-right-nav-bar.component'

// the @ws/app barrel transitively pulls in learn-search.component, which does not compile
// against the installed @sunbird-cb/utils-v2, so only the tokens used here are provided
jest.mock('@ws/app', () => ({
  DialogBoxComponent: class DialogBoxComponent { },
  SurveyPopupComponent: class SurveyPopupComponent { },
  VerificationRequestDialogComponent: class VerificationRequestDialogComponent { },
}))

describe('TopRightNavBarComponent', () => {
  let component: TopRightNavBarComponent
  let fixture: ComponentFixture<TopRightNavBarComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TopRightNavBarComponent],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
        { provide: HomePageService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: ZohoSupportService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: NotificationsService, useValue: autoMock() },
        { provide: RootService, useValue: autoMock() },
        { provide: MatDialogNew, useValue: autoMock() },
        { provide: LibNotificationsService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(TopRightNavBarComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TopRightNavBarComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
