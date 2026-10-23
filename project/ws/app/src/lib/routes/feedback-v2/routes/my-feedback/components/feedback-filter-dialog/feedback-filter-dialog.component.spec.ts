import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { FeedbackFilterDialogComponent } from './feedback-filter-dialog.component'

describe('FeedbackFilterDialogComponent', () => {
  let component: FeedbackFilterDialogComponent
  let fixture: ComponentFixture<FeedbackFilterDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackFilterDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FeedbackFilterDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackFilterDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
