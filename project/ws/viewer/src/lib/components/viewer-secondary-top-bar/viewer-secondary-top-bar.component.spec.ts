import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { PdfScormDataService } from '../../pdf-scorm-data-service'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { WidgetContentLibService } from '@sunbird-cb/consumption'
import { ViewerDataService, WidgetContentService, ViewerUtilService, AppTocService } from '@sunbird-cb/toc'
import { ConfigurationsService, ValueService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ViewerSecondaryTopBarComponent } from './viewer-secondary-top-bar.component'

describe('ViewerSecondaryTopBarComponent', () => {
  let component: ViewerSecondaryTopBarComponent
  let fixture: ComponentFixture<ViewerSecondaryTopBarComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewerSecondaryTopBarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ViewerDataService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: PdfScormDataService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: AppTocService, useValue: autoMock() },
        { provide: WidgetContentLibService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ViewerSecondaryTopBarComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerSecondaryTopBarComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
