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
jest.mock('@sunbird-cb/collection', () => ({ NsInstanceConfig: {}, WidgetBaseComponent: class { } }), { virtual: true })
jest.mock('@sunbird-cb/resolver', () => ({ NsWidgetResolver: {}, WidgetBaseComponent: class { } }), { virtual: true })
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

  describe('ngOnInit', () => {
    it('should set themes, fonts, and allowedLangCode from instanceConfig', () => {
      const { comp, mockConfigSvc } = buildComponent()
      const prefChangeSubject = new Subject<any>()
      mockConfigSvc.prefChangeNotifier = prefChangeSubject.asObservable()
      mockConfigSvc.isDarkMode = false
      mockConfigSvc.isRTL = false
      comp.ngOnInit()
      expect(comp.themes.length).toBe(2)
      expect(comp.fonts.length).toBe(2)
      expect(comp.allowedLangCode['en']).toBeDefined()
      expect(comp.allowedLangCode['hi']).toBeDefined()
    })

    it('should set isLanguageEnabled to false when only one locale', () => {
      const { comp, mockConfigSvc } = buildComponent()
      mockConfigSvc.instanceConfig.locals = [{ path: 'en', label: 'English' }]
      const prefChangeSubject = new Subject<any>()
      mockConfigSvc.prefChangeNotifier = prefChangeSubject.asObservable()
      mockConfigSvc.isDarkMode = false
      comp.ngOnInit()
      expect(comp.isLanguageEnabled).toBe(false)
    })

    it('should set activeThemeClass from configSvc.activeThemeObject', () => {
      const { comp, mockConfigSvc } = buildComponent()
      mockConfigSvc.activeThemeObject = { themeClass: 'theme-dark' }
      const prefChangeSubject = new Subject<any>()
      mockConfigSvc.prefChangeNotifier = prefChangeSubject.asObservable()
      mockConfigSvc.isDarkMode = false
      comp.ngOnInit()
      expect(comp.activeThemeClass).toBe('theme-dark')
    })

    it('should set activeFontClass from configSvc.activeFontObject', () => {
      const { comp, mockConfigSvc } = buildComponent()
      mockConfigSvc.activeFontObject = { fontClass: 'font-lg' }
      const prefChangeSubject = new Subject<any>()
      mockConfigSvc.prefChangeNotifier = prefChangeSubject.asObservable()
      mockConfigSvc.isDarkMode = false
      comp.ngOnInit()
      expect(comp.activeFontClass).toBe('font-lg')
    })

    it('should not throw when instanceConfig is null', () => {
      const { comp, mockConfigSvc } = buildComponent()
      mockConfigSvc.instanceConfig = null
      expect(() => comp.ngOnInit()).not.toThrow()
    })
  })

  describe('ngOnDestroy with subscriptions', () => {
    it('should unsubscribe all active subscriptions', () => {
      const { comp } = buildComponent()
      const mockSub = { unsubscribe: jest.fn() }
      comp.modeChangeSubs = mockSub as any
      comp.prefChangeSubs = mockSub as any
      comp.dirChangeSubs = mockSub as any
      comp.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalledTimes(3)
    })
  })

  describe('isLocaleEnabled', () => {
    it('should return true when locale is enabled', () => {
      const { comp } = buildComponent()
      comp.allowedLangCode = { en: { isEnabled: true, isAvailable: true, path: 'en', pinyin: {} } as any }
      expect(comp.isLocaleEnabled('en')).toBe(true)
    })

    it('should return false when locale is not in allowedLangCode', () => {
      const { comp } = buildComponent()
      comp.allowedLangCode = {}
      expect(comp.isLocaleEnabled('fr')).toBeFalsy()
    })
  })

  describe('isLocaleAvailable', () => {
    it('should return true when locale is available', () => {
      const { comp } = buildComponent()
      comp.allowedLangCode = { en: { isEnabled: true, isAvailable: true, path: 'en', pinyin: {} } as any }
      expect(comp.isLocaleAvailable('en')).toBe(true)
    })

    it('should return false when locale is not available', () => {
      const { comp } = buildComponent()
      comp.allowedLangCode = { en: { isEnabled: true, isAvailable: false, path: 'en', pinyin: {} } as any }
      expect(comp.isLocaleAvailable('en')).toBe(false)
    })
  })

  describe('localeIcon', () => {
    it('should return radio_button_checked for active locale', () => {
      const { comp, mockConfigSvc } = buildComponent()
      mockConfigSvc.activeLocale = { path: 'en' }
      comp.allowedLangCode = { en: { isEnabled: true, isAvailable: true, path: 'en', pinyin: {} } as any }
      expect(comp.localeIcon('en')).toBe('radio_button_checked')
    })

    it('should return radio_button_unchecked for non-active locale', () => {
      const { comp, mockConfigSvc } = buildComponent()
      mockConfigSvc.activeLocale = { path: 'hi' }
      comp.allowedLangCode = { en: { isEnabled: true, isAvailable: true, path: 'en', pinyin: {} } as any }
      expect(comp.localeIcon('en')).toBe('radio_button_unchecked')
    })

    it('should return not_interested when locale is not enabled', () => {
      const { comp, mockConfigSvc } = buildComponent()
      mockConfigSvc.activeLocale = { path: 'en' }
      comp.allowedLangCode = {}
      expect(comp.localeIcon('fr')).toBe('not_interested')
    })
  })

  describe('updateUserLang', () => {
    it('should call settingsSvc.updateUserLocale and redirect when valid locale', async () => {
      const { comp, mockSettingsSvc } = buildComponent()
      mockSettingsSvc.updateUserLocale = jest.fn().mockResolvedValue(undefined)
      comp.allowedLangCode = {
        en: { isEnabled: true, isAvailable: true, path: 'en', pinyin: {} } as any,
      }
      const originalHref = Object.getOwnPropertyDescriptor(window, 'location')
      Object.defineProperty(window, 'location', { value: { href: '' }, writable: true })
      await comp.updateUserLang('en')
      expect(mockSettingsSvc.updateUserLocale).toHaveBeenCalledWith('en')
      if (originalHref) {
        Object.defineProperty(window, 'location', originalHref)
      }
    })

    it('should not redirect when locale has no valid path', async () => {
      const { comp, mockSettingsSvc } = buildComponent()
      mockSettingsSvc.updateUserLocale = jest.fn()
      comp.allowedLangCode = {
        en: { isEnabled: false, isAvailable: false, path: 'en', pinyin: {} } as any,
      }
      await comp.updateUserLang('en')
      expect(mockSettingsSvc.updateUserLocale).not.toHaveBeenCalled()
    })
  })
})
