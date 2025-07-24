import { InitService } from './init.service';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import * as _ from 'lodash';

// Mock external dependencies
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

jest.mock('moment', () => {
  const mockMomentInstance = {
    subtract: jest.fn().mockReturnThis(),
    isBefore: jest.fn().mockReturnValue(false)
  };
  
  const momentMock = jest.fn(() => mockMomentInstance);
  
  // Add static methods to the mock function
  Object.assign(momentMock, {
    subtract: jest.fn().mockReturnValue(mockMomentInstance),
    isBefore: jest.fn().mockReturnValue(false)
  });
  
  return momentMock;
});

// Mock global smartech function
declare global {
  function smartech(...args: any[]): void;
}

global.smartech = jest.fn();

describe('InitService', () => {
  let service: InitService;
  let mockLogger: any;
  let mockConfigSvc: any;
  let mockWidgetResolverService: any;
  let mockSbUiResolverService: any;
  let mockSettingsSvc: any;
  let mockUserPreference: any;
  let mockHttp: any;
  let mockNpsSvc: any;
  let mockTranslate: any;
  let mockEnrollSvc: any;
  let mockNetCoreService: any;
  let mockDomSanitizer: any;
  let mockIconRegistry: any;

  // Setup document and window mocks once before all tests
  beforeAll(() => {
    // Mock document methods
    const mockElement = {
      setAttribute: jest.fn(),
      href: ''
    };

    Object.defineProperty(document, 'getElementById', {
      value: jest.fn().mockReturnValue(mockElement),
      writable: true,
      configurable: true
    });

    Object.defineProperty(document, 'baseURI', {
      value: 'http://test.com',
      writable: true,
      configurable: true
    });

    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      href: 'http://test.com/app',
      pathname: '/app',
      origin: 'http://test.com'
    };

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true,
      configurable: true
    });
  });

  beforeEach(() => {
    // Mock all dependencies
    mockLogger = {
      removeConsoleAccess: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockConfigSvc = {
      baseUrl: 'http://test.com',
      isProduction: false,
      instanceConfig: {
        disablePidCheck: false,
        isMultilingualEnabled: false,
        backgrounds: {},
        primaryNavBarConfig: {},
        telemetryConfig: {
          endpoint: 'test-endpoint',
          publicEndpoint: 'public-endpoint',
          protectedEndpoint: 'protected-endpoint'
        },
        details: { appName: 'Test App' },
        indexHtmlMeta: {}
      },
      updateProfileObservable: of(false),
      userProfile: null,
      userProfileV2: null,
      unMappedUser: null,
      nodebbUserProfile: null,
      hasAcceptedTnc: false,
      profileDetailsStatus: false,
      userGroups: new Set(),
      userRoles: new Set(),
      isActive: true,
      restrictedFeatures: new Set(),
      restrictedWidgets: new Set(),
      welcomeTabs: null,
      sitePath: '/test',
      rootOrg: 'test-org',
      org: ['test-org'],
      activeOrg: 'test-org',
      positions: [],
      compentency: [],
      profileTimelyNudges: {},
      netcoreConfig: null,
      appsConfig: null,
      portalUrls: {},
      primaryNavBar: null,
      pageNavBar: null,
      primaryNavBarConfig: null,
      overrideThemeChanges: null,
      pinnedApps: { next: jest.fn() },
      profileSettings: null
    };

    mockWidgetResolverService = {
      initialize: jest.fn()
    };

    mockSbUiResolverService = {
      initialize: jest.fn()
    };

    mockSettingsSvc = {
      initializePrefChanges: jest.fn()
    };

    mockUserPreference = {
      fetchUserPreference: jest.fn().mockResolvedValue({}),
      initialize: jest.fn()
    };

    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };

    mockNpsSvc = {
      getFeedStatus: jest.fn()
    };

    mockTranslate = {
      use: jest.fn(),
      setDefaultLang: jest.fn()
    };

    mockEnrollSvc = {
      fetchEnrollStats: jest.fn()
    };

    mockNetCoreService = {
      netCoreConfigReadData: jest.fn(),
      getOrgReadData: jest.fn(),
      netCoreUserLoginSetup: jest.fn(),
      trackEvent: jest.fn()
    };

    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('trusted-url')
    };

    mockIconRegistry = {
      addSvgIcon: jest.fn()
    };

    // Create service instance
    service = new InitService(
      mockLogger,
      mockConfigSvc,
      mockWidgetResolverService,
      mockSbUiResolverService,
      mockSettingsSvc,
      mockUserPreference,
      mockHttp,
      mockNpsSvc,
      mockTranslate,
      mockEnrollSvc,
      mockNetCoreService,
      '/test',
      mockDomSanitizer,
      mockIconRegistry
    );

    // Reset mocks for each test
    jest.clearAllMocks();
    
    // Reset localStorage mock calls
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();

    // Reset document.title
    document.title = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize service with dependencies', () => {
      expect(service).toBeDefined();
      expect(mockConfigSvc.isProduction).toBe(environment.production);
    });

    it('should register SVG icons', () => {
      expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'pin',
        'trusted-url'
      );
      expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'facebook',
        'trusted-url'
      );
      // Verify multiple icon registrations
      expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledTimes(17);
    });
  });

  describe('isAnonymousTelemetryRequired getter', () => {
    it('should return true for public URLs', () => {
      window.location.href = 'http://test.com/public/content';
      expect(service.isAnonymousTelemetryRequired).toBe(true);
    });

    it('should return true for preview URLs', () => {
      window.location.href = 'http://test.com/content?preview=true';
      expect(service.isAnonymousTelemetryRequired).toBe(true);
    });

    it('should return true for certs URLs', () => {
      window.location.href = 'http://test.com/certs/certificate';
      expect(service.isAnonymousTelemetryRequired).toBe(true);
    });

    it('should return true for crp URLs', () => {
      window.location.href = 'http://test.com/crp/content';
      expect(service.isAnonymousTelemetryRequired).toBe(true);
    });

    it('should return false for regular URLs', () => {
      window.location.href = 'http://test.com/app/dashboard';
      expect(service.isAnonymousTelemetryRequired).toBe(false);
    });
  });

  describe('init method', () => {
    beforeEach(() => {
      // Mock all the async methods
      service['fetchDefaultConfig'] = jest.fn().mockResolvedValue({});
      service['profileNudgeConfig'] = jest.fn().mockResolvedValue({});
      service['themeOverrideConfig'] = jest.fn().mockResolvedValue({});
      service['netCoreConfig'] = jest.fn().mockResolvedValue({});
      service['fetchStartUpDetails'] = jest.fn().mockResolvedValue({});
      service['fetchUserEnrollDetails'] = jest.fn().mockResolvedValue({});
      service['initFeatured'] = jest.fn().mockResolvedValue(undefined);
      service['updateNavConfig'] = jest.fn();
      service['updateTelemetryConfig'] = jest.fn();
      service['setTelemetrySessionId'] = jest.fn();
      service['logFirstLogin'] = jest.fn();
    });

    it('should initialize successfully for authenticated user', async () => {
      window.location.pathname = '/dashboard';
      
      const result = await service.init();
      
      expect(result).toBe(true);
      expect(service['fetchDefaultConfig']).toHaveBeenCalled();
      expect(service['profileNudgeConfig']).toHaveBeenCalled();
      expect(service['themeOverrideConfig']).toHaveBeenCalled();
      expect(service['netCoreConfig']).toHaveBeenCalled();
      expect(service['fetchStartUpDetails']).toHaveBeenCalled();
      expect(service['fetchUserEnrollDetails']).toHaveBeenCalled();
      expect(service['initFeatured']).toHaveBeenCalled();
      expect(service['updateNavConfig']).toHaveBeenCalled();
      expect(service['logFirstLogin']).toHaveBeenCalled();
    });

    it('should handle public path correctly', async () => {
      window.location.pathname = '/public/content';
      
      const result = await service.init();
      
      expect(result).toBe(true);
      expect(service['fetchStartUpDetails']).not.toHaveBeenCalled();
      expect(service['fetchUserEnrollDetails']).not.toHaveBeenCalled();
    });

    it('should handle public welcome path', async () => {
      window.location.pathname = '/public/welcome';
      
      const result = await service.init();
      
      expect(result).toBe(true);
      expect(service['fetchStartUpDetails']).toHaveBeenCalled();
      expect(service['fetchUserEnrollDetails']).not.toHaveBeenCalled();
    });

    it('should handle edit mode with _rc parameter', async () => {
      window.location.href = 'http://test.com/content?editMode=true&_rc=123';
      
      const result = await service.init();
      
      expect(result).toBe(true);
      expect(service['fetchStartUpDetails']).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      service['fetchStartUpDetails'] = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const result = await service.init();
      
      expect(result).toBe(false);
      expect(mockSettingsSvc.initializePrefChanges).toHaveBeenCalledWith(environment.production);
      expect(service['updateNavConfig']).toHaveBeenCalled();
      expect(service['initFeatured']).toHaveBeenCalled();
    });

    it('should unsubscribe from previous subscription', async () => {
      const mockSubscription = { unsubscribe: jest.fn() };
      service['updateProfileSubscription'] = mockSubscription;
      
      await service.init();
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('fetchDefaultConfig', () => {
    it('should fetch and set default configuration', async () => {
      const mockConfig:any = {
        rootOrg: 'test-org',
        org: ['test-org-1', 'test-org-2'],
        appSetup: {},
        positions: [],
        compentency: []
      };
      
      mockHttp.get.mockReturnValue(of(mockConfig));
      
      const result = await service['fetchDefaultConfig']();
      
      expect(mockHttp.get).toHaveBeenCalledWith('http://test.com/host.config.json');
      expect(mockConfigSvc.instanceConfig).toBe(mockConfig);
      expect(mockConfigSvc.rootOrg).toBe('test-org');
      expect(mockConfigSvc.org).toEqual(['test-org-1', 'test-org-2']);
      expect(mockConfigSvc.activeOrg).toBe('test-org-1');
      expect(result).toBe(mockConfig);
    });
  });

  describe('profileNudgeConfig', () => {
    it('should fetch and set profile nudge configuration', async () => {
      const mockConfig:any = {
        profileTimelyNudges: { key: 'value' }
      };
      
      mockHttp.get.mockReturnValue(of(mockConfig));
      
      const result = await service['profileNudgeConfig']();
      
      expect(mockHttp.get).toHaveBeenCalledWith('http://test.com/profile-nudge.json');
      expect(mockConfigSvc.profileTimelyNudges).toBe(mockConfig.profileTimelyNudges);
      expect(result).toBe(mockConfig);
    });
  });

  describe('netCoreConfig', () => {
    it('should fetch netcore configuration', async () => {
      const mockPayload:any = {
        request: {
          type: "page",
          subType: "netcore",
          action: "page-configuration",
          component: "portal",
          rootOrgId: "*"
        }
      };
      
      const mockResponse:any = {
        netcoreConfig: { key: 'value' }
      };
      
      mockNetCoreService.netCoreConfigReadData.mockReturnValue(of(mockResponse));
      
      const result = await service['netCoreConfig']();
      
      expect(mockNetCoreService.netCoreConfigReadData).toHaveBeenCalledWith(mockPayload);
      expect(mockConfigSvc.netcoreConfig).toBe(mockResponse.netcoreConfig);
      expect(result).toBe(mockResponse);
    });
  });

  describe('fetchUserEnrollDetails', () => {
    it('should fetch and process user enrollment details', async () => {
      const mockResponse = {
        result: {
          userCourseEnrolmentInfo: {
            karmaPoints: 100,
            timeSpentOnCompletedCourses: 50,
            certificatesIssued: 5,
            coursesInProgress: 3,
            addinfo: {
              claimedNonACBPCourseKarmaQuota: 20
            }
          },
          userExternalCourseEnrolmentInfo: {
            karmaPoints: 50,
            timeSpentOnCompletedCourses: 25,
            certificatesIssued: 2,
            coursesInProgress: 1,
            addinfo: {
              claimedNonACBPCourseKarmaQuota: 10
            }
          }
        }
      };
      
      mockEnrollSvc.fetchEnrollStats.mockReturnValue(of(mockResponse));
      mockConfigSvc.userProfile = { userId: 'test-user', rootOrgId: 'test-org' };
      mockNetCoreService.getOrgReadData.mockReturnValue(of({}));
      
      //const result = await service['fetchUserEnrollDetails']();
      
      expect(mockEnrollSvc.fetchEnrollStats).toHaveBeenCalledWith('test-user');
      expect(localStorage.setItem).toHaveBeenCalled();
      
      // Verify the call was made with enrollment data
      const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls;
      const enrollmentCall = setItemCalls.find(call => call[0] === 'userEnrollmentCount');
      expect(enrollmentCall).toBeTruthy();
      expect(enrollmentCall[1]).toContain('enrolledCourseCount');
    });

    it('should handle enrollment fetch error', async () => {
      mockEnrollSvc.fetchEnrollStats.mockReturnValue(throwError('Error'));
      
     // const result = await service['fetchUserEnrollDetails']();
      
      expect(localStorage.setItem).toHaveBeenCalled();
      
      // Verify the call was made with default enrollment data
      const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls;
      const enrollmentCall = setItemCalls.find(call => call[0] === 'userEnrollmentCount');
      expect(enrollmentCall).toBeTruthy();
      expect(enrollmentCall[1]).toContain('enrolledCourseCount":0');
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      // Mock environment.portalRoles
      (environment as any).portalRoles = ['ADMIN', 'USER', 'MANAGER'];
    });

    it('should return true when user has valid role', () => {
      const roles = ['ADMIN', 'GUEST'];
      const result = service.hasRole(roles);
      expect(result).toBe(true);
    });

    it('should return false when user has no valid roles', () => {
      const roles = ['GUEST', 'VISITOR'];
      const result = service.hasRole(roles);
      expect(result).toBe(false);
    });

    it('should return false for empty roles array', () => {
      const roles: string[] = [];
      const result = service.hasRole(roles);
      expect(result).toBe(false);
    });
  });

  describe('setTelemetrySessionId', () => {
    it('should remove existing session ID and set new one', () => {
      service['setTelemetrySessionId']();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('telemetrySessionId');
      expect(localStorage.setItem).toHaveBeenCalledWith('telemetrySessionId', 'mock-uuid-123');
    });
  });

  describe('logFirstLogin', () => {
    it('should log first login when not already logged', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      mockHttp.get.mockReturnValue(of({ result: true }));
      
      service['logFirstLogin']();
      
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/login/entry');
    });

    it('should not log when already logged', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');
      
      service['logFirstLogin']();
      
      expect(mockHttp.get).not.toHaveBeenCalled();
    });
  });

  describe('fetchStartUpDetails', () => {
    beforeEach(() => {
      service['fetchWelcomeConfig'] = jest.fn().mockResolvedValue({});
      service['checkUserFeed'] = jest.fn();
      service['updateTelemetryConfig'] = jest.fn();
      service['setTelemetrySessionId'] = jest.fn();
    });

    it('should fetch user profile successfully', async () => {
      const mockUserProfile = {
        userId: 'test-user',
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john@test.com',
        thumbnail: 'avatar.jpg',
        channel: 'test-channel',
        rootOrgId: 'test-org',
        roles: ['USER'],
        profileDetails: {
          personalDetails: {
            firstname: 'John',
            surname: 'Doe'
          },
          mandatoryFieldsExists: true
        },
        promptTnC: false,
        isDeleted: false
      };
      
      mockHttp.get.mockReturnValue(of({
        result: { response: mockUserProfile }
      }));
      
      service.hasRole = jest.fn().mockReturnValue(true);
      
      const result = await service['fetchStartUpDetails']();
      
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read');
      expect(mockConfigSvc.userProfile).toBeDefined();
      expect(mockConfigSvc.userProfile.firstName).toBe('John');
      expect(mockConfigSvc.userProfile.lastName).toBe('Doe');
      expect(result.profileDetailsStatus).toBe(true);
      expect(result.tncStatus).toBe(true);
    });

    it('should handle invalid user role', async () => {
      const mockUserProfile = {
        roles: ['INVALID_ROLE']
      };
      
      mockHttp.get.mockReturnValue(of({
        result: { response: mockUserProfile },
        redirectUrl: 'http://redirect.com'
      }));
      
      service.hasRole = jest.fn().mockReturnValue(false);
      
      // Mock window.location.href assignment
      delete (window as any).location;
      (window as any).location = { href: '' };
      
      try {
        await service['fetchStartUpDetails']();
      } catch (error) {
        // Expected to throw error due to redirect
      }
      
      expect(window.location.href).toBe('http://redirect.com');
    });

    it('should handle API error', async () => {
      mockHttp.get.mockReturnValue(throwError('API Error'));
      
      try {
        await service['fetchStartUpDetails']();
      } catch (error:any) {
        expect(error.message).toBe('Invalid user');
        expect(mockConfigSvc.userProfile).toBeNull();
      }
    });

    it('should return default values when PID check is disabled', async () => {
      mockConfigSvc.instanceConfig.disablePidCheck = true;
      
      const result = await service['fetchStartUpDetails']();
      
      expect(result).toEqual({
        group: [],
        profileDetailsStatus: true,
        roles: new Set(['Public']),
        tncStatus: true,
        isActive: true
      });
    });
  });

  describe('updateTelemetryConfig', () => {
    it('should set public endpoint for anonymous telemetry', () => {
      service['isAnonymousTelemetry'] = true;
      mockConfigSvc.instanceConfig = {
        telemetryConfig: {
          endpoint: '',
          publicEndpoint: 'public-endpoint',
          protectedEndpoint: 'protected-endpoint'
        }
      };
      
      service['updateTelemetryConfig']();
      
      expect(mockConfigSvc.instanceConfig.telemetryConfig.endpoint).toBe('public-endpoint');
    });

    it('should set protected endpoint for authenticated users', () => {
      service['isAnonymousTelemetry'] = false;
      mockConfigSvc.instanceConfig = {
        telemetryConfig: {
          endpoint: '',
          publicEndpoint: 'public-endpoint',
          protectedEndpoint: 'protected-endpoint'
        }
      };
      
      service['updateTelemetryConfig']();
      
      expect(mockConfigSvc.instanceConfig.telemetryConfig.endpoint).toBe('protected-endpoint');
    });
  });

  describe('netCoreUserLoginSetup', () => {
    beforeEach(() => {
      service['toTitleCase'] = jest.fn().mockImplementation((str) => str);
      mockConfigSvc.unMappedUser = {
        identifier: 'test-user',
        profileDetails: {
          personalDetails: {
            firstname: 'John',
            domicileMedium: 'English',
            primaryEmail: 'john@test.com',
            mobile: '1234567890'
          },
          profileStatus: 'active',
          professionalDetails: [{
            designation: 'Developer',
            group: 'IT'
          }],
          employmentDetails: {
            departmentName: 'Technology'
          }
        }
      };
      mockConfigSvc.netcoreConfig = {
        netcoreWebConfig: {
          isActive: true,
          events: {
            user_signin: {
              isActive: true
            }
          }
        }
      };
    });

    it('should setup netcore user login', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      await service.netCoreUserLoginSetup();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('netCoreUserSetup', 'true');
      expect(mockNetCoreService.netCoreUserLoginSetup).toHaveBeenCalled();
      
      // Verify the call was made with correct structure
      const callArgs = mockNetCoreService.netCoreUserLoginSetup.mock.calls[0][0];
      expect(callArgs['pk^userid']).toBe('test-user');
      expect(callArgs['FULL_NAME']).toBe('John');
      expect(mockNetCoreService.trackEvent).toHaveBeenCalledWith('user_signin', 'test-user');
    });
  });

  describe('toTitleCase', () => {
    it('should convert string to title case', () => {
      const result = service.toTitleCase('hello world test');
      expect(result).toBe('Hello World Test');
    });

    it('should handle single word', () => {
      const result = service.toTitleCase('hello');
      expect(result).toBe('Hello');
    });

    it('should handle empty string', () => {
      const result = service.toTitleCase('');
      expect(result).toBe('');
    });
  });

  describe('checkUserFeed', () => {
    beforeEach(() => {
      // Reset moment mock before each test
      const moment = require('moment');
      moment.mockClear();
      moment.subtract.mockClear();
      moment().subtract.mockClear();
      moment().isBefore.mockClear();
    });

    it('should process NPS feed correctly', () => {
      const mockFeedResponse = {
        result: {
          response: {
            userFeed: [{
              id: 'feed-1',
              category: 'NPS',
              data: {
                actionData: {
                  formId: 'form-123'
                }
              }
            }]
          }
        }
      };
      
      mockConfigSvc.unMappedUser = { id: 'test-user' };
      mockNpsSvc.getFeedStatus.mockReturnValue(of(mockFeedResponse));
      
      service['checkUserFeed']();
      
      expect(mockNpsSvc.getFeedStatus).toHaveBeenCalledWith('test-user');
      expect(localStorage.setItem).toHaveBeenCalledWith('ratingformID', '"form-123"');
      expect(localStorage.setItem).toHaveBeenCalledWith('ratingfeedID', '["feed-1"]');
    });

    it('should handle NPS2 category feed', () => {
      const mockFeedResponse = {
        result: {
          response: {
            userFeed: [{
              id: 'feed-2',
              category: 'NPS2',
              data: {
                actionData: {
                  formId: 'form-456'
                }
              }
            }]
          }
        }
      };
      
      mockConfigSvc.unMappedUser = { id: 'test-user' };
      mockNpsSvc.getFeedStatus.mockReturnValue(of(mockFeedResponse));
      
      service['checkUserFeed']();
      
      expect(mockNpsSvc.getFeedStatus).toHaveBeenCalledWith('test-user');
      expect(localStorage.setItem).toHaveBeenCalledWith('ratingformID', '"form-456"');
      expect(localStorage.setItem).toHaveBeenCalledWith('ratingfeedID', '["feed-2"]');
    });

    it('should set survey popup flag', () => {
      mockConfigSvc.unMappedUser = { id: 'test-user' };
      mockNpsSvc.getFeedStatus.mockReturnValue(of({ result: { response: { userFeed: [] } } }));
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      service['checkUserFeed']();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('surveyPopup', 'true');
    });

    it('should maintain existing survey popup setting when false', () => {
      mockConfigSvc.unMappedUser = { id: 'test-user' };
      mockNpsSvc.getFeedStatus.mockReturnValue(of({ result: { response: { userFeed: [] } } }));
      (localStorage.getItem as jest.Mock).mockReturnValue('false');
      
      service['checkUserFeed']();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('surveyPopup', 'false');
    });

    it('should check platform rating time correctly', () => {
      const mockFeedResponse = {
        result: {
          response: {
            userFeed: []
          }
        }
      };
      
      mockConfigSvc.unMappedUser = { id: 'test-user' };
      mockNpsSvc.getFeedStatus.mockReturnValue(of(mockFeedResponse));
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('2023-01-01T00:00:00Z') // platformratingTime
        .mockReturnValueOnce(null); // surveyPopup
      
      const moment = require('moment');
      moment().isBefore.mockReturnValue(true); // Is next day
      
      service['checkUserFeed']();
      
      expect(moment().subtract).toHaveBeenCalledWith(24, 'hours');
      expect(moment().isBefore).toHaveBeenCalled();
    });
  });

  describe('locale getter', () => {
    it('should return locale from baseHref', () => {
      (service as any).baseHref = '/en/';
      expect(service.locale).toBe('en');
    });

    it('should return default locale when baseHref is empty', () => {
      (service as any).baseHref = '/';
      expect(service.locale).toBe('en');
    });
  });

  describe('defaultRedirectUrl getter', () => {
    it('should return baseURI when available', () => {
      const result = service['defaultRedirectUrl'];
      expect(result).toBe('http://test.com');
    });

    it('should return location.origin when baseURI throws error', () => {
      Object.defineProperty(document, 'baseURI', {
        get: () => { throw new Error('Test error'); }
      });
      
      const result = service['defaultRedirectUrl'];
      expect(result).toBe('http://test.com');
    });
  });
});