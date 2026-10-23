import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { AssessmentQuestionCountContainerComponent } from './assessment-question-count-container.component'

describe('AssessmentQuestionCountContainerComponent', () => {
  let component: AssessmentQuestionCountContainerComponent
  let fixture: ComponentFixture<AssessmentQuestionCountContainerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AssessmentQuestionCountContainerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AssessmentQuestionCountContainerComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentQuestionCountContainerComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
