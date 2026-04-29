import { SubmitQuizDialogComponent } from './submit-quiz-dialog.component'

jest.mock('@angular/material/legacy-dialog', () => ({
  MatLegacyDialogRef: class { },
  MAT_LEGACY_DIALOG_DATA: 'MAT_LEGACY_DIALOG_DATA',
}), { virtual: true })

describe('SubmitQuizDialogComponent', () => {
  let component: SubmitQuizDialogComponent
  let mockDialogRef: any
  const mockData = { title: 'Quiz', questions: 10 }

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    component = new SubmitQuizDialogComponent(mockDialogRef, mockData)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should inject dialog data', () => {
    expect(component.data).toEqual(mockData)
  })

  it('should have dialogRef defined', () => {
    expect(component.dialogRef).toBeDefined()
  })

  it('ngOnInit runs without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('data is accessible after construction', () => {
    expect(component.data.title).toBe('Quiz')
    expect(component.data.questions).toBe(10)
  })

  it('dialogRef.close can be called', () => {
    component.dialogRef.close()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })
})
