// Import only the types for type checking, actual implementations will be mocked
import { AppNavBarComponent } from './app-nav-bar.component';
import {  NavigationStart } from '@angular/router';
// Mock required modules
jest.mock('@angular/core');
jest.mock('@angular/router');
jest.mock('@angular/platform-browser');
jest.mock('@ngx-translate/core');
jest.mock('@sunbird-cb/collection');
jest.mock('@sunbird-cb/resolver');
jest.mock('@sunbird-cb/utils-v2');

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent;
  let mockDomSanitizer: any;
  let mockConfigService: any;
  let mockTourService: any;
  let mockRouter: any;
  let mockTranslateService: any;
  let mockEventService: any;
  let mockLangTranslations: any;
  let mockUrlService: any;
  let mockWidgetUserService: any;
  let mockRouterEvents: any[];

  beforeEach(() => {
    // Create all the mocks needed for the component
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn(url => `sanitized-${url}`),
    };

    mockConfigService = {
      restrictedFeatures: new Set(['feature1', 'helpNavBarMenu']),
      unMappedUser: {
        profileDetails: {
          profileStatus: 'NOT-MY-USER',
          employmentDetails: {
            departmentName: 'IGOT'
          }
        }
      },
      rootOrg: 'test-org',
      userProfile: {
        userId: 'test-user-id'
      },
      instanceConfig: {
        logos: {
          app: 'test-app-logo',
          appSecondary: 'test-secondary-logo',
          appBottomNav: 'test-bottom-nav-logo'
        },
        showNavBarInSetup: false
      },
      appsConfig: {
        features: {
          feature1: {},
          feature2: {}
        }
      },
      primaryNavBar: { color: 'blue' },
      pageNavBar: { color: 'red' },
      primaryNavBarConfig: { config: 'test' },
      tourGuideNotifier: {
        subscribe: jest.fn(callback => {
          callback(true);
          return { unsubscribe: jest.fn() };
        })
      },
      prefChangeNotifier: {
        next: jest.fn()
      },
      openExploreMenuForMWeb: {
        next: jest.fn()
      },
      overrideThemeChanges: {
        desktop: {
          logoDisplayTime: 5000,
          animationDuration: 2000
        }
      },
      completedTour: false
    };

    mockTourService = {
      createPopupTour: jest.fn().mockReturnValue({}),
      cancelPopupTour: jest.fn(),
      startPopupTour: jest.fn(),
      isTourComplete: {
        subscribe: jest.fn(callback => {
          callback(true);
          return { unsubscribe: jest.fn() };
        })
      }
    };

    // Create an array to hold router events
    mockRouterEvents = [];

    mockRouter = {
      events: {
        subscribe: jest.fn(callback => {
          // Store the callback so we can manually trigger it
          mockRouterEvents.push(callback);
          return { unsubscribe: jest.fn() };
        })
      },
      navigate: jest.fn(),
      navigateByUrl: jest.fn()
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };

    // Define WsEvents for telemetry
    // global.WsEvents = {
    //   EnumTelemetrymodules: {
    //     KARMAPOINTS: 'karma-points'
    //   }
    // };

    mockEventService = {
      raiseInteractTelemetry: jest.fn()
    };

    mockLangTranslations = {
      translateLabelWithoutspace: jest.fn((label) => `translated-${label}`)
    };

    mockUrlService = {
      previousUrl$: {
        subscribe: jest.fn(callback => {
          callback('/previous-url');
          return { unsubscribe: jest.fn() };
        })
      }
    };

    mockWidgetUserService = {
      fetchUserBatchList: jest.fn(() => ({
        subscribe: jest.fn(callback => {
          callback({ data: 'test' });
          return { unsubscribe: jest.fn() };
        })
      }))
    };

    // Mock localStorage
    // const mockLocalStorage: Record<string, string> = {
    //   'websiteLanguage': 'en',
    //   'userEnrollmentCount': JSON.stringify({
    //     userCourseEnrolmentInfo: {
    //       karmaPoints: 100
    //     }
    //   }),
    //   'activeRoute': 'home'
    // };

    // Object.defineProperty(global, 'localStorage', {
    //   value: {
    //     getItem: jest.fn(key => mockLocalStorage[key] || null),
    //     setItem: jest.fn((key, value) => {
    //       mockLocalStorage[key] = value.toString();
    //     }),
    //     removeItem: jest.fn(key => {
    //       delete mockLocalStorage[key];
    //     })
    //   },
    //   writable: true
    // });

    // // Mock window.location
    // Object.defineProperty(global, 'window', {
    //   value: {
    //     location: {
    //       href: 'https://test.com/page/home',
    //       pathname: '/page/home'
    //     },
    //     screen: {
    //       availWidth: 1024
    //     },
    //     fs: {
    //       readFile: jest.fn()
    //     }
    //   },
    //   writable: true
    // });

    // // Mock clearInterval and setInterval
    // global.clearInterval = jest.fn();
    // global.setInterval = jest.fn().mockImplementation((callback, time) => {
    //   callback();
    //   return 123; // Return some interval ID
    // });

    // Create component manually
    component = new AppNavBarComponent(
      mockDomSanitizer,
      mockConfigService,
      mockTourService,
      mockRouter,
      mockTranslateService,
      mockEventService,
      mockLangTranslations,
      mockUrlService,
      mockWidgetUserService
    );

    // Manually assign properties that would normally be set by decorators
    component.mode = 'top';
    component.headerFooterConfigData = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper to simulate router navigation events
  function simulateNavigationStart(url: string) {
    mockRouterEvents.forEach(callback => {
      callback(new NavigationStart(1, url));
    });
  }

  // function simulateNavigationEnd(url: string, prevUrl: string = '') {
  //   mockRouterEvents.forEach(callback => {
  //     callback(new NavigationEnd(1, url, prevUrl));
  //   });
  // }

  describe('Basic Tests', () => {
    it('should create component', () => {
      expect(component).toBeDefined();
    });

    it('should use language from localStorage', () => {
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslateService.use).toHaveBeenCalledWith('en');
    });

    it('should set isHubEnable to false for cert URLs', () => {
      simulateNavigationStart('/app/certs');
      expect(component.isHubEnable).toBe(false);
      expect(mockTourService.cancelPopupTour).toHaveBeenCalled();
    });
  });

  describe('Component Initialization', () => {
    it('should initialize component properties in ngOnInit', () => {
      // We'll manually call ngOnInit even though it's called in the constructor
      // in a real application, to test the initialization logic
      component.ngOnInit();
      
      // Test basic initialization properties
      expect(component.isLoggedIn).toBe(true);
      expect(component.appIcon).toBe('sanitized-test-app-logo');
      expect(component.instanceVal).toBe('test-org');
      expect(component.featureApps).toEqual(['feature1', 'feature2']);
      expect(component.isHelpMenuRestricted).toBe(true);
      
      // Test that interval was set up
      //expect(global.setInterval).toHaveBeenCalled();
    });
  });

  // describe('Router Navigation Handling', () => {
  //   it('should handle navigation end events for home page', () => {
  //     // Initialize component first
  //     component.ngOnInit();
      
  //     // Simulate navigation end for home page
  //     simulateNavigationEnd('/page/home');
      
  //     // Check the component state updates
  //     expect(component.activeRoute).toBe('home');
  //     expect(component.showAppNavBar).toBe(false);
  //   });
    
  //   it('should handle navigation end events for explore page', () => {
  //     simulateNavigationEnd('/page/explore');
  //     expect(component.activeRoute).toBe('explorer');
  //   });

  //   it('should handle navigation end events for search page', () => {
  //     simulateNavigationEnd('/app/globalsearch');
  //     expect(component.activeRoute).toBe('search');
  //   });
    
  //   it('should set showAppNavBar false for public pages', () => {
  //     simulateNavigationEnd('/public/home');
  //     expect(component.showAppNavBar).toBe(false);
  //     expect(component.isPublicHomePage).toBe(true);
  //   });
  // });

  describe('Component Methods', () => {
    it('should redirect to path with queryParams', () => {
      component.redirectToPath({ path: '/test', key: 'testKey' });
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/test'], 
        { queryParams: { key: 'testKey' } }
      );
      expect(mockConfigService.openExploreMenuForMWeb.next).toHaveBeenCalledWith(false);
    });

    it('should open explore menu', () => {
      component.openExploreMenu();
      expect(component.activeRoute).toBe('explore');
      expect(mockConfigService.openExploreMenuForMWeb.next).toHaveBeenCalledWith(true);
    });

    it('should get karma count from localStorage', () => {
      component.getKarmaCount();
      expect(component.countdata).toBe(100);
      expect(component.karmaPointLoading).toBe(false);
      //expect(global.clearInterval).toHaveBeenCalled();
    });

    it('should navigate to karma points when menu is enabled', () => {
      component.disableMenu = false;
      component.viewKarmapoints();
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/karma-points']);
    });

    it('should return false from viewKarmapoints when menu is disabled', () => {
      component.disableMenu = true;
      expect(component.viewKarmapoints()).toBe(false);
    });

    it('should navigate back to home from TOC pages', () => {
      component.previousUrl = '/app/toc/do_123';
      component.handleNavigateBack();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home');
    });

    it('should translate labels', () => {
      const result = component.translateLabels('test-label', 'test-type');
      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith('test-label', 'test-type', '');
      expect(result).toBe('translated-test-label');
    });

    it('should get decorated item', () => {
      // Mock the getter method
      Object.defineProperty(component, 'isforPreview', {
        get: jest.fn().mockReturnValue(true)
      });
      
      const item = { id: 1, name: 'Test' };
      const result = component.getItem(item);
      
      expect(result).toEqual({
        id: 1,
        name: 'Test',
        forPreview: false, // !isforPreview
        enableLang: undefined
      });
    });
  });

  describe('Computed Properties', () => {
    it('should check if on home page', () => {
      // First set the location to public/home
      Object.defineProperty(window, 'location', {
        value: { href: 'https://test.com/public/home' },
        writable: true
      });
      
      expect(component.stillOnHomePage).toBe(true);
      
      // Then change to another page
      Object.defineProperty(window, 'location', {
        value: { href: 'https://test.com/app/other' },
        writable: true
      });
      
      expect(component.stillOnHomePage).toBe(false);
    });
    
    it('should determine if in preview mode', () => {
      // Set to preview URL
      Object.defineProperty(window, 'location', {
        value: { href: 'https://test.com/public/home' },
        writable: true
      });
      
      expect(component.isforPreview).toBe(true);
      
      // Set to non-preview URL
      Object.defineProperty(window, 'location', {
        value: { href: 'https://test.com/app/home' },
        writable: true
      });
      
      component.forPreview = false; // Need to reset this as it's set in constructor
      expect(component.isforPreview).toBe(false);
    });
    
    it('should determine if language is enabled', () => {
      // Set to URL where language is enabled
      Object.defineProperty(window, 'location', {
        value: { href: 'https://test.com/public/faq' },
        writable: true
      });
      
      expect(component.isenableLang).toBe(true);
      
      // Set to URL where language is not enabled
      Object.defineProperty(window, 'location', {
        value: { href: 'https://test.com/app/home' },
        writable: true
      });
      
      expect(component.isenableLang).toBe(false);
    });
  });

  describe('Changes Detection', () => {
    it('should handle mode changes', () => {
      const changes = {
        mode: {
          currentValue: 'bottom',
          previousValue: 'top',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      
      // Initial btnAppsConfig setup
      component.btnAppsConfig = { ...component.basicBtnAppsConfig };
      component.ngOnChanges(changes as any);
      
      // Expect the config to be updated for bottom mode
      expect(component.btnAppsConfig).toEqual({
        ...component.basicBtnAppsConfig,
        widgetData: {
          ...component.basicBtnAppsConfig.widgetData,
          showTitle: true
        }
      });
    });
  });
});
