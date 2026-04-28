import { BehaviorSubject } from 'rxjs'
import { HeaderComponent } from './header.component'

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
})
