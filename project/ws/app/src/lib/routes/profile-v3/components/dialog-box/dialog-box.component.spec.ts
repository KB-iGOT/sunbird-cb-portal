import { DialogBoxComponent } from './dialog-box.component'

jest.mock('@angular/material/legacy-dialog', () => ({
  MAT_LEGACY_DIALOG_DATA: 'MAT_LEGACY_DIALOG_DATA',
  MatLegacyDialogRef: class { },
}), { virtual: true })

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class {
    setDefaultLang = jest.fn()
    use = jest.fn()
  },
}), { virtual: true })

const makeComponent = (dialogData: any = {}, lang: string | null = null) => {
  if (lang) {
    localStorage.setItem('websiteLanguage', lang)
  } else {
    localStorage.removeItem('websiteLanguage')
  }
  const mockDialogRef = { close: jest.fn() }
  const mockTranslate = { setDefaultLang: jest.fn(), use: jest.fn() }
  const comp = new (DialogBoxComponent as any)(dialogData, mockDialogRef, mockTranslate)
  comp['dialogRef'] = mockDialogRef
  comp['translate'] = mockTranslate
  return { comp, mockDialogRef, mockTranslate }
}

describe('DialogBoxComponent', () => {
  afterEach(() => localStorage.clear())

  it('should create', () => {
    const { comp } = makeComponent({ title: 'Confirm?' })
    expect(comp).toBeTruthy()
  })

  it('sets translate.use with language from localStorage when websiteLanguage is set', () => {
    const { mockTranslate } = makeComponent({}, 'hi')
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
  })

  it('sets translate.setDefaultLang to en when websiteLanguage is set', () => {
    const { mockTranslate } = makeComponent({}, 'hi')
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
  })

  it('does not call translate when websiteLanguage is not set', () => {
    const { mockTranslate } = makeComponent({}, null)
    expect(mockTranslate.setDefaultLang).not.toHaveBeenCalled()
    expect(mockTranslate.use).not.toHaveBeenCalled()
  })

  it('dialogClose calls dialogRef.close()', () => {
    const { comp, mockDialogRef } = makeComponent({ title: 'Test' })
    comp.dialogClose()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })

  it('sets data from injected dialogData', () => {
    const { comp } = makeComponent({ title: 'Are you sure?', message: 'This will delete.' })
    expect(comp.data).toEqual({ title: 'Are you sure?', message: 'This will delete.' })
  })
})
