import { AssessmentPerformanceInsightSummaryComponent } from './assessment-performance-insight-summary.component'

describe('AssessmentPerformanceInsightSummaryComponent', () => {
  let component: AssessmentPerformanceInsightSummaryComponent

  beforeEach(() => {
    component = new AssessmentPerformanceInsightSummaryComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
