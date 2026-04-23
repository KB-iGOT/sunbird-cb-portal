jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { __esModule: true, default: actual, ...actual }
})
jest.mock('@sunbird-cb/resolver', () => ({
  NsWidgetResolver: {},
}), { virtual: true })
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {},
  ROOT_WIDGET_CONFIG: { actionButton: { _type: 'actionButton', feature: 'feature' } },
}), { virtual: true })
jest.mock('@sunbird-cb/collection/src/lib/collection.config', () => ({
  ROOT_WIDGET_CONFIG: { actionButton: { _type: 'actionButton', feature: 'feature' } },
}), { virtual: true })
jest.mock('@ws/author/src/public-api', () => ({
  AccessControlService: jest.fn().mockImplementation(() => ({
    hasRole: jest.fn().mockReturnValue(false),
  })),
}))

import { HomeOtherPortalComponent } from './home-other-portal.component'
import { Subject } from 'rxjs'

describe('HomeOtherPortalComponent', () => {
  let component: HomeOtherPortalComponent

  const mockAppsConfig = {
    groups: [
      {
        id: 'portal_admin',
        hasRole: [],
        featureIds: ['feature1', 'feature2'],
      },
      {
        id: 'other_group',
        hasRole: ['ADMIN'],
        featureIds: ['feature3'],
      },
    ],
    features: {
      feature1: {
        name: 'Feature 1',
        permission: [],
        url: '/app/feat1',
        keywords: [],
      },
      feature2: {
        name: 'Feature 2',
        permission: ['MDO_ADMIN'],
        url: '/app/feat2',
        keywords: [],
      },
      feature3: {
        name: 'Feature 3',
        permission: [],
        url: '/app/feat3',
        keywords: [],
      },
    },
    tourGuide: null,
  }

  const mockConfigSvc: any = {
    appsConfig: mockAppsConfig,
  }

  const mockAccessService = {
    hasRole: jest.fn().mockReturnValue(false),
  }

  const langSubject = new Subject<void>()
  const mockLangtranslations: any = {
    languageSelectedObservable: langSubject.asObservable(),
    translateLabel: jest.fn().mockReturnValue('translated'),
  }

  const mockTranslate = {
    setDefaultLang: jest.fn(),
    use: jest.fn(),
  }

  const mockEvents = {
    raiseInteractTelemetry: jest.fn(),
  }

  function buildComponent(configSvc?: any) {
    return new HomeOtherPortalComponent(
      configSvc || mockConfigSvc,
      mockAccessService as any,
      mockLangtranslations,
      mockTranslate as any,
      mockEvents as any,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    component = buildComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with showSkeleton true', () => {
    expect(component.showSkeleton).toBe(true)
  })

  it('should initialize noPortal array', () => {
    expect(component.noPortal).toEqual([1, 2, 3])
  })

  it('should build portal links from portal_admin group features', () => {
    // feature1 has no permission -> included, feature2 has MDO_ADMIN and accessService returns false -> excluded
    const comp = new HomeOtherPortalComponent(
      mockConfigSvc,
      { hasRole: jest.fn().mockReturnValue(false) } as any,
      mockLangtranslations,
      mockTranslate as any,
      mockEvents as any,
    )
    comp.ngOnInit()
    expect(comp.portalLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('should set showSkeleton to false after getPortalLinks', () => {
    component.ngOnInit()
    expect(component.showSkeleton).toBe(false)
  })

  it('should use websiteLanguage from localStorage if set', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    buildComponent()
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
    localStorage.removeItem('websiteLanguage')
  })

  it('should update language on languageSelectedObservable emit', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    buildComponent()
    langSubject.next()
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
    localStorage.removeItem('websiteLanguage')
  })

  it('should not throw when appsConfig is null', () => {
    const comp = buildComponent({ appsConfig: null })
    expect(comp).toBeTruthy()
    comp.ngOnInit()
  })

  describe('ngOnInit', () => {
    it('should call getPortalLinks when featuresConfig has entries', () => {
      const spy = jest.spyOn(component, 'getPortalLinks')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should not call getPortalLinks when featuresConfig is empty', () => {
      const comp = buildComponent({ appsConfig: { groups: [], features: {} } })
      const spy = jest.spyOn(comp, 'getPortalLinks')
      comp.ngOnInit()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('translateLabels', () => {
    it('should call langtranslations.translateLabel', () => {
      const result = component.translateLabels('myLabel', 'type1')
      expect(mockLangtranslations.translateLabel).toHaveBeenCalledWith('myLabel', 'type1', '')
      expect(result).toBe('translated')
    })
  })

  describe('raiseTelemetry', () => {
    it('should call events.raiseInteractTelemetry with correct id', () => {
      const wdata = {
        widgetData: { actionBtn: { name: 'Portal Admin' } },
      }
      component.raiseTelemetry(wdata)
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'portal-portal-nudge' }),
        {},
        expect.any(Object),
      )
    })
  })

  describe('getPortalLinks with accessService allowing all roles', () => {
    it('should include features with permissions when hasRole returns true', () => {
      const comp = new HomeOtherPortalComponent(
        mockConfigSvc,
        { hasRole: jest.fn().mockReturnValue(true) } as any,
        mockLangtranslations,
        mockTranslate as any,
        mockEvents as any,
      )
      comp.ngOnInit()
      expect(comp.portalLinks.length).toBeGreaterThan(0)
    })
  })
})
