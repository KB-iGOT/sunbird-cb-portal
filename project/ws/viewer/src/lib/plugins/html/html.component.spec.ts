import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MobileAppsService } from '../../../../../../../src/app/services/mobile-apps.service'
import { SCORMAdapterService } from './SCORMAdapter/scormAdapter'
import { Storage } from './SCORMAdapter/storage'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { WidgetContentService, AppTocService } from '@sunbird-cb/toc'
import { ConfigurationsService, EventService, LoggerService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { HtmlComponent } from './html.component'

describe('HtmlComponent', () => {
  let component: HtmlComponent
  let fixture: ComponentFixture<HtmlComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HtmlComponent],
      providers: [
        { provide: MobileAppsService, useValue: autoMock() },
        { provide: SCORMAdapterService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Storage, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: AppTocService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HtmlComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
