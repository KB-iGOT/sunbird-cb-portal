import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { FeedbackSnackbarComponent } from './feedback-snackbar.component'

describe('FeedbackSnackbarComponent', () => {
  let component: FeedbackSnackbarComponent
  let fixture: ComponentFixture<FeedbackSnackbarComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackSnackbarComponent],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FeedbackSnackbarComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackSnackbarComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
