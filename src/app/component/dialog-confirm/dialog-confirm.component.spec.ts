import { DialogConfirmComponent } from './dialog-confirm.component'

const dialogRefMock = {
  close: jest.fn(),
}

const translateMock = {
  setDefaultLang: jest.fn(),
  use: jest.fn(),
}

const matDialogDataMock = {
  title: 'Test Title',
  body: 'Test Body',
}

describe('DialogConfirmComponent', () => {
  let component: DialogConfirmComponent

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    component = new DialogConfirmComponent(
      matDialogDataMock as any,
      dialogRefMock as any,
      translateMock as any,
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
    expect(component.data.title).toBe('Test Title')
    expect(component.data.body).toBe('Test Body')
  })

  it('should not set language when websiteLanguage is not in localStorage', () => {
    ; (expect as any)(translateMock.setDefaultLang).not.toHaveBeenCalled()
      ; (expect as any)(translateMock.use).not.toHaveBeenCalled()
  })

  it('should set default language and use websiteLanguage from localStorage when available', () => {
    localStorage.setItem('websiteLanguage', 'hi')

    const compWithLang = new DialogConfirmComponent(
      matDialogDataMock as any,
      dialogRefMock as any,
      translateMock as any,
    )

    expect(compWithLang).toBeTruthy()
      ; (expect as any)(translateMock.setDefaultLang).toHaveBeenCalledWith('en')
      ; (expect as any)(translateMock.use).toHaveBeenCalledWith('hi')
  })

  it('should call dialogRef.close with true when confirmed is called without argument', () => {
    component.confirmed(undefined)
      ; (expect as any)(dialogRefMock.close).toHaveBeenCalledWith(true)
  })

  it('should call dialogRef.close with false when confirmed is called with "no"', () => {
    component.confirmed('no')
      ; (expect as any)(dialogRefMock.close).toHaveBeenCalledWith(false)
  })

  it('should call dialogRef.close with false when confirmed is called with "cancel"', () => {
    component.confirmed('cancel')
      ; (expect as any)(dialogRefMock.close).toHaveBeenCalledWith(false)
  })
})

