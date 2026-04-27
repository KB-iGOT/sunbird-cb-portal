import { PublicHomeComponent } from './public-home.component'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { ActivatedRoute } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser'
import { WidgetResolverService } from '@sunbird-cb/resolver/src/public-api'
import { TranslateService } from '@ngx-translate/core'
import { of } from 'rxjs'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn().mockImplementation((obj, path) => {
    if (!obj) return undefined
    const pathArray = path.split('.')
    let result = obj
    for (const p of pathArray) {
      if (result === undefined || result === null) return undefined
      result = result[p]
    }
    return result
  })
}))

describe('PublicHomeComponent', () => {
  let component: PublicHomeComponent
  let configServiceMock: Partial<ConfigurationsService>
  let activatedRouteMock: Partial<ActivatedRoute>
  let domSanitizerMock: Partial<DomSanitizer>
  let widgetResolverServiceMock: Partial<WidgetResolverService>
  let translateServiceMock: Partial<TranslateService>

  const mockPageNavBar = {}
  const mockInstanceConfig: any = {
    logos: {
      app: 'app-logo-url',
      appSecondary: 'app-secondary-logo-url'
    },
    mailIds: {
      contactUs: 'contact@example.com'
    }
  }

  const mockRouteData = {
    pageData: {
      data: {
        featuredCourses: [{ id: 1, name: 'Course 1' }],
        learnNetwork: [{ id: 1, name: 'Network 1' }]
      }
    }
  }

  beforeEach(() => {
    // Setup mocks
    configServiceMock = {
      pageNavBar: mockPageNavBar,
      instanceConfig: mockInstanceConfig
    }

    activatedRouteMock = {
      data: of(mockRouteData),
      snapshot: {
        data: {
          pageData: {
            data: {
              featuredCourses: [{ id: 1, name: 'Course 1' }],
              learnNetwork: [{ id: 1, name: 'Network 1' }]
            }
          }
        }
      } as any
      //   snapshot: {
      //     data: {
      //       pageData: {
      //         data: {
      //           featuredCourses: [{ id: 1, name: 'Course 1' }],
      //           learnNetwork: [{ id: 1, name: 'Network 1' }]
      //         }
      //       }
      //     }
      //   }
    }

    domSanitizerMock = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url) => `sanitized-${url}`)
    }

    widgetResolverServiceMock = {
      isInitialized: true
    }

    translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn().mockImplementation((key) => `translated-${key}`)
    }

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value
        }),
        clear: jest.fn(() => {
          store = {}
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key]
        })
      }
    })()

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    // Create component instance
    component = new PublicHomeComponent(
      configServiceMock as ConfigurationsService,
      activatedRouteMock as ActivatedRoute,
      domSanitizerMock as DomSanitizer,
      widgetResolverServiceMock as WidgetResolverService,
      translateServiceMock as TranslateService
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create an instance', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with correct default values', () => {
    expect(component.contactUsMail).toBe('')
    expect(component.platform).toBe('Learner')
    expect(component.panelOpenState).toBe(false)
    expect(component.appIcon).toBeNull()
    expect(component.appIconSecondary).toBeNull()
    expect(component.pageNavbar).toBe(mockPageNavBar)
    expect(component.learnNetworkSection).toEqual([{ id: 1, name: 'Network 1' }])
    expect(component.loading).toBe(false)
  })

  it('should load data from activated route', () => {
    component.loadData()

    expect(component.data).toEqual([{ id: 1, name: 'Course 1' }])
    expect(component.learnNetworkSection).toEqual([{ id: 1, name: 'Network 1' }])
    expect(component.loading).toBe(false)
  })

  it('should handle missing data in loadData method', () => {
    // Save original snapshot
    const originalSnapshot = activatedRouteMock.snapshot

    // Test with undefined snapshot
    Object.defineProperty(activatedRouteMock, 'snapshot', {
      get: jest.fn().mockReturnValue(undefined),
      configurable: true
    })

    // This should not throw an error
    expect(() => {
      component.loadData()
    }).not.toThrow()

    // Since _.get returns undefined for missing paths, these should be undefined
    expect(component.data).toBeUndefined()
    expect(component.learnNetworkSection).toBeUndefined()
    expect(component.loading).toBe(false)

    // Reset for other tests
    Object.defineProperty(activatedRouteMock, 'snapshot', {
      value: originalSnapshot,
      configurable: true
    })
  })

  it('should return isWsInit from widget resolver service', () => {
    expect(component.isWsInit).toBe(true)

    // Test the negative case
    widgetResolverServiceMock.isInitialized = false
    expect(component.isWsInit).toBe(false)
  })

  it('should set language from localStorage during initialization', () => {
    // Mock localStorage having a language setting
    jest.spyOn(localStorage, 'getItem').mockReturnValue('fr')

    // Create new component so constructor runs with mocked localStorage
    const newComponent = new PublicHomeComponent(
      configServiceMock as ConfigurationsService,
      activatedRouteMock as ActivatedRoute,
      domSanitizerMock as DomSanitizer,
      widgetResolverServiceMock as WidgetResolverService,
      translateServiceMock as TranslateService
    )
    void newComponent

    expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translateServiceMock.use).toHaveBeenCalledWith('fr')
  })

  it('should not change language if websiteLanguage is not in localStorage', () => {
    // Mock localStorage not having a language setting
    jest.spyOn(localStorage, 'getItem').mockReturnValue(null)

    // Create new component so constructor runs with mocked localStorage
    const newComponent = new PublicHomeComponent(
      configServiceMock as ConfigurationsService,
      activatedRouteMock as ActivatedRoute,
      domSanitizerMock as DomSanitizer,
      widgetResolverServiceMock as WidgetResolverService,
      translateServiceMock as TranslateService
    )
    void newComponent

    expect(translateServiceMock.setDefaultLang).not.toHaveBeenCalled()
    expect(translateServiceMock.use).not.toHaveBeenCalled()
  })

  it('should initialize app icons in ngOnInit', () => {
    component.ngOnInit()

    expect(domSanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-logo-url')
    expect(domSanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-secondary-logo-url')
    expect(component.appIcon).toBe('sanitized-app-logo-url')
    expect(component.appIconSecondary).toBe('sanitized-app-secondary-logo-url')
  })

  it('should set contactPage from route data in ngOnInit', () => {
    component.ngOnInit()

    expect(component.contactPage).toEqual(mockRouteData.pageData.data)
  })

  it('should set contactUsMail from instanceConfig in ngOnInit', () => {
    component.ngOnInit()

    expect(component.contactUsMail).toBe('contact@example.com')
  })

  it('should translate hub name', () => {
    const hubName = 'testHub'
    const translated = component.translateHub(hubName)

    expect(translateServiceMock.instant).toHaveBeenCalledWith(hubName)
    expect(translated).toBe('translated-testHub')
  })

  it('should unsubscribe from subscriptionContact in ngOnDestroy', () => {
    // Setup spy
    const unsubscribeSpy = jest.fn()
    component['subscriptionContact'] = { unsubscribe: unsubscribeSpy } as any

    // Call method
    component.ngOnDestroy()

    // Verify unsubscribe was called
    expect(unsubscribeSpy).toHaveBeenCalled()
  })

  it('should not call unsubscribe if subscriptionContact is null', () => {
    // Setup condition
    component['subscriptionContact'] = null

    // Call method (should not throw)
    expect(() => {
      component.ngOnDestroy()
    }).not.toThrow()
  })

  it('should redirect to protected resource on login', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://example.com', href: '' },
      configurable: true
    })

    // Call method
    component.login()

    // Verify redirect
    expect(window.location.href).toBe('http://example.com/protected/v8/resource')
  })

  it('should handle null instanceConfig in ngOnInit', () => {
    // Override instanceConfig to null
    (configServiceMock as any).instanceConfig = undefined

    component.ngOnInit()

    // appIcon and appIconSecondary remain null since instanceConfig is undefined
    expect(component.appIcon).toBeNull()
    expect(component.appIconSecondary).toBeNull()
    // contactUsMail remains ''
    expect(component.contactUsMail).toBe('')
  })
})
