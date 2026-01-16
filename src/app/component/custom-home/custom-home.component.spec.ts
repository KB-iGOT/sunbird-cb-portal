import { of, throwError } from 'rxjs'
import { CustomHomeComponent } from './custom-home.component'

jest.mock('moment', () => {
  const actual = jest.requireActual('moment')
  return {
    __esModule: true,
    default: actual,
    ...actual,
  }
})

jest.mock('lodash', () => ({
  __esModule: true,
  default: {
    kebabCase: (value: string) =>
      value
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .join('-'),
  },
}))

describe('CustomHomeComponent', () => {
  let component: CustomHomeComponent

  const mockActivatedRoute: any = {
    snapshot: {
      params: { id: 'dept-1' },
      data: {},
    },
  }

  const mockEvents: any = {
    raiseInteractTelemetry: jest.fn(),
  }

  const mockTranslate: any = {
    setDefaultLang: jest.fn(),
    use: jest.fn(),
    instant: jest.fn((key: string) => `translated-${key}`),
  }

  const mockRouter: any = {
    navigateByUrl: jest.fn(),
  }

  const mockConfigSvc: any = {
    userProfile: {
      rootOrgId: 'root-org-id',
    },
    unMappedUser: {
      organisations: [{ organisationId: 'org-1' }],
      profileDetails: {
        refRootOrg: {
          orgId: 'state-org-id',
        },
      },
    },
  }

  const mockHomePageSvc: any = {
    getInsightsData: jest.fn(),
  }

  const buildPageData = () => ({
    data: {
      homeConfig: { title: 'Home' },
      profileCard: { name: 'User' },
      announcementSection: { items: [] },
      eventCalendar: { events: [] },
      newHomeStrip: [
        {
          order: 2,
          strips: [{ active: true }],
        },
        {
          order: 1,
          strips: [{ active: false }],
        },
      ],
      enableLazyLoading: true,
      sliderData: [{ id: 1 }],
      nationalLearningWeek: {
        enabled: false,
        startDate: '01-012020',
        endDate: '01-012030',
      },
      stateLearningWeek: [
        {
          orgId: 'state-org-id',
          enabled: false,
          startDate: '01-012020',
          endDate: '01-012030',
        },
      ],
    },
  })

  const createComponent = () =>
    new CustomHomeComponent(
      mockActivatedRoute,
      mockEvents,
      mockTranslate,
      mockRouter,
      mockConfigSvc,
      mockHomePageSvc
    )

  beforeEach(() => {
    jest.clearAllMocks()

    mockActivatedRoute.snapshot.data = {
      pageData: buildPageData(),
    }

    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'websiteLanguage') {
        return 'hi'
      }
      return null
    })

    // Default insights call returns an empty observable to avoid undefined.subscribe
    mockHomePageSvc.getInsightsData.mockReturnValue(of({}))

    component = createComponent()
  })

  it('should create and initialize with page config', () => {
    component.ngOnInit()

    expect(component.departmentId).toBe('dept-1')
    expect(component.homeConfig.title).toBe('Home')
    expect(component.profileCardData.name).toBe('User')
    expect(component.announcementData).toBeDefined()
    expect(component.eventsCalendarData).toBeDefined()
    expect(component.enableLazyLoadingFlag).toBe(true)
    expect(component.sliderData.length).toBe(1)

    expect(component.sectionList.length).toBe(3)
    expect(component.sectionList[0].section).toBe('section_0')
    expect(component.sectionList[1].section).toBe('section_1')
    expect(component.sectionList[2].section).toBe('slider')

    const activeFlags = component.sectionList
      .filter((s: any) => s.section !== 'slider')
      .map((s: any) => s.isActive)
    expect(activeFlags).toEqual([false, true])

    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
  })

  it('should set showNoConfig when pageData is missing', () => {
    mockActivatedRoute.snapshot.data = {}
    component = createComponent()

    component.ngOnInit()

    expect(component.showNoConfig).toBe(true)
  })

  it('should make initial strips visible in ngAfterViewInit', () => {
    component.ngOnInit()
    component.ngAfterViewInit()

    expect(component.sectionList[0].isVisible).toBe(true)
    expect(component.sectionList[1].isVisible).toBe(true)

    const sliderSection = component.sectionList.find((s: any) => s.section === 'slider')
    expect(sliderSection.isVisible).toBe(true)
  })

  it('should update section visibility on scroll when element is in viewport', () => {
    component.sectionList = [{ section: 'section_5', isVisible: false }]

    const div = document.createElement('div')
    div.className = 'section_5'
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ top: 0, bottom: 500 }),
    })
    document.body.appendChild(div)

      ; (globalThis as any).innerHeight = 600

    component.scrollHandler()

    expect(component.sectionList[0].isVisible).toBe(true)
  })

  it('should translate hub name using TranslateService', () => {
    const result = component.translateHub('HOME.HUB')
    expect(mockTranslate.instant).toHaveBeenCalledWith('HOME.HUB')
    expect(result).toBe('translated-HOME.HUB')
  })

  it('should raise telemetry for simple click', () => {
    component.raiseTelemetry('My Button', 'sub-type')

    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: 'click',
        subType: 'sub-type',
        id: 'my-button',
      },
      {},
      { module: (expect as any).anything() }
    )
  })

  it('should raise telemetry for view more interaction', () => {
    const spy = jest.spyOn(component as any, 'raiseTelemetry')

    component.raiseTelemetryInteratEvent({
      stripTitle: 'Section',
      viewMoreUrl: { viewMoreText: 'See All' },
      typeOfTelemetry: 'strip',
    })

    expect(spy).toHaveBeenCalledWith('Section See All', 'strip')
    expect(component.isTelemetryRaised).toBe(true)
  })

  it('should raise telemetry for external content', () => {
    component.isTelemetryRaised = false

    component.raiseTelemetryInteratEvent({
      typeOfTelemetry: 'any',
      contentId: 'ext-content-1',
    })

    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: 'click',
        subType: 'any',
        id: 'card-content',
      },
      {
        id: 'ext-content-1',
        type: 'External content',
      },
      { module: (expect as any).anything() }
    )
    expect(component.isTelemetryRaised).toBe(true)
  })

  it('should raise telemetry for mdo channel event', () => {
    component.isTelemetryRaised = false

    component.raiseTelemetryInteratEvent({
      typeOfTelemetry: 'mdoChannel',
      identifier: 'mdo-1',
      title: 'Org',
      orgId: 'org-1',
    })

    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: 'click',
        subType: 'mdo-channel',
        id: 'card-content',
        pageid: '/page/home',
      },
      {
        id: 'mdo-1',
        type: 'org/ministry',
      },
      { module: (expect as any).anything() }
    )
  })

  it('should raise telemetry for cbpPlan with selected tab and pill', () => {
    component.isTelemetryRaised = false

    component.raiseTelemetryInteratEvent({
      typeOfTelemetry: 'cbpPlan',
      identifier: 'plan-1',
      primaryCategory: 'Course',
      selectedTab: 'tab',
      selectedPill: 'pill',
    })

    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: 'click',
        subType: 'tab-pill',
        id: 'card-content',
        pageid: '/page/home',
      },
      {
        id: 'plan-1',
        type: 'Course',
      },
      { module: (expect as any).anything() }
    )
  })

  it('should raise telemetry for cbpPlan with igot-ai subtype', () => {
    component.isTelemetryRaised = false

    component.raiseTelemetryInteratEvent({
      typeOfTelemetry: 'cbpPlan',
      identifier: 'plan-2',
      primaryCategory: 'Course',
      sakshamAIGenerated: true,
    })

    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: 'click',
        subType: 'igot-ai',
        id: 'card-content',
        pageid: '/page/home',
      },
      {
        id: 'plan-2',
        type: 'Course',
      },
      { module: (expect as any).anything() }
    )
  })

  it('should raise telemetry for providers subtype', () => {
    component.isTelemetryRaised = false

    component.raiseTelemetryInteratEvent({
      typeOfTelemetry: 'providers',
      orgId: 'provider-1',
      title: 'Provider',
    })

    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: 'click',
        subType: 'training-institutions',
        id: 'card-content',
        pageid: '/page/home',
      },
      {
        id: 'provider-1',
        type: 'org',
      },
      { module: (expect as any).anything() }
    )
  })

  it('should open and close key announcements modal', () => {
    const spy = jest.spyOn(component as any, 'raiseTelemetry')

    component.triggerOpenDialog(true)

    expect(component.showModal).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(spy).toHaveBeenCalledWith('key annoucements', 'key annoucements')

    component.onClose()

    expect(component.showModal).toBe(false)
    expect(document.body.style.overflow).toBe('auto')
    expect(spy).toHaveBeenCalledWith('key annoucements', 'close key annoucements')
  })

  it('should trigger open dialog without changing modal when event is false', () => {
    const spy = jest.spyOn(component as any, 'raiseTelemetry')

    component.triggerOpenDialog(false)

    expect(component.showModal).toBe(false)
    expect(spy).toHaveBeenCalledWith('key annoucements', 'key annoucements')
  })

  it('should navigate to activity on goToActivity', () => {
    component.goToActivity({})

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me?tab=1')
  })

  it('should fetch insights successfully', () => {
    const response = {
      result: {
        response: {
          nudges: [
            { label: 'Label 1', growth: 'positive', progress: 10 },
            { label: 'Label 2', growth: 'negative', progress: -5 },
          ],
          'weekly-claps': { count: 5 },
        },
      },
    }

    mockHomePageSvc.getInsightsData.mockReturnValue(of(response))

    // Ensure userData is populated as getInsights expects
    component.userData = mockConfigSvc.userProfile

    component.getInsights()

    expect(mockHomePageSvc.getInsightsData).toHaveBeenCalled()
    expect(component.insightsData).toBeDefined()
    expect(component.insightsData.sliderData).toBeDefined()
    expect(component.insightsData.weeklyClaps).toEqual({ count: 5 })
    expect(component.profileDataLoading).toBe(false)
    expect(component.clapsDataLoading).toBe(false)
  })

  it('should handle insights error', () => {
    mockHomePageSvc.getInsightsData.mockReturnValue(throwError(() => new Error('failed')))

    component.userData = mockConfigSvc.userProfile

    component.getInsights()

    expect(component.insightsData).toBe('')
    expect(component.profileDataLoading).toBe(false)
    expect(component.clapsDataLoading).toBe(false)
  })

  it('should construct weekly data without weekly-claps field', () => {
    component.insightsData = {}
    component.constructWeeklyData()

    expect(component.clapsDataLoading).toBe(false)
  })

  it('should configure NLW card when current date is within range', () => {
    component.nwlConfiguration = {
      enabled: true,
      startDate: '01-012020',
      endDate: '01-012030',
    }

    component.getNlwConfig()

    expect(component.canShowNlwCard).toBe(true)
    expect(component.daysCompleted).toBeGreaterThanOrEqual(0)
    expect(component.totalDays).toBeGreaterThan(0)
  })

  it('should configure SLW card when current date is within range', () => {
    component.slwConfiguration = {
      enabled: true,
      startDate: '01-012020',
      endDate: '01-012030',
    }

    component.getSlwConfig()

    expect(component.canShowSlwCard).toBe(true)
    expect(component.daysCompleted).toBeGreaterThanOrEqual(0)
    expect(component.totalDays).toBeGreaterThan(0)
  })

  it('should hide NLW card when current date is before start', () => {
    component.nwlConfiguration = {
      enabled: true,
      startDate: '31-122999',
      endDate: '31-122999',
    }

    component.getNlwConfig()

    expect(component.canShowNlwCard).toBe(false)
  })

  it('should hide SLW card when current date is before start', () => {
    component.slwConfiguration = {
      enabled: true,
      startDate: '31-122999',
      endDate: '31-122999',
    }

    component.getSlwConfig()

    expect(component.canShowSlwCard).toBe(false)
  })

  it('should return org id when required in getOrgId', () => {
    component.orgId = 'org-1'

    const result = component.getOrgId({ orgIDNeeded: true })
    expect(result).toBe('org-1')
  })

  it('should return empty string when org id is not required in getOrgId', () => {
    component.orgId = 'org-1'

    const result = component.getOrgId({ orgIDNeeded: false })
    expect(result).toBe('')
  })
})
