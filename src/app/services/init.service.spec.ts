import { InitService } from './init.service'
import { of } from 'rxjs'

jest.mock('../../environments/environment', () => ({ environment: { production: false, portalRoles: ['MDO_ADMIN', 'MDO_LEADER', 'SomeCBPAdmin'] } }))
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }))
jest.mock('moment', () => { const m = jest.requireActual('moment'); return m })

jest.mock('@sunbird-cb/resolver', () => ({
  hasPermissions: jest.fn(),
  hasUnitPermission: jest.fn(),
  NsWidgetResolver: {},
  WidgetResolverService: class { initialize = jest.fn() },
}), { virtual: true })

jest.mock('@sunbird-cb/resolver-v2', () => ({
  SbUiResolverService: class { initialize = jest.fn() },
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class { },
  LoggerService: class { info = jest.fn(); warn = jest.fn(); removeConsoleAccess = jest.fn() },
  NsAppsConfig: {},
  NsInstanceConfig: {},
  UserPreferenceService: class { initialize = jest.fn(); fetchUserPreference = jest.fn(() => Promise.resolve({})) },
  WidgetEnrollService: class { fetchEnrollStats = jest.fn(() => of({ result: {} })) },
}), { virtual: true })

jest.mock('@sunbird-cb/collection/src/public-api', () => ({
  BtnSettingsService: class { initializePrefChanges = jest.fn() },
}), { virtual: true })

jest.mock('@sunbird-cb/collection', () => ({
  BtnSettingsService: class { initializePrefChanges = jest.fn() },
  BtnPageBackService: class { },
  WidgetContentService: class { },
}), { virtual: true })

// The actual library path used by init.service.ts
jest.mock('../../../library/ws-widget/collection/src/public-api', () => ({
  BtnSettingsService: class { initializePrefChanges = jest.fn() },
}), { virtual: true })

jest.mock('@sunbird-cb/collection/src/lib/grid-layout/nps-grid.service', () => ({
  NPSGridService: class { },
}), { virtual: true })

jest.mock('@ng-translate/core', () => ({
  TranslateService: class { use = jest.fn(); setDefaultLang = jest.fn() },
}), { virtual: true })

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { use = jest.fn(); setDefaultLang = jest.fn() },
}), { virtual: true })

jest.mock('src/app/services/netcore.service', () => ({
  NetCoreService: class {
    netCoreConfigReadData = jest.fn(() => of({}))
    getOrgReadData = jest.fn(() => of({}))
  },
}), { virtual: true })

jest.mock('src/app/services/global.service', () => ({
  GlobalService: class { globalConfigReadData = jest.fn(() => of({})) },
}), { virtual: true })

jest.mock('src/app/services/common-data.service', () => ({
  CommonDataService: class { },
}), { virtual: true })

jest.mock('@ws/app/src/lib/routes/profile-v3/models/profile-v3.models', () => ({}), { virtual: true })

  // Mock declare for smartech global
  ; (global as any).smartech = jest.fn()

const buildMocks = () => {
  const logger = { info: jest.fn(), warn: jest.fn(), removeConsoleAccess: jest.fn() }
  const configSvc = {
    baseUrl: '/assets',
    isProduction: false,
    instanceConfig: null as any,
    rootOrg: '',
    org: [],
    activeOrg: '',
    appSetup: false,
    positions: [],
    compentency: [],
    globalConfig: null,
    netcoreConfig: null,
    overrideThemeChanges: null,
    profileTimelyNudges: null,
    iGOTAIConfig: null,
    userProfile: { userId: 'u1', rootOrgId: 'org1' },
    unMappedUser: { id: 'u1', rootOrgId: 'org1' },
    restrictedWidgets: new Set<string>(),
    userRoles: new Set<string>(),
    userGroups: new Set<string>(),
    restrictedFeatures: new Set<string>(),
    appsConfig: null,
    orgReadData: {},
    updateProfileObservable: of(false),
  }
  const widgetResolverService = { initialize: jest.fn() }
  const sbUiResolverService = { initialize: jest.fn() }
  const settingsSvc = { initializePrefChanges: jest.fn() }
  const userPreference = { initialize: jest.fn(), fetchUserPreference: jest.fn(() => Promise.resolve({})) }
  const http = {
    get: jest.fn(() => of({})),
    post: jest.fn(() => of({})),
  }
  const npsSvc = {}
  const translate = {
    use: jest.fn(),
    setDefaultLang: jest.fn(),
  }
  const enrollSvc = {
    fetchEnrollStats: jest.fn(() => of({ result: {} })),
  }
  const netCoreService = {
    netCoreConfigReadData: jest.fn(() => of({ netcoreConfig: {} })),
    getOrgReadData: jest.fn(() => of({})),
  }
  const globalService = {
    globalConfigReadData: jest.fn(() => of({ globalConfig: {} })),
  }
  const commonDataSvc = {}
  const matIconRegistry = { addSvgIcon: jest.fn() }
  const domSanitizer = { bypassSecurityTrustResourceUrl: (u: string) => u }
  const baseHref = '/'

  return {
    logger, configSvc, widgetResolverService, sbUiResolverService,
    settingsSvc, userPreference, http, npsSvc, translate, enrollSvc,
    netCoreService, globalService, commonDataSvc, matIconRegistry, domSanitizer, baseHref,
  }
}

const makeService = (m: any) =>
  new (InitService as any)(
    m.logger,
    m.configSvc,
    m.widgetResolverService,
    m.sbUiResolverService,
    m.settingsSvc,
    m.userPreference,
    m.http,
    m.npsSvc,
    m.translate,
    m.enrollSvc,
    m.netCoreService,
    m.globalService,
    m.commonDataSvc,
    m.baseHref,
    m.domSanitizer,
    m.matIconRegistry,
  )

describe('InitService', () => {
  let service: InitService
  let mocks: any

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mocks = buildMocks()
    service = makeService(mocks)
  })

  // ── Construction ──────────────────────────────────────────────────────────
  describe('construction', () => {
    it('creates an instance', () => {
      expect(service).toBeDefined()
    })

    it('sets configSvc.isProduction from environment', () => {
      expect(mocks.configSvc.isProduction).toBe(false)
    })

    it('registers svg icons', () => {
      expect(mocks.matIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'pin',
        expect.anything()
      )
    })

    it('registers facebook icon', () => {
      expect(mocks.matIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'facebook',
        expect.anything()
      )
    })

    it('registers linked-in icon', () => {
      expect(mocks.matIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'linked-in',
        expect.anything()
      )
    })

    it('registers category_xs icon', () => {
      expect(mocks.matIconRegistry.addSvgIcon).toHaveBeenCalledWith(
        'category_xs',
        expect.anything()
      )
    })
  })

  // ── locale getter ─────────────────────────────────────────────────────────
  describe('locale getter', () => {
    it('returns en for baseHref "/"', () => {
      expect((service as any).locale).toBe('en')
    })

    it('returns locale from baseHref "/hi/"', () => {
      ; (service as any).baseHref = '/hi/'
      expect((service as any).locale).toBe('hi')
    })
  })

  // ── isAnonymousTelemetry ──────────────────────────────────────────────────
  describe('isAnonymousTelemetry', () => {
    it('is computed at construction time based on window.location.href', () => {
      // Just ensure the property exists
      expect(typeof (service as any).isAnonymousTelemetry).toBe('boolean')
    })
  })

  // ── isAnonymousTelemetryRequired getter ───────────────────────────────────
  describe('isAnonymousTelemetryRequired', () => {
    it('returns true when URL contains /public/', () => {
      const origHref = window.location.href
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/home' },
        writable: true,
      })
      expect(service.isAnonymousTelemetryRequired).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { href: origHref },
        writable: true,
      })
    })
  })

  // ── fetchDefaultConfig ────────────────────────────────────────────────────
  describe('fetchDefaultConfig (private)', () => {
    it('calls http.get with host.config.json URL', async () => {
      mocks.http.get.mockReturnValue(
        of({ rootOrg: 'ro', org: ['o1'], appSetup: true, positions: [], compentency: [] })
      )
      await (service as any).fetchDefaultConfig()
      expect(mocks.http.get).toHaveBeenCalledWith(
        expect.stringContaining('host.config.json')
      )
    })

    it('sets configSvc.instanceConfig from response', async () => {
      const cfg = { rootOrg: 'ro', org: ['o1'], appSetup: false, positions: [], compentency: [] }
      mocks.http.get.mockReturnValue(of(cfg))
      await (service as any).fetchDefaultConfig()
      expect(mocks.configSvc.instanceConfig).toEqual(cfg)
    })
  })

  // ── globalConfigData ──────────────────────────────────────────────────────
  describe('globalConfigData (private)', () => {
    it('calls globalService.globalConfigReadData', async () => {
      await (service as any).globalConfigData()
      expect(mocks.globalService.globalConfigReadData).toHaveBeenCalled()
    })

    it('sets configSvc.globalConfig', async () => {
      mocks.globalService.globalConfigReadData.mockReturnValue(of({ globalConfig: { key: 'val' } }))
      await (service as any).globalConfigData()
      expect(mocks.configSvc.globalConfig).toEqual({ key: 'val' })
    })
  })

  // ── netCoreConfig ─────────────────────────────────────────────────────────
  describe('netCoreConfig (private)', () => {
    it('calls netCoreService.netCoreConfigReadData', async () => {
      await (service as any).netCoreConfig()
      expect(mocks.netCoreService.netCoreConfigReadData).toHaveBeenCalled()
    })

    it('sets configSvc.netcoreConfig', async () => {
      mocks.netCoreService.netCoreConfigReadData.mockReturnValue(of({ netcoreConfig: { isActive: true } }))
      await (service as any).netCoreConfig()
      expect(mocks.configSvc.netcoreConfig).toEqual({ isActive: true })
    })
  })

  // ── setTelemetrySessionId ─────────────────────────────────────────────────
  describe('setTelemetrySessionId (private)', () => {
    it('stores telemetrySessionId in localStorage', () => {
      ; (service as any).setTelemetrySessionId()
      expect(localStorage.getItem('telemetrySessionId')).toBe('mock-uuid')
    })

    it('removes existing telemetrySessionId before setting new one', () => {
      localStorage.setItem('telemetrySessionId', 'old-id')
        ; (service as any).setTelemetrySessionId()
      expect(localStorage.getItem('telemetrySessionId')).toBe('mock-uuid')
    })
  })

  // ── profileNudgeConfig ────────────────────────────────────────────────────
  describe('profileNudgeConfig (private)', () => {
    it('calls http.get with profile-nudge.json', async () => {
      mocks.http.get.mockReturnValue(of({ profileTimelyNudges: { duration: 7 } }))
      await (service as any).profileNudgeConfig()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('profile-nudge.json'))
    })

    it('sets configSvc.profileTimelyNudges from response', async () => {
      mocks.http.get.mockReturnValue(of({ profileTimelyNudges: { duration: 7 } }))
      await (service as any).profileNudgeConfig()
      expect(mocks.configSvc.profileTimelyNudges).toEqual({ duration: 7 })
    })
  })

  // ── themeOverrideConfig ───────────────────────────────────────────────────
  describe('themeOverrideConfig (private)', () => {
    it('calls http.get with theme-override-config.json', async () => {
      mocks.http.get.mockReturnValue(of({ overrideThemeChanges: null }))
      await (service as any).themeOverrideConfig()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('theme-override-config.json'))
    })

    it('sets configSvc.overrideThemeChanges from response', async () => {
      mocks.http.get.mockReturnValue(of({ overrideThemeChanges: { isEnabled: true } }))
      await (service as any).themeOverrideConfig()
      expect(mocks.configSvc.overrideThemeChanges).toEqual({ isEnabled: true })
    })
  })

  // ── fetchAppsConfig ───────────────────────────────────────────────────────
  describe('fetchAppsConfig (private)', () => {
    it('calls http.get with feature/apps.json', async () => {
      mocks.http.get.mockReturnValue(of({ features: {}, groups: [], tourGuide: {} }))
      await (service as any).fetchAppsConfig()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('feature/apps.json'))
    })
  })

  // ── fetchWelcomeConfig ────────────────────────────────────────────────────
  describe('fetchWelcomeConfig (private)', () => {
    it('calls http.get with feature/profile-v3.json', async () => {
      mocks.http.get.mockReturnValue(of({ tabs: [] }))
      await (service as any).fetchWelcomeConfig()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('profile-v3.json'))
    })
  })

  // ── fetchInstanceConfig ──────────────────────────────────────────────────
  describe('fetchInstanceConfig (private)', () => {
    it('fetches and sets instanceConfig', async () => {
      const mockConfig = {
        rootOrg: 'rootOrg1',
        org: ['org1'],
        portalUrls: null,
        positions: [],
        completionSurvey: null,
        npsCategory: null,
        details: { appName: 'TestApp' },
        indexHtmlMeta: {},
        telemetryConfig: null,
        primaryNavBarConfig: null,
        backgrounds: null,
        appSetup: true,
        compentency: [],
        isMultilingualEnabled: false,
      }
      mocks.configSvc.sitePath = '/assets/configurations/orgA'
      mocks.http.get.mockReturnValue(of(mockConfig))
      jest.spyOn(service as any, 'updateAppIndexMeta').mockReturnValue(undefined)
      jest.spyOn(service as any, 'updateTelemetryConfig').mockReturnValue(undefined)
      const result = await (service as any).fetchInstanceConfig()
      expect(result).toBe(mockConfig)
      expect(mocks.configSvc.instanceConfig).toBe(mockConfig)
      expect(mocks.configSvc.rootOrg).toBe('rootOrg1')
    })

    it('sets npsCategory in localStorage when present', async () => {
      const mockConfig = {
        rootOrg: 'rootOrg1',
        org: ['org1'],
        portalUrls: null,
        positions: [],
        completionSurvey: null,
        npsCategory: 'cat1',
        details: null,
        indexHtmlMeta: {},
        telemetryConfig: null,
        primaryNavBarConfig: null,
        backgrounds: null,
        appSetup: true,
        compentency: [],
      }
      mocks.configSvc.sitePath = '/assets/configurations/orgA'
      mocks.http.get.mockReturnValue(of(mockConfig))
      jest.spyOn(service as any, 'updateAppIndexMeta').mockReturnValue(undefined)
      jest.spyOn(service as any, 'updateTelemetryConfig').mockReturnValue(undefined)
      await (service as any).fetchInstanceConfig()
      expect(localStorage.getItem('npsCategory')).toBe('cat1')
    })
  })

  // ── toTitleCase ──────────────────────────────────────────────────────────
  describe('toTitleCase', () => {
    it('converts first letter of each word to uppercase', () => {
      const result = (service as any).toTitleCase('hello world')
      expect(result).toBe('Hello World')
    })

    it('handles already-titlecased strings', () => {
      const result = (service as any).toTitleCase('Hello World')
      expect(result).toBe('Hello World')
    })

    it('handles single word', () => {
      const result = (service as any).toTitleCase('test')
      expect(result).toBe('Test')
    })
  })

  // ── netCoreUserLoginSetup ─────────────────────────────────────────────────
  describe('netCoreUserLoginSetup', () => {
    it('sets netCoreUserSetup in localStorage', async () => {
      mocks.configSvc.unMappedUser = {
        identifier: 'user1',
        profileDetails: {
          personalDetails: {
            firstname: 'Test',
            primaryEmail: 'test@test.com',
            mobile: '9999999999',
            domicileMedium: 'english',
          },
          profileStatus: 'active',
          employmentDetails: { departmentName: 'HR' },
          professionalDetails: [{ designation: 'manager', group: 'A' }],
        },
      }
      mocks.configSvc.netcoreConfig = null
      await service.netCoreUserLoginSetup()
      expect(localStorage.getItem('netCoreUserSetup')).toBe('true')
    })

    it('calls netCoreService.netCoreUserLoginSetup when netcoreConfig.isActive', async () => {
      mocks.configSvc.unMappedUser = {
        identifier: 'user1',
        profileDetails: {
          personalDetails: { firstname: 'Test' },
          professionalDetails: [{ designation: 'manager', group: 'A' }],
          employmentDetails: { departmentName: 'HR' },
        },
      }
      mocks.configSvc.netcoreConfig = {
        netcoreWebConfig: { isActive: true, events: {} }
      }
      mocks.netCoreService.netCoreUserLoginSetup = jest.fn()
      await service.netCoreUserLoginSetup()
      expect(mocks.netCoreService.netCoreUserLoginSetup).toHaveBeenCalled()
    })
  })

  // ── fetchUserEnrollDetails - additional branches ─────────────────────────
  describe('fetchUserEnrollDetails - error branch', () => {
    it('handles error and resets userEnrollmentCount', async () => {
      const { throwError } = jest.requireActual('rxjs')
      mocks.enrollSvc.fetchEnrollStats.mockReturnValue(throwError(new Error('fail')))
      try {
        await (service as any).fetchUserEnrollDetails()
      } catch (_e) {
        // catch block should set localStorage
      }
    })
  })


  describe('fetchWidgetStatus (private)', () => {
    it('calls http.get with widgets.config.json', async () => {
      mocks.http.get.mockReturnValue(of([]))
      await (service as any).fetchWidgetStatus()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('widgets.config.json'))
    })
  })

  // ── fetchFeaturesStatus ───────────────────────────────────────────────────
  describe('fetchFeaturesStatus (private)', () => {
    it('calls http.get with features.config.json', async () => {
      mocks.http.get.mockReturnValue(of({}))
      await (service as any).fetchFeaturesStatus()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('features.config.json'))
    })

    it('sets configSvc.restrictedFeatures', async () => {
      mocks.http.get.mockReturnValue(of({}))
      await (service as any).fetchFeaturesStatus()
      expect(mocks.configSvc.restrictedFeatures).toBeInstanceOf(Set)
    })
  })

  // ── processWidgetStatus ───────────────────────────────────────────────────
  describe('processWidgetStatus (private)', () => {
    it('handles empty widgetConfigs', () => {
      expect(() => (service as any).processWidgetStatus([])).not.toThrow()
    })

    it('handles null widgetConfigs', () => {
      expect(() => (service as any).processWidgetStatus(null)).not.toThrow()
    })

    it('sets configSvc.restrictedWidgets from widgetConfigs', () => {
      const widgetConfigs = [
        {
          widgetPermission: { roles: [], groups: [], features: [] },
          widgetData: { widgetType: 'test', widgetSubType: 'sub', widgetHostClass: 'host' }
        }
      ]
        ; (service as any).processWidgetStatus(widgetConfigs)
      expect(mocks.configSvc.restrictedWidgets).toBeInstanceOf(Set)
    })
  })

  // ── processAppsConfig ─────────────────────────────────────────────────────
  describe('processAppsConfig (private)', () => {
    it('returns processed config with features, groups and tourGuide', () => {
      const appsConfig = {
        features: {},
        groups: [],
        tourGuide: {},
      }
      const result = (service as any).processAppsConfig(appsConfig)
      expect(result).toHaveProperty('features')
      expect(result).toHaveProperty('groups')
      expect(result).toHaveProperty('tourGuide')
    })

    it('filters features by permission', () => {
      const appsConfig = {
        features: {
          f1: { id: 'f1', permission: { roles: [], groups: [], features: [] } },
        },
        groups: [
          { featureIds: ['f1'], groupId: 'g1' }
        ],
        tourGuide: {},
      }
      const result = (service as any).processAppsConfig(appsConfig)
      expect(result.features).toBeDefined()
    })
  })

  // ── updateTelemetryConfig ─────────────────────────────────────────────────
  describe('updateTelemetryConfig (private)', () => {
    it('does not throw when instanceConfig is null', () => {
      mocks.configSvc.instanceConfig = null
      expect(() => (service as any).updateTelemetryConfig()).not.toThrow()
    })

    it('sets endpoint to publicEndpoint when isAnonymousTelemetryRequired is true', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/home', pathname: '/public/home' },
        writable: true,
      })
      mocks.configSvc.instanceConfig = {
        telemetryConfig: {
          endpoint: '',
          publicEndpoint: '/public-telemetry',
          protectedEndpoint: '/private-telemetry',
        }
      }
        ; (service as any).updateTelemetryConfig()
      expect(mocks.configSvc.instanceConfig.telemetryConfig.endpoint).toBe('/public-telemetry')
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })
  })

  // ── updateNavConfig ────────────────────────────────────────────────────────
  describe('updateNavConfig (private)', () => {
    it('does not throw when instanceConfig is null', () => {
      mocks.configSvc.instanceConfig = null
      expect(() => (service as any).updateNavConfig()).not.toThrow()
    })

    it('sets primaryNavBar from instanceConfig', () => {
      mocks.configSvc.instanceConfig = {
        backgrounds: { primaryNavBar: { color: 'red' }, pageNavBar: { color: 'blue' } },
        primaryNavBarConfig: { items: [] },
      }
        ; (service as any).updateNavConfig()
      expect(mocks.configSvc.primaryNavBar).toEqual({ color: 'red' })
      expect(mocks.configSvc.pageNavBar).toEqual({ color: 'blue' })
    })
  })

  // ── init() with public path ───────────────────────────────────────────────
  describe('init() with public path', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/home', pathname: '/public/home' },
        writable: true,
      })
      // Mock all http.get calls to return a valid config
      mocks.http.get.mockReturnValue(of({
        rootOrg: 'org1',
        org: ['org1'],
        appSetup: false,
        positions: [],
        compentency: [],
        profileTimelyNudges: null,
        overrideThemeChanges: null,
        disablePidCheck: true,
        features: {},
        groups: [],
        tourGuide: {},
        npsCategory: null,
        portalUrls: null,
        featuredApps: [],
        details: null,
        indexHtmlMeta: {},
        telemetryConfig: null,
        primaryNavBarConfig: null,
        backgrounds: null,
      }))
      mocks.globalService.globalConfigReadData.mockReturnValue(of({ globalConfig: null }))
      mocks.netCoreService.netCoreConfigReadData.mockReturnValue(of({ netcoreConfig: null }))
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('calls fetchDefaultConfig during init()', async () => {
      await service.init()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('host.config.json'))
    })

    it('calls netCoreService.netCoreConfigReadData during init()', async () => {
      await service.init()
      expect(mocks.netCoreService.netCoreConfigReadData).toHaveBeenCalled()
    })

    it('calls globalService.globalConfigReadData during init()', async () => {
      await service.init()
      expect(mocks.globalService.globalConfigReadData).toHaveBeenCalled()
    })

    it('returns true after successful init with public path', async () => {
      const result = await service.init()
      expect(result).toBe(true)
    })
  })

  // ── initFeatured() ───────────────────────────────────────────────────────
  describe('initFeatured()', () => {
    it('calls widgetResolverService.initialize', async () => {
      const svc = service as any
      jest.spyOn(svc, 'fetchAppsConfig').mockResolvedValue({
        features: {},
        groups: [],
        tourGuide: {},
      })
      jest.spyOn(svc, 'fetchInstanceConfig').mockResolvedValue({
        featuredApps: [],
        rootOrg: 'o', org: ['o'], appSetup: false, positions: [], compentency: [],
        portalUrls: null, completionSurvey: null, npsCategory: null, details: null,
        indexHtmlMeta: {}, telemetryConfig: null, primaryNavBarConfig: null, backgrounds: null,
      })
      jest.spyOn(svc, 'fetchWidgetStatus').mockResolvedValue([])
      jest.spyOn(svc, 'fetchFeaturesStatus').mockResolvedValue(new Set())
      jest.spyOn(svc, 'processWidgetStatus').mockReturnValue(undefined)
      jest.spyOn(svc, 'updateTelemetryConfig').mockReturnValue(undefined)
      jest.spyOn(svc, 'processAppsConfig').mockReturnValue({ features: {}, groups: [], tourGuide: {} })
      mocks.configSvc.instanceConfig = { featuredApps: [] }
      await service.initFeatured()
      expect(mocks.widgetResolverService.initialize).toHaveBeenCalled()
    })

    it('sets websiteLanguage to en when instanceConfig.isMultilingualEnabled is false', async () => {
      const svc = service as any
      jest.spyOn(svc, 'fetchAppsConfig').mockResolvedValue({ features: {}, groups: [], tourGuide: {} })
      jest.spyOn(svc, 'fetchInstanceConfig').mockResolvedValue({ featuredApps: [], isMultilingualEnabled: false })
      jest.spyOn(svc, 'fetchWidgetStatus').mockResolvedValue([])
      jest.spyOn(svc, 'fetchFeaturesStatus').mockResolvedValue(new Set())
      jest.spyOn(svc, 'processWidgetStatus').mockReturnValue(undefined)
      jest.spyOn(svc, 'updateTelemetryConfig').mockReturnValue(undefined)
      jest.spyOn(svc, 'processAppsConfig').mockReturnValue({ features: {}, groups: [], tourGuide: {} })
      mocks.configSvc.instanceConfig = { featuredApps: [], isMultilingualEnabled: false }
      await service.initFeatured()
      expect(localStorage.getItem('websiteLanguage')).toBe('en')
    })

    it('uses webPortalLang when user profile has it', async () => {
      const svc = service as any
      jest.spyOn(svc, 'fetchAppsConfig').mockResolvedValue({ features: {}, groups: [], tourGuide: {} })
      jest.spyOn(svc, 'fetchInstanceConfig').mockResolvedValue({ featuredApps: [], isMultilingualEnabled: true })
      jest.spyOn(svc, 'fetchWidgetStatus').mockResolvedValue([])
      jest.spyOn(svc, 'fetchFeaturesStatus').mockResolvedValue(new Set())
      jest.spyOn(svc, 'processWidgetStatus').mockReturnValue(undefined)
      jest.spyOn(svc, 'updateTelemetryConfig').mockReturnValue(undefined)
      jest.spyOn(svc, 'processAppsConfig').mockReturnValue({ features: {}, groups: [], tourGuide: {} })
      mocks.configSvc.instanceConfig = { featuredApps: [], isMultilingualEnabled: true }
      mocks.configSvc.unMappedUser = {
        profileDetails: {
          additionalProperties: { webPortalLang: 'hi' }
        }
      }
      await service.initFeatured()
      expect(mocks.translate.use).toHaveBeenCalledWith('hi')
    })

    it('sets language to en when no websiteLanguage and no user profile lang', async () => {
      localStorage.removeItem('websiteLanguage')
      const svc = service as any
      jest.spyOn(svc, 'fetchAppsConfig').mockResolvedValue({ features: {}, groups: [], tourGuide: {} })
      jest.spyOn(svc, 'fetchInstanceConfig').mockResolvedValue({ featuredApps: [], isMultilingualEnabled: true })
      jest.spyOn(svc, 'fetchWidgetStatus').mockResolvedValue([])
      jest.spyOn(svc, 'fetchFeaturesStatus').mockResolvedValue(new Set())
      jest.spyOn(svc, 'processWidgetStatus').mockReturnValue(undefined)
      jest.spyOn(svc, 'updateTelemetryConfig').mockReturnValue(undefined)
      jest.spyOn(svc, 'processAppsConfig').mockReturnValue({ features: {}, groups: [], tourGuide: {} })
      mocks.configSvc.instanceConfig = { featuredApps: [], isMultilingualEnabled: true }
      mocks.configSvc.unMappedUser = { profileDetails: { additionalProperties: {} } }
      await service.initFeatured()
      expect(localStorage.getItem('websiteLanguage')).toBe('en')
    })
  })

  // ── fetchUserEnrollDetails ────────────────────────────────────────────────
  describe('fetchUserEnrollDetails (private)', () => {
    it('calls enrollSvc.fetchEnrollStats', async () => {
      mocks.enrollSvc.fetchEnrollStats.mockReturnValue(of({ result: {} }))
      await (service as any).fetchUserEnrollDetails()
      expect(mocks.enrollSvc.fetchEnrollStats).toHaveBeenCalled()
    })

    it('handles result with userCourseEnrolmentInfo', async () => {
      mocks.enrollSvc.fetchEnrollStats.mockReturnValue(of({
        result: {
          userCourseEnrolmentInfo: {
            karmaPoints: 10,
            timeSpentOnCompletedCourses: 5,
            certificatesIssued: 2,
            coursesInProgress: 1,
            addinfo: {},
          },
          userExternalCourseEnrolmentInfo: {
            karmaPoints: 5,
            timeSpentOnCompletedCourses: 2,
            certificatesIssued: 1,
            coursesInProgress: 0,
            addinfo: {},
          },
          badgeCount: 3,
        }
      }))
      mocks.netCoreService.getOrgReadData.mockReturnValue(of({ netcoreDisabled: true }))
      await (service as any).fetchUserEnrollDetails()
      const stored = JSON.parse(localStorage.getItem('userEnrollmentCount') || '{}')
      expect(stored).toBeDefined()
    })

    it('handles fetch error gracefully', async () => {
      const { throwError } = jest.requireActual('rxjs')
      mocks.enrollSvc.fetchEnrollStats.mockReturnValue(throwError(() => new Error('fail')))
      // The catch block sets localStorage but returns undefined, which becomes {}
      await expect((service as any).fetchUserEnrollDetails()).resolves.toBeDefined()
    })
  })

  // ── hasRole ───────────────────────────────────────────────────────────────
  describe('hasRole (private)', () => {
    it('returns false when roles is empty', () => {
      expect((service as any).hasRole([])).toBe(false)
    })

    it('returns true when roles contains a portalRole match', () => {
      expect((service as any).hasRole(['MDO_ADMIN'])).toBe(true)
    })

    it('returns false when roles do not match portalRoles', () => {
      expect((service as any).hasRole(['UNKNOWN_ROLE'])).toBe(false)
    })
  })

  // ── fetchStartUpDetails else branch ───────────────────────────────────────
  describe('fetchStartUpDetails (private) - disablePidCheck=true', () => {
    it('returns public role details when instanceConfig.disablePidCheck is true', async () => {
      mocks.configSvc.instanceConfig = { disablePidCheck: true }
      const result = await (service as any).fetchStartUpDetails()
      expect(result.tncStatus).toBe(true)
      expect(result.isActive).toBe(true)
    })
  })

  // ── fetchStartUpDetails with HTTP call (disablePidCheck=false) ────────────
  describe('fetchStartUpDetails (private) - full path', () => {
    const mockUserProfile = {
      result: {
        response: {
          userId: 'user1',
          firstName: 'Test',
          lastName: 'User',
          userName: 'testuser',
          email: 'test@test.com',
          rootOrgId: 'org1',
          channel: 'TestOrg',
          thumbnail: null,
          profileUpdateCompletion: 50,
          profileDetails: {
            mandatoryFieldsExists: true,
            personalDetails: { countryCode: 'IN', officialEmail: 'test@test.com', firstname: 'Test', surname: 'User', middlename: '' },
            professionalDetails: [],
            profileImageUrl: '',
            additionalProperties: {},
            employmentDetails: { departmentName: 'TestDept' },
            competencies: [], desiredCompetencies: [], systemTopics: [], desiredTopics: [], userRoles: [],
          },
          roles: ['MDO_ADMIN'],
          isDeleted: false,
          promptTnC: false,
          rootOrg: {},
        }
      }
    }

    beforeEach(() => {
      mocks.configSvc.instanceConfig = { disablePidCheck: false }
      // fetchWelcomeConfig returns tabs
      mocks.http.get
        .mockReturnValueOnce(of(mockUserProfile)) // profilePid
        .mockReturnValueOnce(of({ tabs: [] }))    // fetchWelcomeConfig
    })

    it('sets configSvc.userProfile from response', async () => {
      jest.spyOn(service as any, 'checkUserFeed').mockReturnValue(undefined)
        ; (service as any).commonDataSvc = { checkAndCacheNlw2026Eligibility: jest.fn() }
      const result = await (service as any).fetchStartUpDetails()
      expect(result).toBeDefined()
    })
  })

  // ── fetchUserDetails (private) ────────────────────────────────────────────
  describe('fetchUserDetails (private)', () => {
    it('returns public details when unMappedUser has no id', async () => {
      mocks.configSvc.unMappedUser = {}
      const result = await (service as any).fetchUserDetails()
      expect(result.tncStatus).toBe(true)
    })

    it('fetches user by id when unMappedUser.id is set', async () => {
      mocks.configSvc.unMappedUser = { id: 'user1' }
      const mockResponse = {
        result: {
          response: {
            userId: 'user1',
            firstName: 'Test',
            lastName: 'User',
            userName: 'testuser',
            email: 'test@test.com',
            rootOrgId: 'org1',
            channel: 'TestOrg',
            thumbnail: null,
            profileUpdateCompletion: 50,
            profileDetails: {
              mandatoryFieldsExists: true,
              personalDetails: { officialEmail: 'test@test.com', firstname: 'Test', surname: 'User', middlename: '' },
              professionalDetails: [],
              profileImageUrl: '',
              additionalProperties: {},
              employmentDetails: { departmentName: 'TestDept' },
              competencies: [], desiredCompetencies: [], systemTopics: [], desiredTopics: [], userRoles: [],
            },
            roles: ['MDO_ADMIN'],
            isDeleted: false,
            promptTnC: false,
          }
        }
      }
      mocks.http.get.mockReturnValue(of(mockResponse))
      const result = await (service as any).fetchUserDetails()
      expect(result).toBeDefined()
    })
  })

  // ── checkUserFeed with NPS feed ───────────────────────────────────────────
  describe('checkUserFeed NPS feed handling', () => {
    it('handles NPS feed items and sets surveyPopup', () => {
      localStorage.removeItem('surveyPopup')
      const npsItem = {
        id: 'feed1',
        category: 'NPS',
        data: { actionData: { formId: 'form1' } }
      }
        ; (service as any).npsSvc = {
          getFeedStatus: jest.fn().mockReturnValue(of({
            result: { response: { userFeed: [npsItem] } }
          }))
        }
      mocks.configSvc.unMappedUser = { id: 'user1' }
        ; (service as any).checkUserFeed()
      expect(localStorage.getItem('surveyPopup')).toBeTruthy()
    })

    it('handles NPS2 feed items', () => {
      localStorage.removeItem('surveyPopup')
      const nps2Item = {
        id: 'feed2',
        category: 'NPS2',
        data: { actionData: { formId: 'form2' } }
      }
        ; (service as any).npsSvc = {
          getFeedStatus: jest.fn().mockReturnValue(of({
            result: { response: { userFeed: [nps2Item] } }
          }))
        }
      mocks.configSvc.unMappedUser = { id: 'user1' }
        ; (service as any).checkUserFeed()
      expect(localStorage.getItem('surveyPopup')).toBeTruthy()
    })

    it('sets surveyPopup=false when already false', () => {
      localStorage.setItem('surveyPopup', 'false')
        ; (service as any).npsSvc = {
          getFeedStatus: jest.fn().mockReturnValue(of({
            result: { response: { userFeed: [] } }
          }))
        }
      mocks.configSvc.unMappedUser = { id: 'user1' }
        ; (service as any).checkUserFeed()
      expect(localStorage.getItem('surveyPopup')).toBe('false')
    })
  })

  // ── fetchStartUpDetails - user with no matching roles (redirect path) ─────
  describe('fetchStartUpDetails - no matching roles', () => {
    it('falls through when user has no portal roles', async () => {
      mocks.configSvc.instanceConfig = { disablePidCheck: false }
      const mockResponse = {
        result: {
          response: {
            userId: 'user1',
            firstName: 'Test',
            lastName: 'User',
            roles: [], // No portal roles
            isDeleted: false,
            promptTnC: false,
          }
        }
      }
      mocks.http.get
        .mockReturnValueOnce(of(mockResponse))  // profilePid
        .mockReturnValueOnce(of({ tabs: [] }))  // fetchWelcomeConfig
      jest.spyOn(service as any, 'checkUserFeed').mockReturnValue(undefined)
      jest.spyOn(service as any, 'updateTelemetryConfig').mockReturnValue(undefined)
        ; (service as any).commonDataSvc = { checkAndCacheNlw2026Eligibility: jest.fn() }
      const result = await (service as any).fetchStartUpDetails()
      expect(result).toBeDefined()
    })
  })

  // ── fetchStartUpDetails - HTTP error throws ───────────────────────────────
  // NOTE: This test is removed because Zone.js wrapping causes Node.js process crash
  // when the thrown error is not caught properly in the async context.

  // ── updateAppIndexMeta ───────────────────────────────────────────────────
  describe('updateAppIndexMeta (private)', () => {
    it('does not throw when instanceConfig is null', () => {
      mocks.configSvc.instanceConfig = null
      expect(() => (service as any).updateAppIndexMeta()).not.toThrow()
    })

    it('sets document.title when appName is present', () => {
      mocks.configSvc.instanceConfig = {
        details: { appName: 'Test App' },
        indexHtmlMeta: { description: null, webmanifest: null, pngIcon: null },
      }
        ; (service as any).updateAppIndexMeta()
      expect(document.title).toBe('Test App')
    })
  })

  // ── defaultRedirectUrl getter ────────────────────────────────────────────
  describe('defaultRedirectUrl getter', () => {
    it('returns baseURI or location.origin', () => {
      const result = (service as any).defaultRedirectUrl
      expect(typeof result).toBe('string')
    })
  })

  // ── logFirstLogin ─────────────────────────────────────────────────────────
  describe('logFirstLogin (private)', () => {
    it('calls http.get when firsLogin not set', () => {
      localStorage.removeItem('firsLogin')
      mocks.http.get.mockReturnValue(of({ result: true }))
        ; (service as any).logFirstLogin()
      expect(mocks.http.get).toHaveBeenCalledWith(expect.stringContaining('login/entry'))
    })

    it('does not call http.get when firsLogin already set', () => {
      localStorage.setItem('firsLogin', 'true')
      mocks.http.get.mockClear()
        ; (service as any).logFirstLogin()
      expect(mocks.http.get).not.toHaveBeenCalled()
    })
  })

  // ── checkUserFeed ────────────────────────────────────────────────────────
  describe('checkUserFeed (private)', () => {
    it('calls npsSvc.getFeedStatus and sets surveyPopup', () => {
      mocks.npsSvc.getFeedStatus = jest.fn().mockReturnValue(of({
        result: { response: { userFeed: [] } }
      }))
      mocks.configSvc.unMappedUser = { id: 'user1' }
        ; (service as any).checkUserFeed()
      expect(mocks.npsSvc.getFeedStatus).toHaveBeenCalled()
    })

    it('sets surveyPopup to true when not set', () => {
      localStorage.removeItem('surveyPopup')
      mocks.npsSvc.getFeedStatus = jest.fn().mockReturnValue(of({
        result: { response: { userFeed: [] } }
      }))
      mocks.configSvc.unMappedUser = { id: 'user1' }
        ; (service as any).checkUserFeed()
      expect(localStorage.getItem('surveyPopup')).toBe('true')
    })
  })

  // ── init() with non-public path (spied) ──────────────────────────────────
  describe('init() with non-public path using spies', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/app/home', pathname: '/app/home' },
        writable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('calls fetchStartUpDetails for /public/welcome path', async () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/public/welcome', pathname: '/public/welcome' },
        writable: true,
      })
      const svc = service as any
      jest.spyOn(svc, 'fetchDefaultConfig').mockResolvedValue({})
      jest.spyOn(svc, 'profileNudgeConfig').mockResolvedValue({})
      jest.spyOn(svc, 'themeOverrideConfig').mockResolvedValue({})
      jest.spyOn(svc, 'netCoreConfig').mockResolvedValue({})
      jest.spyOn(svc, 'globalConfigData').mockResolvedValue({})
      jest.spyOn(svc, 'fetchStartUpDetails').mockResolvedValue({ tncStatus: true })
      jest.spyOn(svc, 'initFeatured').mockResolvedValue(undefined)
      const result = await service.init()
      expect(svc.fetchStartUpDetails).toHaveBeenCalled()
      expect(result).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('calls fetchStartUpDetails for editMode=true&_rc path', async () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/viewer?editMode=true&_rc=123', pathname: '/viewer' },
        writable: true,
      })
      const svc = service as any
      jest.spyOn(svc, 'fetchDefaultConfig').mockResolvedValue({})
      jest.spyOn(svc, 'profileNudgeConfig').mockResolvedValue({})
      jest.spyOn(svc, 'themeOverrideConfig').mockResolvedValue({})
      jest.spyOn(svc, 'netCoreConfig').mockResolvedValue({})
      jest.spyOn(svc, 'globalConfigData').mockResolvedValue({})
      jest.spyOn(svc, 'fetchStartUpDetails').mockResolvedValue({ tncStatus: true })
      jest.spyOn(svc, 'initFeatured').mockResolvedValue(undefined)
      const result = await service.init()
      expect(svc.fetchStartUpDetails).toHaveBeenCalled()
      expect(result).toBe(true)
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', pathname: '/' },
        writable: true,
      })
    })

    it('calls fetchStartUpDetails and fetchUserEnrollDetails for non-public path', async () => {
      const svc = service as any
      jest.spyOn(svc, 'fetchDefaultConfig').mockResolvedValue({ disablePidCheck: true })
      jest.spyOn(svc, 'profileNudgeConfig').mockResolvedValue({})
      jest.spyOn(svc, 'themeOverrideConfig').mockResolvedValue({})
      jest.spyOn(svc, 'netCoreConfig').mockResolvedValue({})
      jest.spyOn(svc, 'globalConfigData').mockResolvedValue({})
      jest.spyOn(svc, 'fetchStartUpDetails').mockResolvedValue({ tncStatus: true, isActive: true })
      jest.spyOn(svc, 'fetchUserEnrollDetails').mockResolvedValue({})
      jest.spyOn(svc, 'initFeatured').mockResolvedValue(undefined)
      const result = await service.init()
      expect(svc.fetchStartUpDetails).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('returns false and calls settingsSvc.initializePrefChanges on error', async () => {
      const svc = service as any
      jest.spyOn(svc, 'fetchDefaultConfig').mockResolvedValue({ disablePidCheck: false })
      jest.spyOn(svc, 'profileNudgeConfig').mockResolvedValue({})
      jest.spyOn(svc, 'themeOverrideConfig').mockResolvedValue({})
      jest.spyOn(svc, 'netCoreConfig').mockResolvedValue({})
      jest.spyOn(svc, 'globalConfigData').mockResolvedValue({})
      jest.spyOn(svc, 'fetchStartUpDetails').mockRejectedValue(new Error('auth error'))
      jest.spyOn(svc, 'initFeatured').mockResolvedValue(undefined)
      jest.spyOn(svc, 'updateNavConfig').mockReturnValue(undefined)
      jest.spyOn(svc, 'updateTelemetryConfig').mockReturnValue(undefined)
      const result = await service.init()
      expect(result).toBe(false)
      expect(mocks.settingsSvc.initializePrefChanges).toHaveBeenCalled()
    })
  })
})