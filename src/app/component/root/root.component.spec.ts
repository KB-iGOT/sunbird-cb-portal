// Mock all external modules that jest cannot resolve via moduleNameMapper
// These must use { virtual: true } since they have no jest moduleNameMapper entry
jest.mock('@sunbird-cb/collection', () => ({
  BtnPageBackService: jest.fn(),
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  TelemetryService: jest.fn(),
  ValueService: jest.fn(),
  UtilityService: jest.fn(),
  EventService: jest.fn(),
  WsEvents: {
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    EnumTelemetrySubType: { Loaded: 'Loaded' },
    WsAuditTypes: { Created: 'Created' },
    IWsEventTelemetryInteract: {},
  },
  NsInstanceConfig: {},
}), { virtual: true })

jest.mock('@project-sunbird/client-services', () => ({
  CsModule: {
    instance: {
      init: jest.fn(),
    },
  },
}))

jest.mock('@angular/service-worker', () => ({
  SwUpdate: jest.fn().mockImplementation(() => ({
    isEnabled: false,
    available: { subscribe: jest.fn() },
    checkForUpdate: jest.fn(),
    activateUpdate: jest.fn(),
  })),
}))

jest.mock('../../../environments/environment', () => ({
  environment: {
    production: false,
  },
}))

jest.mock('../dialog-confirm/dialog-confirm.component', () => ({
  DialogConfirmComponent: jest.fn(),
}))

// Mock transitive deps that component file's imported services may pull in
jest.mock('../../services/mobile-apps.service', () => ({
  MobileAppsService: jest.fn(),
}))

jest.mock('./root.service', () => ({
  RootService: jest.fn(),
}))

jest.mock('src/app/shared/url.service', () => ({
  UrlService: jest.fn(),
}), { virtual: true })

jest.mock('../../services/igot-ai.service', () => ({
  iGOTAIService: jest.fn(),
}))

jest.mock('../../services/common-data.service', () => ({
  CommonDataService: jest.fn(),
}))

jest.mock('@angular/material/legacy-dialog', () => ({
  MatLegacyDialog: jest.fn(),
}))

import { RootComponent } from './root.component'
import { Subject, of, BehaviorSubject } from 'rxjs'

describe('RootComponent', () => {
  let component: RootComponent
  let mockRouter: any
  let mockRoute: any
  let mockAppRef: any
  let mockSwUpdate: any
  let mockDialog: any
  let mockHttp: any
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockTelemetrySvc: any
  let mockEventSvc: any
  let mockMobileAppsSvc: any
  let mockRootSvc: any
  let mockBtnBackSvc: any
  let mockChangeDetector: any
  let mockUtilitySvc: any
  let mockUrlService: any
  let mockIGOTAIService: any
  let mockCommonDataSvc: any

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      events: of(),
      navigateByUrl: jest.fn(),
      navigate: jest.fn(),
      routerState: {
        snapshot: { root: { firstChild: null } },
      },
    }

    // Mock ActivatedRoute
    mockRoute = {
      queryParams: of({}),
      snapshot: {
        fragment: '',
        root: { firstChild: null },
        queryParams: {},
      },
    }

    // Mock ApplicationRef
    mockAppRef = {
      isStable: of(true),
    }

    // Mock SwUpdate
    mockSwUpdate = {
      isEnabled: false,
      available: { subscribe: jest.fn() },
      checkForUpdate: jest.fn(),
      activateUpdate: jest.fn(),
    }

    // Mock MatDialog
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(null),
      }),
    }

    // Mock HttpClient
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ data: null })),
      post: jest.fn().mockReturnValue(of({})),
    }

    // Mock ConfigurationsService
    mockConfigSvc = {
      userProfile: { userId: 'test-user-id' },
      unMappedUser: {
        id: 'test-id',
        rootOrgId: 'test-org',
        profileDetails: {
          get_started_tour: { skipped: false, visited: false },
          profileStatus: 'active',
          personalDetails: {},
          employmentDetails: { departmentName: 'test-dept' },
        },
      },
      sitePath: '/assets',
      overrideThemeChanges: null,
      iGOTAIConfig: null,
      updateTourGuideMethod: jest.fn(),
      updateTourGuide: of(false),
      orgReadData: {},
      globalConfig: { mandatoryPopupDuration: 7200 },
    }

    // Mock ValueService
    mockValueSvc = {
      isXSmall$: of(false),
    }

    // Mock TelemetryService
    mockTelemetrySvc = {
      impression: jest.fn(),
    }

    // Mock EventService
    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }

    // Mock MobileAppsService
    mockMobileAppsSvc = {
      init: jest.fn(),
      mobileTopHeaderVisibilityStatus: new Subject(),
      clearGlobalSearchForHomePage: new Subject(),
    }

    // Mock RootService
    mockRootSvc = {
      showNavbarDisplay$: new BehaviorSubject(true),
      getCookie: jest.fn().mockReturnValue(''),
    }

    // Mock BtnPageBackService
    mockBtnBackSvc = {
      initialize: jest.fn(),
    }

    // Mock ChangeDetectorRef
    mockChangeDetector = {
      detectChanges: jest.fn(),
    }

    // Mock UtilityService
    mockUtilitySvc = {
      setRouteData: jest.fn(),
      routeData: {},
    }

    // Mock UrlService
    mockUrlService = {
      setPreviousUrl: jest.fn(),
    }

    // Mock iGOTAIService
    mockIGOTAIService = {
      iGOTAIConfigReadData: jest.fn().mockReturnValue(of({ web: {} })),
    }

    // Mock CommonDataService
    mockCommonDataSvc = {
      mandatoryDetails: jest.fn(),
      fetchMandatoryNotification: jest.fn(),
    }

    component = new RootComponent(
      mockRouter,
      mockRoute,
      mockAppRef,
      mockSwUpdate,
      mockDialog,
      mockHttp,
      mockConfigSvc,
      mockValueSvc,
      mockTelemetrySvc,
      mockEventSvc,
      mockMobileAppsSvc,
      mockRootSvc,
      mockBtnBackSvc,
      mockChangeDetector,
      mockUtilitySvc,
      mockUrlService,
      mockIGOTAIService,
      mockCommonDataSvc,
    )
  })

  // ── Construction ──────────────────────────────────────────────────────────
  describe('construction', () => {
    it('creates the component', () => {
      expect(component).toBeDefined()
    })

    it('initialises showNavbar to true', () => {
      expect(component.showNavbar).toBe(true)
    })

    it('initialises routeChangeInProgress to false', () => {
      expect(component.routeChangeInProgress).toBe(false)
    })

    it('initialises iGOTAIConfigLoaded to false', () => {
      expect(component.iGOTAIConfigLoaded).toBe(false)
    })

    it('sets hideHeaderAndFooter true for privacy-policy path', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/public/privacy-policy', href: 'http://localhost/public/privacy-policy' },
        writable: true,
      })
      const testComponent = new RootComponent(
        mockRouter, mockRoute, mockAppRef, mockSwUpdate, mockDialog, mockHttp,
        mockConfigSvc, mockValueSvc, mockTelemetrySvc, mockEventSvc, mockMobileAppsSvc,
        mockRootSvc, mockBtnBackSvc, mockChangeDetector, mockUtilitySvc, mockUrlService,
        mockIGOTAIService, mockCommonDataSvc,
      )
      expect(testComponent.hideHeaderAndFooter).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { pathname: '/', href: 'http://localhost/' },
        writable: true,
      })
    })

    it('initialises loggedinUser based on configSvc.userProfile', () => {
      expect(component.loggedinUser).toBe(true)
    })
  })

  // ── navBarRequired ────────────────────────────────────────────────────────
  describe('navBarRequired getter', () => {
    it('returns isNavBarRequired', () => {
      component.isNavBarRequired = false
      expect(component.navBarRequired).toBe(false)
      component.isNavBarRequired = true
      expect(component.navBarRequired).toBe(true)
    })
  })

  // ── isShowNavbar ──────────────────────────────────────────────────────────
  describe('isShowNavbar getter', () => {
    it('returns showNavbar', () => {
      component.showNavbar = false
      expect(component.isShowNavbar).toBe(false)
    })
  })

  // ── isCustomHeight ────────────────────────────────────────────────────────
  describe('isCustomHeight getter', () => {
    it('returns true when pathname includes /public/home', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/public/home', href: 'http://localhost/public/home' },
        writable: true,
      })
      expect(component.isCustomHeight).toBe(true)
    })
  })

  // ── openIntro ─────────────────────────────────────────────────────────────
  describe('openIntro()', () => {
    it('does not throw', () => {
      expect(() => component.openIntro()).not.toThrow()
    })
  })

  // ── skipToMainContent ─────────────────────────────────────────────────────
  describe('skipToMainContent()', () => {
    it('focuses the skipper element', () => {
      const el = { focus: jest.fn() }
      component.skipper = { nativeElement: el } as any
      component.skipToMainContent()
      expect(el.focus).toHaveBeenCalled()
    })
  })

  // ── getHeaderFooterConfiguration ─────────────────────────────────────────
  describe('getHeaderFooterConfiguration()', () => {
    it('fetches right-nav-config and emits data', done => {
      mockHttp.get.mockReturnValue(of({ sections: ['s1'] }))
      component.getHeaderFooterConfiguration().subscribe((result: any) => {
        expect(result.data).toBeTruthy()
        done()
      })
    })

    it('emits null data on error', done => {
      const { throwError } = jest.requireActual('rxjs')
      mockHttp.get.mockReturnValue(throwError(() => new Error('fail')))
      component.getHeaderFooterConfiguration().subscribe((result: any) => {
        expect(result.data).toBeNull()
        done()
      })
    })
  })

  // ── getTourGuide ──────────────────────────────────────────────────────────
  describe('getTourGuide()', () => {
    it('returns boolean', () => {
      expect(typeof component.getTourGuide()).toBe('boolean')
    })
  })

  // ── raiseAppStartTelemetry ────────────────────────────────────────────────
  describe('raiseAppStartTelemetry()', () => {
    it('dispatches telemetry event on first call', () => {
      component.appStartRaised = false
      component.raiseAppStartTelemetry()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect(component.appStartRaised).toBe(true)
    })

    it('does not dispatch telemetry on subsequent calls', () => {
      component.appStartRaised = true
      mockEventSvc.dispatchEvent.mockClear()
      component.raiseAppStartTelemetry()
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  // ── getChildRouteData ─────────────────────────────────────────────────────
  describe('getChildRouteData()', () => {
    it('does not throw for null firstChild', () => {
      expect(() => component.getChildRouteData({} as any, null)).not.toThrow()
    })

    it('pushes firstChild.data to currentRouteData', () => {
      component.currentRouteData = []
      const child = { data: { pageId: '/home' }, firstChild: null }
      component.getChildRouteData({} as any, child as any)
      expect(component.currentRouteData).toContain(child.data)
    })

    it('recurses into nested firstChild', () => {
      component.currentRouteData = []
      const nested = { data: { pageId: '/nested' }, firstChild: null }
      const parent = { data: { pageId: '/parent' }, firstChild: nested }
      component.getChildRouteData({} as any, parent as any)
      expect(component.currentRouteData.length).toBe(2)
    })
  })

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('does not throw', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('calls btnBackSvc.initialize', () => {
      component.ngOnInit()
      expect(mockBtnBackSvc.initialize).toHaveBeenCalled()
    })

    it('calls commonDataSvc.mandatoryDetails on NavigationEnd', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/page/home', '/page/home'))
      const testComp = new RootComponent(
        mockRouter, mockRoute, mockAppRef, mockSwUpdate, mockDialog, mockHttp,
        mockConfigSvc, mockValueSvc, mockTelemetrySvc, mockEventSvc, mockMobileAppsSvc,
        mockRootSvc, mockBtnBackSvc, mockChangeDetector, mockUtilitySvc, mockUrlService,
        mockIGOTAIService, mockCommonDataSvc,
      )
      testComp.ngOnInit()
      expect(mockCommonDataSvc.mandatoryDetails).toHaveBeenCalled()
    })
  })

  // ── changeBg26Jan / removeBg26Jan ─────────────────────────────────────────
  describe('changeBg26Jan / removeBg26Jan', () => {
    it('changeBg26Jan does not throw', () => {
      const mockEl = { classList: { add: jest.fn(), remove: jest.fn() } }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      expect(() => component.changeBg26Jan()).not.toThrow()
    })

    it('removeBg26Jan does not throw', () => {
      const mockEl = { classList: { add: jest.fn(), remove: jest.fn() } }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      expect(() => component.removeBg26Jan()).not.toThrow()
    })
  })

  // ── ngAfterViewChecked ────────────────────────────────────────────────────
  describe('ngAfterViewChecked()', () => {
    it('calls changeDetector.detectChanges', () => {
      component.ngAfterViewChecked()
      expect(mockChangeDetector.detectChanges).toHaveBeenCalled()
    })
  })

  it('should have default property values after construction', () => {
    expect(component.routeChangeInProgress).toBe(false)
    expect(component.showNavbar).toBe(true)
    expect(component.isNavBarRequired).toBe(true)
    expect(component.appStartRaised).toBe(false)
    expect(component.isSetupPage).toBe(false)
    expect(component.currentRouteData).toEqual([])
  })

  it('should set hideHeaderAndFooter to false when pathname does not include /public/privacy-policy', () => {
    expect(component.hideHeaderAndFooter).toBe(false)
  })

  it('should initialize mobile apps service in constructor', () => {
    expect(mockMobileAppsSvc.init).toHaveBeenCalled()
  })

  describe('ngOnInit', () => {
    it('should call btnBackSvc.initialize', () => {
      component.ngOnInit()
      expect(mockBtnBackSvc.initialize).toHaveBeenCalled()
    })

    it('should call configSvc.updateTourGuideMethod', () => {
      component.ngOnInit()
      expect(mockConfigSvc.updateTourGuideMethod).toHaveBeenCalled()
    })

    it('should subscribe to mobileTopHeaderVisibilityStatus', () => {
      component.ngOnInit()
      mockMobileAppsSvc.mobileTopHeaderVisibilityStatus.next(false)
      expect(component.mobileTopHeaderVisibilityStatus).toBe(false)
    })

    it('should call iGOTAIConfig when unMappedUser has rootOrgId', () => {
      const spy = jest.spyOn(component as any, 'iGOTAIConfig').mockResolvedValue({})
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set disableHeightOnTop true and navigate when not-my-user and igot org', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user'
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'iGOT'
      component = new RootComponent(
        mockRouter, mockRoute, mockAppRef, mockSwUpdate, mockDialog, mockHttp,
        mockConfigSvc, mockValueSvc, mockTelemetrySvc, mockEventSvc, mockMobileAppsSvc,
        mockRootSvc, mockBtnBackSvc, mockChangeDetector, mockUtilitySvc, mockUrlService,
        mockIGOTAIService, mockCommonDataSvc,
      )
      component.ngOnInit()
      expect(component.disableHeightOnTop).toBe(true)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo')
    })
  })

  describe('navBarRequired getter', () => {
    it('should return the value of isNavBarRequired', () => {
      component.isNavBarRequired = true
      expect(component.navBarRequired).toBe(true)
      component.isNavBarRequired = false
      expect(component.navBarRequired).toBe(false)
    })
  })

  describe('isShowNavbar getter', () => {
    it('should return the value of showNavbar', () => {
      component.showNavbar = true
      expect(component.isShowNavbar).toBe(true)
      component.showNavbar = false
      expect(component.isShowNavbar).toBe(false)
    })
  })

  describe('isCustomHeight getter', () => {
    it('should return customHeight value', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/some/other/path', href: 'http://localhost/some/other/path' },
        writable: true,
      })
      component.customHeight = false
      expect(component.isCustomHeight).toBe(false)
    })
  })

  describe('openIntro', () => {
    it('should be callable without error', () => {
      expect(() => component.openIntro()).not.toThrow()
    })
  })

  describe('skipToMainContent', () => {
    it('should call focus on skipper nativeElement', () => {
      const mockElement = { nativeElement: { focus: jest.fn() } }
      component.skipper = mockElement as any
      component.skipToMainContent()
      expect(mockElement.nativeElement.focus).toHaveBeenCalled()
    })
  })

  describe('raiseAppStartTelemetry', () => {
    it('should dispatch event and set appStartRaised to true', () => {
      component.appStartRaised = false
      component.raiseAppStartTelemetry()
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      expect(component.appStartRaised).toBe(true)
    })

    it('should not dispatch event if appStartRaised is already true', () => {
      component.appStartRaised = true
      mockEventSvc.dispatchEvent.mockClear()
      component.raiseAppStartTelemetry()
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should call initAppUpdateCheck', () => {
      const spy = jest.spyOn(component as any, 'initAppUpdateCheck').mockImplementation(() => { })
      component.ngAfterViewInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('getChildRouteData', () => {
    it('should push data from firstChild into currentRouteData', () => {
      component.currentRouteData = []
      const mockSnapshot = {} as any
      const mockFirstChild = {
        data: { pageId: 'home', module: 'main' },
        firstChild: null,
      } as any
      component.getChildRouteData(mockSnapshot, mockFirstChild)
      expect(component.currentRouteData).toEqual([{ pageId: 'home', module: 'main' }])
    })

    it('should recursively process nested firstChild', () => {
      component.currentRouteData = []
      const mockSnapshot = {} as any
      const mockFirstChild = {
        data: { pageId: 'home' },
        firstChild: {
          data: { pageId: 'child' },
          firstChild: null,
        },
      } as any
      component.getChildRouteData(mockSnapshot, mockFirstChild)
      expect(component.currentRouteData).toEqual([
        { pageId: 'home' },
        { pageId: 'child' },
      ])
    })

    it('should handle null firstChild gracefully', () => {
      component.currentRouteData = []
      const mockSnapshot = {} as any
      component.getChildRouteData(mockSnapshot, null)
      expect(component.currentRouteData).toEqual([])
    })
  })

  describe('getTourGuide', () => {
    it('should return showTour value from configSvc.updateTourGuide', () => {
      const result = component.getTourGuide()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getHeaderFooterConfiguration', () => {
    it('should call http.get with correct URL', () => {
      component.getHeaderFooterConfiguration()
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/page/right-nav-config.json')
    })

    it('should return mapped observable', (done) => {
      mockHttp.get.mockReturnValue(of({ key: 'value' }))
      component.getHeaderFooterConfiguration().subscribe((result: any) => {
        expect(result.data).toEqual({ key: 'value' })
        expect(result.error).toBeNull()
        done()
      })
    })
  })

  describe('ngAfterViewChecked', () => {
    it('should call getTourGuide and changeDetector.detectChanges', () => {
      const spy = jest.spyOn(component, 'getTourGuide').mockReturnValue(false)
      component.ngAfterViewChecked()
      expect(spy).toHaveBeenCalled()
      expect(mockChangeDetector.detectChanges).toHaveBeenCalled()
    })
  })

  describe('changeBg26Jan', () => {
    it('should add class when overrideThemeChanges is enabled', () => {
      mockConfigSvc.overrideThemeChanges = { isEnabled: true }
      const mockEl = { classList: { add: jest.fn(), remove: jest.fn() } }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.changeBg26Jan()
      expect(mockEl.classList.add).toHaveBeenCalledWith('jan-bg-change')
    })

    it('should remove class when overrideThemeChanges is disabled', () => {
      mockConfigSvc.overrideThemeChanges = { isEnabled: false }
      const mockEl = { classList: { add: jest.fn(), remove: jest.fn() } }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.changeBg26Jan()
      expect(mockEl.classList.remove).toHaveBeenCalledWith('jan-bg-change')
    })
  })

  describe('removeBg26Jan', () => {
    it('should remove jan-bg-change class', () => {
      const mockEl = { classList: { remove: jest.fn() } }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
      component.removeBg26Jan()
      expect(mockEl.classList.remove).toHaveBeenCalledWith('jan-bg-change')
    })
  })

  describe('initAppUpdateCheck', () => {
    it('should not set up update check when not in production', () => {
      component.initAppUpdateCheck()
      expect(mockSwUpdate.checkForUpdate).not.toHaveBeenCalled()
    })
  })

  describe('unloadHandler', () => {
    it('should handle unload event without error', () => {
      expect(() => component.unloadHandler({ type: 'unload' })).not.toThrow()
    })

    it('should handle non-unload event without error', () => {
      expect(() => component.unloadHandler({ type: 'other' })).not.toThrow()
    })
  })

  describe('iGOTAIConfig', () => {
    it('should call iGOTAIService.iGOTAIConfigReadData and set config', async () => {
      mockIGOTAIService.iGOTAIConfigReadData.mockReturnValue(of({ web: { aiTutor: true } }))
      const result = await (component as any).iGOTAIConfig()
      expect(mockIGOTAIService.iGOTAIConfigReadData).toHaveBeenCalled()
      expect(result).toEqual({ web: { aiTutor: true } })
      expect(component.iGOTAIConfigLoaded).toBe(true)
    })

    it('should set iGOTAIConfigLoaded to false on 404 error', async () => {
      mockIGOTAIService.iGOTAIConfigReadData.mockReturnValue(of({ error: { status: 404 } }))
      await (component as any).iGOTAIConfig()
      expect(component.iGOTAIConfigLoaded).toBe(false)
    })
  })

  // ── Router events in ngOnInit ───────────────────────────────────────────
  describe('ngOnInit router events', () => {
    const makeComp = () => new RootComponent(
      mockRouter, mockRoute, mockAppRef, mockSwUpdate, mockDialog, mockHttp,
      mockConfigSvc, mockValueSvc, mockTelemetrySvc, mockEventSvc, mockMobileAppsSvc,
      mockRootSvc, mockBtnBackSvc, mockChangeDetector, mockUtilitySvc, mockUrlService,
      mockIGOTAIService, mockCommonDataSvc,
    )

    it('NavigationStart: sets showNavbar=true and isNavBarRequired=true for normal url', () => {
      const { NavigationStart } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationStart(1, '/page/home'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.showNavbar).toBe(true)
      expect(c.isNavBarRequired).toBe(true)
    })

    it('NavigationStart: sets isNavBarRequired=false for preview url', () => {
      const { NavigationStart } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationStart(1, '/page/home?preview=1'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.isNavBarRequired).toBe(false)
    })

    it('NavigationStart: sets isNavBarRequired=false for embed url', () => {
      const { NavigationStart } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationStart(1, '/viewer/embed/123'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.isNavBarRequired).toBe(false)
    })

    it('NavigationStart: sets viewerPage=true for viewer url', () => {
      const { NavigationStart } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationStart(1, '/viewer/123'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.viewerPage).toBe(true)
    })

    it('NavigationStart: sets viewerPage=false for non-viewer url', () => {
      const { NavigationStart } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationStart(1, '/page/home'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.viewerPage).toBe(false)
    })

    it('NavigationEnd: sets routeChangeInProgress=false', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/page/home', '/page/home'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.routeChangeInProgress).toBe(false)
    })

    it('NavigationEnd: sets customHeight=true for /public/home', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/public/home', '/public/home'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.customHeight).toBe(true)
    })

    it('NavigationEnd: sets customHeight=false for non-public/home', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/page/other', '/page/other'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.customHeight).toBe(false)
    })

    it('NavigationEnd: sets showNavbar=false and isNavBarRequired=false for /public/logout', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/public/logout', '/public/logout'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.showNavbar).toBe(false)
      expect(c.isNavBarRequired).toBe(false)
    })

    it('NavigationEnd: sets showNavbar=false for /viewer/ url', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/viewer/123', '/viewer/123'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.showNavbar).toBe(false)
    })

    it('NavigationEnd: sets isSetupPage=true for /setup/ url', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/setup/step1', '/setup/step1'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.isSetupPage).toBe(true)
    })

    it('NavigationEnd: sets showFooter=true for regular url', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/app/home', '/app/home'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.showFooter).toBe(true)
    })

    it('NavigationCancel: sets routeChangeInProgress=false', () => {
      const { NavigationCancel } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationCancel(1, '/page/home', 'cancelled'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.routeChangeInProgress).toBe(false)
    })

    it('NavigationError: sets routeChangeInProgress=false', () => {
      const { NavigationError } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationError(1, '/page/home', new Error('err')))
      const c = makeComp()
      c.ngOnInit()
      expect(c.routeChangeInProgress).toBe(false)
    })

    it('NavigationEnd: calls telemetrySvc.impression when pageId and module present', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/app/home', '/app/home'))
      mockUtilitySvc.routeData = { pageId: 'home', module: 'main' }
      const c = makeComp()
      c.ngOnInit()
      expect(mockTelemetrySvc.impression).toHaveBeenCalled()
    })

    it('NavigationEnd: calls telemetrySvc.impression with no args when no pageId', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/app/home', '/app/home'))
      mockUtilitySvc.routeData = {}
      const c = makeComp()
      c.ngOnInit()
      expect(mockTelemetrySvc.impression).toHaveBeenCalled()
    })

    it('NavigationStart with /public url: sets showHubs=false', () => {
      const { NavigationStart } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationStart(1, '/public/home'))
      Object.defineProperty(window, 'innerWidth', { value: 1500, writable: true })
      const c = makeComp()
      c.ngOnInit()
      expect(c.showHubs).toBe(false)
    })

    it('NavigationEnd with /app/toc/ url: sets showBottomNav=false', () => {
      const { NavigationEnd } = jest.requireActual('@angular/router')
      mockRouter.events = of(new NavigationEnd(1, '/app/toc/123', '/app/toc/123'))
      const c = makeComp()
      c.ngOnInit()
      expect(c.showBottomNav).toBe(false)
    })
  })
})

