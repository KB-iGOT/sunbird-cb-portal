import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SearchApiService } from '../_services/search-api.service'
import { ContentStripMultipleService } from './content-strip-multiple.service'
import { HttpClient } from '@angular/common/http'
import { WidgetUserServiceLib } from '@sunbird-cb/consumption'
import { WidgetContentService } from '@sunbird-cb/toc'
import { LoggerService, EventService, ConfigurationsService, UtilityService, MultilingualTranslationsService, WidgetEnrollService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripMultipleComponent } from './content-strip-multiple.component'

describe('ContentStripMultipleComponent', () => {
  let component: ContentStripMultipleComponent
  let fixture: ComponentFixture<ContentStripMultipleComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripMultipleComponent],
      providers: [
        { provide: ContentStripMultipleService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: WidgetUserServiceLib, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: SearchApiService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: WidgetEnrollService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentStripMultipleComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripMultipleComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
