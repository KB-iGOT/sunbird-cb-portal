import { BehaviorSubject } from 'rxjs'
import { HeaderComponent } from './header.component'
import { Subject } from 'rxjs'

describe('HeaderComponent', () => {
  let component: HeaderComponent
  let showNavbar$: BehaviorSubject<boolean>
  let mobileAppsService: any
  let router: any
  let openSpy: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    showNavbar$ = new BehaviorSubject(true)
    mobileAppsService = { mobileTopHeaderVisibilityStatus: { next: jest.fn() } }
    router = { navigateByUrl: jest.fn() }
    openSpy = jest.spyOn(window, 'open').mockImplementation()
    component = new HeaderComponent(
      { isXSmall$: new BehaviorSubject(false) } as any,
      { showNavbarDisplay$: showNavbar$ } as any,
      mobileAppsService,
      {} as any,
      router,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    openSpy.mockRestore()
  })

  it('initializes navbar subscription and widget data', () => {
    component.ngOnInit()
    showNavbar$.next(false)
    jest.advanceTimersByTime(500)

    expect(component.isShowNavbar).toBe(false)
    expect(component.navBarRequired).toBe(true)
    expect((component.widgetData as any).widgets[0][0].widget.widgetSubType).toBe('cardHomeHubs')
  })

  it('opens app stores based on user agent', () => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('android')
    component.downloadApp()
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('play.google.com'), '_blank')

    openSpy.mockClear()
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone')
    component.downloadApp()
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('apps.apple.com'), '_blank')
  })

  it('hides mobile top header and navigates support form', () => {
    component.hideMobileTopHeader()
    expect(component.mobileTopHeaderVisibilityStatus).toBe(false)
    expect(mobileAppsService.mobileTopHeaderVisibilityStatus.next).toHaveBeenCalledWith(false)

    component.openSupportForm()
    expect(router.navigateByUrl).toHaveBeenCalledWith('igot/help-centre')
  })

  it('should default showNavbar to true', () => {
    expect(component.showNavbar).toBe(true)
  })

  it('should default mobileTopHeaderVisibilityStatus to true', () => {
    expect(component.mobileTopHeaderVisibilityStatus).toBe(true)
  })

  describe('ngOnInit', () => {
    it('should subscribe to showNavbarDisplay$ and update showNavbar', done => {
      component.ngOnInit()
      // The pipe(delay(500)) means we need to wait — but we use fake timers
      jest.useFakeTimers()
      showNavbar$.next(false)
      jest.advanceTimersByTime(600)
      // After timeout component should have showNavbar=false
      expect(component.showNavbar).toBe(false)
      jest.useRealTimers()
      done()
    })

    it('should set widgetData with widgets structure', () => {
      component.ngOnInit()
      expect(component.widgetData).toHaveProperty('widgets')
    })
  })

  describe('navBarRequired getter', () => {
    it('should return isNavBarRequired value', () => {
      component['isNavBarRequired'] = true
      expect(component.navBarRequired).toBe(true)
    })
  })

  describe('isShowNavbar getter', () => {
    it('should return showNavbar value', () => {
      component.showNavbar = false
      expect(component.isShowNavbar).toBe(false)
    })
  })

  describe('hideMobileTopHeader', () => {
    it('should set mobileTopHeaderVisibilityStatus to false and notify service', () => {
      component.hideMobileTopHeader()
      expect(component.mobileTopHeaderVisibilityStatus).toBe(false)
      expect(mockMobileAppsService.mobileTopHeaderVisibilityStatus.next).toHaveBeenCalledWith(false)
    })
  })

  describe('openSupportForm', () => {
    it('should navigate to help-centre url', () => {
      component.openSupportForm()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('igot/help-centre')
    })
  })

  describe('downloadApp', () => {
    const originalNavigator = global.navigator

    afterEach(() => {
      Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true })
    })

    it('should open play store for Android', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10)',
        configurable: true,
      })
      component.downloadApp()
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('play.google.com'),
        '_blank',
      )
    })

    it('should open App Store for iPhone', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        configurable: true,
      })
      component.downloadApp()
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('apps.apple.com'),
        '_blank',
      )
    })

    it('should not open any store for desktop', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      })
      component.downloadApp()
      expect(window.open).not.toHaveBeenCalled()
    })

    it('should open play store for Windows Phone', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0)',
        configurable: true,
      })
      component.downloadApp()
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('play.google.com'),
        '_blank',
        'noopener',
      )
    })

    it('should set opener to null when window.open returns a non-null window object', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0)',
        configurable: true,
      })
      const mockNewWindow: any = { opener: 'something' }
      jest.spyOn(window, 'open').mockImplementation(() => mockNewWindow)
      component.downloadApp()
      expect(mockNewWindow.opener).toBeNull()
    })
  })
})
