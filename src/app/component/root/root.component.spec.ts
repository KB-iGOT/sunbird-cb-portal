import { RootComponent } from './root.component';
import {  NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { of, Subject } from 'rxjs';

// Mock all services and dependencies
jest.mock('@sunbird-cb/utils-v2');
jest.mock('@sunbird-cb/collection');
jest.mock('../../services/mobile-apps.service');
jest.mock('./root.service');
jest.mock('../../shared/url.service');

describe('RootComponent', () => {
  let component: RootComponent;
  
  // Mock all dependencies
  const mockRouter = {
    events: new Subject(),
    url: '/page/home',
    navigateByUrl: jest.fn()
  };
  
  const mockActivatedRoute = {
    snapshot: {
      queryParams: {},
      root: {
        firstChild: {
          data: { pageId: 'test-page', module: 'test-module' }
        }
      },
      firstChild: null
    },
    queryParams: of({})
  };
  
  const mockAppRef = {
    isStable: of(true)
  };
  
  const mockLoggerService = {
    log: jest.fn()
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
    get: jest.fn().mockReturnValue(of({ data: { test: 'data' } }))
  };
  
  const mockConfigSvc = {
    sitePath: 'test-path',
    userProfile: { userId: 'test-user' },
    unMappedUser: {
      profileDetails: {
        get_started_tour: { skipped: false, visited: false },
        profileStatus: 'active',
        employmentDetails: { departmentName: 'test-dept' }
      }
    },
    updateTourGuide: new Subject(),
    overrideThemeChanges: { isEnabled: false },
    updateTourGuideMethod: jest.fn()
  };
  
  const mockValueSvc = {
    isXSmall$: of(false)
  };
  
  const mockTelemetrySvc = {
    impression: jest.fn()
  };
  
  const mockEventSvc = {
    dispatchEvent: jest.fn()
  };
  
  const mockMobileAppsSvc = {
    init: jest.fn(),
    mobileTopHeaderVisibilityStatus: of(true)
  };
  
  const mockRootSvc = {
    showNavbarDisplay$: of(true),
    getCookie: jest.fn().mockReturnValue('test-cookie')
  };
  
  const mockBtnBackSvc = {
    initialize: jest.fn()
  };
  
  const mockChangeDetector = {
    detectChanges: jest.fn()
  };
  
  const mockUtilitySvc = {
    setRouteData: jest.fn(),
    routeData: { pageId: 'test-page', module: 'test-module' }
  };
  
  const mockUrlService = {
    setPreviousUrl: jest.fn()
  };
  
  const mockElementRef = {
    nativeElement: {
      value: 'test-value',
      focus: jest.fn()
    }
  };
  
  const mockViewContainerRef = {};
  
  // Initialize component before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create component instance with all mocked dependencies
    component = new RootComponent(
      mockRouter as any,
      mockActivatedRoute as any,
      mockAppRef as any,
      mockLoggerService as any,
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
      mockUrlService as any
    );
    
    // Set ViewChild properties manually
    component.previewContainerViewRef = mockViewContainerRef as any;
    component.appUpdateTitleRef = mockElementRef as any;
    component.appUpdateBodyRef = mockElementRef as any;
    component.skipper = mockElementRef as any;
    
    // Mock window location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/page/home',
        origin: 'http://test-origin'
      },
      writable: true
    });
    
    // Mock window self and top
    Object.defineProperty(window, 'self', { value: window });
    Object.defineProperty(window, 'top', { value: window });
    
    // Mock document.getElementById
    document.getElementById = jest.fn().mockReturnValue({
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    });
    
    // Mock window.caches
    // global.caches = {
    //   keys: jest.fn().mockResolvedValue(['test-cache']),
    //   delete: jest.fn().mockResolvedValue(undefined)
    // } as any;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize mobile apps service on construction', () => {
    expect(mockMobileAppsSvc.init).toHaveBeenCalled();
  });

  it('should initialize button back service on ngOnInit', () => {
    component.ngOnInit();
    expect(mockBtnBackSvc.initialize).toHaveBeenCalled();
  });

  it('should handle NavigationStart events', () => {
    component.ngOnInit();
    mockRouter.events.next(new NavigationStart(1, '/page/home'));
    
    expect(component.routeChangeInProgress).toBe(true);
    expect(mockChangeDetector.detectChanges).toHaveBeenCalled();
  });

  it('should handle NavigationEnd events', () => {
    component.ngOnInit();
    mockRouter.events.next(new NavigationEnd(1, '/page/home', ''));
    
    expect(component.routeChangeInProgress).toBe(false);
    expect(component.currentUrl).toBe('/page/home');
    expect(mockUtilitySvc.setRouteData).toHaveBeenCalled();
    expect(mockTelemetrySvc.impression).toHaveBeenCalled();
  });

  it('should handle NavigationCancel events', () => {
    component.ngOnInit();
    mockRouter.events.next(new NavigationCancel(1, '/page/home', ''));
    
    expect(component.routeChangeInProgress).toBe(false);
  });

  it('should handle NavigationError events', () => {
    component.ngOnInit();
    mockRouter.events.next(new NavigationError(1, '/page/home', new Error('test error')));
    
    expect(component.routeChangeInProgress).toBe(false);
  });

  it('should update showNavbar based on rootSvc.showNavbarDisplay$', () => {
    component.ngOnInit();
    expect(component.showNavbar).toBe(true);
  });

  it('should update navBarRequired property correctly', () => {
    component.isNavBarRequired = true;
    expect(component.navBarRequired).toBe(true);
    
    component.isNavBarRequired = false;
    expect(component.navBarRequired).toBe(false);
  });

  it('should update isShowNavbar property correctly', () => {
    component.showNavbar = true;
    expect(component.isShowNavbar).toBe(true);
    
    component.showNavbar = false;
    expect(component.isShowNavbar).toBe(false);
  });

  it('should update isCustomHeight property correctly for /public/home path', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/public/home' },
      writable: true
    });
    
    expect(component.isCustomHeight).toBe(true);
  });

  it('should update isCustomHeight property correctly for /public/faq path', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/public/faq' },
      writable: true
    });
    
    expect(component.isCustomHeight).toBe(true);
  });

  it('should get header footer configuration', () => {
    //const result = component.getHeaderFooterConfiguration();
    expect(mockHttpClient.get).toHaveBeenCalledWith('test-path/page/right-nav-config.json');
  });

  it('should skip to main content when skipToMainContent is called', () => {
    component.skipToMainContent();
    expect(mockElementRef.nativeElement.focus).toHaveBeenCalled();
  });

  it('should check for updates when initAppUpdateCheck is called', () => {
    // Mock environment.production
   // (global as any).environment = { production: true };
    
    component.initAppUpdateCheck();
    expect(mockLoggerService.log).toHaveBeenCalled();
  });

  // it('should handle app update when available', done => {
  //   // Mock environment.production
  //   //(global as any).environment = { production: true };
    
  //   component.initAppUpdateCheck();
  //   mockSwUpdate.available.next({} as any);
    
  //   setTimeout(() => {
  //     expect(mockDialog.open).toHaveBeenCalled();
  //     expect(mockSwUpdate.activateUpdate).toHaveBeenCalled();
  //     done();
  //   }, 0);
  // });

  it('should handle getTourGuide correctly', () => {
    mockConfigSvc.updateTourGuide.next(true);
    expect(component.getTourGuide()).toBe(true);
    
    mockConfigSvc.updateTourGuide.next(false);
    expect(component.getTourGuide()).toBe(false);
  });

  it('should detect changes in ngAfterViewChecked', () => {
    component.ngAfterViewChecked();
    expect(mockChangeDetector.detectChanges).toHaveBeenCalled();
  });

  it('should handle changeBg26Jan when theme is enabled', () => {
    mockConfigSvc.overrideThemeChanges = { isEnabled: true };
    component.changeBg26Jan();
    
    expect(document.getElementById).toHaveBeenCalledWith('app-bg');
    expect(document.getElementById('app-bg')?.classList.add).toHaveBeenCalledWith('jan-bg-change');
  });

  it('should handle changeBg26Jan when theme is disabled', () => {
    mockConfigSvc.overrideThemeChanges = { isEnabled: false };
    component.changeBg26Jan();
    
    expect(document.getElementById).toHaveBeenCalledWith('app-bg');
    expect(document.getElementById('app-bg')?.classList.remove).toHaveBeenCalledWith('jan-bg-change');
  });

  it('should handle removeBg26Jan', () => {
    component.removeBg26Jan();
    
    expect(document.getElementById).toHaveBeenCalledWith('app-bg');
    expect(document.getElementById('app-bg')?.classList.remove).toHaveBeenCalledWith('jan-bg-change');
  });

  it('should raise app start telemetry only once', () => {
    component.appStartRaised = false;
    component.raiseAppStartTelemetry();
    expect(mockEventSvc.dispatchEvent).toHaveBeenCalled();
    expect(component.appStartRaised).toBe(true);
    
    // Reset mock
    mockEventSvc.dispatchEvent.mockClear();
    
    // Call again, should not dispatch event
    component.raiseAppStartTelemetry();
    expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled();
  });

  it('should handle getChildRouteData recursively', () => {
    const snapshot = mockActivatedRoute.snapshot;
    const firstChild = {
      data: { test: 'data1' },
      firstChild: {
        data: { test: 'data2' },
        firstChild: null
      }
    };
    
    component.currentRouteData = [];
    component.getChildRouteData(snapshot as any, firstChild as any);
    
    expect(component.currentRouteData).toEqual([
      { test: 'data1' },
      { test: 'data2' }
    ]);
  });

  it('should redirect to profile if isNotMyUser and isIgotOrg', () => {
    mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
    mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
    
    component.ngOnInit();
    
    expect(component.disableHeightOnTop).toBe(true);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
  });

  it('should not redirect if not isNotMyUser or not isIgotOrg', () => {
    mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'active';
    mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
    
    component.ngOnInit();
    
    expect(component.disableHeightOnTop).toBe(false);
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });
});
