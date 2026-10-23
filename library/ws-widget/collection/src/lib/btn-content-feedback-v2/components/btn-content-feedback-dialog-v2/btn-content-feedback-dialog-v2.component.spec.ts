import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { FeedbackService } from '../../services/feedback.service'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { BtnContentFeedbackDialogV2Component } from './btn-content-feedback-dialog-v2.component'

describe('BtnContentFeedbackDialogV2Component', () => {
  let component: BtnContentFeedbackDialogV2Component
  let fixture: ComponentFixture<BtnContentFeedbackDialogV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentFeedbackDialogV2Component],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: FeedbackService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnContentFeedbackDialogV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentFeedbackDialogV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
