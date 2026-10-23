import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ContentStripNewMultipleService } from './content-strip-new-multiple.service'
import { HttpClient } from '@angular/common/http'
import { WidgetUserServiceLib } from '@sunbird-cb/consumption'
import { WidgetContentService } from '@sunbird-cb/toc'
import { LoggerService, EventService, ConfigurationsService, UtilityService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripNewMultipleComponent } from './content-strip-new-multiple.component'

describe('ContentStripNewMultipleComponent', () => {
  let component: ContentStripNewMultipleComponent
  let fixture: ComponentFixture<ContentStripNewMultipleComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripNewMultipleComponent],
      providers: [
        { provide: ContentStripNewMultipleService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: WidgetUserServiceLib, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentStripNewMultipleComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripNewMultipleComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
