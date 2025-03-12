import { MobileAppHomeComponent } from './mobile-app-home.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@angular/cdk/platform';
import { MobileAppsService } from '../../../../services/mobile-apps.service';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';

describe('MobileAppHomeComponent', () => {
  let component: MobileAppHomeComponent;
  let mockSanitizer: Partial<DomSanitizer>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockPlatform: Partial<Platform>;
  let mockMobileAppsService: Partial<MobileAppsService>;
  let mockConfigSvc: Partial<ConfigurationsService>;

  beforeEach(() => {
    // Mocking the services
    mockSanitizer = {
      bypassSecurityTrustUrl: jest.fn().mockReturnValue('sanitized-url'),
    };

    mockActivatedRoute = {
      data: of({
        pageData: {
          data: {
            appsIos: 'ios-app-url',
            showQrCode: true,
            isClient: false,
            code: 'testCode',
          },
        },
      }),
    };

    mockPlatform = {
      IOS: true, // Mock the platform as iOS
    };

    mockMobileAppsService = {
      iOsAppRef: true,
      isAndroidApp: false,
    };

    mockConfigSvc = {
      pageNavBar: {},
    };

    // Create instance of component with mocked services
    component = new MobileAppHomeComponent(
      mockSanitizer as DomSanitizer,
      mockActivatedRoute as ActivatedRoute,
      mockPlatform as Platform,
      mockMobileAppsService as MobileAppsService,
      mockConfigSvc as ConfigurationsService
    );
  });

  it('should initialize component', () => {
    // Initialize ngOnInit manually (because Angular's lifecycle hooks will not run in Jest)
    component.ngOnInit();

    // Test initial values
    expect(component.selectedTabIndex).toBe(1); // because IOS is true
    expect(component.isAndriod).toBe(false); // because iOsAppRef is true
    expect(component.isIos).toBe(true); // because isAndroidApp is false
    expect(component.mobileLinks).toBeDefined();
    expect(component.mobileLinks?.appsIosSanitized).toBe('sanitized-url');
    expect(component.isAndroidPlayStoreLink).toBe(true); // because showQrCode is true
    expect(component.isClient).toBe(false); // as per mock data
    expect(component.mobilePlatformCode).toBe('testCode');
  });

  it('should unsubscribe on ngOnDestroy', () => {
    // Initialize component and subscribe to route data
    component.ngOnInit();

    // Check if the route subscription exists
    expect(component.routeSubscription).toBeDefined();

    // Call ngOnDestroy manually
    component.ngOnDestroy();

    // Expect the subscription to be unsubscribed
    if (component.routeSubscription) {
      expect(component.routeSubscription.closed).toBe(true);
    }
  });

  it('should handle no data in route', () => {
    // Test scenario when there's no data in route
    mockActivatedRoute.data = of({});
    component = new MobileAppHomeComponent(
      mockSanitizer as DomSanitizer,
      mockActivatedRoute as ActivatedRoute,
      mockPlatform as Platform,
      mockMobileAppsService as MobileAppsService,
      mockConfigSvc as ConfigurationsService
    );
    
    component.ngOnInit();

    expect(component.mobileLinks).toBeNull();
  });
});
