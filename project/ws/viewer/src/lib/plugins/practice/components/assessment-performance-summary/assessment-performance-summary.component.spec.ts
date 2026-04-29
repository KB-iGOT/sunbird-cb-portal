import { AssessmentPerformanceSummaryComponent } from './assessment-performance-summary.component'

describe('AssessmentPerformanceSummaryComponent', () => {
  let component: AssessmentPerformanceSummaryComponent

  beforeEach(() => {
    component = new AssessmentPerformanceSummaryComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
