import { AppNavBarComponent } from './app-nav-bar.component';
import {  NavigationStart, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { SimpleChange } from '@angular/core';

// Mock dependencies
const mockDomSanitizer = {
  bypassSecurityTrustResourceUrl: jest.fn()
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

const createMockConfigurationsService = () => ({
  restrictedFeatures: new Set(['helpNavBarMenu']),
  userProfile: { userId: 'test-user' },
  instanceConfig: {
    logos: {
      app: 'app-logo.png',
      appSecondary: 'app-secondary.png',
      appBottomNav: 'bottom-nav.png'
    },
    showNavBarInSetup: false
  },
  rootOrg: 'test-org',
  primaryNavBar: { background: 'blue' },
  pageNavBar: { background: 'white' },
  primaryNavBarConfig: { config: 'test' },
  appsConfig: {
    features: {
      feature1: {},
      feature2: {}
    }
  },
  tourGuideNotifier: new Subject(),
  unMappedUser: {
    profileDetails: {
      profileStatus: 'active',
      employmentDetails: {
        departmentName: 'test-dept'
      }
    },
    identifier: 'test-id'
  },
  completedTour: false,
  prefChangeNotifier: new Subject(),
  openExploreMenuForMWeb: new Subject(),
  overrideThemeChanges: {
    desktop: {
      logoDisplayTime: 5000,
      animationDuration: 1000
    }
  }
});

const mockConfigurationsService = createMockConfigurationsService();

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
};

const mockMultilingualTranslationsService = {
  translateLabelWithoutspace: jest.fn()
};

const mockUrlService = {
  previousUrl$: new Subject()
};

const mockCustomTourService = {
  createPopupTour: jest.fn(),
  cancelPopupTour: jest.fn(),
  startPopupTour: jest.fn(),
  isTourComplete: new Subject()
};

const mockWidgetUserService = {
  fetchUserBatchList: jest.fn()
};

const mockNotificationsService = {
  getNotificationsData: jest.fn()
};

const mockLibNotificationsService = {
  _unreadCount: new Subject()
};

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent;
  let originalLocation: any;
  let mockLocalStorage: { [key: string]: jest.Mock };

  beforeEach(() => {
    // Mock window.location
    originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      href: 'http://localhost:4200/app/home',
      pathname: '/app/home'
    } as any;

    // Mock localStorage
    mockLocalStorage = {
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
      writable: true,
      value: { availWidth: 1024 }
    });

    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock configuration service
    Object.assign(mockConfigurationsService, createMockConfigurationsService());
    
    component = new AppNavBarComponent(
      mockDomSanitizer as any,
      mockConfigurationsService as any,
      mockCustomTourService as any,
      mockRouter as any,
      mockTranslateService as any,
      mockEventService as any,
      mockMultilingualTranslationsService as any,
      mockUrlService as any,
      mockWidgetUserService as any,
      mockNotificationsService as any,
      mockLibNotificationsService as any
    );
  });

  afterEach(() => {
    window.location = originalLocation;
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should initialize component with default values', () => {
      expect(component.mode).toBe('top');
      expect(component.hideKPOnNav).toBe(false);
      expect(component.karmaPointLoading).toBe(true);
      expect(component.tooltipDelay).toBe(1000);
      expect(component.janDataEnable).toBe(true);
      expect(component.notificationsCount).toBe(0);
    });

    it('should set isHelpMenuRestricted when restrictedFeatures contains helpNavBarMenu', () => {
      expect(component.isHelpMenuRestricted).toBe(true);
    });

    it('should handle when restrictedFeatures is null', () => {
      const mockConfigWithoutRestrictions = {
        ...createMockConfigurationsService(),
        restrictedFeatures: null
      };
      
      const componentWithoutRestrictions = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigWithoutRestrictions as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      expect(componentWithoutRestrictions.isHelpMenuRestricted).toBe(false);
    });

    it('should subscribe to router events', () => {
      const navigationStart = new NavigationStart(1, '/test');
      const navigationEnd = new NavigationEnd(1, '/test', '/test');
      
      mockRouter.events.next(navigationStart);
      expect(component.isHubEnable).toBe(true);

      mockRouter.events.next(navigationEnd);
      expect(component.isHubEnable).toBe(true);
    });

    it('should handle navigation to certs page', () => {
      const navigationStart = new NavigationStart(1, '/certs');
      mockRouter.events.next(navigationStart);
      expect(component.isHubEnable).toBe(false);

      const navigationEnd = new NavigationEnd(1, '/public/certs', '/public/certs');
      mockRouter.events.next(navigationEnd);
      expect(component.isHubEnable).toBe(false);
    });

    it('should handle bindUrl call with competencies replacement', () => {
      const bindUrlSpy = jest.spyOn(component, 'bindUrl');
      const navigationEnd = new NavigationEnd(1, '/app/competencies/test', '/app/competencies/test');
      
      mockRouter.events.next(navigationEnd);
      
      expect(bindUrlSpy).toHaveBeenCalledWith('test');
    });

    it('should set showLangDropdown based on URL', () => {
      window.location.href = 'http://localhost:4200/karmayogi-saptah';
      const navigationEnd = new NavigationEnd(1, '/karmayogi-saptah', '/karmayogi-saptah');
      mockRouter.events.next(navigationEnd);
      expect(component.showLangDropdown).toBe(false);
    });

    it('should set default language when websiteLanguage exists in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('hi');
      
      new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigurationsService as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );

      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslateService.use).toHaveBeenCalledWith('hi');
    });

    it('should not set language when websiteLanguage does not exist in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigurationsService as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );

      expect(mockTranslateService.setDefaultLang).not.toHaveBeenCalled();
      expect(mockTranslateService.use).not.toHaveBeenCalled();
    });

    it('should handle router events with showLangDropdown logic', () => {
      // Test karmayogi-saptah URL
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:4200/karmayogi-saptah' },
        writable: true
      });
      
      const testComponent = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigurationsService as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );

      const navigationEnd = new NavigationEnd(1, '/karmayogi-saptah', '/karmayogi-saptah');
      mockRouter.events.next(navigationEnd);
      
      expect(testComponent.showLangDropdown).toBe(false);
      
      // Test normal URL
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:4200/app/home' },
        writable: true
      });
      
      const testComponent2 = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigurationsService as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );

      const navigationEnd2 = new NavigationEnd(1, '/app/home', '/app/home');
      mockRouter.events.next(navigationEnd2);
      
      expect(testComponent2.showLangDropdown).toBe(true);
    });

    it('should handle router NavigationStart events', () => {
      const testComponent = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigurationsService as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );

      const cancelTourSpy = jest.spyOn(testComponent, 'cancelTour');
      
      // Test NavigationStart with certs URL
      const navigationStart = new NavigationStart(1, '/certs');
      mockRouter.events.next(navigationStart);
      
      expect(testComponent.isHubEnable).toBe(false);
      expect(cancelTourSpy).toHaveBeenCalled();
      
      // Test NavigationStart with regular URL
      const navigationStart2 = new NavigationStart(1, '/app/home');
      mockRouter.events.next(navigationStart2);
      
      expect(testComponent.isHubEnable).toBe(true);
    });

    it('should handle router NavigationEnd events with bindUrl', () => {
      const testComponent = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigurationsService as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );

      const cancelTourSpy = jest.spyOn(testComponent, 'cancelTour');
      const bindUrlSpy = jest.spyOn(testComponent, 'bindUrl');
      const routeSubsSpy = jest.spyOn(testComponent, 'routeSubs');
      
      // Test NavigationEnd with competencies URL
      const navigationEnd = new NavigationEnd(1, '/app/competencies/test-path', '/app/competencies/test-path');
      mockRouter.events.next(navigationEnd);
      
      expect(testComponent.isHubEnable).toBe(true);
      expect(cancelTourSpy).toHaveBeenCalled();
      expect(routeSubsSpy).toHaveBeenCalledWith(navigationEnd);
      expect(bindUrlSpy).toHaveBeenCalledWith('test-path');
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should initialize jan26Data and set interval for logo display', () => {
      component.ngOnInit();
      
      expect(component.jan26Data).toBe(mockConfigurationsService.overrideThemeChanges);
      expect(component.logoDisplayTime).toBe(5000);
      
      jest.advanceTimersByTime(5000);
      expect(component.janDataEnable).toBe(true);
    });

    it('should subscribe to router events and set activeRoute', () => {
      mockLocalStorage.getItem.mockReturnValue('home');
      
      component.ngOnInit();
      
      const navigationEnd = new NavigationEnd(1, '/page/home', '/page/home');
      mockRouter.events.next(navigationEnd);
      
      expect(component.activeRoute).toBe('home');
    });

    it('should set hideKPOnNav for mobile toc pages', () => {
      Object.defineProperty(window, 'screen', {
        writable: true,
        value: { availWidth: 767 }
      });
      
      component.ngOnInit();
      
      const navigationEnd = new NavigationEnd(1, '/app/toc/do', '/app/toc/do');
      mockRouter.events.next(navigationEnd);
      
      expect(component.hideKPOnNav).toBe(true);
    });

    it('should set correct activeRoute for different URLs', () => {
      component.ngOnInit();
      
      // Test explorer route
      let navigationEnd = new NavigationEnd(1, '/page/explore', '/page/explore');
      mockRouter.events.next(navigationEnd);
      expect(component.activeRoute).toBe('explorer');
      
      // Test search route
      navigationEnd = new NavigationEnd(1, '/app/globalsearch', '/app/globalsearch');
      mockRouter.events.next(navigationEnd);
      expect(component.activeRoute).toBe('search');
      
      // Test careers route
      navigationEnd = new NavigationEnd(1, '/app/careers', '/app/careers');
      mockRouter.events.next(navigationEnd);
      expect(component.activeRoute).toBe('Career');
      
      // Test my learnings route
      navigationEnd = new NavigationEnd(1, '/app/seeAll?key=continueLearning', '/app/seeAll?key=continueLearning');
      mockRouter.events.next(navigationEnd);
      expect(component.activeRoute).toBe('my learnings');
    });

    it('should set isLoggedIn when userProfile exists', () => {
      component.ngOnInit();
      expect(component.isLoggedIn).toBe(true);
    });

    it('should initialize app icons and configuration', () => {
      mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('safe-url');
      
      component.ngOnInit();
      
      expect(component.appIcon).toBe('safe-url');
      expect(component.appIconSecondary).toBe('safe-url');
      expect(component.appBottomIcon).toBe('safe-url');
      expect(component.instanceVal).toBe('test-org');
      expect(component.primaryNavbarBackground).toBe(mockConfigurationsService.primaryNavBar);
      expect(component.pageNavbar).toBe(mockConfigurationsService.pageNavBar);
      expect(component.primaryNavbarConfig).toBe(mockConfigurationsService.primaryNavBarConfig);
    });

    it('should set featureApps from appsConfig', () => {
      component.ngOnInit();
      expect(component.featureApps).toEqual(['feature1', 'feature2']);
    });

    it('should subscribe to tourGuideNotifier when tour guide is not restricted', () => {
      mockCustomTourService.createPopupTour.mockReturnValue('popup-tour');
      const configWithoutTourRestriction = {
        ...createMockConfigurationsService(),
        restrictedFeatures: new Set(['other-feature'])
      };
      
      const componentWithoutTourRestriction = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutTourRestriction as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithoutTourRestriction.ngOnInit();
      
      configWithoutTourRestriction.tourGuideNotifier.next(true);
      
      expect(componentWithoutTourRestriction.isTourGuideAvailable).toBe(true);
      expect(componentWithoutTourRestriction.popupTour).toBe('popup-tour');
    });

    it('should not set tour guide when restricted', () => {
      mockCustomTourService.createPopupTour.mockReturnValue('popup-tour');
      const configWithTourRestriction = {
        ...createMockConfigurationsService(),
        restrictedFeatures: new Set(['tourGuide'])
      };
      
      const componentWithTourRestriction = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithTourRestriction as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithTourRestriction.ngOnInit();
      
      configWithTourRestriction.tourGuideNotifier.next(true);
      
      expect(componentWithTourRestriction.isTourGuideAvailable).toBe(false);
      expect(componentWithTourRestriction.popupTour).toBeUndefined();
    });

    it('should handle tour guide when restrictedFeatures is null', () => {
      mockCustomTourService.createPopupTour.mockReturnValue('popup-tour');
      const configWithoutRestrictions = {
        ...createMockConfigurationsService(),
        restrictedFeatures: null
      };
      
      const componentWithoutRestrictions = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutRestrictions as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithoutRestrictions.ngOnInit();
      
      configWithoutRestrictions.tourGuideNotifier.next(true);
      
      expect(componentWithoutRestrictions.isTourGuideAvailable).toBe(true);
      expect(componentWithoutRestrictions.popupTour).toBe('popup-tour');
    });

    it('should start karma count interval', () => {
      component.ngOnInit();
      expect(component.enrollInterval).toBeDefined();
    });

    it('should subscribe to previousUrl$', () => {
      component.ngOnInit();
      
      mockUrlService.previousUrl$.next('/previous');
      expect(component.previousUrl).toBe('/previous');
    });

    it('should set disableMenu for not-my-user with igot org', () => {
      mockConfigurationsService.unMappedUser.profileDetails.profileStatus = 'not-my-user';
      mockConfigurationsService.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot';
      mockWidgetUserService.fetchUserBatchList.mockReturnValue(of({}));
      
      component.ngOnInit();
      
      expect(component.disableMenu).toBe(true);
      expect(mockWidgetUserService.fetchUserBatchList).toHaveBeenCalled();
    });

    it('should call getMyCount when unMappedUser identifier exists', () => {
      mockNotificationsService.getNotificationsData.mockReturnValue(of({ result: { unread: 5 } }));
      
      component.ngOnInit();
      
      expect(component.notificationsCount).toBe(5);
    });

    it('should handle when configSvc is null', () => {
      const componentWithoutConfig = new AppNavBarComponent(
        mockDomSanitizer as any,
        null as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      expect(() => componentWithoutConfig.ngOnInit()).not.toThrow();
    });

    it('should handle when instanceConfig is null', () => {
      const configWithoutInstance = {
        ...createMockConfigurationsService(),
        instanceConfig: null
      };
      
      const componentWithoutInstance = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutInstance as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithoutInstance.ngOnInit();
      expect(componentWithoutInstance.appIcon).toBeNull();
    });

    it('should handle when appsConfig is null', () => {
      const configWithoutApps = {
        ...createMockConfigurationsService(),
        appsConfig: null
      };
      
      const componentWithoutApps = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutApps as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithoutApps.ngOnInit();
      expect(componentWithoutApps.featureApps).toEqual([]);
    });

    it('should handle when userProfile is null', () => {
      const configWithoutUser = {
        ...createMockConfigurationsService(),
        userProfile: null
      };
      
      const componentWithoutUser = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutUser as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithoutUser.ngOnInit();
      expect(componentWithoutUser.isLoggedIn).toBe(false);
    });
  });

  describe('getMyCount', () => {
    it('should fetch notifications count successfully', () => {
      mockNotificationsService.getNotificationsData.mockReturnValue(of({ result: { unread: 7 } }));
      
      component.getMyCount();
      
      expect(component.notificationsCount).toBe(7);
    });

    it('should handle missing result object', () => {
      mockNotificationsService.getNotificationsData.mockReturnValue(of({}));
      
      component.getMyCount();
      
      expect(component.notificationsCount).toBe(0);
    });

    it('should handle error when fetching notifications count', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorObservable = new Subject();
      mockNotificationsService.getNotificationsData.mockReturnValue(errorObservable.asObservable());
      
      component.getMyCount();
      
      errorObservable.error(new Error('API Error'));
      
      expect(component.notificationsCount).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Error while fetching notifications count', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('displayLogo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should set janDataEnable to false after animation duration', () => {
      component.jan26Data = { desktop: { animationDuration: 2000 } };
      component.janDataEnable = true;
      
      component.displayLogo();
      
      jest.advanceTimersByTime(2000);
      expect(component.janDataEnable).toBe(false);
    });
  });

  describe('routeSubs', () => {
    it('should set isSetUpPage to true for setup URL', () => {
      const navigationEnd = new NavigationEnd(1, '/app/setup', '/app/setup');
      
      component.routeSubs(navigationEnd);
      
      expect(component.isSetUpPage).toBe(true);
    });

    it('should set showAppNavBar to false for public URLs', () => {
      const navigationEnd = new NavigationEnd(1, '/public/logout', '/public/logout');
      
      component.routeSubs(navigationEnd);
      
      expect(component.showAppNavBar).toBe(false);
    });

    it('should set isPublicHomePage for public home URL', () => {
      const navigationEnd = new NavigationEnd(1, '/public/home', '/public/home');
      
      component.routeSubs(navigationEnd);
      
      expect(component.isPublicHomePage).toBe(true);
      expect(component.showAppNavBar).toBe(false);
    });

    it('should show navbar for setup page when showNavBarInSetup is true', () => {
      mockConfigurationsService.instanceConfig.showNavBarInSetup = true;
      const navigationEnd = new NavigationEnd(1, '/app/setup', '/app/setup');
      
      component.routeSubs(navigationEnd);
      
      expect(component.showAppNavBar).toBe(true);
    });

    it('should hide navbar for setup page when showNavBarInSetup is false', () => {
      mockConfigurationsService.instanceConfig.showNavBarInSetup = false;
      const navigationEnd = new NavigationEnd(1, '/app/setup', '/app/setup');
      
      component.routeSubs(navigationEnd);
      
      expect(component.showAppNavBar).toBe(false);
    });

    it('should handle setup page when instanceConfig is missing', () => {
      const configWithoutInstance = {
        ...createMockConfigurationsService(),
        instanceConfig: null
      };
      
      const componentWithoutInstance = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutInstance as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      const navigationEnd = new NavigationEnd(1, '/app/setup', '/app/setup');
      
      componentWithoutInstance.routeSubs(navigationEnd);
      
      expect(componentWithoutInstance.showAppNavBar).toBe(true);
    });

    it('should show navbar for regular pages', () => {
      const navigationEnd = new NavigationEnd(1, '/app/home', '/app/home');
      
      component.routeSubs(navigationEnd);
      
      expect(component.showAppNavBar).toBe(true);
    });
  });

  describe('ngOnChanges', () => {
    it('should update btnAppsConfig when mode changes to bottom', () => {
      const changes = {
        mode: new SimpleChange('top', 'bottom', false)
      };
      component.mode = 'bottom';
      
      component.ngOnChanges(changes);
      
      expect(component.btnAppsConfig.widgetData.showTitle).toBe(true);
    });

    it('should reset btnAppsConfig when mode changes to top', () => {
      const changes = {
        mode: new SimpleChange('bottom', 'top', false)
      };
      component.mode = 'top';
      
      component.ngOnChanges(changes);
      
      expect(component.btnAppsConfig).toEqual(component.basicBtnAppsConfig);
    });
  });

  describe('startTour', () => {
    it('should exist and be callable', () => {
      expect(() => component.startTour()).not.toThrow();
    });
  });

  describe('cancelTour', () => {
    it('should cancel popup tour when it exists', () => {
      component.popupTour = 'test-tour';
      
      component.cancelTour();
      
      expect(mockCustomTourService.cancelPopupTour).toHaveBeenCalled();
      expect(component.isTourGuideClosed).toBe(false);
    });

    it('should not cancel tour when popupTour does not exist', () => {
      component.popupTour = null;
      
      component.cancelTour();
      
      expect(mockCustomTourService.cancelPopupTour).not.toHaveBeenCalled();
    });
  });

  describe('bindUrl', () => {
    it('should set currentRoute when path is provided and not competencies', () => {
      component.bindUrl('/app/home');
      expect(component.currentRoute).toBe('/app/home');
    });

    it('should not set currentRoute for competencies path', () => {
      component.currentRoute = '/app/home';
      component.bindUrl('/app/competencies');
      expect(component.currentRoute).toBe('/app/home');
    });

    it('should not change currentRoute when path is empty', () => {
      component.currentRoute = '/app/home';
      component.bindUrl('');
      expect(component.currentRoute).toBe('/app/home');
    });
  });

  describe('Getters', () => {
    it('should return correct stillOnHomePage value', () => {
      window.location.href = 'http://localhost:4200/public/home';
      expect(component.stillOnHomePage).toBe(true);
      
      window.location.href = 'http://localhost:4200/app/home';
      expect(component.stillOnHomePage).toBe(false);
    });

    it('should return correct fullMenuDispaly value', () => {
      window.location.href = 'http://localhost:4200/app/home';
      expect(component.fullMenuDispaly).toBe(true);
      
      window.location.href = 'http://localhost:4200/viewer/test';
      expect(component.fullMenuDispaly).toBe(false);
    });

    it('should return correct sShowAppNavBar value', () => {
      component.showAppNavBar = true;
      expect(component.sShowAppNavBar).toBe(true);
    });

    it('should return correct needToHide value', () => {
      component.currentRoute = 'all/assessment/test';
      expect(component.needToHide).toBe(true);
      
      component.currentRoute = 'app/home';
      expect(component.needToHide).toBe(false);
    });

    it('should return correct isforPreview value', () => {
      window.location.href = 'http://localhost:4200/public/test';
      expect(component.isforPreview).toBe(true);
      
      window.location.href = 'http://localhost:4200/test&preview=true';
      expect(component.isforPreview).toBe(true);
      
      window.location.href = 'http://localhost:4200/certs';
      expect(component.isforPreview).toBe(true);
      
      window.location.href = 'http://localhost:4200/app/home';
      expect(component.isforPreview).toBe(false);
    });

    it('should return correct isenableLang value', () => {
      window.location.href = 'http://localhost:4200/public/faq';
      expect(component.isenableLang).toBe(true);
      
      window.location.href = 'http://localhost:4200/public/contact';
      expect(component.isenableLang).toBe(true);
      
      window.location.href = 'http://localhost:4200/app/home';
      expect(component.isenableLang).toBe(false);
    });

    it('should return correct isThisSetUpPage value', () => {
      window.location.pathname = '/app/setup';
      expect(component.isThisSetUpPage).toBe(true);
      
      window.location.pathname = '/app/home';
      expect(component.isThisSetUpPage).toBe(false);
    });
  });

  describe('translateLabels', () => {
    it('should call multilingualTranslationsService translateLabelWithoutspace', () => {
      mockMultilingualTranslationsService.translateLabelWithoutspace.mockReturnValue('translated');
      
      const result = component.translateLabels('test', 'type1');
      
      expect(mockMultilingualTranslationsService.translateLabelWithoutspace).toHaveBeenCalledWith('test', 'type1', '');
      expect(result).toBe('translated');
    });
  });

  describe('redirectToPath', () => {
    it('should navigate with queryParams when pathConfig has key', () => {
      const pathConfig = { path: '/test', key: 'testKey' };
      
      component.redirectToPath(pathConfig);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test'], { queryParams: { key: 'testKey' } });
      expect(mockConfigurationsService.openExploreMenuForMWeb.next).toHaveBeenCalledWith(false);
    });

    it('should navigate without queryParams when pathConfig has no key', () => {
      const pathConfig = { path: '/test' };
      
      component.redirectToPath(pathConfig);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
      expect(mockConfigurationsService.openExploreMenuForMWeb.next).toHaveBeenCalledWith(false);
    });
  });

  describe('openExploreMenu', () => {
    it('should set activeRoute to explore and emit openExploreMenuForMWeb', () => {
      component.openExploreMenu();
      
      expect(component.activeRoute).toBe('explore');
      expect(mockConfigurationsService.openExploreMenuForMWeb.next).toHaveBeenCalledWith(true);
    });
  });

  describe('getKarmaCount', () => {
    it('should get karma count from localStorage and stop interval', () => {
      const enrollData = {
        userCourseEnrolmentInfo: {
          karmaPoints: 150
        }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(enrollData));
      component.enrollInterval = setInterval(() => {}, 1000);
      
      component.getKarmaCount();
      
      expect(component.countdata).toBe(150);
      expect(component.karmaPointLoading).toBe(false);
    });

    it('should handle missing karmaPoints data', () => {
      const enrollData = {
        userCourseEnrolmentInfo: {}
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(enrollData));
      
      component.getKarmaCount();
      
      expect(component.countdata).toBe(0);
    });

    it('should handle missing userCourseEnrolmentInfo', () => {
      const enrollData = {};
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(enrollData));
      
      component.getKarmaCount();
      
      expect(component.countdata).toBe(0);
    });

    it('should handle null localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      component.getKarmaCount();
      
      expect(component.countdata).toBeUndefined();
    });
  });

  describe('viewKarmapoints', () => {
    it('should return false when menu is disabled', () => {
      component.disableMenu = true;
      
      const result = component.viewKarmapoints();
      
      expect(result).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to karma points page when menu is enabled', () => {
      component.disableMenu = false;
      
      component.viewKarmapoints();
      
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/karma-points']);
    });
  });

  describe('raiseTelemetry', () => {
    it('should raise interact telemetry for karma points', () => {
      component.raiseTelemetry();
      
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'nav-karmapoints',
          id: 'nav-karmapoints',
        },
        {},
        {
          module: expect.any(Object),
        }
      );
    });
  });

  describe('handleNavigateBack', () => {
    it('should navigate to home when previous URL contains toc', () => {
      component.previousUrl = '/app/toc/do_123';
      
      component.handleNavigateBack();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home');
    });

    it('should navigate to home when previous URL contains viewer pdf', () => {
      component.previousUrl = '/viewer/pdf/do_123';
      
      component.handleNavigateBack();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home');
    });

    it('should not navigate when previous URL does not match conditions', () => {
      component.previousUrl = '/app/home';
      
      component.handleNavigateBack();
      
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('getItem', () => {
    it('should return item with additional properties', () => {
      const item = { name: 'test' };
      component.enableLang = true;
      
      const result = component.getItem(item);
      
      expect(result).toEqual({
        name: 'test',
        forPreview: true,
        enableLang: true
      });
    });
  });

  describe('fetchEnrollmentList', () => {
    it('should fetch user batch list when userProfile exists', () => {
      mockWidgetUserService.fetchUserBatchList.mockReturnValue(of({}));
      
      component.fetchEnrollmentList();
      
      expect(mockWidgetUserService.fetchUserBatchList).toHaveBeenCalledWith('test-user');
    });

    it('should handle empty userId when userProfile is null', () => {
      const configWithoutUser = createMockConfigurationsService();
     // configWithoutUser.userProfile = null;
      mockWidgetUserService.fetchUserBatchList.mockReturnValue(of({}));
      
      const componentWithoutUser = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutUser as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithoutUser.fetchEnrollmentList();
      
      expect(mockWidgetUserService.fetchUserBatchList).toHaveBeenCalledWith('');
    });

    it('should handle missing userId property', () => {
      const configWithoutUserId = createMockConfigurationsService();
      //configWithoutUserId.userProfile = {};
      mockWidgetUserService.fetchUserBatchList.mockReturnValue(of({}));
      
      const componentWithoutUserId = new AppNavBarComponent(
        mockDomSanitizer as any,
        configWithoutUserId as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      componentWithoutUserId.fetchEnrollmentList();
      
      expect(mockWidgetUserService.fetchUserBatchList).toHaveBeenCalledWith('');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from myNotificationsSubscription', () => {
      const mockSubscription = {
        unsubscribe: jest.fn()
      };
      component.myNotificationsSubscription = mockSubscription as any;
      
      component.ngOnDestroy();
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should not throw error when myNotificationsSubscription is undefined', () => {
      component.myNotificationsSubscription = undefined as any;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing configSvc in ngOnInit', () => {
      const componentWithoutConfig = new AppNavBarComponent(
        mockDomSanitizer as any,
        null as any,
        mockCustomTourService as any,
        mockRouter as any,
        mockTranslateService as any,
        mockEventService as any,
        mockMultilingualTranslationsService as any,
        mockUrlService as any,
        mockWidgetUserService as any,
        mockNotificationsService as any,
        mockLibNotificationsService as any
      );
      
      expect(() => componentWithoutConfig.ngOnInit()).not.toThrow();
    });

    it('should handle error in getMyCount', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNotificationsService.getNotificationsData.mockReturnValue(
        new Subject().asObservable().pipe(() => {
          throw new Error('Network error');
        })
      );
      
      component.getMyCount();
      
      expect(component.notificationsCount).toBe(0);
      consoleSpy.mockRestore();
    });

    it('should handle navigation events with missing URL', () => {
      const navigationEnd = new NavigationEnd(1, '', '');
      
      expect(() => component.routeSubs(navigationEnd)).not.toThrow();
    });

    it('should handle localStorage getItem returning null', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      component.ngOnInit();
      
      expect(component.activeRoute).toBe('');
    });
  });
});