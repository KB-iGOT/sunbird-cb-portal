import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateService } from '@ngx-translate/core'
import { WidgetUserServiceLib } from '@sunbird-cb/consumption'
import { WidgetContentService } from '@sunbird-cb/toc'
import { LoggerService, EventService, ConfigurationsService, UtilityService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripWithTabsComponent } from './content-strip-with-tabs.component'

describe('ContentStripWithTabsComponent', () => {
  let component: ContentStripWithTabsComponent
  let fixture: ComponentFixture<ContentStripWithTabsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripWithTabsComponent],
      providers: [
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: WidgetUserServiceLib, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentStripWithTabsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripWithTabsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
