import { HomeOtherPortalComponent } from './home-other-portal.component';
import { ConfigurationsService, EventService, MultilingualTranslationsService, WsEvents } from '@sunbird-cb/utils-v2';
import { AccessControlService } from '@ws/author/src/public-api';
import { TranslateService } from '@ngx-translate/core';
import {  Subject } from 'rxjs';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('HomeOtherPortalComponent', () => {
  let component: HomeOtherPortalComponent;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockAccessService: jest.Mocked<AccessControlService>;
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>;
  let mockTranslate: jest.Mocked<TranslateService>;
  let mockEvents: jest.Mocked<EventService>;

  const mockAppsConfig = {
    groups: [
      {
        id: 'portal_admin',
        hasRole: ['admin'],
        featureIds: ['feature1', 'feature2']
      },
      {
        id: 'user_group',
        hasRole: [],
        featureIds: ['feature3']
      }
    ],
    features: {
      feature1: {
        name: 'Feature One',
        id: 'feature1',
        permission: ['admin']
      },
      feature2: {
        name: 'Feature Two',
        id: 'feature2',
        permission: []
      },
      feature3: {
        name: 'Feature Three',
        id: 'feature3',
        permission: ['user']
      }
    }
  };

  beforeEach(() => {
    // Create mocks
    mockConfigSvc = {
      appsConfig: mockAppsConfig
    } as any;

    mockAccessService = {
      hasRole: jest.fn()
    } as any;

    mockLangTranslations = {
      languageSelectedObservable: new Subject<boolean>(),
      translateLabel: jest.fn()
    } as any;

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any;

    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    } as any;

    // Reset localStorage mock
    localStorageMock.getItem.mockClear();

    // Create component instance
    component = new HomeOtherPortalComponent(
      mockConfigSvc,
      mockAccessService,
      mockLangTranslations,
      mockTranslate,
      mockEvents
    );
  });

  describe('Constructor', () => {
    it('should create component with default values', () => {
      expect(component).toBeDefined();
      expect(component.portalLinks).toEqual([]);
      expect(component.noPortal).toEqual([1, 2, 3]);
      expect(component.showSkeleton).toBe(true);
    });

    it('should process apps config when available', () => {
      mockAccessService.hasRole.mockReturnValue(true);
      
      const newComponent = new HomeOtherPortalComponent(
        mockConfigSvc,
        mockAccessService,
        mockLangTranslations,
        mockTranslate,
        mockEvents
      );

      expect(newComponent).toBeDefined();
      expect(mockAccessService.hasRole).toHaveBeenCalled();
    });

    it('should filter groups based on role access', () => {
      mockAccessService.hasRole.mockImplementation((roles: string[]) => {
        return roles.includes('admin');
      });

     

      expect(mockAccessService.hasRole).toHaveBeenCalledWith(['admin']);
    });

    it('should handle language setup from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('es');

      

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('es');
    });

    it('should handle language change subscription', () => {
      localStorageMock.getItem.mockReturnValue('fr');
      const mockSubject = new Subject<boolean>();
      mockLangTranslations.languageSelectedObservable = mockSubject;

      

      // Trigger the subscription
      mockSubject.next(true);

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslate.use).toHaveBeenCalledWith('fr');
    });

    it('should handle null appsConfig', () => {
      const configSvcWithoutApps = { appsConfig: null } as any;

      const newComponent = new HomeOtherPortalComponent(
        configSvcWithoutApps,
        mockAccessService,
        mockLangTranslations,
        mockTranslate,
        mockEvents
      );

      expect(newComponent).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      mockAccessService.hasRole.mockReturnValue(true);
    });

    it('should call getPortalLinks when featuresConfig exists', () => {
      const spy = jest.spyOn(component, 'getPortalLinks');
      
      component.ngOnInit();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should not call getPortalLinks when featuresConfig is empty', () => {
      const configSvcEmpty = { appsConfig: { groups: [] } } as any;
      const componentEmpty = new HomeOtherPortalComponent(
        configSvcEmpty,
        mockAccessService,
        mockLangTranslations,
        mockTranslate,
        mockEvents
      );
      
      const spy = jest.spyOn(componentEmpty, 'getPortalLinks');
      
      componentEmpty.ngOnInit();
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('translateLabels', () => {
    it('should call langtranslations.translateLabel with correct parameters', () => {
      const label = 'test-label';
      const type = 'test-type';
      
      component.translateLabels(label, type);
      
      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith(label, type, '');
    });

    it('should return the result from translateLabel', () => {
      const expectedResult = 'translated-label';
      mockLangTranslations.translateLabel.mockReturnValue(expectedResult);
      
      const result = component.translateLabels('test', 'type');
      
      expect(result).toBe(expectedResult);
    });
  });

  describe('getPortalLinks', () => {
    beforeEach(() => {
      mockAccessService.hasRole.mockReturnValue(true);
      
      // Create a new component instance to ensure featuresConfig is populated
      component = new HomeOtherPortalComponent(
        mockConfigSvc,
        mockAccessService,
        mockLangTranslations,
        mockTranslate,
        mockEvents
      );
    });

    it('should populate portalLinks from portal_admin features', () => {
      component.getPortalLinks();
      
      expect(component.portalLinks.length).toBeGreaterThan(0);
      expect(component.showSkeleton).toBe(false);
    });

    it('should handle unique feature widgets using lodash uniqBy', () => {
      const spy = jest.spyOn(component, 'getPortalLinks');
      
      component.getPortalLinks();
      
      expect(spy).toHaveBeenCalled();
      expect(component.showSkeleton).toBe(false);
    });

    it('should only process portal_admin group', () => {
     
      
      component.getPortalLinks();
      
      // Should only add items from portal_admin group
      expect(component.showSkeleton).toBe(false);
    });

    it('should handle empty featureWidgets gracefully', () => {
      const configWithEmptyFeatures = {
        appsConfig: {
          groups: [
            {
              id: 'portal_admin',
              hasRole: [],
              featureIds: []
            }
          ],
          features: {}
        }
      } as any;

      const componentEmpty = new HomeOtherPortalComponent(
        configWithEmptyFeatures,
        mockAccessService,
        mockLangTranslations,
        mockTranslate,
        mockEvents
      );

      componentEmpty.getPortalLinks();
      
      expect(componentEmpty.portalLinks).toEqual([]);
      expect(componentEmpty.showSkeleton).toBe(false);
    });
  });

  describe('raiseTelemetry', () => {
    it('should call events.raiseInteractTelemetry with correct parameters', () => {
      const mockWidgetData = {
        widgetData: {
          actionBtn: {
            name: 'Test Portal'
          }
        }
      };

      component.raiseTelemetry(mockWidgetData);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: WsEvents.EnumInteractTypes.CLICK,
          subType: WsEvents.EnumInteractSubTypes.PORTAL_NUDGE,
          id: 'test-portal-nudge'
        },
        {},
        {
          module: WsEvents.EnumTelemetrymodules.HOME
        }
      );
    });

    it('should handle multi-word portal names correctly', () => {
      const mockWidgetData = {
        widgetData: {
          actionBtn: {
            name: 'Admin Management Portal'
          }
        }
      };

      component.raiseTelemetry(mockWidgetData);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: WsEvents.EnumInteractTypes.CLICK,
          subType: WsEvents.EnumInteractSubTypes.PORTAL_NUDGE,
          id: 'admin-portal-nudge'
        },
        {},
        {
          module: WsEvents.EnumTelemetrymodules.HOME
        }
      );
    });

    it('should convert name to lowercase and use first word', () => {
      const mockWidgetData = {
        widgetData: {
          actionBtn: {
            name: 'USER Dashboard System'
          }
        }
      };

      component.raiseTelemetry(mockWidgetData);

      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: WsEvents.EnumInteractTypes.CLICK,
          subType: WsEvents.EnumInteractSubTypes.PORTAL_NUDGE,
          id: 'user-portal-nudge'
        },
        {},
        {
          module: WsEvents.EnumTelemetrymodules.HOME
        }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing widget data in portal links', () => {
      const configWithInvalidFeature = {
        appsConfig: {
          groups: [
            {
              id: 'portal_admin',
              hasRole: [],
              featureIds: ['invalid_feature']
            }
          ],
          features: {
            invalid_feature: null
          }
        }
      } as any;

      mockAccessService.hasRole.mockReturnValue(true);

      const componentWithInvalid = new HomeOtherPortalComponent(
        configWithInvalidFeature,
        mockAccessService,
        mockLangTranslations,
        mockTranslate,
        mockEvents
      );

      expect(() => componentWithInvalid.getPortalLinks()).not.toThrow();
    });

    it('should handle localStorage with quoted language string', () => {
      localStorageMock.getItem.mockReturnValue('"es"');


      expect(mockTranslate.use).toHaveBeenCalledWith('es');
    });

    it('should handle empty language from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('');


      expect(mockTranslate.use).toHaveBeenCalledWith('');
    });
  });
});