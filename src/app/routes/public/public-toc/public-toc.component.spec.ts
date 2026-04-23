// Virtual mocks must be declared before any imports
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EPrimaryCategory: {
      KNOWLEDGE_ARTIFACT: 'Knowledge Artifact',
      RESOURCE: 'Resource',
      PRACTICE_RESOURCE: 'Practice Resource',
      OFFLINE_SESSION: 'Offline Session',
      COURSE: 'Course',
    },
    EFilterCategory: { PRACTICE: 'Practice' },
  },
  viewerRouteGenerator: jest.fn(),
  NsPlaylist: {},
  NsGoal: {},
  RatingService: jest.fn().mockImplementation(() => ({})),
}), { virtual: true })

jest.mock('@sunbird-cb/collection/src/lib/_common/content-rating-v2-dialog/content-rating-v2-dialog.component', () => ({
  ContentRatingV2DialogComponent: jest.fn(),
}), { virtual: true })

jest.mock('@sunbird-cb/toc', () => ({
  NsAppToc: {},
  AppTocService: jest.fn().mockImplementation(() => ({})),
  ActionService: jest.fn().mockImplementation(() => ({})),
  WidgetContentService: jest.fn().mockImplementation(() => ({})),
}), { virtual: true })

jest.mock('src/app/services/mobile-apps.service', () => ({
  MobileAppsService: jest.fn().mockImplementation(() => ({})),
}), { virtual: true })

jest.mock('@ws/author/src/public-api', () => ({
  AccessControlService: jest.fn().mockImplementation(() => ({
    hasAccess: jest.fn().mockReturnValue(true),
  })),
}), { virtual: true })

// Fix for 'import _ from lodash' with esModuleInterop: false
jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { ...actual, default: actual }
})

import { of, Subject } from 'rxjs'
import { PublicTocComponent, ErrorType } from './public-toc.component'

describe('public-toc.component — module-level helpers', () => {
  // flattenItems is not exported, but we can verify the component uses it by
  // checking tocStructure after initData sets content.  We focus instead on
  // ErrorType enum values.
  describe('ErrorType enum', () => {
    it('should have internalServer value', () => {
      expect(ErrorType.internalServer).toBe('internalServer')
    })
    it('should have serviceUnavailable value', () => {
      expect(ErrorType.serviceUnavailable).toBe('serviceUnavailable')
    })
    it('should have somethingWrong value', () => {
      expect(ErrorType.somethingWrong).toBe('somethingWrong')
    })
  })
})

describe('PublicTocComponent', () => {
  let component: PublicTocComponent
  let mockRoute: any
  let mockRouter: any
  let mockContentSvc: any
  let mockTocSvc: any
  let mockLoggerSvc: any
  let mockConfigSvc: any
  let mockDomSanitizer: any
  let mockAuthAccessControlSvc: any
  let mockDialog: any
  let mockMobileAppsSvc: any
  let mockUtilitySvc: any
  let mockActionSVC: any
  let mockRatingSvc: any

  beforeEach(() => {
    mockRoute = {
      fragment: of(null),
      data: of({ pageData: { data: {} } }),
      queryParamMap: of({ get: jest.fn().mockReturnValue(null) }),
    }

    mockRouter = {
      events: new Subject<any>(),
      url: '/public/toc/some-id',
      navigate: jest.fn(),
    }

    mockContentSvc = {}

    mockTocSvc = {
      subtitleOnBanners: false,
      showDescription: false,
      analyticsFetchStatus: 'none',
      batchReplaySubject: new Subject<any>(),
      initData: jest.fn().mockReturnValue({ content: null, errorCode: null }),
      getTocStructure: jest.fn().mockReturnValue({
        assessment: 0, finalTest: 0, course: 0, handsOn: 0,
        interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0,
        survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0,
        webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0,
      }),
      fetchPostAssessmentStatus: jest.fn().mockReturnValue(of({ result: [] })),
    }

    mockLoggerSvc = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }

    mockConfigSvc = {
      instanceConfig: {
        logos: { defaultSourceLogo: '/logo.png' },
      },
      restrictedFeatures: new Set<string>(),
      pageNavBar: {},
    }

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('<safe>'),
      bypassSecurityTrustStyle: jest.fn().mockReturnValue('safe-style'),
    }

    mockAuthAccessControlSvc = {
      proxyToAuthoringUrl: jest.fn().mockReturnValue('proxied'),
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: jest.fn(() => of(null)) }),
    }

    mockMobileAppsSvc = {
      sendViewerData: jest.fn(),
    }

    mockUtilitySvc = {}

    mockActionSVC = {
      getUpdateCompGroupO: new Subject<any>(),
    }

    mockRatingSvc = {}

    component = new PublicTocComponent(
      mockRoute,
      mockRouter,
      mockContentSvc,
      mockTocSvc,
      mockLoggerSvc,
      mockConfigSvc,
      mockDomSanitizer,
      mockAuthAccessControlSvc,
      mockDialog,
      mockMobileAppsSvc,
      mockUtilitySvc,
      mockActionSVC,
      mockRatingSvc
    )
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize breadcrumbs via handleBreadcrumbs()', () => {
      expect(component.breadcrumbs).toEqual({
        url: 'home',
        titles: [
          { title: 'Learn', url: '/page/learn', icon: 'school' },
          { title: 'Details', url: 'none' },
        ],
      })
    })
  })

  describe('handleBreadcrumbs', () => {
    it('should set breadcrumbs with correct structure', () => {
      component.handleBreadcrumbs()
      expect(component.breadcrumbs.url).toBe('home')
      expect(component.breadcrumbs.titles).toHaveLength(2)
    })
  })

  describe('handleScroll', () => {
    it('should set sticky to true when scroll >= elementPosition - 100', () => {
      component.elementPosition = 100
      Object.defineProperty(window, 'pageYOffset', { value: 10, writable: true })
      component.handleScroll()
      expect(component.sticky).toBe(true)
    })

    it('should set sticky to false when scroll < elementPosition - 100', () => {
      component.elementPosition = 500
      Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true })
      component.handleScroll()
      expect(component.sticky).toBe(false)
    })
  })

  describe('enableAnalytics getter', () => {
    it('should return true when tocAnalytics is NOT in restrictedFeatures', () => {
      mockConfigSvc.restrictedFeatures = new Set(['somethingElse'])
      expect(component.enableAnalytics).toBe(true)
    })

    it('should return false when tocAnalytics IS in restrictedFeatures', () => {
      mockConfigSvc.restrictedFeatures = new Set(['tocAnalytics'])
      expect(component.enableAnalytics).toBe(false)
    })

    it('should return false when restrictedFeatures is not set', () => {
      mockConfigSvc.restrictedFeatures = null
      expect(component.enableAnalytics).toBe(false)
    })
  })

  describe('isResource getter', () => {
    it('should return false when content is null', () => {
      component.content = null
      expect(component.isResource).toBe(false)
    })

    it('should return true for KNOWLEDGE_ARTIFACT primaryCategory', () => {
      component.content = {
        primaryCategory: 'Knowledge Artifact',
        children: [],
      } as any
      expect(component.isResource).toBe(true)
    })

    it('should return true when content has no children', () => {
      component.content = {
        primaryCategory: 'Course',
        children: [],
      } as any
      expect(component.isResource).toBe(true)
    })
  })

  describe('getStartDate getter', () => {
    it('should return NA when content is null', () => {
      component.content = null
      expect(component.getStartDate).toBe('NA')
    })

    it('should return NA when content has no batches matching currentCourseBatchId', () => {
      component.content = { batches: [] } as any
      component.currentCourseBatchId = 'batch-1'
      expect(component.getStartDate).toBe('NA')
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from routeSubscription', () => {
      const sub = { unsubscribe: jest.fn() }
      component.routeSubscription = sub as any
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should unsubscribe from batchSubscription', () => {
      const sub = { unsubscribe: jest.fn() }
      component.batchSubscription = sub as any
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should reset tocSvc.analyticsFetchStatus to none', () => {
      component.ngOnDestroy()
      expect(mockTocSvc.analyticsFetchStatus).toBe('none')
    })

    it('should unsubscribe from routerParamSubscription', () => {
      const sub = { unsubscribe: jest.fn() }
      component.routerParamSubscription = sub as any
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when subscriptions are null', () => {
      component.routeSubscription = null
      component.batchSubscription = null
      component.routerParamSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('ngAfterViewChecked', () => {
    it('should not throw when fragment is null', () => {
      component['fragment'] = null as any
      expect(() => component.ngAfterViewChecked()).not.toThrow()
    })

    it('should not throw when fragment element is not found', () => {
      component['fragment'] = 'nonexistent-id'
      expect(() => component.ngAfterViewChecked()).not.toThrow()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should not throw', () => {
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  describe('properties initialization', () => {
    it('should have showMoreGlance as false initially', () => {
      expect(component.showMoreGlance).toBe(false)
    })

    it('should have sticky as false initially', () => {
      expect(component.sticky).toBe(false)
    })

    it('should have validPaths set', () => {
      expect(component.validPaths.has('overview')).toBe(true)
      expect(component.validPaths.has('contents')).toBe(true)
      expect(component.validPaths.has('analytics')).toBe(true)
    })

    it('should have currentFragment as overview initially', () => {
      expect(component.currentFragment).toBe('overview')
    })

    it('should have disableEnrollBtn as false', () => {
      expect(component.disableEnrollBtn).toBe(false)
    })
  })
})
