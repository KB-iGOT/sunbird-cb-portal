import { HeaderComponent } from './header.component';
import { ValueService } from '@sunbird-cb/utils-v2';
import { HeaderService } from './header.service';
import { MobileAppsService } from '../../services/mobile-apps.service';
import { of } from 'rxjs';

// Mock the services
jest.mock('@sunbird-cb/utils-v2', () => ({
  ValueService: jest.fn().mockImplementation(() => ({
    isXSmall$: of(true), // Mocking observable to return `true`
  })),
}));

jest.mock('./header.service', () => ({
  HeaderService: jest.fn().mockImplementation(() => ({
    showNavbarDisplay$: of(true), // Mock observable for navbar display
  })),
}));

jest.mock('../../services/mobile-apps.service', () => ({
  MobileAppsService: jest.fn().mockImplementation(() => ({
    mobileTopHeaderVisibilityStatus: { next: jest.fn() }, // Mock next function for mobileTopHeaderVisibilityStatus
  })),
}));

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let valueService: ValueService;
  let headerService: HeaderService;
  let mobileAppsService: MobileAppsService;

  beforeEach(() => {
    // Create instances of the mocked services
    valueService = new ValueService(null as any);
    headerService = new HeaderService();
    mobileAppsService = new MobileAppsService(null as any);

    // Initialize the component
    component = new HeaderComponent(valueService, headerService, mobileAppsService);

    // Trigger ngOnInit lifecycle hook
    component.ngOnInit();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set isXSmall$ to true', () => {
    component.isXSmall$.subscribe(isXSmall => {
      expect(isXSmall).toBe(true); // Expect the observable to emit true
    });
  });

  it('should set showNavbar to true after delay', (done) => {
    component.ngOnInit(); // Trigger ngOnInit
    component.isShowNavbar;
    // Since showNavbarDisplay$ emits after delay(500), check the value after some time
    setTimeout(() => {
      expect(component.showNavbar).toBe(true); // Expect showNavbar to be true after delay
      done();
    }, 600); // Wait for more than 500 ms
  });

  it('should initialize widgetData', () => {
    expect(component.widgetData).toEqual({
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
    });
  });

  it('should call mobileAppsService.mobileTopHeaderVisibilityStatus.next() when hideMobileTopHeader() is called', () => {
    // Call the method
    component.hideMobileTopHeader();
    
    // Check if the method has been called with false as argument
    expect(mobileAppsService.mobileTopHeaderVisibilityStatus.next).toHaveBeenCalledWith(false);
  });

  it('should navigate to the correct URL based on userAgent for Android', () => {
    // Mock userAgent to be Android
    Object.defineProperty(navigator, 'userAgent', {
      value: 'android',
      writable: true,
    });
    window.open = jest.fn(); // Mock window.open

    component.downloadApp(); // Call the method

    expect(window.open).toHaveBeenCalledWith('https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US', '_blank');
  });

  it('should navigate to the correct URL based on userAgent for iPhone', () => {
    // Mock userAgent to be iPhone
    Object.defineProperty(navigator, 'userAgent', {
      value: 'iPhone',
      writable: true,
    });
    window.open = jest.fn(); // Mock window.open

    component.downloadApp(); // Call the method

    expect(window.open).toHaveBeenCalledWith('https://apps.apple.com/in/app/igot-karmayogi/id6443949491', '_blank');
  });

  it('should navigate to the correct URL based on userAgent for Windows Phone', () => {
    // Mock userAgent to be Windows Phone
    Object.defineProperty(navigator, 'userAgent', {
      value: 'windows phone',
      writable: true,
    });
    window.open = jest.fn(); // Mock window.open

    component.downloadApp(); // Call the method

    expect(window.open).toHaveBeenCalledWith('https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US', '_blank');
  });
});
