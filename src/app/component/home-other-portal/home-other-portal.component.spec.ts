import { HomeOtherPortalComponent } from './home-other-portal.component';
import { of } from 'rxjs';

// Mock the services
const mockConfigurationsService = {
  appsConfig: {
    groups: [
      {
        id: 'group1',
        hasRole: [],
        featureIds: ['feature1'],
      }
    ],
    features: {
      feature1: { permission: [], name: 'Feature 1' }
    }
  }
};

const mockAccessControlService = {
  hasRole: jest.fn(() => true)
};

const mockMultilingualTranslationsService = {
  languageSelectedObservable: of('en'),
  translateLabel: jest.fn((label: string) => label)
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
};

describe('HomeOtherPortalComponent', () => {
  let component: HomeOtherPortalComponent;

  beforeEach(() => {
    component = new HomeOtherPortalComponent(
      mockConfigurationsService as any,
      mockAccessControlService as any,
      mockMultilingualTranslationsService as any,
      mockTranslateService as any,
      mockEventService as any
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit and getPortalLinks if featuresConfig exists', () => {
    const spy = jest.spyOn(component, 'getPortalLinks');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should correctly translate labels', () => {
    const label = 'label';
    const translated = component.translateLabels(label, null);
    expect(translated).toBe(label);
    expect(mockMultilingualTranslationsService.translateLabel).toHaveBeenCalledWith(label, null, '');
  });

  it('should process portal links correctly', () => {
    // Call ngOnInit to initialize featuresConfig
    component.ngOnInit();

    // Manually set up the featuresConfig for this test
    // component.featuresConfig = [
    //   {
    //     id: 'portal_admin',
    //     featureWidgets: [
    //       {
    //         widgetData: {
    //           actionBtn: { name: 'Test Feature' }
    //         }
    //       },
    //       {
    //         widgetData: {
    //           actionBtn: { name: 'Test Feature' }
    //         }
    //       }
    //     ]
    //   }
    // ];

    // Spy on push to portalLinks array
    const pushSpy = jest.spyOn(component.portalLinks, 'push');
    
    component.getPortalLinks();
    
    // Assert that the unique feature widget was added to portalLinks
    expect(pushSpy).toHaveBeenCalled();
    expect(component.portalLinks.length).toBe(1);
  });

  it('should raise telemetry on raiseTelemetry method call', () => {
    const widgetData = {
      widgetData: {
        actionBtn: { name: 'Test Action' }
      }
    };
    component.raiseTelemetry(widgetData);
    expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
  });

  it('should set default language and translate if language is in localStorage', () => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'en')
      },
      writable: true
    });

    component.ngOnInit();
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });
});
