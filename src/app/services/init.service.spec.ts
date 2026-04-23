import { of } from 'rxjs'

jest.mock('@sunbird-cb/resolver', () => ({
  hasPermissions: jest.fn(),
  hasUnitPermission: jest.fn(),
  NsWidgetResolver: {},
  WidgetResolverService: jest.fn().mockImplementation(() => ({})),
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn().mockImplementation(() => ({})),
  LoggerService: jest.fn().mockImplementation(() => ({})),
  NsAppsConfig: {},
  NsInstanceConfig: {},
  UserPreferenceService: jest.fn().mockImplementation(() => ({})),
  WidgetEnrollService: jest.fn().mockImplementation(() => ({})),
}), { virtual: true })

jest.mock('@ws/app/src/lib/routes/profile-v3/models/profile-v3.models', () => ({
  NSProfileDataV3: {},
}), { virtual: true })

// Fix uuid ESM issue
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}))

// Fix lodash default export
jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { ...actual, default: actual }
})

jest.mock('../../../library/ws-widget/collection/src/public-api', () => ({
  BtnSettingsService: jest.fn(),
}))

jest.mock('@sunbird-cb/resolver-v2', () => ({
  SbUiResolverService: jest.fn(),
}), { virtual: true })

jest.mock('@sunbird-cb/collection/src/lib/grid-layout/nps-grid.service', () => ({
  NPSGridService: jest.fn(),
}), { virtual: true })

// Mock dependencies
const mockLoggerService = {
  removeConsoleAccess: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockConfigurationsService = {
  baseUrl: 'http://localhost:3000',
  isProduction: false,
  instanceConfig: null as any,
  rootOrg: null as any,
  org: null as any,
  activeOrg: null as any,
  userProfile: null as any,
  userProfileV2: null as any,
  unMappedUser: null as any,
  nodebbUserProfile: null as any,
  hasAcceptedTnc: false,
  profileDetailsStatus: false,
  userGroups: new Set(),
  userRoles: new Set(),
  isActive: true,
  restrictedFeatures: new Set(),
  restrictedWidgets: new Set(),
  appsConfig: null as any,
  welcomeTabs: null as any,
  primaryNavBar: null as any,
  pageNavBar: null as any,
  primaryNavBarConfig: null as any,
  sitePath: '/site',
  portalUrls: null as any,
  positions: null as any,
  compentency: null as any,
  appSetup: null as any,
  profileTimelyNudges: null as any,
  netcoreConfig: null as any,
  overrideThemeChanges: null as any,
  pinnedApps: { next: jest.fn() },
  profileSettings: null as any,
  updateProfileObservable: of(false),
};

const mockWidgetResolverService = {
  initialize: jest.fn(),
};

const mockSbUiResolverService = {
  initialize: jest.fn(),
};

const mockBtnSettingsService = {
  initializePrefChanges: jest.fn(),
};

const mockUserPreferenceService = {
  initialize: jest.fn(),
  fetchUserPreference: jest.fn().mockResolvedValue({
    pinnedApps: 'app1,app2,app3',
    profileSettings: { theme: 'dark' },
    selectedLocale: 'fr',
  }),
};

const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockNPSGridService = {
  getFeedStatus: jest.fn(),
};

const mockTranslateService = {
  use: jest.fn(),
  setDefaultLang: jest.fn(),
};

const mockWidgetEnrollService = {
  fetchEnrollStats: jest.fn(),
};

const mockNetCoreService = {
  netCoreConfigReadData: jest.fn(),
  getOrgReadData: jest.fn(),
  netCoreUserLoginSetup: jest.fn(),
  trackEvent: jest.fn(),
};

const mockDomSanitizer = {
  bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('trusted-url'),
};

const mockMatIconRegistry = {
  addSvgIcon: jest.fn(),
};

// Mock environment
jest.mock('../../environments/environment', () => ({
  environment: {
    production: false,
    portalRoles: ['admin', 'user', 'moderator'],
  },
}));

// Mock external libraries
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, defaultValue) => {
    if (!obj || !path) return defaultValue;
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    return result;
  }),
  set: jest.fn(),
  map: jest.fn((array, path) => {
    if (!Array.isArray(array)) return [];
    return array.map(item => {
      const keys = path.split('.');
      let result = item;
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return undefined;
        }
      }
      return result;
    });
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-123'),
}));

jest.mock('moment', () => {
  const mockMoment = jest.fn(() => ({
    subtract: jest.fn().mockReturnThis(),
    isBefore: jest.fn().mockReturnValue(false),
  }));
  return mockMoment;
});

// Mock global objects
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/app',
    pathname: '/app',
    origin: 'http://localhost:3000',
  },
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(document, 'title', {
  value: '',
  writable: true,
});

Object.defineProperty(document, 'getElementById', {
  value: jest.fn().mockReturnValue({ 
    setAttribute: jest.fn(), 
    href: '',
    getAttribute: jest.fn(),
  }),
});

Object.defineProperty(document, 'baseURI', {
  value: 'http://localhost:3000/',
  writable: true,
  configurable: true,
});

// Mock smartech global
(global as any).smartech = jest.fn();

// Add a helper function to simulate a failed promise
const fail = (message: string) => {
  throw new Error(message);
};

// Mock widget resolver permissions
jest.mock('@sunbird-cb/resolver/src/lib/widget-resolver.permissions', () => ({
  hasPermissions: jest.fn().mockReturnValue(true),
  hasUnitPermission: jest.fn().mockReturnValue(true),
}));

// Mock widget resolver service
jest.mock('@sunbird-cb/resolver/src/lib/widget-resolver.service', () => ({
  WidgetResolverService: {
    getWidgetKey: jest.fn().mockReturnValue('test-widget-key'),
  },
}));

describe('InitService', () => {
  let service: InitService
  let mockLogger: any
  let mockConfigSvc: any
  let mockWidgetResolverService: any
  let mockSbUiResolverService: any
  let mockSettingsSvc: any
  let mockUserPreference: any
  let mockHttp: any
  let mockNpsSvc: any
  let mockTranslate: any
  let mockEnrollSvc: any
  let mockNetCoreService: any
  let mockGlobalService: any
  let mockCommonDataSvc: any
  let mockDomSanitizer: any
  let mockIconRegistry: any

  function buildService() {
    return new InitService(
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
      mockGlobalService,
      mockCommonDataSvc,
      '/',
      mockDomSanitizer,
      mockIconRegistry
    )
  }

  beforeEach(() => {
    mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }

    mockConfigSvc = {
      isProduction: false,
      baseUrl: '/assets',
      instanceConfig: null,
      rootOrg: '',
      org: ['org1'],
      activeOrg: '',
      appSetup: false,
      positions: [],
      compentency: [],
      appsConfig: null,
      restrictedWidgets: new Set(),
      userRoles: [],
      userGroups: [],
      restrictedFeatures: new Set(),
      profileTimelyNudges: null,
      globalConfig: null,
      netcoreConfig: null,
      unMappedUser: null,
      userProfile: null,
      updateProfileObservable: new (require('rxjs').Subject)(),
    }

    mockWidgetResolverService = { initialize: jest.fn() }
    mockSbUiResolverService = { initialize: jest.fn() }
    mockSettingsSvc = { initializePrefChanges: jest.fn() }
    mockUserPreference = { initialize: jest.fn(), fetchUserPreference: jest.fn() }
    mockHttp = { get: jest.fn().mockReturnValue(of({})) }
    mockNpsSvc = {}
    mockTranslate = { use: jest.fn(), setDefaultLang: jest.fn() }
    mockEnrollSvc = { fetchEnrollStats: jest.fn() }
    mockNetCoreService = { netCoreConfigReadData: jest.fn().mockReturnValue(of({})) }
    mockGlobalService = { globalConfigReadData: jest.fn().mockReturnValue(of({})) }
    mockCommonDataSvc = {}

    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => url),
    }

    mockIconRegistry = {
      addSvgIcon: jest.fn(),
    }

    service = buildService()
  })

  describe('constructor', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy()
    })

    it('should set configSvc.isProduction from environment', () => {
      // environment.production is false in test env
      expect(mockConfigSvc.isProduction).toBe(false)
    })

    it('should register svg icons via iconRegistry', () => {
      expect(mockIconRegistry.addSvgIcon).toHaveBeenCalled()
    })

    it('should register pin icon', () => {
      expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'pin',
        expect.anything()
      )
    })

    it('should register facebook icon', () => {
      expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'facebook',
        expect.anything()
      )
    })

    it('should register download icon', () => {
      expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'download',
        expect.anything()
      )
    })

    it('should call bypassSecurityTrustResourceUrl for each icon', () => {
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
    })
  })

  describe('isAnonymousTelemetry property', () => {
    it('should be true when url includes /public/', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/toc/abc', pathname: '/public/toc/abc' },
        writable: true,
      })
      const svc = buildService()
      expect(svc.isAnonymousTelemetry).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('should be false when url is regular page', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/page/home', pathname: '/page/home' },
        writable: true,
      })
      const svc = buildService()
      expect(svc.isAnonymousTelemetry).toBe(false)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('should be true for /certs url', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/certs/123', pathname: '/certs/123' },
        writable: true,
      })
      const svc = buildService()
      expect(svc.isAnonymousTelemetry).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })
  })

  describe('isAnonymousTelemetryRequired getter', () => {
    it('should return true for /public/ url', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/toc/id', pathname: '/public/toc/id' },
        writable: true,
      })
      expect(service.isAnonymousTelemetryRequired).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('should return true for /helpcenter url', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/helpcenter/faq', pathname: '/helpcenter/faq' },
        writable: true,
      })
      expect(service.isAnonymousTelemetryRequired).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('should return false for authenticated page', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/page/home', pathname: '/page/home' },
        writable: true,
      })
      expect(service.isAnonymousTelemetryRequired).toBe(false)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })
  })
})

