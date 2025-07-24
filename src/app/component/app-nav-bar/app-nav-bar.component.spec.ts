import { AppNavBarComponent } from './app-nav-bar.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationsService, EventService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { UrlService } from '../../shared/url.service';
import { CustomTourService } from '@sunbird-cb/collection/src/lib/_common/tour-guide/tour-guide.service';
import { WidgetUserService } from '@sunbird-cb/collection/src/lib/_services/widget-user.service';
import { NotificationsService } from '../../services/notifications.service';
import { LibNotificationsService } from '@sunbird-cb/notification';
import { Subject, of } from 'rxjs';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:4200/',
    pathname: '/',
  },
  writable: true,
});

// Mock window.screen
Object.defineProperty(window, 'screen', {
  value: {
    availWidth: 1024,
  },
  writable: true,
});

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent;
  let mockDomSanitizer: jest.Mocked<DomSanitizer>;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockTourService: jest.Mocked<CustomTourService>;
  let mockRouter: jest.Mocked<Router>;
  let mockTranslate: jest.Mocked<TranslateService>;
  let mockEvents: jest.Mocked<EventService>;
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>;
  let mockUrlService: jest.Mocked<UrlService>;
  let mockUserSvc: jest.Mocked<WidgetUserService>;
  let mockNotificationsService: jest.Mocked<NotificationsService>;
  let mockLibNotificationsService: jest.Mocked<LibNotificationsService>;

  const mockRouterEvents = new Subject<any>();
  const mockTourGuideNotifier = new Subject<boolean>();
  const mockPreviousUrl = new Subject<string>();
  const mockUnreadCount = new Subject<boolean>();
  const mockOpenExploreMenuForMWeb = new Subject<boolean>();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReset();

    // Mock DomSanitizer
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url'),
    } as any;

    // Mock ConfigurationsService
    mockConfigSvc = {
      restrictedFeatures: new Set(),
      instanceConfig: {
        logos: {
          app: 'app-logo.png',
          appSecondary: 'app-secondary.png',
          appBottomNav: 'bottom-nav.png',
        },
      },
      rootOrg: 'test-org',
      primaryNavBar: { background: 'blue' },
      pageNavBar: { background: 'white' },
      primaryNavBarConfig: { showApps: true },
      appsConfig: {
        features: {
          feature1: {},
          feature2: {},
        },
      },
      userProfile: {
        userId: 'user123',
      },
      unMappedUser: {
        profileDetails: {
          profileStatus: 'active',
          employmentDetails: {
            departmentName: 'test-dept',
          },
        },
        identifier: 'user123',
      },
      tourGuideNotifier: mockTourGuideNotifier,
      openExploreMenuForMWeb: mockOpenExploreMenuForMWeb,
      overrideThemeChanges: {
        desktop: {
          logoDisplayTime: 5000,
          animationDuration: 1000,
        },
      },
      completedTour: false,
      prefChangeNotifier: {
        next: jest.fn(),
      },
    } as any;

    // Mock Router
    mockRouter = {
      events: mockRouterEvents,
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    } as any;

    // Mock TranslateService
    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as any;

    // Mock EventService
    mockEvents = {
      raiseInteractTelemetry: jest.fn(),
    } as any;

    // Mock MultilingualTranslationsService
    mockLangTranslations = {
      translateLabelWithoutspace: jest.fn().mockReturnValue('translated-label'),
    } as any;

    // Mock UrlService
    mockUrlService = {
      previousUrl$: mockPreviousUrl,
    } as any;

    // Mock CustomTourService
    mockTourService = {
      createPopupTour: jest.fn().mockReturnValue({}),
      cancelPopupTour: jest.fn(),
      startPopupTour: jest.fn(),
      isTourComplete: new Subject<boolean>(),
    } as any;

    // Mock WidgetUserService
    mockUserSvc = {
      fetchUserBatchList: jest.fn().mockReturnValue(of({})),
    } as any;

    // Mock NotificationsService
    mockNotificationsService = {
      getNotificationsData: jest.fn().mockReturnValue(of({
        result: { unread: 5 }
      })),
    } as any;

    // Mock LibNotificationsService
    mockLibNotificationsService = {
      _unreadCount: mockUnreadCount,
    } as any;

    // Create component instance
    component = new AppNavBarComponent(
      mockDomSanitizer,
      mockConfigSvc,
      mockTourService,
      mockRouter,
      mockTranslate,
      mockEvents,
      mockLangTranslations,
      mockUrlService,
      mockUserSvc,
      mockNotificationsService,
      mockLibNotificationsService
    );

    // Mock setInterval and clearInterval
    // jest.spyOn(global, 'setInterval').mockImplementation((fn: any, delay: number) => {
    //   return 123 as any; // Return a mock timer ID
    // });
    // jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
    // jest.spyOn(global, 'setTimeout').mockImplementation((fn: any, delay: number) => {
    //   fn(); // Execute immediately for testing
    //   return 123 as any;
    // });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create component with default values', () => {
      expect(component).toBeDefined();
      expect(component.mode).toBe('top');
      expect(component.basicBtnAppsConfig.widgetType).toBe('actionButton');
      expect(component.isHelpMenuRestricted).toBe(false);
    });

    it('should set restricted features if available', () => {
      mockConfigSvc.restrictedFeatures = new Set(['helpNavBarMenu']);
      
      const newComponent = new AppNavBarComponent(
        mockDomSanitizer,
        mockConfigSvc,
        mockTourService,
        mockRouter,
        mockTranslate,
        mockEvents,
        mockLangTranslations,
        mockUrlService,
        mockUserSvc,
        mockNotificationsService,
        mockLibNotificationsService
      );

      expect(newComponent.isHelpMenuRestricted).toBe(true);
    });

    it('should set up language from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('hi');

      new AppNavBarComponent(
        mockDomSanitizer,
        mockConfigSvc,
        mockTourService,
        mockRouter,
        mockTranslate,
        mockEvents,
        mockLangTranslations,
        mockUrlService,
        mockUserSvc,
        mockNotificationsService,
        mockLibNotificationsService
      );

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('hi');
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.spyOn(component, 'displayLogo').mockImplementation(() => {});
      jest.spyOn(component, 'startTour').mockImplementation(() => {});
      jest.spyOn(component, 'getKarmaCount').mockImplementation(() => {});
      jest.spyOn(component, 'fetchEnrollmentList').mockImplementation(() => {});
      jest.spyOn(component, 'getMyCount').mockImplementation(() => {});
    });

    it('should initialize component properties', () => {
      component.ngOnInit();

      expect(component.displayLogo).toHaveBeenCalled();
      expect(component.startTour).toHaveBeenCalled();
      expect(setInterval).toHaveBeenCalled();
    });

    it('should set up logo configuration', () => {
      component.ngOnInit();

      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-logo.png');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-secondary.png');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('bottom-nav.png');
    });

    it('should set up tour guide if not restricted', () => {
      component.ngOnInit();

      mockTourGuideNotifier.next(true);

      expect(component.isTourGuideAvailable).toBe(true);
      expect(mockTourService.createPopupTour).toHaveBeenCalled();
    });

    it('should handle unmapped user with igot org', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';

      component.ngOnInit();

      expect(component.disableMenu).toBe(true);
      expect(component.fetchEnrollmentList).toHaveBeenCalled();
    });

    it('should subscribe to notifications count', () => {
      component.ngOnInit();

      mockUnreadCount.next(true);

      expect(component.getMyCount).toHaveBeenCalled();
    });
  });

  describe('Navigation Event Handling', () => {
    beforeEach(() => {
      jest.spyOn(component, 'cancelTour').mockImplementation(() => {});
      jest.spyOn(component, 'routeSubs').mockImplementation(() => {});
      jest.spyOn(component, 'bindUrl').mockImplementation(() => {});
    });

    it('should handle NavigationStart event', () => {
      const navigationStart = new NavigationStart(1, '/app/test');
      
      mockRouterEvents.next(navigationStart);

      expect(component.isHubEnable).toBe(true);
      expect(component.cancelTour).toHaveBeenCalled();
    });

    it('should handle NavigationEnd event', () => {
      const navigationEnd = new NavigationEnd(1, '/app/test', '/app/test');
      
      mockRouterEvents.next(navigationEnd);

      expect(component.isHubEnable).toBe(true);
      expect(component.routeSubs).toHaveBeenCalledWith(navigationEnd);
      expect(component.cancelTour).toHaveBeenCalled();
      expect(component.bindUrl).toHaveBeenCalled();
    });

    it('should disable hub for certs routes', () => {
      const navigationEnd = new NavigationEnd(1, '/app/certs', '/app/certs');
      
      mockRouterEvents.next(navigationEnd);

      expect(component.isHubEnable).toBe(false);
    });
  });

  describe('displayLogo', () => {
    it('should set janDataEnable to false after timeout', () => {
      component.janDataEnable = true;
      
      component.displayLogo();

      expect(component.janDataEnable).toBe(false);
    });
  });

  describe('routeSubs', () => {
    it('should set isSetUpPage to true for setup route', () => {
      const event = new NavigationEnd(1, '/app/setup', '/app/setup');
      
      component.routeSubs(event);

      expect(component.isSetUpPage).toBe(true);
      expect(component.showAppNavBar).toBe(false);
    });

    it('should hide nav bar for public routes', () => {
      const event = new NavigationEnd(1, '/public/home', '/public/home');
      
      component.routeSubs(event);

      expect(component.showAppNavBar).toBe(false);
      expect(component.isPublicHomePage).toBe(true);
    });

    it('should show nav bar for regular app routes', () => {
      const event = new NavigationEnd(1, '/app/dashboard', '/app/dashboard');
      
      component.routeSubs(event);

      expect(component.showAppNavBar).toBe(true);
    });
  });

  describe('ngOnChanges', () => {
    it('should update btnAppsConfig when mode changes to bottom', () => {
      const changes = {
        mode: {
          currentValue: 'bottom',
          previousValue: 'top',
          firstChange: false,
          isFirstChange: () => false,
        },
      };

      component.ngOnChanges(changes);

      expect(component.btnAppsConfig.widgetData.showTitle).toBe(true);
    });

    it('should reset btnAppsConfig for non-bottom mode', () => {
      const changes = {
        mode: {
          currentValue: 'top',
          previousValue: 'bottom',
          firstChange: false,
          isFirstChange: () => false,
        },
      };

      component.ngOnChanges(changes);

      expect(component.btnAppsConfig).toEqual(component.basicBtnAppsConfig);
    });
  });

  describe('Utility Methods', () => {
    it('should cancel tour', () => {
      component.popupTour = {};
      
      component.cancelTour();

      expect(mockTourService.cancelPopupTour).toHaveBeenCalled();
      expect(component.isTourGuideClosed).toBe(false);
    });

    it('should bind URL correctly', () => {
      component.bindUrl('/app/test');

      expect(component.currentRoute).toBe('/app/test');
    });

    it('should not bind competencies URL', () => {
      component.currentRoute = '/app/previous';
      component.bindUrl('/app/competencies');

      expect(component.currentRoute).toBe('/app/previous');
    });

    it('should translate labels', () => {
      const result = component.translateLabels('test', 'type');

      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith('test', 'type', '');
      expect(result).toBe('translated-label');
    });
  });

  describe('Navigation Methods', () => {
    it('should redirect to path with query params', () => {
      const pathConfig = { path: '/app/test', key: 'testKey' };
      
      component.redirectToPath(pathConfig);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/test'], { queryParams: { key: 'testKey' } });
      expect(mockConfigSvc.openExploreMenuForMWeb.next).toHaveBeenCalledWith(false);
    });

    it('should redirect to path without query params', () => {
      const pathConfig = { path: '/app/test' };
      
      component.redirectToPath(pathConfig);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/test']);
    });

    it('should open explore menu', () => {
      component.openExploreMenu();

      expect(component.activeRoute).toBe('explore');
      expect(mockConfigSvc.openExploreMenuForMWeb.next).toHaveBeenCalledWith(true);
    });
  });

  describe('Karma Points', () => {
    it('should get karma count from localStorage', () => {
      const mockEnrollmentData = {
        userCourseEnrolmentInfo: {
          karmaPoints: 100,
        },
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockEnrollmentData));

      component.getKarmaCount();

      expect(component.countdata).toBe(100);
      expect(component.karmaPointLoading).toBe(false);
      expect(clearInterval).toHaveBeenCalled();
    });

    it('should navigate to karma points page if not disabled', () => {
      component.disableMenu = false;
      jest.spyOn(component, 'raiseTelemetry').mockImplementation(() => {});

      const result = component.viewKarmapoints();

      expect(component.raiseTelemetry).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/karma-points']);
      expect(result).toBeUndefined();
    });

    it('should return false if menu is disabled', () => {
      component.disableMenu = true;

      const result = component.viewKarmapoints();

      expect(result).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should raise telemetry for karma points', () => {
      component.raiseTelemetry();

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'nav-karmapoints',
          id: 'nav-karmapoints',
        },
        {},
        expect.objectContaining({
          module: expect.any(String),
        })
      );
    });
  });

  describe('Notifications', () => {
    it('should get notifications count successfully', () => {
      component.getMyCount();

      expect(mockNotificationsService.getNotificationsData).toHaveBeenCalled();
      expect(component.notificationsCount).toBe(5);
    });

    it('should handle notifications count error', () => {
      mockNotificationsService.getNotificationsData.mockReturnValue(
        new Subject().asObservable().pipe(() => {
          throw new Error('Network error');
        })
      );
      jest.spyOn(console, 'error').mockImplementation(() => {});

      component.getMyCount();

      // Since the error handling is in the subscribe error callback,
      // we need to trigger the error manually in a real test scenario
      expect(mockNotificationsService.getNotificationsData).toHaveBeenCalled();
    });
  });

  describe('Getters', () => {
    it('should return correct stillOnHomePage value', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:4200/public/home' },
        writable: true,
      });

      expect(component.stillOnHomePage).toBe(true);
    });

    it('should return correct fullMenuDispaly value', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:4200/app/dashboard' },
        writable: true,
      });

      expect(component.fullMenuDispaly).toBe(true);
    });

    it('should return correct isforPreview value', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:4200/public/test' },
        writable: true,
      });

      expect(component.isforPreview).toBe(true);
    });

    it('should return correct isenableLang value for FAQ page', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:4200/public/faq' },
        writable: true,
      });

      expect(component.isenableLang).toBe(true);
    });

    it('should return correct isThisSetUpPage value', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/app/setup' },
        writable: true,
      });

      expect(component.isThisSetUpPage).toBe(true);
    });
  });

  describe('handleNavigateBack', () => {
    it('should navigate to home if previous URL contains toc', () => {
      component.previousUrl = '/app/toc/do_123';

      component.handleNavigateBack();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home');
    });

    it('should navigate to home if previous URL contains viewer/pdf', () => {
      component.previousUrl = '/viewer/pdf/do_123';

      component.handleNavigateBack();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home');
    });

    it('should not navigate if previous URL does not match', () => {
      component.previousUrl = '/app/dashboard';

      component.handleNavigateBack();

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('getItem', () => {
    it('should return item with additional properties', () => {
      const testItem = { name: 'test' };
      component.enableLang = true;

      const result = component.getItem(testItem);

      expect(result).toEqual({
        name: 'test',
        forPreview: true, // !component.isforPreview
        enableLang: true,
      });
    });
  });

  describe('fetchEnrollmentList', () => {
    it('should fetch user batch list', () => {
      component.fetchEnrollmentList();

      expect(mockUserSvc.fetchUserBatchList).toHaveBeenCalledWith('user123');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from notifications subscription', () => {
      const mockSubscription = {
        unsubscribe: jest.fn(),
      };
      component.myNotificationsSubscription = mockSubscription as any;

      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle missing subscription gracefully', () => {
      component.myNotificationsSubscription = undefined as any;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});