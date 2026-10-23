import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SearchServService } from '../_services/search-serv.service'
import { ContentStripVerticalService } from './content-strip-vertical.service'
import { WidgetContentService } from '@sunbird-cb/toc'
import { LoggerService, EventService, ConfigurationsService, UtilityService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripVerticalComponent } from './content-strip-vertical.component'

describe('ContentStripVerticalComponent', () => {
  let component: ContentStripVerticalComponent
  let fixture: ComponentFixture<ContentStripVerticalComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripVerticalComponent],
      providers: [
        { provide: ContentStripVerticalService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: SearchServService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentStripVerticalComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripVerticalComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
