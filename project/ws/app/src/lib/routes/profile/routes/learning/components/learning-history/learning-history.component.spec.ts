import { of, Subject } from 'rxjs'

jest.mock('@angular/router', () => ({ ActivatedRoute: jest.fn() }), { virtual: true })
jest.mock('@sunbird-cb/collection', () => ({ NsContent: {} }), { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  ValueService: jest.fn(),
  TFetchStatus: jest.fn(),
}), { virtual: true })
jest.mock('../../../analytics/models/analytics.model', () => ({ NSAnalyticsData: {} }), { virtual: true })
jest.mock('../../../analytics/services/analytics.service', () => ({ AnalyticsService: jest.fn() }), { virtual: true })
jest.mock('../../models/learning.models', () => ({ NSLearningHistory: {} }), { virtual: true })
jest.mock('../../services/learning-history.service', () => ({ LearningHistoryService: jest.fn() }), { virtual: true })
jest.mock('@angular/material/legacy-paginator', () => ({ LegacyPageEvent: jest.fn() }), { virtual: true })
jest.mock('@angular/forms', () => {
  const actual = jest.requireActual('@angular/forms')
  return actual
})

import { LearningHistoryComponent } from './learning-history.component'

function buildComponent(isClient = false, showCount = false) {
  const ltMediumSubject = new Subject<boolean>()

  const pageData = {
    enabledTabs: {
      learning: {
        subTabs: {
          learningHistory: {
            isClient,
            showCount,
            tabs: { courses: true, modules: true, resources: true },
          },
        },
      },
    },
  }

  const mockRoute: any = {
    snapshot: {
      data: {
        pageData: { data: pageData },
        learningHistory: {
          data: {
            results: [],
            count: 0,
            page_state: '',
            result: [],
          },
        },
      },
    },
    data: of({
      learningHistory: {
        data: { results: [{ identifier: 'lh1' }], count: 1, page_state: '', result: [] },
      },
    }),
  }

  const mockLearnHstSvc: any = {
    fetchContentProgress: jest.fn().mockReturnValue(of({
      count: 5,
      page_state: 'state1',
      result: [{ identifier: 'c1' }],
    })),
    fetchCertification: jest.fn().mockReturnValue(of({
      ongoingList: [{ identifier: 'cert1', name: 'Cert 1' }],
      passedList: [{ identifier: 'cert2', name: 'Cert 2' }],
    })),
  }

  const mockAnalyticsSrv: any = {
    userProgress: jest.fn().mockReturnValue(of({ count: 5 })),
    fetchFilterList: jest.fn().mockReturnValue(of({ progress_source: ['Source1'] })),
    fetchUserProgressDetails: jest.fn().mockReturnValue(of({})),
    getFilteredCourse: jest.fn().mockReturnValue(of({ result: [] })),
  }

  const mockConfigSvc: any = {
    userProfile: { userId: 'u1' },
    userRoles: new Set(['my-analytics']),
  }

  const mockValueSvc: any = {
    isLtMedium$: ltMediumSubject.asObservable(),
  }

  const comp = new LearningHistoryComponent(
    mockRoute,
    mockLearnHstSvc,
    mockAnalyticsSrv,
    mockConfigSvc,
    mockValueSvc,
  )

  return { comp, mockRoute, mockLearnHstSvc, mockAnalyticsSrv, mockConfigSvc, mockValueSvc, ltMediumSubject }
}

describe('LearningHistoryComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should initialize with default values', () => {
    const { comp } = buildComponent()
    expect(comp.selectedStatusType).toBe('inprogress')
    expect(comp.selectedTabIndex).toBe(0)
    expect(comp.pageSize).toBe(10)
  })

  it('ngOnInit - non-client pushes lhContent and subscribes to route.data', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    expect(comp.lhContent.length).toBeGreaterThan(0)
  })

  it('ngOnInit - subscribes to isLtMedium$', () => {
    const { comp, ltMediumSubject } = buildComponent(false)
    comp.ngOnInit()
    ltMediumSubject.next(true)
    expect(comp.screenSizeIsLtMedium).toBe(true)
  })

  it('ngOnInit - client with roles calls fetchFilterList', () => {
    const { comp, mockAnalyticsSrv } = buildComponent(true, true)
    comp.ngOnInit()
    expect(mockAnalyticsSrv.fetchFilterList).toHaveBeenCalled()
  })

  it('ngOnInit - client without role sets showHistory false', () => {
    const { comp, mockConfigSvc } = buildComponent(true)
    mockConfigSvc.userRoles = new Set()
    comp.ngOnInit()
    expect(comp.showHistory).toBe(false)
  })

  it('ngOnInit - client with role and showCount calls userProgress', () => {
    const { comp, mockAnalyticsSrv } = buildComponent(true, true)
    comp.ngOnInit()
    expect(mockAnalyticsSrv.userProgress).toHaveBeenCalled()
  })

  it('getUserProgress - non-certification fetches content progress', () => {
    const { comp, mockLearnHstSvc } = buildComponent(false)
    comp.ngOnInit()
    const content = comp.lhContent[0]
    comp.getUserProgress(content)
    expect(mockLearnHstSvc.fetchContentProgress).toHaveBeenCalled()
  })

  it('getUserProgress - collection sets pageSize 20', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    const content = comp.lhContent.find((c: any) => c.contentType === 'collection')!
    comp.getUserProgress(content)
    expect(comp.pageSize).toBe(20)
  })

  it('getUserProgress - resource sets pageSize 40', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    const content = comp.lhContent.find((c: any) => c.contentType === 'resource')!
    comp.getUserProgress(content)
    expect(comp.pageSize).toBe(40)
  })

  it('getUserProgress - certification fetches certification data', () => {
    const { comp, mockLearnHstSvc } = buildComponent(false)
    comp.ngOnInit()
    const content = comp.lhContent.find((c: any) => c.contentType === 'certification')!
    comp.getUserProgress(content)
    expect(mockLearnHstSvc.fetchCertification).toHaveBeenCalled()
  })

  it('getUserProgress - certification uses cached data if available', () => {
    const { comp, mockLearnHstSvc } = buildComponent(false)
    comp.ngOnInit()
    comp.ongoingCertifications = [{ identifier: 'cert1' } as any]
    comp.passedCertifications = [{ identifier: 'cert2' } as any]
    const content = comp.lhContent.find((c: any) => c.contentType === 'certification')!
    comp.getUserProgress(content)
    expect(mockLearnHstSvc.fetchCertification).not.toHaveBeenCalled()
  })

  it('reinitializeHistory - resets all lhContent', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    comp.lhContent[0].pageState = 5
    comp.reinitializeHistory()
    expect(comp.lhContent[0].pageState).toBe(0)
    expect(comp.lhContent[0].isLoadingFirstTime).toBe(true)
  })

  it('onStatusChange - toggles selectedStatusType', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    expect(comp.selectedStatusType).toBe('inprogress')
    comp.onStatusChange()
    expect(comp.selectedStatusType).toBe('completed')
    comp.onStatusChange()
    expect(comp.selectedStatusType).toBe('inprogress')
  })

  it('toggleLoading - loading true sets loadingContent and content.loading', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    const content = comp.lhContent[0]
    comp.toggleLoading(true, content)
    expect(comp.loadingContent).toBe(true)
    expect(content.loading).toBe(true)
  })

  it('toggleLoading - loading false marks done', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    const content = comp.lhContent[0]
    comp.toggleLoading(false, content)
    expect(comp.loadingContent).toBe(false)
    expect(content.fetchStatus).toBe('done')
  })

  it('onTabChange - updates selectedTabIndex', () => {
    const { comp } = buildComponent(false)
    comp.ngOnInit()
    comp.onTabChange(2)
    expect(comp.selectedTabIndex).toBe(2)
  })

  it('onTabChange - calls getUserProgress when not loaded', () => {
    const { comp, mockLearnHstSvc } = buildComponent(false)
    comp.ngOnInit()
    comp.onTabChange(1)
    expect(mockLearnHstSvc.fetchContentProgress).toHaveBeenCalled()
  })

  it('onTabChangeClient - updates selectedTabIndex', () => {
    const { comp } = buildComponent(true, true)
    comp.ngOnInit()
    comp.onTabChangeClient(1)
    expect(comp.selectedTabIndex).toBe(1)
  })

  it('applyFilter - updates filterType and calls getFilteredCourse', () => {
    const { comp } = buildComponent(true, true)
    comp.ngOnInit()
    comp.applyFilter('Source1')
    expect(comp.filterType).toBe('Source1')
  })

  it('contentToLearningHistory - converts cert to history item', () => {
    const { comp } = buildComponent()
    const cert: any = { identifier: 'c1', name: 'Cert 1', appIcon: '/icon.png', contentType: 'Course', duration: 3600, children: [{ identifier: 'child1' }] }
    const result = comp.contentToLearningHistory(cert)
    expect(result).toBeDefined()
    expect(result.identifier).toBe('c1')
  })
})
