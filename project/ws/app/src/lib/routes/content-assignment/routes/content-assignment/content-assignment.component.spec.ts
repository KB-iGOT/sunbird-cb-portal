import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { ContentAssignService } from '@sunbird-cb/collection'
import { ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentAssignmentComponent } from './content-assignment.component'

describe('ContentAssignmentComponent', () => {
  let component: ContentAssignmentComponent
  let fixture: ComponentFixture<ContentAssignmentComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentAssignmentComponent],
      providers: [
        { provide: Router, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ContentAssignService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentAssignmentComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentAssignmentComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
