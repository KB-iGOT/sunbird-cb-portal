import { RootComponent } from './root.component';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { NavigationEnd, NavigationStart, NavigationCancel, NavigationError, ActivatedRouteSnapshot } from '@angular/router';

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
  let component: RootComponent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock window and document
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/page/home',
        origin: 'http://localhost'
      },
      writable: true
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
      writable: true
    });

    Object.defineProperty(window, 'self', {
      value: window,
      writable: true
    });

    Object.defineProperty(window, 'top', {
      value: window,
      writable: true
    });

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });

    // Mock document.getElementById
    const mockElement = {
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    } as unknown as HTMLElement;
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    // Create component instance
    component = new RootComponent(
      mockRouter as any,
      mockActivatedRoute as any,
      mockApplicationRef as any,
      mockSwUpdate as any,
      mockDialog as any,
      mockHttpClient as any,
      mockConfigurationsService as any,
      mockValueService as any,
      mockTelemetryService as any,
      mockEventService as any,
      mockMobileAppsService as any,
      mockRootService as any,
      mockBtnPageBackService as any,
      mockChangeDetectorRef as any,
      mockUtilityService as any,
      mockUrlService as any,
      mockIGOTAIService as any
    );

    // Set up ViewChild mocks
    component.skipper = mockElementRef as any;
    component.previewContainerViewRef = mockViewContainerRef as any;
    component.appUpdateTitleRef = mockElementRef as any;
    component.appUpdateBodyRef = mockElementRef as any;
  });

  describe('Constructor', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should hide header and footer for privacy policy page', () => {
      window.location.pathname = '/public/privacy-policy';
      
      const newComponent = new RootComponent(
        mockRouter as any,
        mockActivatedRoute as any,
        mockApplicationRef as any,
        mockSwUpdate as any,
        mockDialog as any,
        mockHttpClient as any,
        mockConfigurationsService as any,
        mockValueService as any,
        mockTelemetryService as any,
        mockEventService as any,
        mockMobileAppsService as any,
        mockRootService as any,
        mockBtnPageBackService as any,
        mockChangeDetectorRef as any,
        mockUtilityService as any,
        mockUrlService as any,
        mockIGOTAIService as any
      );

      expect(newComponent.hideHeaderAndFooter).toBe(true);
    });

    it('should set custom height for specific pages', () => {
      window.location.pathname = '/public/home';
      
      const newComponent = new RootComponent(
        mockRouter as any,
        mockActivatedRoute as any,
        mockApplicationRef as any,
        mockSwUpdate as any,
        mockDialog as any,
        mockHttpClient as any,
        mockConfigurationsService as any,
        mockValueService as any,
        mockTelemetryService as any,
        mockEventService as any,
        mockMobileAppsService as any,
        mockRootService as any,
        mockBtnPageBackService as any,
        mockChangeDetectorRef as any,
        mockUtilityService as any,
        mockUrlService as any,
        mockIGOTAIService as any
      );

      expect(newComponent.customHeight).toBe(true);
    });

    it('should initialize mobile apps service', () => {
      expect(mockMobileAppsService.init).toHaveBeenCalled();
    });
  });

  describe('Getters', () => {
    it('should return navBarRequired', () => {
      component.isNavBarRequired = true;
      expect(component.navBarRequired).toBe(true);
    });

    it('should return isShowNavbar', () => {
      component.showNavbar = false;
      expect(component.isShowNavbar).toBe(false);
    });

    it('should return isCustomHeight for home page', () => {
      window.location.pathname = '/public/home';
      expect(component.isCustomHeight).toBe(true);
    });

    it('should return isCustomHeight for FAQ page', () => {
      window.location.pathname = '/public/faq';
      expect(component.isCustomHeight).toBe(true);
    });

    it('should return isCustomHeight for CRP pages', () => {
      window.location.pathname = '/crp/test-page';
      expect(component.isCustomHeight).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize component properly', () => {
      component.ngOnInit();

      expect(mockBtnPageBackService.initialize).toHaveBeenCalled();
      expect(mockConfigurationsService.updateTourGuideMethod).toHaveBeenCalled();
    });

    it('should set isInIframe to false when not in iframe', () => {
      component.ngOnInit();
      expect(component.isInIframe).toBe(false);
    });

    it('should set customHeight for home page', () => {
      window.location.pathname = '/public/home';
      component.ngOnInit();
      expect(component.customHeight).toBe(true);
    });

    it('should handle profile status "not-my-user" with igot organization', () => {
      mockConfigurationsService.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigurationsService.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      
      component.ngOnInit();
      
      expect(component.disableHeightOnTop).toBe(true);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
    });

    it('should subscribe to mobile apps visibility status', () => {
      component.ngOnInit();
      
      mockMobileAppsService.mobileTopHeaderVisibilityStatus.next(false);
      
      expect(component.mobileTopHeaderVisibilityStatus).toBe(false);
    });
  });

  describe('Router Events', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle NavigationStart event', () => {
      const navigationStart = new NavigationStart(1, '/test-url');
      
      mockRouter.events.next(navigationStart);
      
      expect(component.routeChangeInProgress).toBe(true);
      expect(component.showNavbar).toBe(true);
      expect(component.isNavBarRequired).toBe(true);
    });

    it('should handle NavigationStart for preview pages', () => {
      const navigationStart = new NavigationStart(1, '/preview/test');
      
      mockRouter.events.next(navigationStart);
      
      expect(component.isNavBarRequired).toBe(false);
    });

    it('should handle NavigationStart for embed pages', () => {
      const navigationStart = new NavigationStart(1, '/embed/test');
      
      mockRouter.events.next(navigationStart);
      
      expect(component.isNavBarRequired).toBe(false);
    });

    it('should handle NavigationStart for mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      const navigationStart = new NavigationStart(1, '/test-url');
      
      mockRouter.events.next(navigationStart);
      
      expect(component.showHubs).toBe(false);
    });

    it('should handle NavigationStart for viewer pages', () => {
      const navigationStart = new NavigationStart(1, '/viewer/test');
      
      mockRouter.events.next(navigationStart);
      
      expect(component.viewerPage).toBe(true);
    });

    it('should handle NavigationEnd event', () => {
      const navigationEnd = new NavigationEnd(1, '/test-url', '/test-url');
      
      mockRouter.events.next(navigationEnd);
      
      expect(component.routeChangeInProgress).toBe(false);
      expect(component.currentUrl).toBe('/test-url');
    });

    it('should handle NavigationEnd for public logout', () => {
      const navigationEnd = new NavigationEnd(1, '/public/logout', '/public/logout');
      
      mockRouter.events.next(navigationEnd);
      
      expect(component.showFooter).toBe(false);
      expect(component.showNavbar).toBe(false);
      expect(component.isNavBarRequired).toBe(false);
    });

    it('should handle NavigationEnd for learner-advisory', () => {
      window.location.pathname = '/learner-advisory';
      const navigationEnd = new NavigationEnd(1, '/learner-advisory', '/learner-advisory');
      
      mockRouter.events.next(navigationEnd);
      
      expect(component.showNavbar).toBe(true);
      expect(component.isNavBarRequired).toBe(true);
      expect(component.showBottomNav).toBe(true);
      expect(component.showHubs).toBe(true);
    });

    it('should handle NavigationEnd for globalsearch', () => {
      window.location.pathname = '/globalsearch';
      const navigationEnd = new NavigationEnd(1, '/globalsearch', '/globalsearch');
      
      mockRouter.events.next(navigationEnd);
      
      expect(component.showFooter).toBe(false);
    });

    it('should handle NavigationEnd for toc pages', () => {
      const navigationEnd = new NavigationEnd(1, '/app/toc/test', '/app/toc/test');
      
      mockRouter.events.next(navigationEnd);
      
      expect(component.showBottomNav).toBe(false);
    });

    it('should handle NavigationCancel event', () => {
      const navigationCancel = new NavigationCancel(1, '/test-url', 'cancelled');
      
      mockRouter.events.next(navigationCancel);
      
      expect(component.routeChangeInProgress).toBe(false);
    });

    it('should handle NavigationError event', () => {
      const navigationError = new NavigationError(1, '/test-url', 'error');
      
      mockRouter.events.next(navigationError);
      
      expect(component.routeChangeInProgress).toBe(false);
    });

    it('should set prevUrl and currUrl on NavigationEnd', () => {
      const navigationEnd1 = new NavigationEnd(1, '/first-url', '/first-url');
      const navigationEnd2 = new NavigationEnd(2, '/second-url', '/second-url');
      
      mockRouter.events.next(navigationEnd1);
      mockRouter.events.next(navigationEnd2);
      
      expect(component.prevUrl).toBe('/first-url');
      expect(component.currUrl).toBe('/second-url');
      expect(mockUrlService.setPreviousUrl).toHaveBeenCalledWith('/first-url');
    });
  });

  describe('iGOTAIConfig', () => {
    it('should call iGOTAI service and set config', async () => {
      const mockResponse:any = { aiTutor: true, iGOTAI: true };
      mockIGOTAIService.iGOTAIConfigReadData.mockReturnValue(of(mockResponse));
      
      const result = await component['iGOTAIConfig']();
      
      expect(mockIGOTAIService.iGOTAIConfigReadData).toHaveBeenCalled();
      expect(mockConfigurationsService.iGOTAIConfig).toBe(mockResponse);
      expect(component.iGOTAIConfigLoaded).toBe(true);
      expect(result).toBe(mockResponse);
    });

    it('should handle 404 error from iGOTAI service', async () => {
      const mockError = { error: { status: 404 } };
      mockIGOTAIService.iGOTAIConfigReadData.mockReturnValue(of(mockError));
      
      await component['iGOTAIConfig']();
      
      expect(component.iGOTAIConfigLoaded).toBe(false);
    });
  });

  describe('Background Theme Methods', () => {
    beforeEach(() => {
      mockConfigurationsService.overrideThemeChanges = { isEnabled: true };
    });

    it('should add jan-bg-change class when theme is enabled', () => {
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      } as unknown as HTMLElement;
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

      component.changeBg26Jan();

      expect(mockElement.classList.add).toHaveBeenCalledWith('jan-bg-change');
    });

    it('should remove jan-bg-change class when theme is disabled', () => {
      mockConfigurationsService.overrideThemeChanges = { isEnabled: false };
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      } as unknown as HTMLElement;
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

      component.changeBg26Jan();

      expect(mockElement.classList.remove).toHaveBeenCalledWith('jan-bg-change');
    });

    it('should remove jan-bg-change class in removeBg26Jan', () => {
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      } as unknown as HTMLElement;
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

      component.removeBg26Jan();

      expect(mockElement.classList.remove).toHaveBeenCalledWith('jan-bg-change');
    });
  });

  describe('Telemetry Methods', () => {
    it('should raise app start telemetry only once', () => {
      component.appStartRaised = false;
      
      component.raiseAppStartTelemetry();
      component.raiseAppStartTelemetry();
      
      expect(mockEventService.dispatchEvent).toHaveBeenCalledTimes(1);
      expect(component.appStartRaised).toBe(true);
    });

    it('should not raise app start telemetry if already raised', () => {
      component.appStartRaised = true;
      
      component.raiseAppStartTelemetry();
      
      expect(mockEventService.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should skip to main content', () => {
      component.skipToMainContent();
      
      expect(mockElementRef.nativeElement.focus).toHaveBeenCalled();
    });

    it('should get child route data recursively', () => {
      const mockSnapshot = {} as ActivatedRouteSnapshot;
      const mockFirstChild = {
        data: { pageId: 'test', module: 'test-module' },
        firstChild: {
          data: { subPage: 'sub-test' },
          firstChild: null
        }
      } as unknown as ActivatedRouteSnapshot;

      component.getChildRouteData(mockSnapshot, mockFirstChild);

     // expect(component.currentRouteData).toHaveLength(2);
      expect(component.currentRouteData[0]).toEqual({ pageId: 'test', module: 'test-module' });
      expect(component.currentRouteData[1]).toEqual({ subPage: 'sub-test' });
    });

    it('should get tour guide status', () => {
      mockConfigurationsService.updateTourGuide.next(true);
      
      const result = component.getTourGuide();
      
      expect(result).toBe(true);
      expect(component.showTour).toBe(true);
    });

    it('should get header footer configuration', () => {
      const expectedUrl = '/test/page/right-nav-config.json';
      
      component.getHeaderFooterConfiguration().subscribe();
      
      expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should initialize app update check', () => {
      const initSpy = jest.spyOn(component, 'initAppUpdateCheck');
      
      component.ngAfterViewInit();
      
      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewChecked', () => {
    it('should detect changes after view checked', () => {
      component.ngAfterViewChecked();
      
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    });
  });

  describe('Host Listener', () => {
    it('should handle unload event', () => {
      const unloadEvent = { type: 'unload' };
      
      component.unloadHandler(unloadEvent);
      
      // This test ensures the method handles the event without errors
      expect(unloadEvent.type).toBe('unload');
    });
  });

  describe('App Update Check', () => {
    it('should not initialize update check in non-production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      component.initAppUpdateCheck();
      
      expect(mockSwUpdate.checkForUpdate).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});