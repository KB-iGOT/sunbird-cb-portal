import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NotificationsService } from '../../services/notifications.service'
import { UrlService } from '../../shared/url.service'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { CustomTourService, WidgetUserService } from '@sunbird-cb/collection'
import { LibNotificationsService } from '@sunbird-cb/notification'
import { ConfigurationsService, EventService, MultilingualTranslationsService, DomainConfService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AppNavBarComponent } from './app-nav-bar.component'

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent
  let fixture: ComponentFixture<AppNavBarComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppNavBarComponent],
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AppNavBarComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavBarComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
