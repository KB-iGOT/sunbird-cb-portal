import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { BtnSettingsService } from '@sunbird-cb/collection'
import { ConfigurationsService, DomainConfService, EventService } from '@sunbird-cb/utils-v2'
import { UserProfileService } from '@ws/app'
import { autoMock } from 'src/testing/auto-mock'
import { MobileAppsService } from '../../services/mobile-apps.service'

import { HomeComponent } from './home.component'

// the @ws/app barrel transitively pulls in learn-search.component, which does not compile
// against the installed @sunbird-cb/utils-v2, so only the token used here is provided
jest.mock('@ws/app', () => ({ UserProfileService: class UserProfileService { } }))

describe('HomeComponent', () => {
  let component: HomeComponent
  let fixture: ComponentFixture<HomeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: BtnSettingsService, useValue: autoMock() },
        { provide: MobileAppsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: UserProfileService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HomeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
