import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ViewerHeaderSideBarToggleService } from './../../viewer-header-side-bar-toggle.service'
import { PracticeService } from './practice.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { ViewerUtilService, ViewerDataService, WidgetContentService, AppTocService } from '@sunbird-cb/toc'
import { EventService, ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PracticeComponent } from './practice.component'

describe('PracticeComponent', () => {
  let component: PracticeComponent
  let fixture: ComponentFixture<PracticeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PracticeComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: PracticeService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ViewerDataService, useValue: autoMock() },
        { provide: ViewerHeaderSideBarToggleService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: AppTocService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PracticeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
