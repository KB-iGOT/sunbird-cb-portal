import { AppNavBarComponent } from './app-nav-bar.component';
import { SimpleChange } from '@angular/core';
import { NavigationEnd, NavigationStart } from '@angular/router';
import { of, Subject } from 'rxjs';

// Create mocks for all dependencies
const mockDomSanitizer = {
  bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url) => url),
};

const tourGuideNotifier = new Subject<boolean>();
const openExploreMenuForMWeb = new Subject<boolean>();

const mockConfigSvc = {
  restrictedFeatures: new Set(['feature1']),
  rootOrg: 'TestOrg',
  userProfile: {
    userId: 'test-user-id',
  },
  instanceConfig: {
    logos: {
      app: 'app-logo.png',
      appSecondary: 'app-secondary-logo.png',
      appBottomNav: 'app-bottom-nav-logo.png',
    },
    showNavBarInSetup: true,
  },
  primaryNavBar: { background: 'blue' },
  pageNavBar: { background: 'white' },
  primaryNavBarConfig: { logo: true },
  appsConfig: {
    features: {
      feature1: {},
      feature2: {},
    },
  },
  tourGuideNotifier,
  openExploreMenuForMWeb,
  prefChangeNotifier: new Subject(),
  completedTour: false,
  overrideThemeChanges: {
    desktop: {
      logoDisplayTime: 5000,
      animationDuration: 2000,
    },
  },
  unMappedUser: {
    profileDetails: {
      profileStatus: 'active',
      employmentDetails: {
        departmentName: 'TestDept',
      },
    },
  },
};

const mockTourService = {
  createPopupTour: jest.fn().mockReturnValue({ id: 'tour1' }),
  cancelPopupTour: jest.fn(),
  startPopupTour: jest.fn(),
  isTourComplete: new Subject<boolean>(),
};

const mockRouter = {
  events: of(
    new NavigationStart(1, '/app/home'),
    new NavigationEnd(1, '/page/home', '/page/home')
  ),
  navigate: jest.fn(),
};

const mockTranslate = {
  setDefaultLang: jest.fn(),
  use: jest.fn(),
};

const mockEvents = {
  raiseInteractTelemetry: jest.fn(),
};

const mockLangTranslations = {
  translateLabelWithoutspace: jest.fn().mockReturnValue('Translated Text'),
};

const mockUrlService = {
  previousUrl$: of('/app/home'),
};

const mockUserSvc = {
  fetchUserBatchList: jest.fn().mockReturnValue(of({ data: [] })),
};

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a fresh instance of the component
    component = new AppNavBarComponent(
      mockDomSanitizer as any,
      mockConfigSvc as any,
      mockTourService as any,
      mockRouter as any,
      mockTranslate as any,
      mockEvents as any,
      mockLangTranslations as any,
      mockUrlService as any,
      mockUserSvc as any
    );
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
  
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize with default values', () => {
    expect(component.mode).toBe('top');
    expect(component.showAppNavBar).toBe(false);
    expect(component.isLoggedIn).toBe(false);
  });
  
  it('should set isLoggedIn to true when userProfile is available', () => {
    component.ngOnInit();
    expect(component.isLoggedIn).toBe(true);
  });
  
  it('should set app icons from instanceConfig', () => {
    component.ngOnInit();
    expect(component.appIcon).toBe('app-logo.png');
    expect(component.appIconSecondary).toBe('app-secondary-logo.png');
    expect(component.appBottomIcon).toBe('app-bottom-nav-logo.png');
  });
  
  it('should set feature apps from appsConfig', () => {
    component.ngOnInit();
    expect(component.featureApps).toEqual(['feature1', 'feature2']);
  });
  
  it('should handle ngOnChanges when mode is changed to bottom', () => {
    const changes = {
      mode: new SimpleChange(null, 'bottom', true),
    };
    
    component.ngOnChanges(changes);
    
    expect(component.btnAppsConfig.widgetData.showTitle).toBe(true);
  });
  
  it('should handle ngOnChanges when mode is changed to top', () => {
    component.mode = 'bottom';
    const changes = {
      mode: new SimpleChange('bottom', 'top', false),
    };
    
    component.ngOnChanges(changes);
    
    expect(component.btnAppsConfig.widgetData.showTitle).toBeUndefined();
  });
  
  it('should cancel tour on cancelTour call', () => {
    component.popupTour = { id: 'tour1' };
    component.cancelTour();
    
    expect(mockTourService.cancelPopupTour).toHaveBeenCalled();
    expect(component.isTourGuideClosed).toBe(false);
  });
  
  it('should bind the current route path', () => {
    component.bindUrl('/app/test-path');
    expect(component.currentRoute).toBe('/app/test-path');
    
    // Should not update for special path
    component.bindUrl('/app/competencies');
    expect(component.currentRoute).toBe('/app/test-path');
  });
  
  it('should handle redirectToPath with key parameter', () => {
    const pathConfig = { path: '/test', key: 'someKey' };
    component.redirectToPath(pathConfig);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test'], { queryParams: { key: 'someKey' } });
    expect(mockConfigSvc.openExploreMenuForMWeb.next).toHaveBeenCalledWith(false);
  });
  
  it('should handle redirectToPath without key parameter', () => {
    const pathConfig = { path: '/test' };
    component.redirectToPath(pathConfig);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
    expect(mockConfigSvc.openExploreMenuForMWeb.next).toHaveBeenCalledWith(false);
  });
  
  it('should open explore menu', () => {
    component.openExploreMenu();
    
    expect(component.activeRoute).toBe('explore');
    expect(mockConfigSvc.openExploreMenuForMWeb.next).toHaveBeenCalledWith(true);
  });
  
  it('should translate labels correctly', () => {
    const result = component.translateLabels('test', 'type');
    
    expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith('test', 'type', '');
    expect(result).toBe('Translated Text');
  });
  
  it('should handle view karma points with disabled menu', () => {
    component.disableMenu = true;
    const result = component.viewKarmapoints();
    
    expect(result).toBe(false);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
  
  it('should handle view karma points with enabled menu', () => {
    component.disableMenu = false;
    component.viewKarmapoints();
    
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile/karma-points']);
  });
  
  it('should handle navigate back to home page', () => {
    component.previousUrl = '/app/toc/do_123';
    component.handleNavigateBack();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home']);
  });
  
  it('should not navigate back for other URLs', () => {
    component.previousUrl = '/app/other-page';
    component.handleNavigateBack();
    
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
  
  it('should get item with preview flags', () => {
    const item = { name: 'Test' };
    component.forPreview = true;
    const result = component.getItem(item);
    
    expect(result).toEqual({
      name: 'Test',
      forPreview: false,
      enableLang: component.enableLang,
    });
  });
  
  it('should fetch enrollment list', () => {
    component.fetchEnrollmentList();
    
    expect(mockUserSvc.fetchUserBatchList).toHaveBeenCalledWith('test-user-id');
  });
  
  it('should get karma count from localStorage', () => {
    const enrollData = {
      userCourseEnrolmentInfo: {
        karmaPoints: 100,
      },
    };
    
    jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(enrollData));
    
    component.getKarmaCount();
    
    expect(component.countdata).toBe(100);
    expect(component.karmaPointLoading).toBe(false);
  });
  
  describe('getter methods', () => {
    it('should check if still on home page', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/public/home',
        },
      });
      
      expect(component.stillOnHomePage).toBe(true);
      expect(component.isPublicHomePage).toBe(true);
    });
    
    it('should check if full menu should display', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/app/home',
        },
      });
      
      component.isPlayerPage = false;
      component.isPublicHomePage = false;
      
      expect(component.fullMenuDispaly).toBe(true);
    });
    
    it('should determine if need to hide based on current route', () => {
      component.currentRoute = '/all/assessment/test';
      expect(component.needToHide).toBe(true);
      
      component.currentRoute = '/other/path';
      expect(component.needToHide).toBe(false);
    });
    
    it('should check if is for preview', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/public/test',
        },
      });
      
      expect(component.isforPreview).toBe(true);
      
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/app/test',
        },
      });
      
      expect(component.isforPreview).toBe(false);
    });
    
    it('should check if language is enabled', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/public/faq',
        },
      });
      
      expect(component.isenableLang).toBe(true);
      
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/app/test',
        },
      });
      
      expect(component.isenableLang).toBe(false);
    });
    
    it('should check if this is setup page', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/app/setup',
        },
      });
      
      expect(component.isThisSetUpPage).toBe(true);
      
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/app/other',
        },
      });
      
      expect(component.isThisSetUpPage).toBe(false);
    });
  });
  
  describe('Router Events', () => {
    it('should handle NavigationStart events', () => {
      const navigationStart = new NavigationStart(1, '/app/certs');
      mockRouter.events = of(navigationStart);
      
      component = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigSvc as any,
        mockTourService as any,
        mockRouter as any,
        mockTranslate as any,
        mockEvents as any,
        mockLangTranslations as any,
        mockUrlService as any,
        mockUserSvc as any
      );
      
      expect(component.isHubEnable).toBe(false);
      expect(mockTourService.cancelPopupTour).toHaveBeenCalled();
    });
    
    it('should handle NavigationEnd events', () => {
      const navigationEnd = new NavigationEnd(1, '/app/setup', '/app/setup');
      mockRouter.events = of(navigationEnd);
      
      component = new AppNavBarComponent(
        mockDomSanitizer as any,
        mockConfigSvc as any,
        mockTourService as any,
        mockRouter as any,
        mockTranslate as any,
        mockEvents as any,
        mockLangTranslations as any,
        mockUrlService as any,
        mockUserSvc as any
      );
      
      component.routeSubs(navigationEnd);
      expect(component.isSetUpPage).toBe(true);
    });
  });
});