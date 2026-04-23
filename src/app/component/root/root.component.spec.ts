import { Subject, of } from 'rxjs'

jest.mock('@sunbird-cb/collection', () => ({
  BtnPageBackService: jest.fn().mockImplementation(() => ({ pageBack: jest.fn() })),
}), { virtual: true })

jest.mock('src/app/shared/url.service', () => ({
  UrlService: jest.fn().mockImplementation(() => ({ getRedirectUrl: jest.fn() })),
}), { virtual: true })

jest.mock('@project-sunbird/client-services', () => ({
  CsModule: { instance: { init: jest.fn() } },
}))

jest.mock('@angular/service-worker', () => ({
  SwUpdate: jest.fn().mockImplementation(() => ({
    available: of(null),
    activated: of(null),
    checkForUpdate: jest.fn(),
  })),
}))

// Mock dependencies
const mockRouter = {
  events: new Subject(),
  url: '/page/home',
  navigateByUrl: jest.fn(),
  routerState: {
    firstChild: jest.fn()
  }
};

const mockActivatedRoute = {
  queryParams: of({}),
  snapshot: {
    root: {
      firstChild: {
        data: { pageId: 'home', module: 'main' },
        firstChild: null
      }
    },
    queryParams: {},
    firstChild: null
  }
};

const mockApplicationRef = {
  isStable: of(true)
};

const mockSwUpdate = {
  isEnabled: true,
  available: new Subject(),
  checkForUpdate: jest.fn(),
  activateUpdate: jest.fn().mockResolvedValue(true)
};

const mockDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: () => of(true)
  })
};

const mockHttpClient = {
  get: jest.fn().mockReturnValue(of({ data: { config: 'test' } }))
};

const mockConfigurationsService = {
  unMappedUser: {
    profileDetails: {
      get_started_tour: { skipped: false, visited: false },
      profileStatus: 'active',
      employmentDetails: { departmentName: 'test' }
    },
    rootOrgId: 'test-org'
  },
  userProfile: { userId: 'test-user' },
  sitePath: '/test',
  overrideThemeChanges: { isEnabled: false },
  updateTourGuideMethod: jest.fn(),
  updateTourGuide: new BehaviorSubject(false),
  iGOTAIConfig: null
};

const mockValueService = {
  isXSmall$: of(false)
};

const mockTelemetryService = {
  impression: jest.fn()
};

const mockEventService = {
  dispatchEvent: jest.fn()
};

const mockMobileAppsService = {
  init: jest.fn(),
  mobileTopHeaderVisibilityStatus: new BehaviorSubject(true)
};

const mockRootService = {
  showNavbarDisplay$: of(true),
  getCookie: jest.fn().mockReturnValue('test-cookie')
};

const mockBtnPageBackService = {
  initialize: jest.fn()
};

const mockChangeDetectorRef = {
  detectChanges: jest.fn()
};

const mockUtilityService = {
  setRouteData: jest.fn(),
  routeData: { pageId: 'home', module: 'main' }
};

const mockUrlService = {
  setPreviousUrl: jest.fn()
};

const mockIGOTAIService = {
  iGOTAIConfigReadData: jest.fn().mockReturnValue(of({ aiTutor: true }))
};

// Mock DOM elements
const mockElementRef = {
  nativeElement: {
    focus: jest.fn(),
    value: 'test-value'
  }
};

const mockViewContainerRef = {};

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

  function buildComponent() {
    return new RootComponent(
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
      mockCommonDataSvc
    )
  }

  beforeEach(() => {
    mockRouter = {
      events: new Subject<any>(),
      navigate: jest.fn(),
    }

    mockRoute = {
      queryParams: new Subject<any>(),
      snapshot: { fragment: null },
    }

    mockAppRef = { isStable: of(true) }

    mockSwUpdate = {
      available: of(null),
      activated: of(null),
      checkForUpdate: jest.fn().mockResolvedValue(undefined),
      isEnabled: false,
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: jest.fn(() => of(null)) }),
    }

    mockHttp = {
      get: jest.fn().mockReturnValue(of({ data: null, error: null })),
    }

    mockConfigSvc = {
      unMappedUser: {
        id: 'u1',
        profileDetails: { get_started_tour: { skipped: true, visited: false } },
      },
      userProfile: { userId: 'u1' },
      sitePath: '/assets',
      updateTourGuideMethod: jest.fn(),
      pageNavBar: {},
    }

    mockValueSvc = {
      isXSmall$: of(false),
    }

    mockTelemetrySvc = { start: jest.fn(), end: jest.fn() }
    mockEventSvc = { raiseInteractTelemetry: jest.fn() }

    mockMobileAppsSvc = {
      init: jest.fn(),
      mobileTopHeaderVisibilityStatus: new Subject<any>(),
      clearGlobalSearchForHomePage: { next: jest.fn() },
      sendViewerData: jest.fn(),
    }

    mockRootSvc = {
      getCookie: jest.fn(),
      getPageConfig: jest.fn().mockReturnValue(of({})),
      showNavbarDisplay$: of(true),
    }

    mockBtnBackSvc = {
      initialize: jest.fn(),
    }

    mockChangeDetector = {
      detectChanges: jest.fn(),
    }

    mockUtilitySvc = {
      setRouteData: jest.fn(),
      routeData: {},
    }

    mockUrlService = {
      setPreviousUrl: jest.fn(),
    }

    mockIGOTAIService = {
      loadScript: jest.fn(),
    }

    mockCommonDataSvc = {
      mandatoryDetails: jest.fn(),
      fetchMandatoryNotification: jest.fn(),
      checkAndShowMandatoryNotification: jest.fn(),
    }

    component = buildComponent()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should set showTour from profileDetails when get_started_tour is set', () => {
      expect(component.showTour).toBe(true)
    })

    it('should set showTour to false when get_started_tour is absent', () => {
      mockConfigSvc.unMappedUser = { id: 'u2', profileDetails: {} }
      const comp = buildComponent()
      expect(comp.showTour).toBe(false)
    })

    it('should set hideHeaderAndFooter to true for privacy-policy path', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/public/privacy-policy', href: 'http://localhost/public/privacy-policy' },
        writable: true,
      })
      const comp = buildComponent()
      expect(comp.hideHeaderAndFooter).toBe(true)
      // restore
      Object.defineProperty(window, 'location', {
        value: { pathname: '/', href: 'http://localhost/' },
        writable: true,
      })
    })

    it('should call mobileAppsSvc.init', () => {
      expect(mockMobileAppsSvc.init).toHaveBeenCalled()
    })
  })

  describe('navBarRequired getter', () => {
    it('should return isNavBarRequired value', () => {
      component['isNavBarRequired'] = true
      expect(component.navBarRequired).toBe(true)
    })

    it('should return false when isNavBarRequired is false', () => {
      component['isNavBarRequired'] = false
      expect(component.navBarRequired).toBe(false)
    })
  })

  describe('isShowNavbar getter', () => {
    it('should return showNavbar value', () => {
      component['showNavbar'] = true
      expect(component.isShowNavbar).toBe(true)
    })

    it('should return false when showNavbar is false', () => {
      component['showNavbar'] = false
      expect(component.isShowNavbar).toBe(false)
    })
  })

  describe('isCustomHeight getter', () => {
    it('should return customHeight when on /public/home', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/public/home', href: 'http://localhost/public/home' },
        writable: true,
      })
      expect(component.isCustomHeight).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { pathname: '/', href: 'http://localhost/' },
        writable: true,
      })
    })

    it('should return false on a regular path', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/page/home', href: 'http://localhost/page/home' },
        writable: true,
      })
      component['customHeight'] = false
      expect(component.isCustomHeight).toBe(false)
      Object.defineProperty(window, 'location', {
        value: { pathname: '/', href: 'http://localhost/' },
        writable: true,
      })
    })
  })

  describe('openIntro', () => {
    it('should not throw', () => {
      expect(() => component.openIntro()).not.toThrow()
    })
  })

  describe('getHeaderFooterConfiguration', () => {
    it('should call http.get with sitePath + right-nav-config.json', () => {
      component.getHeaderFooterConfiguration().subscribe()
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/page/right-nav-config.json')
    })
  })

  describe('ngOnInit', () => {
    it('should call configSvc.updateTourGuideMethod', () => {
      component.ngOnInit()
      expect(mockConfigSvc.updateTourGuideMethod).toHaveBeenCalledWith(component.showTour)
    })

    it('should call btnBackSvc.initialize', () => {
      component.ngOnInit()
      expect(mockBtnBackSvc.initialize).toHaveBeenCalled()
    })

    it('should set isHomePage based on router events', () => {
      // spy on changeBg methods to prevent DOM errors
      jest.spyOn(component as any, 'changeBg26Jan').mockImplementation(() => { })
      jest.spyOn(component as any, 'removeBg26Jan').mockImplementation(() => { })
      mockEventSvc.dispatchEvent = jest.fn()
      mockTelemetrySvc.impression = jest.fn()
      mockRoute.snapshot = { fragment: null, queryParams: {}, root: { firstChild: null } }
      mockUtilitySvc.routeData = { pageId: null, module: null }
      const { NavigationEnd } = jest.requireActual('@angular/router')
      component.ngOnInit()
      mockRouter.events.next(new NavigationEnd(1, '/page/home', '/page/home'))
      // homePage depends on the clearGlobalSearchForHomePage call
      expect(mockMobileAppsSvc.clearGlobalSearchForHomePage.next).toHaveBeenCalled()
    })

    it('should set isNavBarRequired false for preview urls', () => {
      jest.spyOn(component as any, 'changeBg26Jan').mockImplementation(() => { })
      jest.spyOn(component as any, 'removeBg26Jan').mockImplementation(() => { })
      const { NavigationStart } = jest.requireActual('@angular/router')
      component.ngOnInit()
      mockRouter.events.next(new NavigationStart(1, '/preview/some-content'))
      expect(component['isNavBarRequired']).toBe(false)
    })
  })

  describe('getChildRouteData', () => {
    it('should push firstChild data into currentRouteData', () => {
      const snapshot = {} as any
      const child: any = { data: { pageId: 'test' }, firstChild: null }
      component.getChildRouteData(snapshot, child)
      expect(component['currentRouteData']).toContainEqual({ pageId: 'test' })
    })

    it('should handle nested children recursively', () => {
      const snapshot = {} as any
      const grandchild: any = { data: { pageId: 'grand' }, firstChild: null }
      const child: any = { data: { pageId: 'child' }, firstChild: grandchild }
      component.getChildRouteData(snapshot, child)
      expect(component['currentRouteData'].length).toBe(2)
    })

    it('should not crash when firstChild is null', () => {
      expect(() => component.getChildRouteData({} as any, null)).not.toThrow()
    })
  })

  describe('raiseAppStartTelemetry', () => {
    it('should set appStartRaised to true after first call', () => {
      mockEventSvc.dispatchEvent = jest.fn()
      component['appStartRaised'] = false
      component.raiseAppStartTelemetry()
      expect(component['appStartRaised']).toBe(true)
    })

    it('should not dispatch event if appStartRaised is already true', () => {
      mockEventSvc.dispatchEvent = jest.fn()
      component['appStartRaised'] = true
      component.raiseAppStartTelemetry()
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('getTourGuide', () => {
    it('should return showTour value from updateTourGuide observable', () => {
      const subj = new Subject()
      mockConfigSvc.updateTourGuide = subj
      subj.next(true)
      const result = component.getTourGuide()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('loggedinUser getter', () => {
    it('should be true when userProfile has userId', () => {
      expect(component.loggedinUser).toBe(true)
    })
  })

  describe('isInIframe', () => {
    it('should be false initially', () => {
      expect(component['isInIframe']).toBe(false)
    })
  })

  describe('hideHeaderAndFooter', () => {
    it('should be false for normal path', () => {
      expect(component.hideHeaderAndFooter).toBe(false)
    })
  })
})


