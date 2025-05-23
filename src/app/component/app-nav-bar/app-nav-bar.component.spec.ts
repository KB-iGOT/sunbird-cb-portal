import { AppNavBarComponent } from './app-nav-bar.component';
import {  NavigationStart, NavigationEnd } from '@angular/router';
import { Subject, of } from 'rxjs';

// Mock implementations
const mockDomSanitizer = {
  bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('trusted-url')
};

const mockRouter = {
  events: new Subject(),
  navigate: jest.fn(),
  navigateByUrl: jest.fn()
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockTourService = {
  createPopupTour: jest.fn(),
  startPopupTour: jest.fn(),
  cancelPopupTour: jest.fn(),
  isTourComplete: new Subject()
};

const mockConfigSvc = {
  restrictedFeatures: new Set(),
  userProfile: { userId: 'test-user-id' },
  instanceConfig: {
    logos: {
      app: 'app-logo-url',
      appSecondary: 'app-secondary-logo-url',
      appBottomNav: 'bottom-nav-logo-url'
    },
    showNavBarInSetup: true
  },
  rootOrg: 'test-org',
  primaryNavBar: { background: 'primary-bg' },
  pageNavBar: { background: 'page-bg' },
  primaryNavBarConfig: { config: 'primary-config' },
  appsConfig: {
    features: {
      feature1: {},
      feature2: {}
    }
  },
  tourGuideNotifier: new Subject(),
  completedTour: false,
  prefChangeNotifier: new Subject(),
  openExploreMenuForMWeb: new Subject(),
  unMappedUser: {
    profileDetails: {
      profileStatus: 'active',
      employmentDetails: {
        departmentName: 'test-dept'
      }
    }
  },
  overrideThemeChanges: {
    desktop: {
      logoDisplayTime: 5000,
      animationDuration: 1000
    }
  }
};

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
};

const mockLangTranslations = {
  translateLabelWithoutspace: jest.fn().mockReturnValue('translated-label')
};

const mockUrlService = {
  previousUrl$: new Subject<string>()
};

const mockUserSvc = {
  fetchUserBatchList: jest.fn().mockReturnValue(of({}))
};

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent;
  let originalLocation: Location;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Mock window.location
    originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      href: 'http://localhost/app/home',
      pathname: '/app/home'
    } as Location;

    // Mock localStorage
    originalLocalStorage = window.localStorage;
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock window.screen
    Object.defineProperty(window, 'screen', {
      value: { availWidth: 1024 },
      writable: true
    });

    component = new AppNavBarComponent(
      mockDomSanitizer as any,
      mockConfigSvc as any,
      mockTourService as any,
      mockRouter as any,
      mockTranslateService as any,
      mockEventService as any,
      mockLangTranslations as any,
      mockUrlService as any,
      mockUserSvc as any
    );
  });

  afterEach(() => {
    window.location = originalLocation;
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should create component with default values', () => {
      expect(component).toBeDefined();
      expect(component.mode).toBe('top');
      expect(component.forPreview).toBe(false);
      expect(component.isPlayerPage).toBe(false);
      expect(component.showAppNavBar).toBe(false);
    });

    it('should set forPreview to true when URL contains /public/', () => {
      window.location.href = 'http://localhost/public/home';
      const newComponent = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigSvc as any,
        mockTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockLangTranslations as any,
        mockUrlService as any,
        mockUserSvc as any
      );
      expect(newComponent.forPreview).toBe(true);
    });

    it('should set isPlayerPage to true when URL contains /viewer/', () => {
      window.location.href = 'http://localhost/viewer/content';
      const newComponent = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigSvc as any,
        mockTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockLangTranslations as any,
        mockUrlService as any,
        mockUserSvc as any
      );
      expect(newComponent.isPlayerPage).toBe(true);
    });

    it('should setup language from localStorage', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('hi');
      new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigSvc as any,
        mockTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockLangTranslations as any,
        mockUrlService as any,
        mockUserSvc as any
      );
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslateService.use).toHaveBeenCalledWith('hi');
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should initialize component properties', () => {
      component.ngOnInit();
      expect(component.isLoggedIn).toBe(true);
      expect(component.instanceVal).toBe('test-org');
      expect(component.featureApps).toEqual(['feature1', 'feature2']);
    });

    it('should setup app icons', () => {
      component.ngOnInit();
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-logo-url');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-secondary-logo-url');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('bottom-nav-logo-url');
    });

    // it('should setup karma point interval', () => {
    //   const setIntervalSpy = jest.spyOn(global, 'setInterval');
    //   component.ngOnInit();
    // //  expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    // });

    it('should handle unmapped user with not-my-user status and igot org', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      component.ngOnInit();
      expect(component.disableMenu).toBe(true);
      expect(mockUserSvc.fetchUserBatchList).toHaveBeenCalledWith('test-user-id');
    });

    it('should not disable menu for regular user', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'active';
      component.ngOnInit();
      expect(component.disableMenu).toBe(false);
    });
  });

  describe('Router Events', () => {
    it('should handle NavigationStart events', () => {
      const cancelTourSpy = jest.spyOn(component, 'cancelTour');
      component.ngOnInit();
      
      const navigationStart = new NavigationStart(1, '/app/certs');
      mockRouter.events.next(navigationStart);
      
      expect(component.isHubEnable).toBe(false);
      expect(cancelTourSpy).toHaveBeenCalled();
    });

    it('should handle NavigationEnd events', () => {
      const routeSubsSpy = jest.spyOn(component, 'routeSubs');
      const bindUrlSpy = jest.spyOn(component, 'bindUrl');
      const cancelTourSpy = jest.spyOn(component, 'cancelTour');
      
      component.ngOnInit();
      
      const navigationEnd = new NavigationEnd(1, '/app/home', '/app/home');
      mockRouter.events.next(navigationEnd);
      
      expect(routeSubsSpy).toHaveBeenCalledWith(navigationEnd);
      expect(bindUrlSpy).toHaveBeenCalledWith('/app/home');
      expect(cancelTourSpy).toHaveBeenCalled();
    });

    it('should set activeRoute for specific URLs', () => {
      component.ngOnInit();
      
      // Test home route
      const homeNavigation = new NavigationEnd(1, '/page/home', '/page/home');
      mockRouter.events.next(homeNavigation);
      expect(component.activeRoute).toBe('home');
      
      // Test explore route
      const exploreNavigation = new NavigationEnd(2, '/page/explore', '/page/explore');
      mockRouter.events.next(exploreNavigation);
      expect(component.activeRoute).toBe('explorer');
      
      // Test search route
      const searchNavigation = new NavigationEnd(3, '/app/globalsearch', '/app/globalsearch');
      mockRouter.events.next(searchNavigation);
      expect(component.activeRoute).toBe('search');
    });

    it('should set hideKPOnNav for mobile toc pages', () => {
      Object.defineProperty(window, 'screen', {
        value: { availWidth: 500 },
        writable: true
      });
      
      component.ngOnInit();
      
      const tocNavigation = new NavigationEnd(1, '/app/toc/do_123', '/app/toc/do_123');
      mockRouter.events.next(tocNavigation);
      
      expect(component.hideKPOnNav).toBe(true);
    });
  });

  describe('ngOnChanges', () => {
    it('should update btnAppsConfig when mode changes to bottom', () => {
      const changes = {
        mode: {
          currentValue: 'bottom',
          previousValue: 'top',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      
      component.ngOnChanges(changes);
      
      expect(component.btnAppsConfig.widgetData.showTitle).toBe(true);
    });

    it('should reset btnAppsConfig when mode changes to top', () => {
      component.mode = 'top';
      const changes = {
        mode: {
          currentValue: 'top',
          previousValue: 'bottom',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      
      component.ngOnChanges(changes);
      
      expect(component.btnAppsConfig).toEqual(component.basicBtnAppsConfig);
    });
  });

  describe('Tour Methods', () => {
    beforeEach(() => {
      component.popupTour = { id: 'test-tour' };
    });

    it('should cancel tour', () => {
      component.cancelTour();
      expect(mockTourService.cancelPopupTour).toHaveBeenCalled();
      expect(component.isTourGuideClosed).toBe(false);
    });

    it('should not cancel tour if popupTour is not set', () => {
      component.popupTour = null;
      component.cancelTour();
      expect(mockTourService.cancelPopupTour).not.toHaveBeenCalled();
    });
  });

  describe('Route Subscription', () => {
    it('should set showAppNavBar to false for public routes', () => {
      const navigationEnd = new NavigationEnd(1, '/public/home', '/public/home');
      component.routeSubs(navigationEnd);
      expect(component.showAppNavBar).toBe(false);
      expect(component.isPublicHomePage).toBe(true);
    });

    it('should set showAppNavBar to false for viewer routes', () => {
      const navigationEnd = new NavigationEnd(1, '/viewer/content', '/viewer/content');
      component.routeSubs(navigationEnd);
      expect(component.showAppNavBar).toBe(false);
    });

    it('should set showAppNavBar to true for app routes', () => {
      const navigationEnd = new NavigationEnd(1, '/app/home', '/app/home');
      component.routeSubs(navigationEnd);
      expect(component.showAppNavBar).toBe(true);
    });

    it('should set isSetUpPage for setup routes', () => {
      const navigationEnd = new NavigationEnd(1, '/app/setup', '/app/setup');
      component.routeSubs(navigationEnd);
      expect(component.isSetUpPage).toBe(true);
    });
  });

  describe('Getter Methods', () => {
    it('should return correct stillOnHomePage value', () => {
      window.location.href = 'http://localhost/public/home';
      expect(component.stillOnHomePage).toBe(true);
    });

    it('should return correct fullMenuDispaly value', () => {
      window.location.href = 'http://localhost/app/home';
      expect(component.fullMenuDispaly).toBe(true);
      
      window.location.href = 'http://localhost/viewer/content';
      expect(component.fullMenuDispaly).toBe(false);
    });

    it('should return correct isforPreview value', () => {
      window.location.href = 'http://localhost/public/content';
      expect(component.isforPreview).toBe(true);
      
      window.location.href = 'http://localhost/app/home';
      expect(component.isforPreview).toBe(false);
    });

    it('should return correct isenableLang value', () => {
      window.location.href = 'http://localhost/public/faq';
      expect(component.isenableLang).toBe(true);
      
      window.location.href = 'http://localhost/public/contact';
      expect(component.isenableLang).toBe(true);
      
      window.location.href = 'http://localhost/app/home';
      expect(component.isenableLang).toBe(false);
    });

    it('should return correct isThisSetUpPage value', () => {
      window.location.pathname = '/app/setup';
      expect(component.isThisSetUpPage).toBe(true);
      
      window.location.pathname = '/app/home';
      expect(component.isThisSetUpPage).toBe(false);
    });

    it('should return correct needToHide value', () => {
      component.currentRoute = 'all/assessment/test';
      expect(component.needToHide).toBe(true);
      
      component.currentRoute = 'app/home';
      expect(component.needToHide).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should translate labels', () => {
      const result = component.translateLabels('test-label', 'test-type');
      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith('test-label', 'test-type', '');
      expect(result).toBe('translated-label');
    });

    it('should redirect to path with query params', () => {
      const pathConfig = { path: '/app/test', key: 'test-key' };
      component.redirectToPath(pathConfig);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/test'], { queryParams: { key: 'test-key' } });
    });

    it('should redirect to path without query params', () => {
      const pathConfig = { path: '/app/test' };
      component.redirectToPath(pathConfig);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/test']);
    });

    it('should open explore menu', () => {
      const nextSpy = jest.spyOn(mockConfigSvc.openExploreMenuForMWeb, 'next');
      component.openExploreMenu();
      expect(component.activeRoute).toBe('explore');
      expect(nextSpy).toHaveBeenCalledWith(true);
    });

    it('should bind URL correctly', () => {
      component.bindUrl('/app/test');
      expect(component.currentRoute).toBe('/app/test');
    });

    it('should not bind competencies URL', () => {
      component.currentRoute = '/app/home';
      component.bindUrl('/app/competencies');
      expect(component.currentRoute).toBe('/app/home');
    });
  });

  describe('Karma Points', () => {
    it('should get karma count from localStorage', () => {
      const mockEnrollmentData = {
        userCourseEnrolmentInfo: {
          karmaPoints: 100
        }
      };
      (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockEnrollmentData));
      
      component.getKarmaCount();
      
      expect(component.countdata).toBe(100);
      expect(component.karmaPointLoading).toBe(false);
    });

    it('should view karma points if menu is not disabled', () => {
      component.disableMenu = false;
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetry');
      
      const result = component.viewKarmapoints();
      
      expect(raiseTelemetrySpy).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/karma-points']);
      expect(result).toBeUndefined();
    });

    it('should not view karma points if menu is disabled', () => {
      component.disableMenu = true;
      const result = component.viewKarmapoints();
      expect(result).toBe(false);
    });

    // it('should raise telemetry', () => {
    //   component.raiseTelemetry();
    //   expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
    //     {
    //       type: 'click',
    //       subType: 'nav-karmapoints',
    //       id: 'nav-karmapoints',
    //     },
    //     {},
    //     {
    //       module: expect.any(String),
    //     }
    //   );
    // });
  });

  describe('Navigation', () => {
    it('should handle navigate back to home when previous URL contains toc', () => {
      component.previousUrl = '/app/toc/do_123';
      component.handleNavigateBack();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home');
    });

    it('should handle navigate back to home when previous URL contains viewer/pdf', () => {
      component.previousUrl = '/viewer/pdf/do_123';
      component.handleNavigateBack();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home');
    });

    it('should not navigate if previous URL does not match conditions', () => {
      component.previousUrl = '/app/home';
      component.handleNavigateBack();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should get item with correct properties', () => {
      const testItem = { id: 'test' };
      const result = component.getItem(testItem);
      
      expect(result).toEqual({
        id: 'test',
        forPreview: true,
        enableLang: component.enableLang
      });
    });

    it('should fetch enrollment list', () => {
      component.fetchEnrollmentList();
      expect(mockUserSvc.fetchUserBatchList).toHaveBeenCalledWith('test-user-id');
    });

    it('should display logo with animation', (done) => {
      jest.useRealTimers();
      component.janDataEnable = true;
      
      component.displayLogo();
      
      setTimeout(() => {
        expect(component.janDataEnable).toBe(false);
        done();
      }, 1100);
    });
  });

  describe('URL Service Subscription', () => {
    it('should subscribe to previousUrl changes', () => {
      component.ngOnInit();
      
      mockUrlService.previousUrl$.next('/app/test');
      
      expect(component.previousUrl).toBe('/app/test');
    });
  });

  describe('Language Dropdown', () => {
    it('should hide language dropdown for karmayogi-saptah URL', () => {
      window.location.href = 'http://localhost/karmayogi-saptah';
      
      const newComponent = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigSvc as any,
        mockTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockLangTranslations as any,
        mockUrlService as any,
        mockUserSvc as any
      );
      
      const navigationEnd = new NavigationEnd(1, '/karmayogi-saptah', '/karmayogi-saptah');
      mockRouter.events.next(navigationEnd);
      
      expect(newComponent.showLangDropdown).toBe(false);
    });

    it('should show language dropdown for other URLs', () => {
      const navigationEnd = new NavigationEnd(1, '/app/home', '/app/home');
      mockRouter.events.next(navigationEnd);
      
      expect(component.showLangDropdown).toBe(true);
    });
  });
});