import { RootComponent } from './root.component';
import { of, Subject } from 'rxjs';
import { NavigationEnd, NavigationStart } from '@angular/router';


describe('RootComponent', () => {
  let component: RootComponent;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockAppRef: any;
  let mockSwUpdate: any;
  let mockDialog: any;
  let mockHttpClient: any;
  let mockConfigSvc: any;
  let mockValueSvc: any;
  let mockTelemetrySvc: any;
  let mockEventSvc: any;
  let mockMobileAppsSvc: any;
  let mockRootSvc: any;
  let mockBtnBackSvc: any;
  let mockChangeDetector: any;
  let mockUtilitySvc: any;
  let mockUrlService: any;
  let mockiGOTAIService: any;

  const routerEvents = new Subject();
  const mobileTopHeaderSubject = new Subject();
  const rootSvcShowNavbarDisplay = new Subject();
  const configSvcUpdateTourGuide = new Subject();

  beforeEach(() => {
    // Create mock services
    mockRouter = {
      events: routerEvents.asObservable(),
      url: '/page/home',
      navigateByUrl: jest.fn(),
    };
    
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
        root: {
          firstChild: {
            data: { pageId: 'home', module: 'learning' },
            firstChild: null
          }
        },
        firstChild: null
      },
      queryParams: of({})
    };
    
    mockAppRef = {
      isStable: of(true)
    };
    
    mockSwUpdate = {
      isEnabled: true,
      available: of({}),
      checkForUpdate: jest.fn(),
      activateUpdate: jest.fn().mockResolvedValue(true)
    };
    
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };
    
    mockHttpClient = {
      get: jest.fn().mockReturnValue(of({ data: { footer: {}, header: {} } }))
    };
    
    mockConfigSvc = {
      sitePath: 'http://test-site',
      unMappedUser: {
        profileDetails: {
          get_started_tour: { skipped: false, visited: false },
          profileStatus: 'active',
          employmentDetails: { departmentName: 'test' }
        },
        rootOrgId: 'orgId123'
      },
      userProfile: { userId: 'user123' },
      overrideThemeChanges: { isEnabled: false },
      updateTourGuide: configSvcUpdateTourGuide.asObservable(),
      updateTourGuideMethod: jest.fn()
    };
    
    mockValueSvc = {
      isXSmall$: of(false)
    };
    
    mockTelemetrySvc = {
      impression: jest.fn(),
      audit: jest.fn()
    };
    
    mockEventSvc = {
      dispatchEvent: jest.fn()
    };
    
    mockMobileAppsSvc = {
      init: jest.fn(),
      mobileTopHeaderVisibilityStatus: mobileTopHeaderSubject.asObservable()
    };
    
    mockRootSvc = {
      showNavbarDisplay$: rootSvcShowNavbarDisplay.asObservable(),
      getCookie: jest.fn()
    };
    
    mockBtnBackSvc = {
      initialize: jest.fn()
    };
    
    mockChangeDetector = {
      detectChanges: jest.fn()
    };
    
    mockUtilitySvc = {
      setRouteData: jest.fn(),
      routeData: { pageId: 'home', module: 'learning' }
    };
    
    mockUrlService = {
      setPreviousUrl: jest.fn()
    };
    
    mockiGOTAIService = {
      iGOTAIConfigReadData: jest.fn().mockReturnValue(of({
        aiTutor: true,
        iGOTAI: true,
        subTitles: true,
        transcription: true
      }))
    };

    // Mock window properties
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/page/home',
        origin: 'http://localhost:3000'
      },
      writable: true
    });
    
    Object.defineProperty(window, 'innerWidth', {
      value: 1400,
      writable: true
    });

    // Create component instance with mocked dependencies
    component = new RootComponent(
      mockRouter as any,
      mockActivatedRoute as any,
      mockAppRef as any,
      mockSwUpdate as any,
      mockDialog as any,
      mockHttpClient as any,
      mockConfigSvc as any,
      mockValueSvc as any,
      mockTelemetrySvc as any,
      mockEventSvc as any,
      mockMobileAppsSvc as any,
      mockRootSvc as any,
      mockBtnBackSvc as any,
      mockChangeDetector as any,
      mockUtilitySvc as any,
      mockUrlService as any,
      mockiGOTAIService as any
    );

    // Spy on component methods
    jest.spyOn(component, 'raiseAppStartTelemetry');
    jest.spyOn(component, 'getChildRouteData');
   // jest.spyOn(component, 'iGOTAIConfig');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize properties and call services', () => {
      // Assert services are called
      expect(mockMobileAppsSvc.init).toHaveBeenCalled();
      expect(mockHttpClient.get).toHaveBeenCalledWith('http://test-site/page/right-nav-config.json');
      expect(component.loggedinUser).toBe(true);
    });

    it('should set customHeight to true when path includes specified routes', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/public/home' },
        writable: true
      });
      
      component = new RootComponent(
        mockRouter as any, mockActivatedRoute as any, mockAppRef as any,
        mockSwUpdate as any, mockDialog as any, mockHttpClient as any,
        mockConfigSvc as any, mockValueSvc as any, mockTelemetrySvc as any,
        mockEventSvc as any, mockMobileAppsSvc as any, mockRootSvc as any,
        mockBtnBackSvc as any, mockChangeDetector as any, mockUtilitySvc as any,
        mockUrlService as any, mockiGOTAIService as any
      );
      
      expect(component.customHeight).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize button back service and subscribe to router events', () => {
      component.ngOnInit();
      expect(mockBtnBackSvc.initialize).toHaveBeenCalled();
    });

    it('should call iGOTAIConfig when user has rootOrgId', async () => {
      const iGOTAIConfigSpy = jest.spyOn(component as any, 'iGOTAIConfig')
        .mockResolvedValue({ data: 'config data' });
      
      await component.ngOnInit();
      
      expect(iGOTAIConfigSpy).toHaveBeenCalled();
    });

    it('should navigate to profile page when user is not-my-user and from igot org', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      
      component.ngOnInit();
      
      expect(component.disableHeightOnTop).toBe(true);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
    });
  });

  describe('router events', () => {
    it('should handle NavigationStart events correctly', () => {
      component.ngOnInit();
      
      // Simulate navigation start event
      const navStartEvent = new NavigationStart(1, '/viewer/some-path');
      routerEvents.next(navStartEvent);
      
      expect(component.routeChangeInProgress).toBe(true);
      expect(component.isNavBarRequired).toBe(false);
      expect(component.viewerPage).toBe(true);
      expect(mockChangeDetector.detectChanges).toHaveBeenCalled();
    });

    it('should handle NavigationEnd events correctly', () => {
      component.ngOnInit();
      
      // Set up spies
      jest.spyOn(component as any, 'getChildRouteData');
      jest.spyOn(component as any, 'raiseAppStartTelemetry');
      
      // Simulate navigation end event
      const navEndEvent = new NavigationEnd(1, '/public/logout', '/previous');
      routerEvents.next(navEndEvent);
      
      expect(component.routeChangeInProgress).toBe(false);
      expect(component.currentUrl).toBe('/public/logout');
      expect(component.showFooter).toBe(false);
      expect(component.showNavbar).toBe(false);
      expect(component.raiseAppStartTelemetry).toHaveBeenCalled();
      expect(mockTelemetrySvc.impression).toHaveBeenCalled();
    });

    it('should track previous and current URLs on NavigationEnd', () => {
      component.ngOnInit();
      
      // Simulate first navigation end
      const navEnd1 = new NavigationEnd(1, '/page1', '');
      routerEvents.next(navEnd1);
      
      expect(component.prevUrl).toBe('');
      expect(component.currUrl).toBe('/page1');
      expect(mockUrlService.setPreviousUrl).toHaveBeenCalledWith('');
      
      // Simulate second navigation end
      const navEnd2 = new NavigationEnd(2, '/page2', '/page1');
      routerEvents.next(navEnd2);
      
      expect(component.prevUrl).toBe('/page1');
      expect(component.currUrl).toBe('/page2');
      expect(mockUrlService.setPreviousUrl).toHaveBeenCalledWith('/page1');
    });
  });

  describe('iGOTAIConfig', () => {
    it('should fetch and set iGOTAI configuration', async () => {
      const mockConfig = {
        aiTutor: true,
        iGOTAI: true,
        subTitles: true,
        transcription: true
      };
      
      mockiGOTAIService.iGOTAIConfigReadData.mockReturnValue(of(mockConfig));
      
     // const result = await component['iGOTAIConfig']();
      
      expect(mockiGOTAIService.iGOTAIConfigReadData).toHaveBeenCalledWith({
        request: {
          type: 'page',
          subType: 'iGOTAI',
          action: 'page-configuration',
          component: 'portal',
          rootOrgId: 'orgId123'
        }
      });
      expect(mockConfigSvc.iGOTAIConfig).toEqual(mockConfig);
      expect(component.iGOTAIConfigLoaded).toBe(true);
    //  expect(result).toEqual(mockConfig);
    });

    it('should handle error response correctly', async () => {
      const errorResponse:any = {
        error: {
          status: 404
        }
      };
      
      mockiGOTAIService.iGOTAIConfigReadData.mockReturnValue(of(errorResponse));
      
      const result = await component['iGOTAIConfig']();
      
      expect(component.iGOTAIConfigLoaded).toBe(false);
      expect(result).toEqual(errorResponse);
    });
  });

  describe('Theme methods', () => {
    it('should add jan-bg-change class when changeBg26Jan is called with enabled theme', () => {
      // Mock document.getElementById
      document.body.innerHTML = '<div id="app-bg"></div>';
      mockConfigSvc.overrideThemeChanges = { isEnabled: true };
      
      component.changeBg26Jan();
      
      const appBgElement = document.getElementById('app-bg');
      expect(appBgElement?.classList.contains('jan-bg-change')).toBe(true);
    });

    it('should remove jan-bg-change class when removeBg26Jan is called', () => {
      // Mock document.getElementById
      document.body.innerHTML = '<div id="app-bg" class="jan-bg-change"></div>';
      
      component.removeBg26Jan();
      
      const appBgElement = document.getElementById('app-bg');
      expect(appBgElement?.classList.contains('jan-bg-change')).toBe(false);
    });
  });

  describe('raiseAppStartTelemetry', () => {
    it('should dispatch telemetry event only once', () => {
      component.raiseAppStartTelemetry();
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledTimes(1);
      expect(component.appStartRaised).toBe(true);
      
      // Call again, should not dispatch event
      mockEventSvc.dispatchEvent.mockClear();
      component.raiseAppStartTelemetry();
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('getChildRouteData', () => {
    it('should collect route data from child routes', () => {
      const snapshot = mockActivatedRoute.snapshot;
      const firstChild:any = {
        data: { page: 'test1' },
        firstChild: {
          data: { page: 'test2' },
          firstChild: {
            data: { page: 'test3' },
            firstChild: null
          }
        }
      };
      
      component.currentRouteData = [];
      component.getChildRouteData(snapshot, firstChild);
      
      expect(component.currentRouteData).toEqual([
        { page: 'test1' },
        { page: 'test2' },
        { page: 'test3' }
      ]);
    });
  });

  describe('initAppUpdateCheck', () => {
    it('should subscribe to check for updates in production', () => {
      // Mock environment
      jest.mock('../../../environments/environment', () => ({
        environment: { production: true }
      }));
      
      component.ngAfterViewInit();
      
      // Should check for updates
      expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
    });
  });

  describe('getTourGuide', () => {
    it('should get tour guide status from config service', () => {
      // Emit value from subject
      configSvcUpdateTourGuide.next(true);
      
      const result = component.getTourGuide();
      
      expect(result).toBe(true);
      expect(component.showTour).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return navBarRequired correctly', () => {
      component.isNavBarRequired = true;
      expect(component.navBarRequired).toBe(true);
      
      component.isNavBarRequired = false;
      expect(component.navBarRequired).toBe(false);
    });

    it('should return isShowNavbar correctly', () => {
      component.showNavbar = true;
      expect(component.isShowNavbar).toBe(true);
      
      component.showNavbar = false;
      expect(component.isShowNavbar).toBe(false);
    });

    it('should calculate isCustomHeight based on pathname', () => {
      // Test with public/home path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/public/home' },
        writable: true
      });
      
      expect(component.isCustomHeight).toBe(true);
      
      // Test with other path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/app/dashboard' },
        writable: true
      });
      
      // Reset customHeight
      component.customHeight = false;
      expect(component.isCustomHeight).toBe(false);
    });
  });
});