import { AssessmentFooterComponent } from './assessment-footer.component'

describe('AssessmentFooterComponent', () => {
  let component: AssessmentFooterComponent

  beforeEach(() => {
    component = new AssessmentFooterComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
