import { SubmissionDialogComponent } from './submission-dialog.component'

describe('SubmissionDialogComponent', () => {
  let component: SubmissionDialogComponent

  beforeEach(() => {
    component = new SubmissionDialogComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
