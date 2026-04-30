import { AssessmentQuestionCountContainerComponent } from './assessment-question-count-container.component'

describe('AssessmentQuestionCountContainerComponent', () => {
  let component: AssessmentQuestionCountContainerComponent

  beforeEach(() => {
    component = new AssessmentQuestionCountContainerComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
