import { InitService } from './init.service';
import { LoggerService, ConfigurationsService, UserPreferenceService } from '@sunbird-cb/utils-v2';
import { HttpClient } from '@angular/common/http';
import { BtnSettingsService } from '@sunbird-cb/collection';
import { WidgetResolverService } from '@sunbird-cb/resolver';
import { SbUiResolverService } from '@sunbird-cb/resolver-v2';
import { NPSGridService } from '@sunbird-cb/collection/src/lib/grid-layout/nps-grid.service';
import { TranslateService } from '@ngx-translate/core';
import { WidgetEnrollService } from '@sunbird-cb/utils-v2';
import { NetCoreService } from './netcore.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import _ from 'lodash';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock uuid function
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

// Mock window location
//delete window.location;
window.location = { 
  href: 'http://example.com', 
  origin: 'http://example.com',
  pathname: '/' 
} as any;

// Mock document
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'id-app-description' || id === 'id-app-webmanifest' || id === 'id-app-fav-icon' || id === 'id-app-x-icon') {
    return {
      setAttribute: jest.fn(),
      href: ''
    };
  }
  return null;
});

describe('InitService', () => {
  let initService: InitService;
  let loggerService: jest.Mocked<LoggerService>;
  let configSvc: jest.Mocked<ConfigurationsService>;
  let widgetResolverService: jest.Mocked<WidgetResolverService>;
  let sbUiResolverService: jest.Mocked<SbUiResolverService>;
  let settingsSvc: jest.Mocked<BtnSettingsService>;
  let userPreference: jest.Mocked<UserPreferenceService>;
  let http: jest.Mocked<HttpClient>;
  let npsSvc: jest.Mocked<NPSGridService>;
  let translate: jest.Mocked<TranslateService>;
  let enrollSvc: jest.Mocked<WidgetEnrollService>;
  let netCoreService: jest.Mocked<NetCoreService>;
  let domSanitizer: jest.Mocked<DomSanitizer>;
  let iconRegistry: jest.Mocked<MatIconRegistry>;
  
  const environment = { production: false, portalRoles: ['PUBLIC'] };

  beforeEach(() => {
    // Initialize mocks
    loggerService = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      removeConsoleAccess: jest.fn()
    } as unknown as jest.Mocked<LoggerService>;
    
    configSvc = {
      baseUrl: 'http://example.com',
      isProduction: false,
      updateProfileObservable: { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) },
      sitePath: '/site',
      instanceConfig: { 
        details: { appName: 'Test App' },
        indexHtmlMeta: {}
      },
      portalUrls: {},
      pinnedApps: { next: jest.fn() },
      restrictedWidgets: new Set(),
      restrictedFeatures: new Set(),
      userRoles: new Set(),
      userGroups: new Set(),
      userProfile: null
    } as unknown as jest.Mocked<ConfigurationsService>;
    
    widgetResolverService = {
      initialize: jest.fn()
    } as unknown as jest.Mocked<WidgetResolverService>;
    
    sbUiResolverService = {
      initialize: jest.fn()
    } as unknown as jest.Mocked<SbUiResolverService>;
    
    settingsSvc = {
      initializePrefChanges: jest.fn()
    } as unknown as jest.Mocked<BtnSettingsService>;
    
    userPreference = {
      initialize: jest.fn(),
      fetchUserPreference: jest.fn().mockResolvedValue({})
    } as unknown as jest.Mocked<UserPreferenceService>;
    
    http = {
      get: jest.fn().mockImplementation((url) => {
        if (url.includes('host.config.json')) {
          return of({ rootOrg: 'INFOSYS', org: ['INFOSYS'] });
        }
        if (url.includes('profile-nudge.json')) {
          return of({ profileTimelyNudges: [] });
        }
        if (url.includes('theme-override-config.json')) {
          return of({ overrideThemeChanges: {} });
        }
        if (url.includes('site.config.json')) {
          return of({ 
            rootOrg: 'INFOSYS', 
            org: ['INFOSYS'], 
            npsCategory: 'test',
            details: { appName: 'Test App' },
            indexHtmlMeta: {}
          });
        }
        if (url.includes('feature/apps.json')) {
          return of({ features: {}, groups: [] });
        }
        if (url.includes('feature/profile-v3.json')) {
          return of({ tabs: [] });
        }
        if (url.includes('features.config.json')) {
          return of({});
        }
        if (url.includes('widgets.config.json')) {
          return of([]);
        }
        if (url.includes('/api/user/v2/read')) {
          return of({ 
            result: { 
              response: {
                userId: 'test-user-id',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                userName: 'testuser',
                thumbnail: 'test-thumbnail',
                channel: 'test-channel',
                rootOrgId: 'test-org-id',
                roles: ['PUBLIC'],
                profileDetails: {
                  mandatoryFieldsExists: true,
                  personalDetails: {
                    primaryEmail: 'test@example.com'
                  }
                },
                promptTnC: false,
                isDeleted: false
              } 
            } 
          });
        }
        return of({});
      }),
      post: jest.fn().mockReturnValue(of({}))
    } as unknown as jest.Mocked<HttpClient>;
    
    npsSvc = {
      getFeedStatus: jest.fn().mockReturnValue(of({ result: { response: { userFeed: [] } } }))
    } as unknown as jest.Mocked<NPSGridService>;
    
    translate = {
      use: jest.fn(),
      setDefaultLang: jest.fn()
    } as unknown as jest.Mocked<TranslateService>;
    
    enrollSvc = {
      fetchEnrollStats: jest.fn().mockReturnValue(of({
        result: {
          userCourseEnrolmentInfo: {
            karmaPoints: 0,
            timeSpentOnCompletedCourses: 0,
            certificatesIssued: 0,
            coursesInProgress: 0,
            addinfo: {}
          },
          userExternalCourseEnrolmentInfo: {
            karmaPoints: 0,
            timeSpentOnCompletedCourses: 0,
            certificatesIssued: 0,
            coursesInProgress: 0,
            addinfo: {}
          }
        }
      }))
    } as unknown as jest.Mocked<WidgetEnrollService>;
    
    netCoreService = {
      netCoreConfigReadData: jest.fn().mockReturnValue(of({ netcoreConfig: {} })),
      getOrgReadData: jest.fn().mockReturnValue(of({})),
      netCoreUserLoginSetup: jest.fn(),
      trackEvent: jest.fn()
    } as unknown as jest.Mocked<NetCoreService>;
    
    domSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn(url => url)
    } as unknown as jest.Mocked<DomSanitizer>;
    
    iconRegistry = {
      addSvgIcon: jest.fn()
    } as unknown as jest.Mocked<MatIconRegistry>;

    // Create service
    initService = new InitService(
      loggerService,
      configSvc,
      widgetResolverService,
      sbUiResolverService,
      settingsSvc,
      userPreference,
      http,
      npsSvc,
      translate,
      enrollSvc,
      netCoreService,
      '/',
      domSanitizer,
      iconRegistry
    );

    // Override the environment for testing
    Object.defineProperty(initService, 'isAnonymousTelemetry', {
      get: jest.fn().mockReturnValue(false)
    });

    // Access the private environment property
    Object.defineProperty(initService, 'environment', {
      get: () => environment
    });

    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(initService).toBeTruthy();
  });

  describe('init()', () => {
    it('should initialize the service and return true', async () => {
      const result = await initService.init();
      expect(result).toBe(true);
      expect(http.get).toHaveBeenCalled();
      expect(localStorage.getItem('telemetrySessionId')).toBe('mocked-uuid');
      expect(settingsSvc.initializePrefChanges).toHaveBeenCalled();
    });

    it('should add SVG icons to the registry', async () => {
      await initService.init();
      expect(iconRegistry.addSvgIcon).toHaveBeenCalledTimes(8);
    });

    it('should handle initialization errors gracefully', async () => {
      jest.spyOn(http, 'get').mockImplementation(() => {
        throw new Error('Network error');
      });
      
      await expect(initService.init()).resolves.toBe(false);
      expect(loggerService.info).toHaveBeenCalledWith('Not Authenticated');
      expect(settingsSvc.initializePrefChanges).toHaveBeenCalled();
    });
  });

  describe('fetchDefaultConfig()', () => {
    it('should fetch and set default configuration', async () => {
      // Use any to access private method
      const result = await (initService as any).fetchDefaultConfig();
      
      expect(result).toEqual({ rootOrg: 'INFOSYS', org: ['INFOSYS'] });
      expect(configSvc.rootOrg).toBe('INFOSYS');
      expect(configSvc.org).toEqual(['INFOSYS']);
      expect(configSvc.activeOrg).toBe('INFOSYS');
    });
  });

  describe('fetchInstanceConfig()', () => {
    it('should fetch and set instance configuration', async () => {
      const result = await (initService as any).fetchInstanceConfig();
      
      expect(result).toEqual(expect.objectContaining({ 
        rootOrg: 'INFOSYS', 
        org: ['INFOSYS'],
        npsCategory: 'test' 
      }));
      
      expect(localStorage.getItem('npsCategory')).toBe('test');
      expect(configSvc.instanceConfig).toEqual(expect.objectContaining({ 
        rootOrg: 'INFOSYS', 
        org: ['INFOSYS'] 
      }));
    });
  });

  describe('setTelemetrySessionId()', () => {
    it('should set a telemetry session ID in localStorage', () => {
      (initService as any).setTelemetrySessionId();
      expect(localStorage.getItem('telemetrySessionId')).toBe('mocked-uuid');
      
      // Call again to test removal of existing ID
      localStorage.setItem('telemetrySessionId', 'existing-id');
      (initService as any).setTelemetrySessionId();
      expect(localStorage.getItem('telemetrySessionId')).toBe('mocked-uuid');
    });
  });

  describe('hasRole()', () => {
    it('should return true if user has matching role', () => {
      const result = (initService as any).hasRole(['PUBLIC']);
      expect(result).toBe(true);
    });

    it('should return false if user has no matching role', () => {
      const result = (initService as any).hasRole(['ADMIN']);
      expect(result).toBe(false);
    });
  });

  describe('toTitleCase()', () => {
    it('should convert string to title case', () => {
      const result = (initService as any).toTitleCase('hello world');
      expect(result).toBe('Hello World');
    });
  });

  describe('fetchStartUpDetails()', () => {
    it('should fetch user details and set up configurations', async () => {
      // Override the instanceConfig for testing
    //  configSvc.instanceConfig = { disablePidCheck: false };
      
      const result = await (initService as any).fetchStartUpDetails();
      
      expect(result).toEqual({
        group: [],
        profileDetailsStatus: true,
        roles: ['public'],
        tncStatus: true,
        isActive: true
      });
      
      expect(configSvc.hasAcceptedTnc).toBe(true);
      expect(configSvc.profileDetailsStatus).toBe(true);
      expect(configSvc.userGroups).toEqual(new Set([]));
      expect(configSvc.userRoles).toEqual(new Set(['public']));
      expect(configSvc.isActive).toBe(true);
      expect(localStorage.getItem('login')).toBe('true');
    });
  });

  describe('fetchUserEnrollDetails()', () => {
    it('should fetch user enrollment details', async () => {
      configSvc.userProfile = { userId: 'test-user-id' } as any;
      
      await (initService as any).fetchUserEnrollDetails();
      
      expect(enrollSvc.fetchEnrollStats).toHaveBeenCalledWith('test-user-id');
      expect(localStorage.getItem('userEnrollmentCount')).toBeTruthy();
      const storedData = JSON.parse(localStorage.getItem('userEnrollmentCount') || '{}');
      expect(storedData.enrolledCourseCount).toBe(0);
    });
  });

  describe('updateAppIndexMeta()', () => {
    it('should update document title and meta elements', () => {
    //   configSvc.instanceConfig = {
    //     details: { appName: 'Test App' },
    //     indexHtmlMeta: {
    //       description: 'Test Description',
    //       webmanifest: 'test.webmanifest',
    //       pngIcon: 'icon.png',
    //       xIcon: 'icon.ico'
    //     }
    //   };
      
      (initService as any).updateAppIndexMeta();
      
      expect(document.title).toBe('Test App');
      expect(document.getElementById).toHaveBeenCalledWith('id-app-description');
      expect(document.getElementById).toHaveBeenCalledWith('id-app-webmanifest');
      expect(document.getElementById).toHaveBeenCalledWith('id-app-fav-icon');
      expect(document.getElementById).toHaveBeenCalledWith('id-app-x-icon');
    });
  });

  describe('isAnonymousTelemetryRequired', () => {
    it('should return true for public URLs', () => {
      window.location.href = 'http://example.com/public/';
      expect(initService.isAnonymousTelemetryRequired).toBe(true);
      
      window.location.href = 'http://example.com/?preview=true';
      expect(initService.isAnonymousTelemetryRequired).toBe(true);
      
      window.location.href = 'http://example.com/certs';
      expect(initService.isAnonymousTelemetryRequired).toBe(true);
      
      window.location.href = 'http://example.com/crp/';
      expect(initService.isAnonymousTelemetryRequired).toBe(true);
    });
    
    it('should return false for private URLs', () => {
      window.location.href = 'http://example.com/private';
      expect(initService.isAnonymousTelemetryRequired).toBe(false);
    });
  });
});
