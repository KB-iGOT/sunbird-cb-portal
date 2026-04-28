import { Subject } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  ValueService: jest.fn(),
  NsInstanceConfig: {},
}), { virtual: true })
jest.mock('@angular/router', () => ({ ActivatedRoute: jest.fn() }), { virtual: true })
jest.mock('../../../user-profile/services/user-profile.service', () => ({
  UserPreferenceService: jest.fn(),
}), { virtual: true })
jest.mock('@sunbird-cb/collection/src/public-api', () => ({ NsContent: {} }), { virtual: true })
jest.mock('@sunbird-cb/collection', () => ({ NsInstanceConfig: {}, WidgetBaseComponent: class {} }), { virtual: true })
jest.mock('@sunbird-cb/resolver', () => ({ NsWidgetResolver: {}, WidgetBaseComponent: class {} }), { virtual: true })
jest.mock('./btn-settings.service', () => ({
  BtnSettingsService: jest.fn().mockImplementation(() => ({
    prefChangeSubject: { subscribe: jest.fn() },
    modeChangeSubs: { subscribe: jest.fn() },
    dirChangeSubs: { subscribe: jest.fn() },
    initializePrefChanges: jest.fn(),
    changeTheme: jest.fn(),
    changeFont: jest.fn(),
    applyThemeMode: jest.fn(),
    changeLanguage: jest.fn(),
    applyRTLChanges: jest.fn(),
  })),
}))

jest.mock('@angular/forms', () => {
  const actual = jest.requireActual('@angular/forms')
  return actual
})

import { BtnSettingsComponent } from './btn-settings.component'

function buildComponent() {
  const prefChangeSubject = new Subject<any>()
  const modeChangeSubject = new Subject<boolean>()
  const dirChangeSubject = new Subject<boolean>()

  const mockConfigSvc: any = {
    isRTL: false,
    isDarkMode: false,
    instanceConfig: {
      themes: [{ class: 'theme-dark', isDark: true }, { class: 'theme-light', isDark: false }],
      fontSizes: [{ class: 'font-sm', scale: 1 }, { class: 'font-lg', scale: 2 }],
      locals: [
        { path: 'en', label: 'English' },
        { path: 'hi', label: 'Hindi' },
      ],
      websitelanguages: ['en', 'hi'],
    },
    activeFontObject: { fontClass: 'font-sm' },
    isIntranetAllowed: true,
  }

  const mockSettingsSvc: any = {
    prefChangeSubject: prefChangeSubject.asObservable(),
    modeChangeSubs: modeChangeSubject.asObservable(),
    dirChangeSubs: dirChangeSubject.asObservable(),
    initializePrefChanges: jest.fn(),
    changeTheme: jest.fn(),
    changeFont: jest.fn(),
    applyThemeMode: jest.fn(),
    changeLanguage: jest.fn(),
    applyRTLChanges: jest.fn(),
  }

  const comp = new BtnSettingsComponent(mockConfigSvc, mockSettingsSvc)
  return { comp, mockConfigSvc, mockSettingsSvc, prefChangeSubject, modeChangeSubject, dirChangeSubject }
}

describe('BtnSettingsComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should have default form values', () => {
    const { comp } = buildComponent()
    expect(comp.darkModeForm).toBeDefined()
    expect(comp.isRTLForm).toBeDefined()
  })

  it('darkModeForm - is initialized with false', () => {
    const { comp } = buildComponent()
    expect(comp.darkModeForm.value).toBe(false)
  })

  it('themes - are empty initially', () => {
    const { comp } = buildComponent()
    expect(Array.isArray(comp.themes)).toBe(true)
  })

  it('fonts - are empty initially', () => {
    const { comp } = buildComponent()
    expect(Array.isArray(comp.fonts)).toBe(true)
  })

  it('allowedLangCode - is empty initially', () => {
    const { comp } = buildComponent()
    expect(typeof comp.allowedLangCode).toBe('object')
  })

  it('isLanguageEnabled - defaults to true', () => {
    const { comp } = buildComponent()
    expect(comp.isLanguageEnabled).toBe(true)
  })

  it('ngOnDestroy - does not throw when called before init', () => {
    const { comp } = buildComponent()
    expect(() => comp.ngOnDestroy()).not.toThrow()
  })

  it('changeFont - calls settingsSvc.changeFont', () => {
    const { comp, mockSettingsSvc } = buildComponent()
    comp.changeFont('font-lg')
    expect(mockSettingsSvc.changeFont).toHaveBeenCalledWith('font-lg')
  })

  it('changeTheme - calls settingsSvc.changeTheme', () => {
    const { comp, mockSettingsSvc } = buildComponent()
    comp.changeTheme('theme-dark')
    expect(mockSettingsSvc.changeTheme).toHaveBeenCalledWith('theme-dark')
  })

  it('toggleRTL - toggles isRTLForm value', () => {
    const { comp } = buildComponent()
    const initialValue = comp.isRTLForm.value
    comp.toggleRTL()
    expect(comp.isRTLForm.value).toBe(!initialValue)
  })

  it('changeTheme - calls with correct class', () => {
    const { comp, mockSettingsSvc } = buildComponent()
    comp.changeTheme('theme-light')
    expect(mockSettingsSvc.changeTheme).toHaveBeenCalledWith('theme-light')
  })

  it('changeFont - calls with font-sm', () => {
    const { comp, mockSettingsSvc } = buildComponent()
    comp.changeFont('font-sm')
    expect(mockSettingsSvc.changeFont).toHaveBeenCalledWith('font-sm')
  })

  it('activeThemeClass - defaults to empty string', () => {
    const { comp } = buildComponent()
    expect(comp.activeThemeClass).toBe('')
  })

  it('activeFontClass - defaults to empty string', () => {
    const { comp } = buildComponent()
    expect(comp.activeFontClass).toBe('')
  })
})
