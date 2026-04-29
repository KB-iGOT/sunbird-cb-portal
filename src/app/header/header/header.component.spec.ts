import { BehaviorSubject } from 'rxjs'
import { HeaderComponent } from './header.component'

describe('HeaderComponent (mocked, no TestBed)', () => {
  let component: HeaderComponent
  let mockValueSvc: any
  let mockHeaderService: any
  let mockMobileAppsService: any
  let mockDialog: any
  let mockRouter: any
  let showNavbar$: BehaviorSubject<boolean>
  let openSpy: jest.SpyInstance

  beforeEach(() => {
    showNavbar$ = new BehaviorSubject(true)
    mockValueSvc = { isXSmall$: new BehaviorSubject(false) }
    mockHeaderService = { showNavbarDisplay$: showNavbar$ }
    mockMobileAppsService = { mobileTopHeaderVisibilityStatus: { next: jest.fn() } }
    mockDialog = { open: jest.fn() }
    mockRouter = { navigateByUrl: jest.fn() }
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    component = new HeaderComponent(
      mockValueSvc,
      mockHeaderService,
      mockMobileAppsService,
      mockDialog,
      mockRouter,
    )
  })

  afterEach(() => {
    openSpy.mockRestore()
    jest.clearAllMocks()
  })

  it('should initialize with default values', () => {
    expect(component.isNavBarRequired).toBe(true)
    expect(component.showNavbar).toBe(true)
    expect(component.mobileTopHeaderVisibilityStatus).toBe(true)
    expect(component.widgetData).toEqual({})
  })

  it('should set widgetData and subscribe to showNavbarDisplay$', () => {
    jest.useFakeTimers()
    component.ngOnInit()
    showNavbar$.next(false)
    jest.advanceTimersByTime(600)
    expect(component.showNavbar).toBe(false)
    expect(component.widgetData).toHaveProperty('widgets')
    jest.useRealTimers()
  })

  it('navBarRequired getter returns isNavBarRequired', () => {
    component['isNavBarRequired'] = false
    expect(component.navBarRequired).toBe(false)
    component['isNavBarRequired'] = true
    expect(component.navBarRequired).toBe(true)
  })

  it('isShowNavbar getter returns showNavbar', () => {
    component.showNavbar = false
    expect(component.isShowNavbar).toBe(false)
    component.showNavbar = true
    expect(component.isShowNavbar).toBe(true)
  })

  it('hideMobileTopHeader sets flag and notifies service', () => {
    component.mobileTopHeaderVisibilityStatus = true
    component.hideMobileTopHeader()
    expect(component.mobileTopHeaderVisibilityStatus).toBe(false)
    expect(mockMobileAppsService.mobileTopHeaderVisibilityStatus.next).toHaveBeenCalledWith(false)
  })

  it('openSupportForm navigates to help-centre', () => {
    component.openSupportForm()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('igot/help-centre')
  })

  describe('downloadApp', () => {
    let originalUserAgent: string
    beforeAll(() => {
      originalUserAgent = navigator.userAgent
    })
    afterEach(() => {
      Object.defineProperty(window.navigator, 'userAgent', { value: originalUserAgent, configurable: true })
      openSpy.mockClear()
    })

    it('opens Play Store for Android', () => {
      Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (Linux; Android 10)', configurable: true })
      component.downloadApp()
      expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('play.google.com'), '_blank')
    })

    it('opens App Store for iOS', () => {
      Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)', configurable: true })
      component.downloadApp()
      expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('apps.apple.com'), '_blank')
    })

    it('opens Play Store for Windows Phone', () => {
      Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0)', configurable: true })
      component.downloadApp()
      expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('play.google.com'), '_blank', 'noopener')
    })

    it('does not open store for desktop', () => {
      Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', configurable: true })
      component.downloadApp()
      expect(openSpy).not.toHaveBeenCalled()
    })

    it('sets opener to null if window.open returns window', () => {
      Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0)', configurable: true })
      const fakeWindow: any = { opener: 'notnull' }
      openSpy.mockImplementation(() => fakeWindow)
      component.downloadApp()
      expect(fakeWindow.opener).toBeNull()
    })
  })

  it('should handle @Input properties', () => {
    component.mode = 'test-mode'
    component.headerFooterConfigData = { foo: 'bar' }
    component.showHubs = true
    expect(component.mode).toBe('test-mode')
    expect(component.headerFooterConfigData).toEqual({ foo: 'bar' })
    expect(component.showHubs).toBe(true)
  })
})
