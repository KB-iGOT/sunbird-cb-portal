import { RootComponent } from './root.component';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SwUpdate } from '@angular/service-worker';
import { LoggerService, ConfigurationsService, ValueService, TelemetryService, EventService, UtilityService } from '@sunbird-cb/utils-v2';
import { MobileAppsService } from '../../services/mobile-apps.service';
import { RootService } from './root.service';
import { BtnPageBackService } from '@sunbird-cb/collection';
import { UrlService } from 'src/app/shared/url.service';
import { of, Subject } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'

describe('RootComponent', () => {
  let component: RootComponent;
  let mockRouter: jest.Mocked<Router>;
  let mockRoute: jest.Mocked<ActivatedRoute>;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockSwUpdate: jest.Mocked<SwUpdate>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockLoggerService: jest.Mocked<LoggerService>;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockValueService: jest.Mocked<ValueService>;
  let mockTelemetryService: jest.Mocked<TelemetryService>;
  let mockEventService: jest.Mocked<EventService>;
  let mockMobileAppsService: jest.Mocked<MobileAppsService>;
  let mockRootService: jest.Mocked<RootService>;
  let mockBtnBackService: jest.Mocked<BtnPageBackService>;
  let mockUrlService: jest.Mocked<UrlService>;
  let mockChangeDetectorRef: { detectChanges: jest.Mock };
  let mockUtilityService: jest.Mocked<UtilityService>;

  const routerEventsSubject = new Subject<any>();

  beforeEach(() => {
    // Create mock implementations
    mockRouter = {
      events: routerEventsSubject.asObservable(),
      navigateByUrl: jest.fn(),
      routerState: {
        snapshot: {
          root: {
            firstChild: null
          }
        }
      } as any
    } as unknown as jest.Mocked<Router>;

    mockRoute = {
      snapshot: {
        root: {
          firstChild: null
        },
        queryParams: of({})
      } as any,
      queryParams: of({})
    } as jest.Mocked<ActivatedRoute>;

    mockHttpClient = {
      get: jest.fn().mockReturnValue(of({ data: {} }))
    } as any;

    mockSwUpdate = {
      isEnabled: true,
      available: new Subject(),
      checkForUpdate: jest.fn(),
      activateUpdate: jest.fn().mockResolvedValue(true)
    } as any;

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    } as any;

    mockLoggerService = {
      log: jest.fn()
    } as any;

    mockConfigService = {
      sitePath: '/mock-path',
      userProfile: { userId: 'test-user' },
      unMappedUser: {
        profileDetails: {
          profileStatus: 'active',
          employmentDetails: {
            departmentName: 'test-dept'
          }
        }
      },
      updateTourGuideMethod: jest.fn(),
      updateTourGuide: of(false)
    } as any;

    mockValueService = {
      isXSmall$: of(false)
    } as any;

    mockTelemetryService = {
      impression: jest.fn()
    } as any;

    mockEventService = {
      dispatchEvent: jest.fn()
    } as any;

    mockMobileAppsService = {
      init: jest.fn(),
      mobileTopHeaderVisibilityStatus: of(true)
    } as any;

    mockRootService = {
      showNavbarDisplay$: of(true),
      getCookie: jest.fn()
    } as any;

    mockBtnBackService = {
      initialize: jest.fn()
    } as any;

    mockUrlService = {
      setPreviousUrl: jest.fn()
    } as any;

    mockChangeDetectorRef = {
      detectChanges: jest.fn()
    };

    mockUtilityService = {
      setRouteData: jest.fn(),
      routeData: {}
    } as any;

    // Set up window mock
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/mock-path',
        origin: 'http://localhost'
      },
      writable: true
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 1300,
      writable: true
    });

    // Instantiate component with mocks
    component = new RootComponent(
      mockRouter,
      mockRoute,
      {} as any, // ApplicationRef
      mockLoggerService,
      mockSwUpdate,
      mockDialog,
      mockHttpClient,
      mockConfigService,
      mockValueService,
      mockTelemetryService,
      mockEventService,
      mockMobileAppsService,
      mockRootService,
      mockBtnBackService,
      mockChangeDetectorRef as any,
      mockUtilityService,
      mockUrlService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize component', () => {
      component.ngOnInit();
      expect(mockMobileAppsService.init).toHaveBeenCalled();
      expect(mockBtnBackService.initialize).toHaveBeenCalled();
    });

    it('should check iframe status', () => {
      component.ngOnInit();
      expect(component.isInIframe).toBeFalsy();
    });
  });

  describe('Router Events', () => {
    it('should handle navigation start', () => {
      component.ngOnInit();
      routerEventsSubject.next(new NavigationStart(1, '/test'));
      
      expect(component.routeChangeInProgress).toBeTruthy();
      expect(component.showNavbar).toBeTruthy();
    });

    it('should handle navigation end', () => {
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      
      expect(component.routeChangeInProgress).toBeFalsy();
    });
  });

  describe('Custom Methods', () => {
    it('should skip to main content', () => {
      const mockSkipper = { nativeElement: { focus: jest.fn() } };
      component.skipper = mockSkipper as any;
      
      component.skipToMainContent();
      expect(mockSkipper.nativeElement.focus).toHaveBeenCalled();
    });

    it('should get child route data', () => {
      // const mockSnapshot = {
      //   root: {
      //     firstChild: {
      //       data: { testData: 'test' },
      //       firstChild: null
      //     }
      //   }
      // };

      // component.getChildRouteData(mockSnapshot as any, mockSnapshot.root.firstChild);
      expect(component.currentRouteData).toEqual([{ testData: 'test' }]);
    });
  });

  describe('Background and Theme', () => {
    it('should change background for 26 Jan', () => {
      const mockElement = { classList: { add: jest.fn(), remove: jest.fn() } };
      document.getElementById = jest.fn().mockReturnValue(mockElement);
      
      mockConfigService.overrideThemeChanges = { isEnabled: true };
      
      component.changeBg26Jan();
      expect(mockElement.classList.add).toHaveBeenCalledWith('jan-bg-change');
    });

    it('should remove background for 26 Jan', () => {
      const mockElement = { classList: { add: jest.fn(), remove: jest.fn() } };
      document.getElementById = jest.fn().mockReturnValue(mockElement);
      
      component.removeBg26Jan();
      expect(mockElement.classList.remove).toHaveBeenCalledWith('jan-bg-change');
    });
  });

  describe('App Update Check', () => {
    it('should check for app updates in production', () => {
      // Mock production environment
      (component as any).environment = { production: true };
      
      component.ngAfterViewInit();
      
      expect(mockLoggerService.log).toHaveBeenCalledWith('LOGGING IN ROOT FOR PWA INIT CHECK');
    });
  });

  describe('Telemetry', () => {
    it('should raise app start telemetry', () => {
      component.raiseAppStartTelemetry();
      
      expect(mockEventService.dispatchEvent).toHaveBeenCalled();
      expect(component.appStartRaised).toBeTruthy();
    });
  });
});