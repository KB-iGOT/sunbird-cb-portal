import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { PdfScormDataService } from './pdf-scorm-data-service'
import { MobileAppsService } from './services/mobile-apps.service'
import { RootService } from './services/root.service'
import { ViewerHeaderSideBarToggleService } from './viewer-header-side-bar-toggle.service'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { WidgetContentLibService, ContentLanguageService, WidgetUserServiceLib } from '@sunbird-cb/consumption'
import { ViewerDataService, WidgetContentService, AppTocService, AppTocV2Service, ViewerUtilService, TocConfigService } from '@sunbird-cb/toc'
import { ValueService, UtilityService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ViewerComponent } from './viewer.component'

describe('ViewerComponent', () => {
  let component: ViewerComponent
  let fixture: ComponentFixture<ViewerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewerComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ViewerDataService, useValue: autoMock() },
        { provide: RootService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: WidgetContentLibService, useValue: autoMock() },
        { provide: ContentLanguageService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: WidgetUserServiceLib, useValue: autoMock() },
        { provide: MobileAppsService, useValue: autoMock() },
        { provide: ViewerHeaderSideBarToggleService, useValue: autoMock() },
        { provide: PdfScormDataService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: AppTocService, useValue: autoMock() },
        { provide: AppTocV2Service, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: TocConfigService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ViewerComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
