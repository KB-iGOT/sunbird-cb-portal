import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { AssessmentPerformanceSummaryComponent } from './assessment-performance-summary.component'

describe('AssessmentPerformanceSummaryComponent', () => {
  let component: AssessmentPerformanceSummaryComponent
  let fixture: ComponentFixture<AssessmentPerformanceSummaryComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AssessmentPerformanceSummaryComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AssessmentPerformanceSummaryComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentPerformanceSummaryComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
