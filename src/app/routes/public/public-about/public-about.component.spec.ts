
import { PublicAboutComponent } from './public-about.component';
import {  Breakpoints } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('PublicAboutComponent', () => {
  let component: PublicAboutComponent;
  let mockBreakpointObserver: any;
  let mockDomSanitizer: any;
  let mockConfigSvc: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    // Mock BreakpointObserver
    mockBreakpointObserver = {
      observe: jest.fn().mockReturnValue(of({ matches: false })),
    };

    // Mock DomSanitizer
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url) => `safe_resource_${url}`),
      bypassSecurityTrustStyle: jest.fn().mockImplementation((style) => `safe_style_${style}`),
    };

    // Mock ConfigurationsService
    mockConfigSvc = {
      pageNavBar: { color: 'blue' },
      instanceConfig: {
        logos: {
          aboutHeader: 'header.jpg',
          aboutFooter: 'footer.jpg',
        },
      },
    };

    // Mock ActivatedRoute
    mockActivatedRoute = {
      data: of({
        pageData: {
          data: {
            banner: {
              videoLink: 'https://example.com/video',
            },
            sections: [
              { title: 'Section 1', description: 'Description 1' },
            ],
          },
        },
      }),
    };

    // Create component
    component = new PublicAboutComponent(
      mockBreakpointObserver,
      mockDomSanitizer,
      mockConfigSvc,
      mockActivatedRoute
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component properties from route data', () => {
      // Call ngOnInit
      component.ngOnInit();

      // Check aboutPage is set from route data
      expect(component.aboutPage).toBeTruthy();
      expect(component.aboutPage?.banner?.videoLink).toBe('https://example.com/video');

      // Check if videoLink is sanitized
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://example.com/video');
      expect(component.videoLink).toBe('safe_resource_https://example.com/video');
    });

    it('should set banner styles if instanceConfig is available', () => {
      // Call ngOnInit
      component.ngOnInit();

      // Verify the banner styles are set and sanitized
      expect(mockDomSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith(
        `url('${mockConfigSvc.instanceConfig.logos.aboutHeader}')`
      );
      expect(mockDomSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith(
        `url('${mockConfigSvc.instanceConfig.logos.aboutFooter}')`
      );
      expect(component.headerBanner).toBe('safe_style_url(\'header.jpg\')');
      expect(component.footerBanner).toBe('safe_style_url(\'footer.jpg\')');
    });

    it('should not set banners if instanceConfig is not available', () => {
      // Set instanceConfig to null
      mockConfigSvc.instanceConfig = null;
      
      // Call ngOnInit
      component.ngOnInit();

      // Verify the banner styles are not set
      expect(component.headerBanner).toBeNull();
      expect(component.footerBanner).toBeNull();
    });

    it('should not set videoLink if banner or videoLink is not available', () => {
      // Create a route data without videoLink
      mockActivatedRoute.data = of({
        pageData: {
          data: {
            sections: [
              { title: 'Section 1', description: 'Description 1' },
            ],
          },
        },
      });

      // Call ngOnInit
      component.ngOnInit();

      // Verify videoLink is not set
      expect(component.videoLink).toBeNull();
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    });
  });

  describe('isSmallScreen$', () => {
    it('should observe Breakpoints.XSmall', () => {
      // Verify the breakpoint observation
      expect(mockBreakpointObserver.observe).toHaveBeenCalledWith(Breakpoints.XSmall);
    });

    it('should return an observable that maps to matches property', (done) => {
      // Setup mock to return true for small screen
      mockBreakpointObserver.observe.mockReturnValue(of({ matches: true }));

      // Re-create component with updated mock
      component = new PublicAboutComponent(
        mockBreakpointObserver,
        mockDomSanitizer,
        mockConfigSvc,
        mockActivatedRoute
      );

      // Subscribe to the observable and check result
      component.isSmallScreen$.subscribe(isSmall => {
        expect(isSmall).toBe(true);
        done();
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptionAbout if it exists', () => {
      // Setup
      component.ngOnInit(); // This will initialize the subscription
      const unsubscribeSpy = jest.spyOn(component['subscriptionAbout'] as any, 'unsubscribe');

      // Execute
      component.ngOnDestroy();

      // Verify
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should not throw error if subscription is null', () => {
      // Set subscription to null
      component['subscriptionAbout'] = null;

      // Execute and expect no error
      expect(() => {
        component.ngOnDestroy();
      }).not.toThrow();
    });
  });
});
