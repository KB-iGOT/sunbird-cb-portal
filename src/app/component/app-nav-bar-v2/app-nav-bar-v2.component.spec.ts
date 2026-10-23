import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BreakpointObserver } from '@angular/cdk/layout'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { CustomTourService, WidgetUserService } from '@sunbird-cb/collection'
import { LibNotificationsService } from '@sunbird-cb/notification'
import { ConfigurationsService, DomainConfService, EventService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { ThemeService } from '@sunbird-cb/design-system'
import { NotificationsService } from '../../services/notifications.service'
import { UserRestrictionService } from '../../services/user-restriction.service'
import { UrlService } from '../../shared/url.service'
import { autoMock } from 'src/testing/auto-mock'

import { AppNavBarV2Component } from './app-nav-bar-v2.component'

jest.mock('../../header/header.module', () => ({ HeaderModule: class HeaderModule { } }))
jest.mock('../top-right-nav-bar-v2/top-right-nav-bar-v2.component', () => ({
  TopRightNavBarV2Component: class TopRightNavBarV2Component { },
}))
jest.mock('../../../../project/ws/app/src/lib/routes/search-v3/components/search-input-home-v4/search-input-home-v4.component', () => ({
  SearchInputHomeV4Component: class SearchInputHomeV4Component { },
}))
// @sunbird-cb/design-system ships untranspiled ES module sources that jest cannot load
jest.mock('@sunbird-cb/design-system', () => ({ ThemeService: class ThemeService { } }))

describe('AppNavBarV2Component', () => {
  let component: AppNavBarV2Component
  let fixture: ComponentFixture<AppNavBarV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppNavBarV2Component],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: CustomTourService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: UrlService, useValue: autoMock() },
        { provide: WidgetUserService, useValue: autoMock() },
        { provide: NotificationsService, useValue: autoMock() },
        { provide: LibNotificationsService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
        { provide: ThemeService, useValue: autoMock() },
        { provide: UserRestrictionService, useValue: autoMock() },
        { provide: BreakpointObserver, useValue: autoMock() },
      ],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // standalone component: its template and imports (which pull in mocked modules) are
    // stubbed out and change detection is not run, so this only verifies construction
    .overrideComponent(AppNavBarV2Component, { set: { imports: [], template: '', schemas: [NO_ERRORS_SCHEMA] } })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavBarV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
