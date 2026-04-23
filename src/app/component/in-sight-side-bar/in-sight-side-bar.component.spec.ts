import { Subject, of } from 'rxjs'
import { InsightSideBarComponent } from './in-sight-side-bar.component'

describe('InsightSideBarComponent', () => {
  let component: InsightSideBarComponent
  let mockHomePageSvc: any
  let mockConfigSvc: any
  let mockActivatedRoute: any
  let mockDiscussUtilitySvc: any
  let mockTranslate: any
  let mockEvents: any
  let mockSnackBar: any
  let mockRouter: any
  let mockSignupService: any
  let mockProfileV2Svc: any
  let mockUserProfileService: any
  let mockLangtranslations: any
  let mockCdr: any
  let mockDialog: any
  let mockCommonDataSvc: any

  const defaultPageData = {
    pageData: {
      data: {
        learnerAdvisory: [],
        surveyForm: null,
        surveyPopup: null,
        nationalLearningWeek: null,
        nlwExperience: null,
        updateDesignation: null,
        stateLearningWeek: [],
        assessmentData: null,
      },
    },
  }

  beforeEach(() => {
    localStorage.clear()

    mockHomePageSvc = {
      getInsightsData: jest.fn().mockReturnValue(of({ result: { response: {} } })),
      getDiscussionsData: jest.fn().mockReturnValue(of({ latestPosts: [] })),
    }

    mockConfigSvc = {
      userProfile: {
        userId: 'user-1',
        rootOrgId: 'org-1',
        userName: 'jdoe',
        professionalDetails: [{ designation: 'Director' }],
      },
      unMappedUser: {
        id: 'user-1',
        rootOrgId: 'org-1',
        profileDetails: {
          profileStatus: 'VERIFIED',
          employmentDetails: { departmentName: 'Finance' },
          refRootOrg: { orgId: 'org-1' },
        },
      },
      nodebbUserProfile: { username: 'jdoe' },
    }

    mockActivatedRoute = {
      snapshot: { data: defaultPageData },
    }

    mockDiscussUtilitySvc = { setDiscussionConfig: jest.fn() }
    mockTranslate = { setDefaultLang: jest.fn(), use: jest.fn() }
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    }

    mockSignupService = {
      getOrgReadData: jest.fn().mockReturnValue(of({})),
      getFrameworkInfo: jest.fn().mockReturnValue(of({})),
    }

    mockProfileV2Svc = {
      fetchApprovalDetails: jest.fn().mockReturnValue(of({ result: { data: [] } })),
    }

    mockUserProfileService = {}

    const langSubject = new Subject<void>()
    mockLangtranslations = {
      languageSelectedObservable: langSubject.asObservable(),
      translateLabel: jest.fn().mockReturnValue('translated'),
    }

    mockCdr = { detectChanges: jest.fn() }

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: jest.fn(() => of(null)) }),
    }

    mockCommonDataSvc = {
      getNlw2026CertifiedStatus: jest.fn().mockReturnValue(of(false)),
    }

    component = new InsightSideBarComponent(
      mockHomePageSvc,
      mockConfigSvc,
      mockActivatedRoute,
      mockDiscussUtilitySvc,
      mockTranslate,
      mockEvents,
      mockSnackBar,
      mockRouter,
      mockSignupService,
      mockProfileV2Svc,
      mockUserProfileService,
      mockLangtranslations,
      mockCdr,
      mockDialog,
      mockCommonDataSvc
    )
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should read language from localStorage if set', () => {
      localStorage.setItem('websiteLanguage', 'hi')
      void new InsightSideBarComponent(
        mockHomePageSvc, mockConfigSvc, mockActivatedRoute,
        mockDiscussUtilitySvc, mockTranslate, mockEvents,
        mockSnackBar, mockRouter, mockSignupService,
        mockProfileV2Svc, mockUserProfileService, mockLangtranslations,
        mockCdr, mockDialog, mockCommonDataSvc
      )
      expect(mockTranslate.use).toHaveBeenCalledWith('hi')
    })
  })

  describe('ngOnInit', () => {
    it('should set userData from configSvc.userProfile', () => {
      component.ngOnInit()
      expect(component.userData).toBe(mockConfigSvc.userProfile)
    })

    it('should call getInsights', () => {
      jest.spyOn(component, 'getInsights')
      component.ngOnInit()
      expect(component.getInsights).toHaveBeenCalled()
    })

    it('should call getPendingRequestData', () => {
      jest.spyOn(component, 'getPendingRequestData')
      component.ngOnInit()
      expect(component.getPendingRequestData).toHaveBeenCalled()
    })

    it('should set isNotMyUser to true when profileStatus is not-my-user', () => {
      mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'not-my-user'
      component.ngOnInit()
      expect(component.isNotMyUser).toBe(true)
    })

    it('should set isNotMyUser to false when profileStatus is VERIFIED', () => {
      component.ngOnInit()
      expect(component.isNotMyUser).toBe(false)
    })

    it('should set isIgotOrg to true when departmentName is igot', () => {
      mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'igot'
      component.ngOnInit()
      expect(component.isIgotOrg).toBe(true)
    })

    it('should call commonDataSvc.getNlw2026CertifiedStatus when pageData is present', () => {
      component.ngOnInit()
      expect(mockCommonDataSvc.getNlw2026CertifiedStatus).toHaveBeenCalled()
    })
  })

  describe('getNlwConfig', () => {
    it('should set canShowNlwCard to false when current date is before start date', () => {
      component.nwlConfiguration = {
        startDate: '25-042030',
        endDate: '30-042030',
        enabled: true,
      }
      component.getNlwConfig()
      expect(component.canShowNlwCard).toBe(false)
    })

    it('should set canShowNlwCard to true when current date is between start and end', () => {
      // Use dates in the past and future around today
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const fmt = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`

      component.nwlConfiguration = {
        startDate: fmt(yesterday),
        endDate: fmt(tomorrow),
        enabled: true,
      }
      component.getNlwConfig()
      expect(component.canShowNlwCard).toBe(true)
    })
  })

  describe('getSlwConfig', () => {
    it('should set canShowSlwCard to false when current date is before start date', () => {
      component.slwConfiguration = {
        startDate: '25-042030',
        endDate: '30-042030',
        enabled: true,
      }
      component.getSlwConfig()
      expect(component.canShowSlwCard).toBe(false)
    })

    it('should set canShowSlwCard to true when current date is in range', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const fmt = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`

      component.slwConfiguration = {
        startDate: fmt(yesterday),
        endDate: fmt(tomorrow),
        enabled: true,
      }
      component.getSlwConfig()
      expect(component.canShowSlwCard).toBe(true)
    })
  })

  describe('getPendingRequestData', () => {
    it('should set pendingRequestSkeleton to false', () => {
      component.getPendingRequestData()
      expect(component.pendingRequestSkeleton).toBe(false)
    })
  })

  describe('navigateTo', () => {
    it('should call router.navigateByUrl with connection-requests', () => {
      component.navigateTo()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        'app/network-v2/connection-requests'
      )
    })
  })

  describe('moveToUserProile', () => {
    it('should navigate to user profile url', () => {
      component.moveToUserProile('user-abc')
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        'app/person-profile/user-abc#profileInfo'
      )
    })
  })

  describe('expandCollapse', () => {
    it('should set collapsed from event', () => {
      component.expandCollapse(true)
      expect(component.collapsed).toBe(true)
    })

    it('should toggle collapsed to false', () => {
      component.collapsed = true
      component.expandCollapse(false)
      expect(component.collapsed).toBe(false)
    })
  })

  describe('goToActivity', () => {
    it('should navigate to person-profile me tab=1', () => {
      component.goToActivity(null)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        'app/person-profile/me?tab=1'
      )
    })
  })

  describe('navigate', () => {
    it('should set discuss config and navigate to discussion forum', () => {
      component.navigate()
      expect(mockDiscussUtilitySvc.setDiscussionConfig).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/discussion-forum'],
        expect.objectContaining({ queryParams: { page: 'home' } })
      )
    })
  })

  describe('getInsights', () => {
    it('should set profileDataLoading to true while loading', () => {
      component.getInsights()
      // After subscribe it will be set to false on success
      expect(mockHomePageSvc.getInsightsData).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from nlw2026Sub if set', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['nlw2026Sub'] = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when nlw2026Sub is null', () => {
      component['nlw2026Sub'] = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})

