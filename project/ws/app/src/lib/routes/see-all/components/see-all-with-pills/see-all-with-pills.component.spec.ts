// @ts-nocheck
import { readFileSync } from 'fs'
import { join } from 'path'
import { of, throwError } from 'rxjs'

// Mock the SeeAllService module before importing the component to avoid heavy deps
jest.mock('../../services/see-all.service', () => ({
  SeeAllService: jest.fn().mockImplementation(() => ({
    getSeeAllConfigJson: jest.fn(),
    searchV6: jest.fn(),
    trendingSearchRequest: jest.fn(),
  })),
}))

import { SeeAllWithPillsComponent } from './see-all-with-pills.component'

describe('SeeAllWithPillsComponent (no TestBed)', () => {
  let component: SeeAllWithPillsComponent
  const mockActivated: any = { queryParams: of({ key: 'k1', tabSelected: 't1', pillSelected: 'p1', pageType: 'pt', pageSubType: 'pst' }) }
  const sampleStrip = { key: 'k1', tabs: [{ value: 't1', pillsData: [{ value: 'p1' }] }], viewMoreUrl: { loaderConfig: { cardSubType: 'card-portrait-skeleton' } }, request: {} }
  const mockSeeAllSvc: any = {
    getSeeAllConfigJson: jest.fn().mockResolvedValue({ newHomeStrip: [{ strips: [sampleStrip] }], assessmentData: [] }),
    getSeeAllFormsConfigJson: jest.fn().mockResolvedValue({ newHomeStrip: [{ strips: [sampleStrip] }], assessmentData: [] }),
    getSeeAllTabsConfig: jest.fn().mockResolvedValue(null),
    searchV6: jest.fn().mockReturnValue(of({ result: { content: [] } })),
    trendingContentSearch: jest.fn().mockReturnValue(of({ result: { responseKey: [] } })),
    getApplicationsById: jest.fn().mockReturnValue(of({ result: { response: [] } })),
  }
  const mockConfigSvc: any = {
    userProfile: { userId: 'u1', rootOrgId: 'r1' },
    userProfileV2: { userRoles: [] },
    userRoles: new Set<string>(),
  }
  const mockEventSvc: any = { raiseInteractTelemetry: jest.fn(), broadcast: jest.fn() }
  const mockMulti: any = { translateLabel: jest.fn().mockReturnValue('translated') }
  const mockEnroll: any = {
    fetchInternalEnrollmentData: jest.fn().mockReturnValue(of({ result: { courses: [] } })),
    fetchExternalEnrollmentData: jest.fn().mockReturnValue(of({ result: { courses: [] } })),
    fetchEventsEnrollmentData: jest.fn().mockReturnValue(of({ result: { events: [] } })),
  }

  beforeEach(() => {
    mockConfigSvc.userProfileV2.userRoles = []
    mockConfigSvc.userRoles = new Set<string>()
    component = new SeeAllWithPillsComponent(
      mockActivated,
      mockSeeAllSvc,
      mockConfigSvc,
      mockEventSvc,
      mockMulti,
      mockEnroll,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('getExploreContentRoute', () => {
    it('keeps the Events route unchanged without query parameters', () => {
      const tab = { label: 'Events' }

      expect(component.getExploreContentRoute(tab)).toBe('/app/event-hub/home')
      expect(component.getExploreContentQueryParams(tab)).toBeNull()
    })

    it('routes volunteers to volunteer global search with explore-content parameters', () => {
      mockConfigSvc.userRoles.add('volunteer')
      const tab = { label: 'Courses' }

      expect(component.getExploreContentRoute(tab)).toBe('/app/globalsearch/volunteer')
      expect(component.getExploreContentQueryParams(tab)).toEqual({
        q: '',
        tab: 'explore-content',
        category: 'course',
        filtersPanel: 'show',
      })
    })

    it('routes other users to regular global search with course parameters', () => {
      const tab = { label: 'Courses' }

      expect(component.getExploreContentRoute(tab)).toBe('/app/globalsearch')
      expect(component.getExploreContentQueryParams(tab)).toEqual({
        q: '',
        category: 'courses',
        filtersPanel: 'show',
      })
    })

    it('recognizes volunteer roles from the profile fallback used by global search', () => {
      mockConfigSvc.userProfileV2.userRoles = [{ role: 'Volunteer' }]

      expect(component.getExploreContentRoute({ label: 'Courses' }))
        .toBe('/app/globalsearch/volunteer')
    })
  })

  it('ngOnInit should set seeAllPageConfig and contentDataList when config has matching key', async () => {
    // ensure the service returns a config that includes our sampleStrip
    await component.ngOnInit()
    expect(component.seeAllPageConfig).toBeDefined()
    // transformSkeletonToWidgets called -> contentDataList should be an array
    expect(Array.isArray(component.contentDataList)).toBe(true)
    expect(component.contentDataList.length).toBeGreaterThan(0)
  })

  it('checkForDateFilters should evaluate date expressions when present', () => {
    const filters: any = { 'batches.endDate': { '>=': '1+1' } }
    const res = component.checkForDateFilters(filters)
    // after eval the value should be numeric 2
    expect(res['batches.endDate']['>=']).toBe(2)
  })

  it('getFiltersFromArray should merge array entries into object', () => {
    const input = [{ a: 1 }, { b: 2 }, { c: 3 }]
    const out = (component as any).getFiltersFromArray(input)
    expect(out.a).toBe(1)
    expect(out.b).toBe(2)
    expect(out.c).toBe(3)
  })

  it('transformSkeletonToWidgets should return widgets with proper cardSubType', () => {
    const widgets = (component as any).transformSkeletonToWidgets({ viewMoreUrl: { loaderConfig: { cardSubType: 'custom' } } })
    expect(Array.isArray(widgets)).toBe(true)
    expect((widgets[0] as any).widgetData.cardSubType).toBe('custom')
  })

  it('translateLabels should call multilingual service', () => {
    const out = component.translateLabels('LABEL', 'type')
    expect(out).toBe('translated')
    expect(mockMulti.translateLabel).toHaveBeenCalled()
  })
  it('transformContentsToWidgets returns widgets array', () => {
    const contents: any[] = [];
    const widgets = (component as any).transformContentsToWidgets(contents, { key: 'k', viewMoreUrl: {}, stripConfig: { intranetMode: true } });
    expect(Array.isArray(widgets)).toBe(true);
  });

  it('transformSearchV6FiltersV2 merges filters', () => {
    const filtersArr = [{ a: 1 }, { b: 2 }];
    const merged = (component as any).transformSearchV6FiltersV2(filtersArr);
    expect(merged.a).toBe(1);
    expect(merged.b).toBe(2);
  });

  it('searchV6Request returns viewMoreUrl when many results', async () => {
    const strip1: any = { viewMoreUrl: { path: '/p', queryParams: {} }, stripConfig: { postCardForSearch: true } };
    const request1: any = { searchV6: { request: {} } };
    mockSeeAllSvc.searchV6.mockReturnValue(of({ result: { content: new Array(6).fill({}) } }));
    const resp1 = await (component as any).searchV6Request(strip1, request1, true);
    expect(resp1.viewMoreUrl).toBeDefined();
  });

  it('trendingSearchRequest handles org replacement and viewMoreUrl', async () => {
    const strip2: any = { viewMoreUrl: { path: '/p', queryParams: {} }, stripConfig: { postCardForSearch: true }, request: { trendingSearch: { responseKey: 'r', request: { filters: { organisation: '<orgID>' } } } } };
    mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ result: { r: new Array(6).fill({}) } }));
    const resp2 = await (component as any).trendingSearchRequest(strip2, strip2.request, true);
    expect(resp2.viewMoreUrl).toBeDefined();
  });

  it('resetSelectedPill clears selections', () => {
    const pills: any[] = [{ selected: true }, { selected: true }];
    (component as any).resetSelectedPill(pills);
    expect(pills[0].selected).toBe(false);
    expect(pills[1].selected).toBe(false);
  });

  it('pillClicked sets selected when no requestRequired', () => {
    const cfg: any = { tabs: [{ pillsData: [{}, {}] }] };
    component.seeAllPageConfig = cfg;
    (component as any).pillClicked(cfg, 1, 0);
    expect(cfg.tabs[0].pillsData[1].selected).toBe(true);
  });

  it('getSelectedPillIndex returns correct index', () => {
    const idx = (component as any).getSelectedPillIndex({ pillsData: [{ selected: false }, { selected: true }] });
    expect(idx).toBe(1);
  });

  it('fetchUserEnrolledData calls internal enrollment for enrollment type', () => {
    const strip3: any = { request: { enrollmentList: { a: 1 } }, tabs: [{ pillsData: [{ request: { type: 'enrollment' } }] }] };
    (component as any).fetchFromInternalEnrollmentList = jest.fn();
    (component as any).fetchUserEnrolledData(strip3, 0, 0);
    expect((component as any).fetchFromInternalEnrollmentList).toHaveBeenCalled();
  });

  it('formatNewEnrollmentData sets contentDataList and tabResults', () => {
    const strip4: any = { tabs: [{ pillsData: [{}, {}] }] };
    const courses: any[] = [{ content: { identifier: 'c1', primaryCategory: 'pc' }, completionPercentage: 50, lastContentAccessTime: '2020-01-01' }];
    (component as any).formatNewEnrollmentData(strip4, 0, 0, courses, true);
    expect(component.contentDataList).toBeDefined();
  });

  it('loadMore increases pageSize when contentDataList longer', () => {
    component.contentDataList = new Array(200).fill({});
    component.pageSize = 50;
    component.loadMore();
    expect(component.pageSize).toBeGreaterThan(50);
  });

  describe('fetchFromInternalEnrollmentList survey check', () => {
    const START_DATE = 1766428200000
    const buildStrip = (status: any = 'Completed'): any => ({
      tabs: [{ pillsData: [{ request: { type: 'enrollment', payload: { request: { status, limit: 10 } } } }] }],
    })
    const buildCourse = (completedOn: any, link: any = 'https://x/surveys/form1'): any => ({
      completedOn,
      content: { identifier: 'c1', completionSurveyLink: link },
    })
    const run = (courses: any[], strip: any = buildStrip()): any => {
      mockEnroll.fetchInternalEnrollmentData.mockReturnValue(of({ result: { courses } }))
      component.formatNewEnrollmentData = jest.fn()
      component.fetchFromInternalEnrollmentList(strip, 0, 0)
      return courses
    }

    beforeEach(() => {
      mockConfigSvc.instanceConfig = { completionSurvey: { startDate: START_DATE } }
      mockSeeAllSvc.getApplicationsById = jest.fn().mockReturnValue(of({
        result: { response: [{ contextId: 'c1', submitted: true }, { contextId: 'unknown', submitted: false }] },
      }))
      mockEnroll.fetchExternalEnrollmentData.mockReturnValue(of({ result: { courses: [] } }))
    })

    afterEach(() => {
      delete mockConfigSvc.instanceConfig
    })

    it('requests survey status and sets it when completedOn is on or after the start date', () => {
      const courses = run([buildCourse(START_DATE + 1000)])

      expect(mockSeeAllSvc.getApplicationsById).toHaveBeenCalledWith({
        userId: 'u1',
        formContextList: [{ formId: 'form1', contextId: 'c1' }],
      })
      expect(courses[0].surveyCompletionStatus).toBe(true)
      expect(component.formatNewEnrollmentData).toHaveBeenCalled()
    })

    it('does not request survey status when completedOn is before the start date', () => {
      const courses = run([buildCourse(START_DATE - 1000)])

      expect(mockSeeAllSvc.getApplicationsById).not.toHaveBeenCalled()
      expect(courses[0].surveyCompletionStatus).toBeUndefined()
    })

    it('does not request survey status when completedOn is missing', () => {
      run([buildCourse(undefined)])
      expect(mockSeeAllSvc.getApplicationsById).not.toHaveBeenCalled()
    })

    it('does not request survey status when the start date is not configured', () => {
      mockConfigSvc.instanceConfig = {}
      run([buildCourse(START_DATE + 1000)])
      expect(mockSeeAllSvc.getApplicationsById).not.toHaveBeenCalled()
    })

    it('does not request survey status when there is no survey link', () => {
      run([buildCourse(START_DATE + 1000, '')])
      expect(mockSeeAllSvc.getApplicationsById).not.toHaveBeenCalled()
    })

    it('does not request survey status when the survey link has no form id', () => {
      run([buildCourse(START_DATE + 1000, 'https://x/nosurvey')])
      expect(mockSeeAllSvc.getApplicationsById).not.toHaveBeenCalled()
    })

    it('does not request survey status when the pill status is not Completed', () => {
      run([buildCourse(START_DATE + 1000)], buildStrip('In-Progress'))
      expect(mockSeeAllSvc.getApplicationsById).not.toHaveBeenCalled()
    })

    it('does not request survey status when the user id is missing', () => {
      const original = mockConfigSvc.userProfile
      mockConfigSvc.userProfile = { userId: '' }
      run([buildCourse(START_DATE + 1000)])
      mockConfigSvc.userProfile = original
      expect(mockSeeAllSvc.getApplicationsById).not.toHaveBeenCalled()
    })

    it('keeps the original response when the survey status call fails', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
      mockSeeAllSvc.getApplicationsById = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
      const courses = run([buildCourse(START_DATE + 1000)])

      expect(errorSpy).toHaveBeenCalled()
      expect(courses[0].surveyCompletionStatus).toBeUndefined()
      expect(component.formatNewEnrollmentData).toHaveBeenCalled()
      errorSpy.mockRestore()
    })

    it('merges external enrollments that have content', () => {
      mockEnroll.fetchExternalEnrollmentData.mockReturnValue(of({
        result: { courses: [{ content: { identifier: 'e1' } }, { content: {} }, null] },
      }))
      run([buildCourse(START_DATE - 1000)])

      const merged = component.formatNewEnrollmentData.mock.calls[0][3]
      expect(merged.length).toBe(2)
    })

    it('still formats internal courses when the external call fails', () => {
      mockEnroll.fetchExternalEnrollmentData.mockReturnValue(throwError(() => new Error('fail')))
      run([buildCourse(START_DATE - 1000)])
      expect(component.formatNewEnrollmentData).toHaveBeenCalled()
    })

    it('still formats internal courses when the internal call fails after none loaded', () => {
      mockEnroll.fetchInternalEnrollmentData.mockReturnValue(throwError(() => new Error('fail')))
      component.formatNewEnrollmentData = jest.fn()
      component.fetchFromInternalEnrollmentList(buildStrip(), 0, 0)
      expect(component.formatNewEnrollmentData).not.toHaveBeenCalled()
    })

    it('does nothing when the pill is missing', () => {
      component.formatNewEnrollmentData = jest.fn()
      mockEnroll.fetchInternalEnrollmentData.mockClear()
      component.fetchFromInternalEnrollmentList({ tabs: [] }, 0, 0)
      expect(mockEnroll.fetchInternalEnrollmentData).not.toHaveBeenCalled()
    })
  })

  describe('ngOnInit and config handling', () => {
    const buildTabs = (): any[] => ([
      { value: 't1', label: 'T1', pillsData: [{ value: 'p1' }, { value: 'p2' }] },
      { value: 't2', label: 'T2', hideTab: true, pillsData: [] },
      { value: 't3', label: 'T3', pillsData: [{ value: 'p3' }] },
    ])
    const init = async (query: any, configData: any, tabsConfig: any = null): Promise<any> => {
      mockSeeAllSvc.getSeeAllFormsConfigJson = jest.fn().mockResolvedValue(configData)
      mockSeeAllSvc.getSeeAllTabsConfig = jest.fn().mockResolvedValue(tabsConfig)
      const cmp: any = new SeeAllWithPillsComponent(
        { queryParams: of(query) }, mockSeeAllSvc, mockConfigSvc, mockEventSvc, mockMulti, mockEnroll,
      )
      cmp.fetchForYouData = jest.fn()
      cmp.fetchUserEnrolledData = jest.fn()
      await cmp.ngOnInit()
      return cmp
    }

    it('clears skeletons when no strip matches the key', async () => {
      const cmp = await init({ key: 'none' }, { assessmentData: [{ strips: [{ key: 'other' }] }], newHomeStrip: [{ strips: [{ key: 'other' }] }] })
      expect(cmp.contentDataList).toEqual([])
    })

    it('handles a failing config request', async () => {
      mockSeeAllSvc.getSeeAllFormsConfigJson = jest.fn().mockRejectedValue(new Error('x'))
      const cmp: any = new SeeAllWithPillsComponent(
        { queryParams: of({}) }, mockSeeAllSvc, mockConfigSvc, mockEventSvc, mockMulti, mockEnroll,
      )
      await cmp.ngOnInit()
      expect(cmp.contentDataList).toEqual([])
    })

    it('uses assessmentData strips and defaults empty query params', async () => {
      const cmp = await init({}, { assessmentData: [{ strips: [{ key: '' }] }, { strips: [] }, null] })
      expect(cmp.seeAllPageConfig).toBeDefined()
      expect(cmp.contentDataList.length).toBeGreaterThan(0)
    })

    it('hides configured tabs and falls back to the first visible tab and pill', async () => {
      const strip = { key: 'k', tabs: buildTabs() }
      const cmp = await init(
        { key: 'k', tabSelected: 't2', pillSelected: 'missing' },
        { newHomeStrip: [{ strips: [strip] }] },
        { k: { t3: false } },
      )
      expect(cmp.seeAllPageConfig.tabs.map((t: any) => t.value)).toEqual(['t1'])
      expect(cmp.tabSelected).toBe('t1')
      expect(cmp.userSelectedTab).toBe('t1')
      expect(cmp.pillSelected).toBe('p1')
      expect(cmp.pillResults[0].selected).toBe(true)
    })

    it('keeps all tabs when every tab would be hidden', async () => {
      const strip = { key: 'k', tabs: [{ value: 'a', hideTab: true, pillsData: [] }] }
      const cmp = await init({ key: 'k', tabSelected: 'a' }, { newHomeStrip: [{ strips: [strip] }] })
      expect(cmp.seeAllPageConfig.tabs.length).toBe(1)
      expect(cmp.pillSelected).toBe('')
    })

    it('selects the requested tab and pill', async () => {
      const strip = { key: 'k', tabs: buildTabs() }
      const cmp = await init({ key: 'k', tabSelected: 't3', pillSelected: 'p3' }, { newHomeStrip: [{ strips: [strip] }] })
      expect(cmp.userSelectedTab).toBe('t3')
      expect(cmp.dynamicPillIndex).toBe(0)
    })

    it('fetches for-you data for the forYou strip', async () => {
      const strip = { key: 'forYou', request: { a: 1 } }
      const cmp = await init({ key: 'forYou' }, { newHomeStrip: [{ strips: [strip] }] })
      expect(cmp.fetchForYouData).toHaveBeenCalledWith(strip)
    })

    it('fetches enrolled data for the continueLearning strip', async () => {
      const strip = { key: 'continueLearning', request: { a: 1 } }
      const cmp = await init({ key: 'continueLearning' }, { newHomeStrip: [{ strips: [strip] }] })
      expect(cmp.fetchUserEnrolledData).toHaveBeenCalledWith(strip, 0, 0)
    })

    it('applyTabVisibilityConfig ignores strips without tabs', () => {
      component.seeAllPageConfig = { key: 'k' }
      component.applyTabVisibilityConfig({})
      expect(component.seeAllPageConfig.tabs).toBeUndefined()
      component.seeAllPageConfig = undefined
      component.applyTabVisibilityConfig({})
      expect(component.seeAllPageConfig).toBeUndefined()
    })

    it('ngOnDestroy does nothing', () => {
      expect(component.ngOnDestroy()).toBeUndefined()
    })
  })

  describe('filter and widget helpers', () => {
    it('evaluates batches.enrollmentEndDate expressions', () => {
      const res = component.checkForDateFilters({ 'batches.enrollmentEndDate': { '>=': '2+3' } })
      expect(res['batches.enrollmentEndDate']['>=']).toBe(5)
    })

    it('returns filters untouched when no date filter exists', () => {
      const filters = { a: 1 }
      expect(component.checkForDateFilters(filters)).toBe(filters)
    })

    it('returns non-array filters unchanged', () => {
      const filters = { a: 1 }
      expect(component.getFiltersFromArray(filters)).toBe(filters)
      expect(component.transformSearchV6FiltersV2(filters)).toBe(filters)
    })

    it('transformContentsToWidgets maps contents and flags specializations', () => {
      component.userSelectedTab = 'igotSpecializations'
      const strip: any = {
        key: 'k',
        viewMoreUrl: { stripConfig: { cardSubType: 'sub' } },
        stripConfig: { intranetMode: true, deletedMode: false, contentTags: ['t'] },
      }
      const widgets = component.transformContentsToWidgets([{ identifier: 'a' }], strip)
      expect(widgets[0].widgetData.isiGOTSpecialization).toBe(true)
      expect(widgets[0].widgetData.cardSubType).toBe('sub')
      expect(widgets[0].widgetData.context).toEqual({ pageSection: 'k', position: 0 })
      expect(component.transformContentsToWidgets(null, strip)).toEqual([])
    })

    it('transformSkeletonToWidgets defaults the card sub type', () => {
      expect(component.transformSkeletonToWidgets({})[0].widgetData.cardSubType).toBe('card-portrait-skeleton')
    })
  })

  describe('request helpers', () => {
    it('searchV6Request resolves without view more for few results', async () => {
      mockSeeAllSvc.searchV6.mockReturnValue(of({ result: { content: [{}] } }))
      const resp = await component.searchV6Request({}, { searchV6: { request: { filters: { a: 1 } } } }, true)
      expect(resp.viewMoreUrl).toBeNull()
    })

    it('searchV6Request builds view more url with filters', async () => {
      mockSeeAllSvc.searchV6.mockReturnValue(of({ result: { content: new Array(6).fill({}) } }))
      const strip: any = { stripConfig: { postCardForSearch: true } }
      const resp = await component.searchV6Request(strip, { searchV6: { request: { filters: { a: 1 } } } }, true)
      expect(resp.viewMoreUrl.path).toBe('')
      expect(resp.viewMoreUrl.queryParams.f).toBe('{}')
      const noFilters = await component.searchV6Request(strip, { searchV6: { request: {} } }, true)
      expect(noFilters.viewMoreUrl.queryParams.f).toEqual({})
    })

    it('searchV6Request rejects on error', async () => {
      mockSeeAllSvc.searchV6.mockReturnValue(throwError(() => 'err'))
      await expect(component.searchV6Request({}, { searchV6: {} }, true)).rejects.toBe('err')
    })

    it('trendingSearchRequest replaces <orgID> with the root org and handles filters', async () => {
      mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ result: { r: new Array(6).fill({}) } }))
      const strip: any = { request: { trendingSearch: { responseKey: 'r' } }, stripConfig: { postCardForSearch: true } }
      const request: any = { trendingSearch: { request: { filters: { organisation: '<orgID>' } } } }
      const resp = await component.trendingSearchRequest(strip, request, true)
      expect(request.trendingSearch.request.filters.organisation).toBe('r1')
      expect(resp.viewMoreUrl.queryParams.f).toBe('{}')
    })

    it('trendingSearchRequest handles missing profile, no view more and certifications', async () => {
      const original = mockConfigSvc.userProfile
      mockConfigSvc.userProfile = undefined
      mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ response: { certifications: [1] } }))
      const request: any = { trendingSearch: { request: { filters: { organisation: '<orgID>' } } } }
      const resp = await component.trendingSearchRequest({ request }, request, true)
      mockConfigSvc.userProfile = original
      expect(request.trendingSearch.request.filters.organisation).toBeUndefined()
      expect(resp.viewMoreUrl).toBeNull()
      expect(resp.results).toEqual({ response: { certifications: [] } })
    })

    it('trendingSearchRequest rejects on error', async () => {
      mockSeeAllSvc.trendingContentSearch.mockReturnValue(throwError(() => ({ error: { status: 400 } })))
      const request: any = { trendingSearch: { request: { filters: {} } } }
      await expect(component.trendingSearchRequest({}, request, true)).rejects.toEqual({ error: { status: 400 } })
      mockSeeAllSvc.trendingContentSearch.mockReturnValue(throwError(() => ({})))
      await expect(component.trendingSearchRequest({}, request, true)).rejects.toEqual({})
    })

    it('microCredentialsSearchRequest builds results and view more url', async () => {
      mockSeeAllSvc.microCredentialsSearch = jest.fn().mockReturnValue(of({ result: { content: new Array(6).fill({}) } }))
      const strip: any = { stripConfig: { postCardForSearch: true }, viewMoreUrl: { path: '/p', queryParams: 'q' } }
      const request: any = { microSearch: { request: { url: 'u', filters: { a: 1 } } } }
      const resp = await component.microCredentialsSearchRequest(strip, request, true)
      expect(resp.results.length).toBe(6)
      expect(resp.viewMoreUrl.path).toBe('/p')
      const noFilters = await component.microCredentialsSearchRequest(strip, { microSearch: { request: { url: 'u' } } }, true)
      expect(noFilters.viewMoreUrl.queryParams.f).toEqual({})
    })

    it('microCredentialsSearchRequest handles empty responses and errors', async () => {
      mockSeeAllSvc.microCredentialsSearch = jest.fn().mockReturnValue(of(null))
      const request: any = { microSearch: { request: { url: 'u' } } }
      const resp = await component.microCredentialsSearchRequest({}, request, true)
      expect(resp.results).toEqual([])
      expect(resp.viewMoreUrl).toBeNull()
      mockSeeAllSvc.microCredentialsSearch = jest.fn().mockReturnValue(throwError(() => ({ error: { status: 400 } })))
      await expect(component.microCredentialsSearchRequest({}, request, true)).rejects.toBeDefined()
      mockSeeAllSvc.microCredentialsSearch = jest.fn().mockReturnValue(throwError(() => ({})))
      await expect(component.microCredentialsSearchRequest({}, request, true)).rejects.toBeDefined()
    })
  })

  describe('trending, for-you and micro credential fetches', () => {
    const buildConfig = (): any => ({
      tabs: [{ value: 'tv', pillsData: [{ value: 'p' }, { value: 'q' }] }],
    })

    it('fetchFromTrendingContent ignores strips without trendingSearch', async () => {
      component.getTabDataByNewReqTrending = jest.fn()
      await component.fetchFromTrendingContent({ request: {} })
      expect(component.getTabDataByNewReqTrending).not.toHaveBeenCalled()
    })

    it('fetchFromTrendingContent delegates to tab fetch when the tab requires a request', async () => {
      component.getTabDataByNewReqTrending = jest.fn()
      component.seeAllPageConfig = buildConfig()
      const strip: any = {
        request: { trendingSearch: { request: { filters: [{ 'batches.endDate': { '>=': '1+1' } }] } } },
        tabs: [{ requestRequired: true }],
      }
      strip.request.trendingSearch.request.filters = [{ a: 1 }]
      await component.fetchFromTrendingContent(strip)
      expect(strip.request.trendingSearch.request.filters).toEqual({ a: 1 })
      expect(component.getTabDataByNewReqTrending).toHaveBeenCalled()
    })

    it('fetchFromTrendingContent skips tabs that do not require a request or config', async () => {
      component.getTabDataByNewReqTrending = jest.fn()
      const strip: any = { request: { trendingSearch: { a: 1 } }, tabs: [{ requestRequired: true }] }
      component.seeAllPageConfig = {}
      await component.fetchFromTrendingContent(strip)
      strip.tabs = [{}]
      await component.fetchFromTrendingContent(strip)
      expect(component.getTabDataByNewReqTrending).not.toHaveBeenCalled()
    })

    it('fetchFromTrendingContent builds widgets without tabs and swallows errors', async () => {
      const strip: any = { request: { trendingSearch: { responseKey: 'r' } } }
      component.trendingSearchRequest = jest.fn().mockResolvedValue({ results: { response: { r: [{ identifier: 'a' }] } } })
      await component.fetchFromTrendingContent(strip)
      expect(component.contentDataList.length).toBe(1)
      component.trendingSearchRequest = jest.fn().mockResolvedValue({ results: { response: {} } })
      await component.fetchFromTrendingContent(strip)
      expect(component.contentDataList.length).toBe(0)
      component.trendingSearchRequest = jest.fn().mockResolvedValue(null)
      await component.fetchFromTrendingContent(strip)
      component.trendingSearchRequest = jest.fn().mockRejectedValue(new Error('x'))
      await expect(component.fetchFromTrendingContent(strip)).resolves.toBeUndefined()
    })

    it('onScrollEnd advances the offset when more pages exist', () => {
      component.totalPages = 3
      component.contentDataList = [{ widgetData: { content: {} } }]
      component.seeAllPageConfig = { request: { searchV6: { request: { limit: 10 } } } }
      component.onScrollEnd()
      expect(component.offsetForPage).toBe(10)
      component.seeAllPageConfig = { request: {} }
      component.onScrollEnd()
      expect(component.offsetForPage).toBe(10)
      component.totalPages = 0
      component.onScrollEnd()
      expect(component.page).toBe(4)
    })

    describe('fetchForYouData', () => {
      beforeEach(() => {
        component.getTabDataByNewReqSearchV6 = jest.fn()
        component.getTabDataByNewReqTrending = jest.fn()
        component.getTabDataByNewReqMicroCreds = jest.fn()
        component.fetchMicroCredentialsList = jest.fn().mockResolvedValue(undefined)
      })
      const run = async (request: any, config: any = true): Promise<void> => {
        component.seeAllPageConfig = config === true
          ? { tabs: [{ pillsData: [{ request }] }] }
          : config
        const strip: any = { type: 'forYou', tabs: [{ pillsData: [{ requestRequired: true }] }] }
        await component.fetchForYouData(strip)
      }

      it('dispatches searchV6 requests', async () => {
        await run({ searchV6: {} })
        expect(component.getTabDataByNewReqSearchV6).toHaveBeenCalled()
        expect(component.fetchMicroCredentialsList).toHaveBeenCalled()
      })

      it('dispatches trending requests', async () => {
        await run({ trendingSearch: {} })
        expect(component.getTabDataByNewReqTrending).toHaveBeenCalled()
      })

      it('dispatches micro credential requests without refetching the list', async () => {
        await run({ microSearch: {} })
        expect(component.getTabDataByNewReqMicroCreds).toHaveBeenCalled()
        expect(component.fetchMicroCredentialsList).not.toHaveBeenCalled()
      })

      it('does nothing without a config, request flag or forYou type', async () => {
        await run({}, null)
        const strip: any = { type: 'forYou', tabs: [{ pillsData: [{}] }] }
        await component.fetchForYouData(strip)
        await component.fetchForYouData({ type: 'forYou' })
        await component.fetchForYouData({ type: 'other' })
        await component.fetchForYouData(null)
        expect(component.getTabDataByNewReqSearchV6).not.toHaveBeenCalled()
      })
    })

    describe('fetchMicroCredentialsList', () => {
      const buildStrip = (): any => ({ tabs: [{ value: 'a' }, { value: 'igotSpecializations' }] })

      it('ignores strips without the specialization tab', async () => {
        mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn()
        await component.fetchMicroCredentialsList({ tabs: [{ value: 'a' }] })
        await component.fetchMicroCredentialsList({ tabs: [] })
        await component.fetchMicroCredentialsList(null)
        expect(mockSeeAllSvc.microCredentialsSearchWithoutUrl).not.toHaveBeenCalled()
      })

      it('keeps the tab when data is available', async () => {
        mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn().mockReturnValue(of({ result: { content: [{}] } }))
        const strip = buildStrip()
        await component.fetchMicroCredentialsList(strip)
        expect(strip.tabs.length).toBe(2)
      })

      it('removes the tab when there is no data', async () => {
        mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn().mockReturnValue(of({ result: { content: [] } }))
        const strip = buildStrip()
        component.seeAllPageConfig = buildStrip()
        await component.fetchMicroCredentialsList(strip)
        expect(strip.tabs.length).toBe(1)
        expect(component.seeAllPageConfig.tabs.length).toBe(1)
      })

      it('removes the tab when the config has no matching tab', async () => {
        mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn().mockReturnValue(of(null))
        const strip = buildStrip()
        component.seeAllPageConfig = { tabs: [{ value: 'a' }] }
        await component.fetchMicroCredentialsList(strip)
        expect(strip.tabs.length).toBe(1)
        expect(component.seeAllPageConfig.tabs.length).toBe(1)
      })

      it('removes the tab when the request fails', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
        mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn().mockReturnValue(throwError(() => new Error('x')))
        const strip = buildStrip()
        component.seeAllPageConfig = buildStrip()
        await component.fetchMicroCredentialsList(strip)
        expect(strip.tabs.length).toBe(1)
        expect(component.seeAllPageConfig.tabs.length).toBe(1)
        component.seeAllPageConfig = { tabs: [{ value: 'a' }] }
        await component.fetchMicroCredentialsList(buildStrip())
        component.seeAllPageConfig = undefined
        await component.fetchMicroCredentialsList(buildStrip())
        errorSpy.mockRestore()
      })
    })

    describe('getTabDataByNewReq*', () => {
      const tabValue = 'tv'
      beforeEach(() => {
        component.seeAllPageConfig = buildConfig()
      })

      it('micro credentials fills pill and tab widgets', async () => {
        component.microCredentialsSearchRequest = jest.fn().mockResolvedValue({ results: [{ identifier: 'a' }] })
        await component.getTabDataByNewReqMicroCreds({}, 0, 1, { request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].pillsData[1].widgets.length).toBe(1)
        expect(component.seeAllPageConfig.tabs[0].fetchTabStatus).toBe('done')
      })

      it('micro credentials fills empty widgets when there are no results or on error', async () => {
        component.microCredentialsSearchRequest = jest.fn().mockResolvedValue({ results: [] })
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toEqual([])
        component.seeAllPageConfig = buildConfig()
        component.microCredentialsSearchRequest = jest.fn().mockRejectedValue(new Error('x'))
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toEqual([])
        expect(component.seeAllPageConfig.tabs[0].widgets).toEqual([])
      })

      it('micro credentials tolerates a missing config or pills', async () => {
        component.microCredentialsSearchRequest = jest.fn().mockResolvedValue({ results: [{}] })
        component.seeAllPageConfig = undefined
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        component.seeAllPageConfig = { tabs: [{ pillsData: [] }] }
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].fetchTabStatus).toBe('done')
        component.microCredentialsSearchRequest = jest.fn().mockResolvedValue({ results: [] })
        component.seeAllPageConfig = undefined
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        component.seeAllPageConfig = { tabs: [{ pillsData: [] }] }
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        component.microCredentialsSearchRequest = jest.fn().mockRejectedValue(new Error('x'))
        component.seeAllPageConfig = { tabs: [{ pillsData: [] }] }
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        component.seeAllPageConfig = undefined
        await component.getTabDataByNewReqMicroCreds({}, 0, 0, { request: {} }, true)
        expect(component.seeAllPageConfig).toBeUndefined()
      })

      it('trending fills widgets from the response', async () => {
        component.trendingSearchRequest = jest.fn().mockResolvedValue({ results: { response: { [tabValue]: [{ identifier: 'a' }] } } })
        await component.getTabDataByNewReqTrending({}, 0, 0, { value: tabValue, request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets.length).toBe(1)
        component.trendingSearchRequest = jest.fn().mockResolvedValue({ results: { response: {} } })
        await component.getTabDataByNewReqTrending({}, 0, 0, { value: tabValue, request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].widgets).toEqual([])
      })

      it('trending fills empty widgets without a response and tolerates errors', async () => {
        component.trendingSearchRequest = jest.fn().mockResolvedValue(null)
        await component.getTabDataByNewReqTrending({}, 0, 1, { value: tabValue, request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].pillsData[1].widgets).toEqual([])
        component.seeAllPageConfig = { tabs: [{ pillsData: [] }] }
        await component.getTabDataByNewReqTrending({}, 0, 0, { value: tabValue, request: {} }, true)
        component.seeAllPageConfig = undefined
        await component.getTabDataByNewReqTrending({}, 0, 0, { value: tabValue, request: {} }, true)
        component.trendingSearchRequest = jest.fn().mockResolvedValue({ results: { response: { [tabValue]: [] } } })
        component.seeAllPageConfig = { tabs: [{ pillsData: [] }] }
        await component.getTabDataByNewReqTrending({}, 0, 0, { value: tabValue, request: {} }, true)
        component.seeAllPageConfig = undefined
        await component.getTabDataByNewReqTrending({}, 0, 0, { value: tabValue, request: {} }, true)
        component.trendingSearchRequest = jest.fn().mockRejectedValue(new Error('x'))
        await expect(component.getTabDataByNewReqTrending({}, 0, 0, { value: tabValue, request: {} }, true)).resolves.toBeUndefined()
      })

      it('searchV6 fills widgets and tolerates empty responses and errors', async () => {
        component.searchV6Request = jest.fn().mockResolvedValue({ results: { result: { content: [{ identifier: 'a' }] } } })
        await component.getTabDataByNewReqSearchV6({}, 0, 0, { request: {} }, true)
        expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets.length).toBe(1)
        component.seeAllPageConfig = { tabs: [{ pillsData: [] }] }
        await component.getTabDataByNewReqSearchV6({}, 0, 0, { request: {} }, true)
        component.seeAllPageConfig = undefined
        await component.getTabDataByNewReqSearchV6({}, 0, 0, { request: {} }, true)
        component.searchV6Request = jest.fn().mockResolvedValue(null)
        await component.getTabDataByNewReqSearchV6({}, 0, 0, { request: {} }, true)
        component.searchV6Request = jest.fn().mockRejectedValue(new Error('x'))
        await expect(component.getTabDataByNewReqSearchV6({}, 0, 0, { request: {} }, true)).resolves.toBeUndefined()
      })
    })
  })

  describe('pill and tab interaction', () => {
    const buildStrip = (request: any, extraTab: any = {}): any => ({
      tabs: [{ textLabel: 'Tab One', value: 'tv', ...extraTab, pillsData: [{ requestRequired: !!request, request }, {}] }],
    })
    beforeEach(() => {
      component.getTabDataByNewReqSearchV6 = jest.fn()
      component.getTabDataByNewReqTrending = jest.fn()
      component.getTabDataByNewReqMicroCreds = jest.fn()
      component.fetchFromInternalEnrollmentList = jest.fn()
      component.fetchEventEnrollmentList = jest.fn()
    })

    it('pillClicked dispatches each request type', () => {
      const cases: Array<[any, string]> = [
        [{ searchV6: {} }, 'getTabDataByNewReqSearchV6'],
        [{ trendingSearch: {} }, 'getTabDataByNewReqTrending'],
        [{ microSearch: {} }, 'getTabDataByNewReqMicroCreds'],
        [{ type: 'enrollment' }, 'fetchFromInternalEnrollmentList'],
        [{ type: 'eventEnrollment' }, 'fetchEventEnrollmentList'],
      ]
      cases.forEach(([request, method]) => {
        const strip = buildStrip(request)
        component.seeAllPageConfig = strip
        component.pillClicked(strip, 0, 0)
        expect(component[method]).toHaveBeenCalled()
        expect(strip.tabs[0].pillsData[0].tabLoading).toBe(false)
      })
    })

    it('pillClicked ignores a missing tab and unknown request types', () => {
      const strip = buildStrip({ type: 'other' })
      component.seeAllPageConfig = strip
      component.pillClicked(strip, 0, 0)
      expect(component.fetchFromInternalEnrollmentList).not.toHaveBeenCalled()
      component.pillClicked({}, 0, 0)
    })

    it('tabClicked dispatches pill requests', () => {
      const cases: Array<[any, string]> = [
        [{ searchV6: {} }, 'getTabDataByNewReqSearchV6'],
        [{ trendingSearch: {} }, 'getTabDataByNewReqTrending'],
        [{ microSearch: {} }, 'getTabDataByNewReqMicroCreds'],
        [{ type: 'enrollment' }, 'fetchFromInternalEnrollmentList'],
        [{ type: 'eventEnrollment' }, 'fetchEventEnrollmentList'],
      ]
      cases.forEach(([request, method]) => {
        const strip = buildStrip(request)
        component.seeAllPageConfig = strip
        component.tabClicked(0, strip, 'key', 0)
        expect(component[method]).toHaveBeenCalled()
      })
      expect(mockEventSvc.raiseInteractTelemetry).toHaveBeenCalled()
      expect(component.userSelectedTab).toBe('tv')
    })

    it('tabClicked falls back to tab level requests', () => {
      const strip = buildStrip(null, { requestRequired: true, request: { enrollmentList: {} } })
      component.seeAllPageConfig = strip
      component.tabClicked(0, strip, 'key', 0)
      expect(component.fetchFromInternalEnrollmentList).toHaveBeenCalled()
      strip.tabs[0].request = { eventEnrollmentList: {} }
      component.tabClicked(0, strip, 'key', 0)
      expect(component.fetchEventEnrollmentList).toHaveBeenCalled()
      strip.tabs[0].request = {}
      component.tabClicked(0, strip, 'key', 0)
    })

    it('tabClicked ignores unknown pill request types', () => {
      const strip = buildStrip({ type: 'other' })
      component.seeAllPageConfig = strip
      component.tabClicked(0, strip, 'key', 0)
      expect(component.fetchFromInternalEnrollmentList).not.toHaveBeenCalled()
    })

    it('getSelectedPillIndex returns 0 when there are no pills', () => {
      expect(component.getSelectedPillIndex({})).toBe(0)
    })

    it('resetSelectedPill ignores empty input', () => {
      expect(component.resetSelectedPill(null)).toBeUndefined()
    })
  })

  describe('responsive layout helpers', () => {
    it('isForYouResponsiveLayout uses the user selected tab or the current tab', () => {
      component.seeAllPageConfig = { key: 'forYou' }
      component.userSelectedTab = 'recentlyAdded'
      expect(component.isForYouResponsiveLayout).toBe(true)
      component.userSelectedTab = ''
      component.dynamicTabIndex = 0
      component.tabResults = [{ value: 'igotSpecializations' }]
      expect(component.isForYouResponsiveLayout).toBe(true)
      component.tabResults = []
      expect(component.isForYouResponsiveLayout).toBe(false)
    })

    it('isForYouResponsiveTab requires the forYou strip', () => {
      component.seeAllPageConfig = { key: 'other' }
      expect(component.isForYouResponsiveTab('recentlyAdded')).toBe(false)
      component.seeAllPageConfig = undefined
      expect(component.isForYouResponsiveTab('recentlyAdded')).toBe(false)
    })

    it('isContinueLearningResponsivePill checks the selected pill', () => {
      component.seeAllPageConfig = { key: 'continueLearning' }
      const tab = { value: 'Contents', pillsData: [{ value: 'inprogress', selected: true }] }
      expect(component.isContinueLearningResponsivePill(tab)).toBe(true)
      expect(component.isContinueLearningResponsivePill({ value: 'Contents', pillsData: [{ value: 'other', selected: true }] })).toBe(false)
      expect(component.isContinueLearningResponsivePill({ value: 'Contents', pillsData: [{ value: 'inprogress' }] })).toBe(false)
    })
  })

  describe('enrollment fetches', () => {
    it('fetchUserEnrolledData dispatches event enrollments and ignores empty config', () => {
      component.fetchEventEnrollmentList = jest.fn()
      component.fetchFromInternalEnrollmentList = jest.fn()
      const strip: any = { request: { enrollmentList: { a: 1 } }, tabs: [{ pillsData: [{ request: { type: 'eventEnrollment' } }] }] }
      component.fetchUserEnrolledData(strip, 0, 0)
      expect(component.fetchEventEnrollmentList).toHaveBeenCalled()
      component.fetchUserEnrolledData({ request: {} }, 0, 0)
      component.fetchUserEnrolledData({ request: { enrollmentList: { a: 1 } }, tabs: [{ pillsData: [] }] }, 0, 0)
      expect(component.fetchFromInternalEnrollmentList).not.toHaveBeenCalled()
    })

    it('fetchEventEnrollmentList formats events and tolerates errors', () => {
      component.formatNewEnrollmentData = jest.fn()
      mockEnroll.fetchEventsEnrollmentData.mockReturnValue(of({ result: { events: [{ event: { identifier: 'e1' } }] } }))
      const strip: any = { tabs: [{ pillsData: [{ request: { payload: { request: { limit: 5 } } } }] }] }
      component.fetchEventEnrollmentList(strip, 0, 0)
      expect(component.formatNewEnrollmentData.mock.calls[0][3].length).toBe(1)
      expect(strip.tabs[0].pillsData[0].request.payload.request.limit).toBeUndefined()
      mockEnroll.fetchEventsEnrollmentData.mockReturnValue(of(null))
      component.fetchEventEnrollmentList(strip, 0, 0)
      mockEnroll.fetchEventsEnrollmentData.mockReturnValue(throwError(() => new Error('x')))
      component.fetchEventEnrollmentList(strip, 0, 0)
      component.fetchEventEnrollmentList({ tabs: [] }, 0, 0)
      expect(component.formatNewEnrollmentData).toHaveBeenCalledTimes(2)
    })

    it('fetchFromInternalEnrollmentList uses an empty user id without a profile', () => {
      const original = mockConfigSvc.userProfile
      mockConfigSvc.userProfile = undefined
      component.formatNewEnrollmentData = jest.fn()
      mockEnroll.fetchInternalEnrollmentData.mockReturnValue(of({ result: { courses: [] } }))
      component.fetchFromInternalEnrollmentList({ tabs: [{ pillsData: [{ request: { payload: {} } }] }] }, 0, 0)
      mockConfigSvc.userProfile = original
      expect(mockEnroll.fetchInternalEnrollmentData).toHaveBeenCalledWith('', {})
    })

    it('fetchFromInternalEnrollmentList formats courses when the internal call fails after partial data', () => {
      component.formatNewEnrollmentData = jest.fn()
      mockEnroll.fetchInternalEnrollmentData.mockReturnValue(of({ result: { courses: [{ content: { identifier: 'a' } }] } }))
      mockEnroll.fetchExternalEnrollmentData.mockReturnValue(throwError(() => new Error('x')))
      component.fetchFromInternalEnrollmentList({ tabs: [{ pillsData: [{ request: { payload: {} } }] }] }, 0, 0)
      expect(component.formatNewEnrollmentData.mock.calls[0][3].length).toBe(1)
    })

    it('formatNewEnrollmentData maps events and survey status', () => {
      const strip: any = { tabs: [{ pillsData: [{}] }] }
      component.formatNewEnrollmentData(strip, 0, 0, [
        { event: { identifier: 'e1', resourceType: 'Webinar' }, lastContentAccessTime: '2024-01-01', surveyCompletionStatus: false },
        { content: { identifier: 'c1', primaryCategory: 'Course' }, lastContentAccessTime: '2025-01-01', completedOn: 5 },
        { content: undefined, event: undefined },
      ])
      const widgets = component.contentDataList
      expect(widgets.length).toBe(3)
      expect(widgets[0].widgetData.content.identifier).toBe('c1')
      const event = widgets.find((w: any) => w.widgetData.content.cType === 'event')
      expect(event.widgetData.content.surveyCompletionStatus).toBe(false)
      expect(event.widgetData.content.content.primaryCategory).toBe('Webinar')
    })

    it('formatNewEnrollmentData handles empty input and strips without pills', () => {
      component.formatNewEnrollmentData({ tabs: [{ pillsData: [] }] }, 0, 0, [])
      component.formatNewEnrollmentData(null, 0, 0, null)
      expect(component.tabResults).toBeDefined()
    })

    it('loadMore keeps the page size when everything is loaded', () => {
      component.contentDataList = []
      component.pageSize = 50
      component.loadMore()
      expect(component.pageSize).toBe(50)
    })
  })

  // My Learning cards should start from the left on desktop; centering is only for mobile widths.
  describe('continue learning card grid styles', () => {
    const scss = readFileSync(join(__dirname, 'see-all-with-pills.component.scss'), 'utf8');
    const baseBlock = scss.match(/\n\.continue-learning-responsive-card-grid \{[\s\S]*?\n\}/)[0];
    const mobileBlock = scss.slice(scss.indexOf('@media only screen and (max-width: 768px) {\n    .continue-learning-responsive-card-grid'));

    it('does not center the cards outside the mobile breakpoint', () => {
      expect(baseBlock).not.toMatch(/justify-content/);
    });

    it('centers the cards on mobile widths', () => {
      expect(mobileBlock).toMatch(
        /^@media only screen and \(max-width: 768px\) \{\s*\.continue-learning-responsive-card-grid \{\s*justify-content: center !important;/
      );
    });
  });

})

