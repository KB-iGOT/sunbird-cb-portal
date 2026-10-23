import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { PracticeService } from '../../practice.service'
import { ViewerHeaderSideBarToggleService } from './../../../../viewer-header-side-bar-toggle.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { OverviewComponent } from './overview.component'

describe('OverviewComponent', () => {
  let component: OverviewComponent
  let fixture: ComponentFixture<OverviewComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OverviewComponent],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ViewerHeaderSideBarToggleService, useValue: autoMock() },
        { provide: PracticeService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(OverviewComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
