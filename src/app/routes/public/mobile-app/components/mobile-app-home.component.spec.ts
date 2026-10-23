import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MobileAppsService } from '../../../../services/mobile-apps.service'
import { Platform } from '@angular/cdk/platform'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { MobileAppHomeComponent } from './mobile-app-home.component'

describe('MobileAppHomeComponent', () => {
  let component: MobileAppHomeComponent
  let fixture: ComponentFixture<MobileAppHomeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MobileAppHomeComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Platform, useValue: autoMock() },
        { provide: MobileAppsService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(MobileAppHomeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileAppHomeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
