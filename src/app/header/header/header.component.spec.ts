jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {},
}), { virtual: true })
jest.mock('@sunbird-cb/collection/src/public-api', () => ({}), { virtual: true })

import { HeaderComponent } from './header.component'
import { Subject } from 'rxjs'

describe('HeaderComponent', () => {
  let component: HeaderComponent

  const showNavbar$ = new Subject<boolean>()
  const mockHeaderService: any = {
    showNavbarDisplay$: showNavbar$.asObservable(),
  }

  const mockMobileAppsService: any = {
    mobileTopHeaderVisibilityStatus: { next: jest.fn() },
  }

  const mockDialog: any = {
    open: jest.fn(),
  }

  const mockRouter: any = {
    navigateByUrl: jest.fn(),
  }

  const isXSmall$ = new Subject<boolean>()
  const mockValueSvc: any = {
    isXSmall$: isXSmall$.asObservable(),
  }

  function buildComponent() {
    return new HeaderComponent(
      mockValueSvc,
      mockHeaderService,
      mockMobileAppsService,
      mockDialog,
      mockRouter,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(window, 'open').mockImplementation(() => null)
    component = buildComponent()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
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
      )
    })
  })
})
