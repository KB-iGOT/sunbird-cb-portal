import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { FinalAssessmentPopupComponent } from './final-assessment-popup.component'

describe('FinalAssessmentPopupComponent', () => {
  let component: FinalAssessmentPopupComponent
  let fixture: ComponentFixture<FinalAssessmentPopupComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FinalAssessmentPopupComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FinalAssessmentPopupComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalAssessmentPopupComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
