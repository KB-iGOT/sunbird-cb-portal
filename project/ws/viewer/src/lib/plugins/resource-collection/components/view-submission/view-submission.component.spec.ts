import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ResourceCollectionService } from 'project/ws/viewer/src/lib/plugins/resource-collection/resource-collection.service'
import { autoMock } from 'src/testing/auto-mock'

import { ViewSubmissionComponent } from './view-submission.component'

describe('ViewSubmissionComponent', () => {
  let component: ViewSubmissionComponent
  let fixture: ComponentFixture<ViewSubmissionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSubmissionComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: ResourceCollectionService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ViewSubmissionComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSubmissionComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
