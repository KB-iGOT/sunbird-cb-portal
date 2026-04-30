import { AssessmentHeaderComponent } from './assessment-header.component'

describe('AssessmentHeaderComponent', () => {
  let component: AssessmentHeaderComponent

  beforeEach(() => {
    component = new AssessmentHeaderComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
