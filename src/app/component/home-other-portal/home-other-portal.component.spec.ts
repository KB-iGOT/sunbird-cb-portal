import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, MultilingualTranslationsService, EventService } from '@sunbird-cb/utils-v2'
import { AccessControlService } from '@ws/author'
import { autoMock } from 'src/testing/auto-mock'

import { HomeOtherPortalComponent } from './home-other-portal.component'

describe('HomeOtherPortalComponent', () => {
  let component: HomeOtherPortalComponent
  let fixture: ComponentFixture<HomeOtherPortalComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeOtherPortalComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HomeOtherPortalComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeOtherPortalComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
