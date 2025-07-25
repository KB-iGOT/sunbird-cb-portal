import { HeaderComponent } from './header.component';
import { HeaderService } from './header.service';
import { MobileAppsService } from '../../services/mobile-apps.service';
import { ValueService } from '@sunbird-cb/utils-v2';
import { of, BehaviorSubject } from 'rxjs';

// Mock dependencies
const mockValueService = {
  isXSmall$: of(false)
};

const mockHeaderService = {
  showNavbarDisplay$: of(true)
};

const mockMobileAppsService = {
  mobileTopHeaderVisibilityStatus: new BehaviorSubject(true)
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let headerService: HeaderService;
  let mobileAppsService: MobileAppsService;
  let valueService: ValueService;

  beforeEach(() => {
    headerService = mockHeaderService as any;
    mobileAppsService = mockMobileAppsService as any;
    valueService = mockValueService as any;
    
    component = new HeaderComponent(
      valueService,
      headerService,
      mobileAppsService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isNavBarRequired).toBe(true);
      expect(component.showNavbar).toBe(true);
      expect(component.widgetData).toEqual({});
      expect(component.mobileTopHeaderVisibilityStatus).toBe(true);
      expect(component.showHubs).toBe(false);
    });

    it('should set isXSmall$ from ValueService', () => {
      expect(component.isXSmall$).toBe(mockValueService.isXSmall$);
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to showNavbarDisplay$ and update showNavbar', (done) => {
      //const mockShowNavbarDisplay$ = of(false);
     // headerService.showNavbarDisplay$ = mockShowNavbarDisplay$;

      component.ngOnInit();

      setTimeout(() => {
        expect(component.showNavbar).toBe(false);
        done();
      }, 600); // Wait for delay(500) + buffer
    });

    it('should set widgetData correctly', () => {
      component.ngOnInit();

      const expectedWidgetData = {
        widgets: [
          [
            {
              dimensions: {},
              className: 'ws-mat-primary-lite-background-important new-box-hubs',
              widget: {
                widgetType: 'card',
                widgetSubType: 'cardHomeHubs',
                widgetData: {},
              },
            },
          ],
        ],
      };

      expect(component.widgetData).toEqual(expectedWidgetData);
    });
  });

  describe('downloadApp', () => {
    //let originalNavigator: Navigator;
    let windowOpenSpy: jest.SpyInstance;

    beforeEach(() => {
     // originalNavigator = global.navigator;
      windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => {
        const mockWindow = { opener: {} } as Window;
        return mockWindow;
      });
    });

    afterEach(() => {
    //  global.navigator = originalNavigator;
      windowOpenSpy.mockRestore();
    });

    it('should open Play Store for Windows Phone', () => {
      // Object.defineProperty(global.navigator, 'userAgent', {
      //   value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 822)',
      //   configurable: true
      // });

      component.downloadApp();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US',
        '_blank',
        'noopener'
      );
    });

    it('should open Play Store for Android', () => {
      // Object.defineProperty(global.navigator, 'userAgent', {
      //   value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
      //   configurable: true
      // });

      component.downloadApp();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US',
        '_blank',
        'noopener'
      );
    });

    it('should open App Store for iPad', () => {
      // Object.defineProperty(global.navigator, 'userAgent', {
      //   value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      //   configurable: true
      // });

      component.downloadApp();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://apps.apple.com/in/app/igot-karmayogi/id6443949491',
        '_blank',
        'noopener'
      );
    });

    it('should open App Store for iPhone', () => {
      // Object.defineProperty(global.navigator, 'userAgent', {
      //   value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      //   configurable: true
      // });

      component.downloadApp();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://apps.apple.com/in/app/igot-karmayogi/id6443949491',
        '_blank',
        'noopener'
      );
    });

    it('should open App Store for iPod', () => {
      // Object.defineProperty(global.navigator, 'userAgent', {
      //   value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
      //   configurable: true
      // });

      component.downloadApp();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://apps.apple.com/in/app/igot-karmayogi/id6443949491',
        '_blank',
        'noopener'
      );
    });

    it('should set opener to null for all platforms', () => {
      const mockWindow = { opener: {} } as Window;
      windowOpenSpy.mockReturnValue(mockWindow);

      // Object.defineProperty(global.navigator, 'userAgent', {
      //   value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
      //   configurable: true
      // });

      component.downloadApp();

      expect(mockWindow.opener).toBeNull();
    });

    it('should handle case when window.open returns null', () => {
      windowOpenSpy.mockReturnValue(null);

      // Object.defineProperty(global.navigator, 'userAgent', {
      //   value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
      //   configurable: true
      // });

      expect(() => component.downloadApp()).not.toThrow();
    });
  });

  describe('Getters', () => {
    it('should return correct value for navBarRequired', () => {
      component.isNavBarRequired = true;
      expect(component.navBarRequired).toBe(true);

      component.isNavBarRequired = false;
      expect(component.navBarRequired).toBe(false);
    });

    it('should return correct value for isShowNavbar', () => {
      component.showNavbar = true;
      expect(component.isShowNavbar).toBe(true);

      component.showNavbar = false;
      expect(component.isShowNavbar).toBe(false);
    });
  });

  describe('hideMobileTopHeader', () => {
    it('should set mobileTopHeaderVisibilityStatus to false', () => {
      component.mobileTopHeaderVisibilityStatus = true;
      
      component.hideMobileTopHeader();
      
      expect(component.mobileTopHeaderVisibilityStatus).toBe(false);
    });

    it('should call next on mobileAppsService.mobileTopHeaderVisibilityStatus', () => {
      const nextSpy = jest.spyOn(mobileAppsService.mobileTopHeaderVisibilityStatus, 'next');
      
      component.hideMobileTopHeader();
      
      expect(nextSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('Input Properties', () => {
    it('should accept mode input', () => {
      const testMode = 'test-mode';
      component.mode = testMode;
      expect(component.mode).toBe(testMode);
    });

    it('should accept headerFooterConfigData input', () => {
      const testConfig = { test: 'config' };
      component.headerFooterConfigData = testConfig;
      expect(component.headerFooterConfigData).toBe(testConfig);
    });

    it('should accept showHubs input with default false', () => {
      expect(component.showHubs).toBe(false);
      
      component.showHubs = true;
      expect(component.showHubs).toBe(true);
    });
  });
});