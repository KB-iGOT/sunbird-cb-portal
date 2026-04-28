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

  it('should create', () => {
    expect(component).toBeTruthy()
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
      const spy = jest.spyOn(component as any, 'initAppUpdateCheck').mockImplementation(() => {})
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
})
