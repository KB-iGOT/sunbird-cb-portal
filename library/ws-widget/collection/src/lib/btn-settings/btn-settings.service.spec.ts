import { BtnSettingsService } from './btn-settings.service'

describe('BtnSettingsService (no TestBed)', () => {
  let service: BtnSettingsService
  let mockConfigurationsSvc: any
  let mockUserPrefSvc: any

  beforeEach(() => {
    // reset document element classes and meta tag
    document.documentElement.className = ''
    const existingMeta = document.getElementById('id-app-theme-color') as HTMLMetaElement | null
    if (existingMeta) {
      existingMeta.remove()
    }
    const meta = document.createElement('meta')
    meta.id = 'id-app-theme-color'
    meta.content = ''
    document.head.appendChild(meta)

    mockConfigurationsSvc = {
      instanceConfig: {
        themes: [
          { themeClass: 'theme-light', themeFile: '/assets/themes/light', color: { primary: '#ffffff' } },
          { themeClass: 'theme-dark', themeFile: '/assets/themes/dark', color: { primary: '#000000' } },
        ],
        defaultThemeClass: 'theme-light',
        fontSizes: [
          { fontClass: 'font-s', scale: 0.8 },
          { fontClass: 'font-m', scale: 1 },
          { fontClass: 'font-l', scale: 1.2 },
        ],
        defaultFontsize: 'font-m',
        locals: [
          { locals: ['en'], isRTL: false },
          { locals: ['ar'], isRTL: true },
        ],
      },
      prefChangeNotifier: { next: jest.fn() },
      userPreference: {
        selectedTheme: 'theme-light',
        selectedFont: 'font-m',
        selectedLocale: 'en',
        isDarkMode: false,
        completedTour: false,
      },
      isDarkMode: false,
      isIntranetAllowed: true,
      isRTL: false,
      activeThemeObject: null,
      activeFontObject: null,
      activeLocale: null,
      completedTour: false,
    }

    mockUserPrefSvc = {
      saveUserPreference: jest.fn().mockResolvedValue(true),
    }

    jest.clearAllMocks()

    service = new BtnSettingsService('en', mockConfigurationsSvc, mockUserPrefSvc)
  })

  it('should create the service instance', () => {
    expect(service).toBeTruthy()
  })

  it('initializePrefChanges should set fallbacks, theme, font, mode and locale', () => {
    mockConfigurationsSvc.userPreference.isDarkMode = true
    mockConfigurationsSvc.userPreference.completedTour = true

    service.initializePrefChanges(true)

    expect(service.useLinkForThemeInjection).toBe(true)
    expect(mockConfigurationsSvc.activeThemeObject).toBeTruthy()
    expect(mockConfigurationsSvc.activeFontObject).toBeTruthy()
    expect(mockConfigurationsSvc.isDarkMode).toBe(true)
    expect(mockConfigurationsSvc.completedTour).toBe(true)
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    expect(document.documentElement.getAttribute('lang')).toBe('en')
    // initializePrefChanges runs with notifyOnChange=false, so no prefChangeNotifier calls are expected here
    expect(mockConfigurationsSvc.prefChangeNotifier.next).not.toHaveBeenCalled()
  })

  it('changeFont should apply the given font class', () => {
    service.changeFont('font-l')

    expect(document.documentElement.classList.contains('font-l')).toBe(true)
    expect(mockConfigurationsSvc.activeFontObject.fontClass).toBe('font-l')
    expect(mockConfigurationsSvc.prefChangeNotifier.next).toHaveBeenCalledWith({ selectedFont: 'font-l' })
  })

  it('changeTheme should apply the given theme class', () => {
    service.changeTheme('theme-dark')

    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
    expect(mockConfigurationsSvc.activeThemeObject.themeClass).toBe('theme-dark')
    expect(mockConfigurationsSvc.prefChangeNotifier.next).toHaveBeenCalledWith({ selectedTheme: 'theme-dark' })
  })

  it('applyThemeMode should toggle dark and light modes and emit preference change', () => {
    service.applyThemeMode(true)
    expect(document.documentElement.classList.contains('night-mode')).toBe(true)
    expect(document.documentElement.classList.contains('day-mode')).toBe(false)
    expect(mockConfigurationsSvc.isDarkMode).toBe(true)
    expect(mockConfigurationsSvc.prefChangeNotifier.next).toHaveBeenCalledWith({ isDarkMode: true })

    mockConfigurationsSvc.prefChangeNotifier.next.mockClear()
    service.applyThemeMode(false)
    expect(document.documentElement.classList.contains('day-mode')).toBe(true)
    expect(document.documentElement.classList.contains('night-mode')).toBe(false)
    expect(mockConfigurationsSvc.isDarkMode).toBe(false)
    expect(mockConfigurationsSvc.prefChangeNotifier.next).toHaveBeenCalledWith({ isDarkMode: false })
  })

  it('intranetContentMode should update isIntranetAllowed and emit preference change', () => {
    service.intranetContentMode(false)
    expect(mockConfigurationsSvc.isIntranetAllowed).toBe(false)
    expect(mockConfigurationsSvc.prefChangeNotifier.next)
      .toHaveBeenCalledWith({ isIntranetAllowed: false })
  })

  it('updateAppColor should update theme color meta tag', () => {
    const theme: any = { themeClass: 'theme-light', themeFile: '/t', color: { primary: '#123456' } }
    service.updateAppColor(theme)

    const meta = document.getElementById('id-app-theme-color') as HTMLMetaElement
    expect(meta.content).toBe('#123456')
  })

  it('updateUserLocale should update user preference and call saveUserPreference', async () => {
    const result = await service.updateUserLocale('ar')
    expect(result).toBe(true)
    expect(mockConfigurationsSvc.userPreference.selectedLocale).toBe('ar')
    expect(mockUserPrefSvc.saveUserPreference).toHaveBeenCalledWith({ selectedLocale: 'ar' })
  })

  it('toggleRTL should set RTL explicitly and via toggle', () => {
    service.toggleRTL(true)
    expect(mockConfigurationsSvc.isRTL).toBe(true)
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    expect(mockConfigurationsSvc.prefChangeNotifier.next).toHaveBeenCalledWith({ isRTL: true })

    mockConfigurationsSvc.prefChangeNotifier.next.mockClear()
    service.toggleRTL()
    expect(mockConfigurationsSvc.isRTL).toBe(false)
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    expect(mockConfigurationsSvc.prefChangeNotifier.next).toHaveBeenCalledWith({ isRTL: false })
  })
})
