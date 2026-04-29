jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs')
  return { __esModule: true, default: actualDayjs }
})

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
  NsAppToc: {
    EWsTocErrorCode: { API_FAILURE: 'API_FAILURE', INVALID_DATA: 'INVALID_DATA', NO_DATA: 'NO_DATA' },
  },
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

  describe('ngOnInit', () => {
    it('should call tocSvc.initData when route.data emits', () => {
      component.ngOnInit()
      expect(mockTocSvc.initData).toHaveBeenCalled()
    })
    it('should set defaultSLogo from instanceConfig', () => {
      component.ngOnInit()
      expect(component['defaultSLogo']).toBe('/logo.png')
    })
    it('should set isGoalsEnabled true when goals not restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set<string>()
      component.ngOnInit()
      expect(component['isGoalsEnabled']).toBe(true)
    })
    it('should set isGoalsEnabled false when goals restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['goals'])
      component.ngOnInit()
      expect(component['isGoalsEnabled']).toBe(false)
    })
    it('should handle missing instanceConfig logos gracefully', () => {
      mockConfigSvc.instanceConfig = {}
      component.ngOnInit()
      expect(component['defaultSLogo']).toBe('')
    })
    it('should set content when tocSvc.initData returns content', () => {
      const mockContent = { identifier: 'c1', primaryCategory: 'Course', body: '', children: [], registrationUrl: null }
      mockTocSvc.initData = jest.fn().mockReturnValue({ content: mockContent, errorCode: null })
      mockTocSvc.getTocStructure = jest.fn().mockReturnValue({ assessment: 0, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0 })
      mockTocSvc.filterToc = jest.fn().mockReturnValue(null)
      mockContentSvc.getFirstChildInHierarchy = jest.fn().mockReturnValue({ identifier: 'c', mimeType: 'mp4' })
      component.ngOnInit()
      expect(component.content).toEqual(mockContent)
    })
    it('should set errorType to internalServer for API_FAILURE', () => {
      mockTocSvc.initData = jest.fn().mockReturnValue({ content: null, errorCode: 'API_FAILURE' })
      component.ngOnInit()
      expect(component.errorWidgetData.widgetData.errorType).toBe('internalServer')
    })
    it('should set errorType to somethingWrong for unknown error', () => {
      mockTocSvc.initData = jest.fn().mockReturnValue({ content: null, errorCode: 'UNKNOWN' })
      component.ngOnInit()
      expect(component.errorWidgetData.widgetData.errorType).toBe('somethingWrong')
    })
  })

  describe('getters', () => {
    it('showStart should return tocSvc.showStartButton result', () => {
      mockTocSvc.showStartButton = jest.fn().mockReturnValue(true)
      expect(component.showStart).toBe(true)
    })
    it('showSubtitleOnBanner should reflect tocSvc.subtitleOnBanners', () => {
      mockTocSvc.subtitleOnBanners = true
      expect(component.showSubtitleOnBanner).toBe(true)
    })
    it('showActionButtons should return false when actionBtnStatus is wait', () => {
      component['actionBtnStatus'] = 'wait'
      expect(component.showActionButtons).toBe(false)
    })
    it('isPostAssessment should return false when tocConfig has no postAssessment', () => {
      component.tocConfig = {}
      expect(component.isPostAssessment).toBe(false)
    })
    it('sanitizedIntroductoryVideoIcon should return null when content is null', () => {
      component.content = null
      expect(component.sanitizedIntroductoryVideoIcon).toBeNull()
    })
    it('sanitizedIntroductoryVideoIcon should return safe style when content has icon', () => {
      component.content = { introductoryVideoIcon: 'http://icon.png' } as any
      expect(component.sanitizedIntroductoryVideoIcon).toBeTruthy()
    })
  })

  describe('getBatchId', () => {
    it('should return empty string when batchData is null', () => {
      component.batchData = null
      expect(component.getBatchId()).toBe('')
    })
    it('should return batchId from batchData.content', () => {
      component.batchData = { content: [{ batchId: 'batch-123' }] } as any
      expect(component.getBatchId()).toBe('batch-123')
    })
  })

  describe('getCompetencies', () => {
    it('should return array of competency names', () => {
      const data = JSON.stringify([{ name: 'Leadership' }, { name: 'Finance' }])
      expect(component.getCompetencies(data)).toEqual(['Leadership', 'Finance'])
    })
  })

  describe('handleEnrollmentEndDate', () => {
    it('should return true when enrollmentEndDate is in the past', () => {
      expect(component.handleEnrollmentEndDate({ enrollmentEndDate: '2000-01-01' })).toBe(true)
    })
    it('should return false when enrollmentEndDate is in the future', () => {
      expect(component.handleEnrollmentEndDate({ enrollmentEndDate: '2099-01-01' })).toBe(false)
    })
  })

  describe('getUserRating', () => {
    it('should call ratingSvc.getRating when content has identifier', () => {
      mockRatingSvc.getRating = jest.fn().mockReturnValue(of({ result: { response: null } }))
      mockConfigSvc.userProfile = { userId: 'u1' }
      component.content = { identifier: 'c1', primaryCategory: 'Course' } as any
      component.getUserRating()
      expect(mockRatingSvc.getRating).toHaveBeenCalled()
    })
  })

  describe('scrollToTop', () => {
    it('should not throw', () => {
      expect(() => component.scrollToTop()).not.toThrow()
    })
  })

  describe('ngAfterViewChecked with fragment', () => {
    it('should not throw when fragment is set', () => {
      component['fragment'] = 'some-section'
      expect(() => component.ngAfterViewChecked()).not.toThrow()
    })
  })

  describe('assignPathAndUpdateBanner', () => {
    it('should set routePath from valid url suffix', () => {
      component['banners'] = null
      component['assignPathAndUpdateBanner']('/public/toc/id/overview')
      expect(component['routePath']).toBe('overview')
    })
  })

  describe('modifySensibleContentRating – direct', () => {
    it('should convert object averageRating to number via rootOrg key', () => {
      mockConfigSvc.rootOrg = 'igot'
      component.content = { averageRating: { igot: 4.5 } } as any
        ; (component as any).modifySensibleContentRating()
      expect((component.content as any).averageRating).toBe(4.5)
    })

    it('should convert object totalRating to number via rootOrg key', () => {
      mockConfigSvc.rootOrg = 'igot'
      component.content = { totalRating: { igot: 10 } } as any
        ; (component as any).modifySensibleContentRating()
      expect((component.content as any).totalRating).toBe(10)
    })

    it('should not modify numeric averageRating', () => {
      component.content = { averageRating: 3.0 } as any
        ; (component as any).modifySensibleContentRating()
      expect((component.content as any).averageRating).toBe(3.0)
    })

    it('should not throw when content is null', () => {
      component.content = null
      expect(() => (component as any).modifySensibleContentRating()).not.toThrow()
    })
  })

  describe('getLearningUrls – direct', () => {
    it('should set isPracticeVisible true when practiceItems exist', () => {
      mockTocSvc.filterToc = jest.fn().mockReturnValue([{ id: 'p1' }])
      mockContentSvc.getFirstChildInHierarchy = jest.fn().mockReturnValue({ identifier: 'fc1', mimeType: 'mp4' })
      component.content = { identifier: 'c1', primaryCategory: 'Course', children: [{ id: 'ch1' }] } as any
        ; (component as any).getLearningUrls()
      expect(component.isPracticeVisible).toBe(true)
    })

    it('should not throw when content is null', () => {
      component.content = null
      expect(() => (component as any).getLearningUrls()).not.toThrow()
    })
  })

  describe('updateBannerUrl – direct', () => {
    it('should set bannerUrl when banners is set', () => {
      component['banners'] = { overview: 'http://img.png', analytics: '', contents: '' }
      component['routePath'] = 'overview'
        ; (component as any).updateBannerUrl()
      expect(mockDomSanitizer.bypassSecurityTrustStyle).toHaveBeenCalled()
    })

    it('should not throw when banners is null', () => {
      component['banners'] = null
      expect(() => (component as any).updateBannerUrl()).not.toThrow()
    })
  })

  describe('fetchExternalContentAccess – direct', () => {
    it('should fetch access when content has registrationUrl and not forPreview', () => {
      mockTocSvc.fetchExternalContentAccess = jest.fn().mockReturnValue(of({ hasAccess: true }))
      component.content = { identifier: 'c1', registrationUrl: 'http://ext.com' } as any
      component['forPreview'] = false
        ; (component as any).fetchExternalContentAccess()
      expect(mockTocSvc.fetchExternalContentAccess).toHaveBeenCalledWith('c1')
      expect(component.registerForExternal).toBe(true)
    })

    it('should handle error in fetchExternalContentAccess', () => {
      const { throwError } = require('rxjs')
      mockTocSvc.fetchExternalContentAccess = jest.fn().mockReturnValue(throwError(() => new Error('err')))
      component.content = { identifier: 'c1', registrationUrl: 'http://ext.com' } as any
      component['forPreview'] = false
        ; (component as any).fetchExternalContentAccess()
      expect(component.registerForExternal).toBe(false)
    })

    it('should not call fetchExternalContentAccess when forPreview is true', () => {
      mockTocSvc.fetchExternalContentAccess = jest.fn()
      component.content = { identifier: 'c1', registrationUrl: 'http://ext.com' } as any
      component['forPreview'] = true
        ; (component as any).fetchExternalContentAccess()
      expect(mockTocSvc.fetchExternalContentAccess).not.toHaveBeenCalled()
    })
  })

  describe('isPostAssessment getter', () => {
    it('should return true for Course with Instructor-Led mode and postAssessment enabled', () => {
      component.tocConfig = { postAssessment: true }
      component.content = { primaryCategory: 'Course', learningMode: 'Instructor-Led' } as any
      expect(component.isPostAssessment).toBe(true)
    })

    it('should return false for Course without Instructor-Led mode', () => {
      component.tocConfig = { postAssessment: true }
      component.content = { primaryCategory: 'Course', learningMode: 'Self-Paced' } as any
      expect(component.isPostAssessment).toBe(false)
    })

    it('should return false when content is null', () => {
      component.tocConfig = { postAssessment: true }
      component.content = null
      expect(component.isPostAssessment).toBe(false)
    })
  })

  describe('isMobile getter', () => {
    it('should return utilitySvc.isMobile value', () => {
      mockUtilitySvc.isMobile = true
      expect(component.isMobile).toBe(true)
      mockUtilitySvc.isMobile = false
      expect(component.isMobile).toBe(false)
    })
  })

  describe('showIntranetMsg getter', () => {
    it('should return true when isMobile is true', () => {
      mockUtilitySvc.isMobile = true
      expect(component.showIntranetMsg).toBe(true)
    })

    it('should return showIntranetMessage when not mobile', () => {
      mockUtilitySvc.isMobile = false
      component.showIntranetMessage = false
      expect(component.showIntranetMsg).toBe(false)
      component.showIntranetMessage = true
      expect(component.showIntranetMsg).toBe(true)
    })
  })

  describe('showButtonContainer getter', () => {
    it('should return true for grant status with content and children', () => {
      component['actionBtnStatus'] = 'grant'
      mockUtilitySvc.isMobile = false
      component.content = {
        status: 'Live',
        contentType: 'Course',
        children: [{ id: 'ch1' }],
        artifactUrl: '',
        isInIntranet: false,
      } as any
      expect(component.showButtonContainer).toBe(true)
    })

    it('should return false when actionBtnStatus is wait', () => {
      component['actionBtnStatus'] = 'wait'
      expect(component.showButtonContainer).toBe(false)
    })

    it('should return false when content is Course with no children and no artifactUrl', () => {
      component['actionBtnStatus'] = 'grant'
      mockUtilitySvc.isMobile = false
      component.content = {
        status: 'Live',
        contentType: 'Course',
        children: [],
        artifactUrl: '',
        isInIntranet: false,
      } as any
      expect(component.showButtonContainer).toBe(false)
    })
  })

  describe('getUserRating error handler', () => {
    it('should log error when ratingSvc.getRating fails', () => {
      const { throwError } = require('rxjs')
      mockRatingSvc.getRating = jest.fn().mockReturnValue(throwError(() => new Error('rating error')))
      mockConfigSvc.userProfile = { userId: 'u1' }
      component.content = { identifier: 'c1', primaryCategory: 'Course' } as any
      component.getUserRating()
      expect(mockLoggerSvc.error).toHaveBeenCalled()
    })
  })

  describe('initData with INVALID_DATA and NO_DATA', () => {
    it('should set errorType to internalServer for INVALID_DATA', () => {
      mockTocSvc.initData = jest.fn().mockReturnValue({ content: null, errorCode: 'INVALID_DATA' })
      component.ngOnInit()
      expect(component.errorWidgetData.widgetData.errorType).toBe('internalServer')
    })

    it('should set errorType to internalServer for NO_DATA', () => {
      mockTocSvc.initData = jest.fn().mockReturnValue({ content: null, errorCode: 'NO_DATA' })
      component.ngOnInit()
      expect(component.errorWidgetData.widgetData.errorType).toBe('internalServer')
    })
  })

  describe('playIntroVideo', () => {
    it('should not throw', () => {
      expect(() => component.playIntroVideo()).not.toThrow()
    })
  })

  describe('ngAfterViewChecked – with DOM element mock', () => {
    it('should call scrollTo when fragment element exists', () => {
      const mockEl = { scrollTo: jest.fn() }
      jest.spyOn(document, 'querySelector').mockReturnValue(mockEl as any)
      component['fragment'] = 'my-section'
      component.ngAfterViewChecked()
      expect(mockEl.scrollTo).toHaveBeenCalledWith({ top: 80, behavior: 'smooth' })
      jest.restoreAllMocks()
    })
  })

  describe('initData – content with body and forPreview', () => {
    it('should call proxyToAuthoringUrl when forPreview is true and content has body', () => {
      const mockContent = {
        identifier: 'c1',
        primaryCategory: 'Course',
        body: '<p>hello</p>',
        children: [],
        registrationUrl: null,
        learningMode: 'Self-Paced',
      }
      mockTocSvc.initData = jest.fn().mockReturnValue({ content: mockContent, errorCode: null })
      mockTocSvc.filterToc = jest.fn().mockReturnValue([])
      mockTocSvc.getTocStructure = jest.fn().mockReturnValue({ assessment: 0, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0 })
      mockContentSvc.getFirstChildInHierarchy = jest.fn().mockReturnValue({ identifier: 'fc', mimeType: 'mp4' })
      component['forPreview'] = true
      component.ngOnInit()
      expect(mockAuthAccessControlSvc.proxyToAuthoringUrl).toHaveBeenCalledWith('<p>hello</p>')
    })
  })

  describe('initData – content with post-assessment', () => {
    it('should call fetchPostAssessmentStatus when content isPostAssessment', () => {
      const mockContent = {
        identifier: 'c1',
        primaryCategory: 'Course',
        body: '',
        children: [],
        registrationUrl: null,
        learningMode: 'Instructor-Led',
      }
      // Create a fresh component with route data that has postAssessment: true
      const localTocSvc = {
        ...mockTocSvc,
        initData: jest.fn().mockReturnValue({ content: mockContent, errorCode: null }),
        filterToc: jest.fn().mockReturnValue([]),
        getTocStructure: jest.fn().mockReturnValue({ assessment: 0, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0 }),
        fetchPostAssessmentStatus: jest.fn().mockReturnValue(of({ result: [{ contentId: 'c1' }] })),
        batchReplaySubject: new (require('rxjs').Subject)(),
      }
      const localRoute = {
        fragment: of(null),
        data: of({ pageData: { data: { postAssessment: true } } }),
        queryParamMap: of({ get: jest.fn().mockReturnValue(null) }),
      }
      const localContentSvc = {
        getFirstChildInHierarchy: jest.fn().mockReturnValue({ identifier: 'fc', mimeType: 'mp4' }),
      }
      const localComp = new PublicTocComponent(
        localRoute as any,
        mockRouter,
        localContentSvc as any,
        localTocSvc as any,
        mockLoggerSvc,
        mockConfigSvc,
        mockDomSanitizer,
        mockAuthAccessControlSvc,
        mockDialog,
        mockMobileAppsSvc,
        mockUtilitySvc,
        mockActionSVC,
        mockRatingSvc,
      )
      localComp.ngOnInit()
      expect(localTocSvc.fetchPostAssessmentStatus).toHaveBeenCalledWith('c1')
    })
  })

  describe('getCompetencies – direct', () => {
    it('should push each competency name to array', () => {
      const data = JSON.stringify([{ name: 'A' }, { name: 'B' }, { name: 'C' }])
      const result = component.getCompetencies(data)
      expect(result).toHaveLength(3)
      expect(result[2]).toBe('C')
    })
  })


  describe('showInstructorLedMsg getter', () => {
    it('should return false when showActionButtons is false', () => {
      component['actionBtnStatus'] = 'wait'
      expect(component.showInstructorLedMsg).toBe(false)
    })

    it('should return true for Instructor-Led content without children', () => {
      component['actionBtnStatus'] = 'grant'
      component.content = {
        status: 'Live',
        learningMode: 'Instructor-Led',
        children: [],
        artifactUrl: '',
      } as any
      expect(component.showInstructorLedMsg).toBe(true)
    })
  })
})
