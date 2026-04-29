import { AssessmentQuestionContainerComponent } from './assessment-question-container.component'

describe('AssessmentQuestionContainerComponent', () => {
  let component: AssessmentQuestionContainerComponent

  beforeEach(() => {
    component = new AssessmentQuestionContainerComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
