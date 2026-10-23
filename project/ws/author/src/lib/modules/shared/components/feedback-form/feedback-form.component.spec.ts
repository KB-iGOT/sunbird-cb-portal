import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { FeedbackService, UserAutocompleteService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { FeedbackFormComponent } from './feedback-form.component'

describe('FeedbackFormComponent', () => {
  let component: FeedbackFormComponent
  let fixture: ComponentFixture<FeedbackFormComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: FeedbackService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: UserAutocompleteService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FeedbackFormComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackFormComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
