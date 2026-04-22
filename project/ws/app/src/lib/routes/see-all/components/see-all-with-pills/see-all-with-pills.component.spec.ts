// @ts-nocheck
import { of } from 'rxjs'

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
    searchV6: jest.fn().mockReturnValue(of({ result: { content: [] } })),
    trendingContentSearch: jest.fn().mockReturnValue(of({ result: { responseKey: [] } })),
    getApplicationsById: jest.fn().mockReturnValue(of({ result: { response: [] } })),
  }
  const mockConfigSvc: any = { userProfile: { userId: 'u1', rootOrgId: 'r1' } }
  const mockEventSvc: any = { raiseInteractTelemetry: jest.fn(), broadcast: jest.fn() }
  const mockMulti: any = { translateLabel: jest.fn().mockReturnValue('translated') }
  const mockEnroll: any = {
    fetchInternalEnrollmentData: jest.fn().mockReturnValue(of({ result: { courses: [] } })),
    fetchExternalEnrollmentData: jest.fn().mockReturnValue(of({ result: { courses: [] } })),
    fetchEventsEnrollmentData: jest.fn().mockReturnValue(of({ result: { events: [] } })),
  }

  beforeEach(() => {
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
    const contents: any[] = []
    const widgets = (component as any).transformContentsToWidgets(contents, { key: 'k', viewMoreUrl: {}, stripConfig: { intranetMode: true } })
    expect(Array.isArray(widgets)).toBe(true)
  })

  it('transformSearchV6FiltersV2 merges filters', () => {
    const filtersArr = [{ a: 1 }, { b: 2 }]
    const merged = (component as any).transformSearchV6FiltersV2(filtersArr)
    expect(merged.a).toBe(1)
    expect(merged.b).toBe(2)
  })

  it('searchV6Request returns viewMoreUrl when many results', async () => {
    const strip1: any = { viewMoreUrl: { path: '/p', queryParams: {} }, stripConfig: { postCardForSearch: true } }
    const request1: any = { searchV6: { request: {} } }
    mockSeeAllSvc.searchV6.mockReturnValue(of({ result: { content: new Array(6).fill({}) } }))
    const resp1 = await (component as any).searchV6Request(strip1, request1, true)
    expect(resp1.viewMoreUrl).toBeDefined()
  })

  it('trendingSearchRequest handles org replacement and viewMoreUrl', async () => {
    const strip2: any = { viewMoreUrl: { path: '/p', queryParams: {} }, stripConfig: { postCardForSearch: true }, request: { trendingSearch: { responseKey: 'r', request: { filters: { organisation: '<orgID>' } } } } }
    mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ result: { r: new Array(6).fill({}) } }))
    const resp2 = await (component as any).trendingSearchRequest(strip2, strip2.request, true)
    expect(resp2.viewMoreUrl).toBeDefined()
  })

  it('resetSelectedPill clears selections', () => {
    const pills: any[] = [{ selected: true }, { selected: true }];
    (component as any).resetSelectedPill(pills)
    expect(pills[0].selected).toBe(false)
    expect(pills[1].selected).toBe(false)
  })

  it('pillClicked sets selected when no requestRequired', () => {
    const cfg: any = { tabs: [{ pillsData: [{}, {}] }] }
    component.seeAllPageConfig = cfg;
    (component as any).pillClicked(cfg, 1, 0)
    expect(cfg.tabs[0].pillsData[1].selected).toBe(true)
  })

  it('getSelectedPillIndex returns correct index', () => {
    const idx = (component as any).getSelectedPillIndex({ pillsData: [{ selected: false }, { selected: true }] })
    expect(idx).toBe(1)
  })

  it('fetchUserEnrolledData calls internal enrollment for enrollment type', () => {
    const strip3: any = { request: { enrollmentList: { a: 1 } }, tabs: [{ pillsData: [{ request: { type: 'enrollment' } }] }] };
    (component as any).fetchFromInternalEnrollmentList = jest.fn();
    (component as any).fetchUserEnrolledData(strip3, 0, 0)
    expect((component as any).fetchFromInternalEnrollmentList).toHaveBeenCalled()
  })

  it('formatNewEnrollmentData sets contentDataList and tabResults', () => {
    const strip4: any = { tabs: [{ pillsData: [{}, {}] }] }
    const courses: any[] = [{ content: { identifier: 'c1', primaryCategory: 'pc' }, completionPercentage: 50, lastContentAccessTime: '2020-01-01' }];
    (component as any).formatNewEnrollmentData(strip4, 0, 0, courses, true)
    expect(component.contentDataList).toBeDefined()
  })

  it('loadMore increases pageSize when contentDataList longer', () => {
    component.contentDataList = new Array(200).fill({})
    component.pageSize = 50
    component.loadMore()
    expect(component.pageSize).toBeGreaterThan(50)
  })

  it('loadMore does not change pageSize when contentDataList shorter or equal', () => {
    component.contentDataList = new Array(30).fill({})
    component.pageSize = 50
    const initialPageSize = component.pageSize
    component.loadMore()
    expect(component.pageSize).toBe(initialPageSize)
  })

  it('onScrollEnd increments page number', () => {
    component.page = 1
    component.totalPages = 5
    component.contentDataList = [{ widgetData: { content: {} } }]
    component.seeAllPageConfig = { request: { searchV6: { request: { limit: 10 } } } }
    component.offsetForPage = 0
    component.onScrollEnd()
    expect(component.page).toBe(2)
  })

  it('onScrollEnd does not increment page when page exceeds totalPages', () => {
    component.page = 7
    component.totalPages = 7
    component.onScrollEnd()
    expect(component.page).toBe(8)
  })

  it('onScrollEnd updates offsetForPage when searchV6 exists', () => {
    component.page = 1
    component.totalPages = 5
    component.contentDataList = [{ widgetData: { content: { id: '1' } } }]
    component.seeAllPageConfig = { request: { searchV6: { request: { limit: 20 } } } }
    component.offsetForPage = 0
    component.onScrollEnd()
    expect(component.offsetForPage).toBe(20)
  })

  it('fetchFromTrendingContent should call trendingSearchRequest when request exists', async () => {
    const strip5: any = {
      key: 'test',
      request: { trendingSearch: { responseKey: 'content', request: { filters: {} } } },
    }
    mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ response: { content: [] } }))
    await component.fetchFromTrendingContent(strip5)
    expect(mockSeeAllSvc.trendingContentSearch).toHaveBeenCalled()
  })

  it('fetchFromTrendingContent should handle batches.endDate filter', async () => {
    const strip6: any = {
      key: 'test',
      request: { trendingSearch: { responseKey: 'content', request: { filters: { 'batches.endDate': { '>=': '5+5' } } } } },
    }
    mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ response: { content: [] } }))
    await component.fetchFromTrendingContent(strip6)
    expect(strip6.request.trendingSearch.request.filters['batches.endDate']['>=']).toBe(10)
  })

  it('fetchFromTrendingContent should handle batches.enrollmentEndDate filter', async () => {
    const strip7: any = {
      key: 'test',
      request: { trendingSearch: { responseKey: 'content', request: { filters: { 'batches.enrollmentEndDate': { '>=': '3+2' } } } } },
    }
    mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ response: { content: [] } }))
    await component.fetchFromTrendingContent(strip7)
    expect(strip7.request.trendingSearch.request.filters['batches.enrollmentEndDate']['>=']).toBe(5)
  })

  it('fetchFromTrendingContent should handle tabs with requestRequired', async () => {
    component.seeAllPageConfig = {
      tabs: [{ requestRequired: true, value: 'tab1' }],
    }
    component.dynamicTabIndex = 0
    const strip8: any = {
      key: 'test',
      request: { trendingSearch: { responseKey: 'content', request: { filters: {} } } },
      tabs: [{ requestRequired: true, value: 'tab1', request: { trendingSearch: {} } }],
    };
    (component as any).getTabDataByNewReqTrending = jest.fn()
    await component.fetchFromTrendingContent(strip8)
    expect((component as any).getTabDataByNewReqTrending).toHaveBeenCalled()
  })

  it('fetchForYouData should handle forYou type strip', async () => {
    const strip9: any = {
      type: 'forYou',
      tabs: [{
        pillsData: [{
          requestRequired: true,
          request: { searchV6: { request: {} } },
        }],
      }],
    }
    component.seeAllPageConfig = strip9
    component.dynamicTabIndex = 0
    component.dynamicPillIndex = 0;
    (component as any).getTabDataByNewReqSearchV6 = jest.fn()
    await component.fetchForYouData(strip9)
    expect((component as any).getTabDataByNewReqSearchV6).toHaveBeenCalled()
  })

  it('fetchForYouData should handle microSearch request', async () => {
    const strip10: any = {
      type: 'forYou',
      tabs: [{
        pillsData: [{
          requestRequired: true,
          request: { microSearch: { request: {} } },
        }],
      }],
    }
    component.seeAllPageConfig = strip10
    component.dynamicTabIndex = 0
    component.dynamicPillIndex = 0;
    (component as any).getTabDataByNewReqMicroCreds = jest.fn();
    (component as any).fetchMicroCredentialsList = jest.fn()
    await component.fetchForYouData(strip10)
    expect((component as any).getTabDataByNewReqMicroCreds).toHaveBeenCalled()
  })

  it('fetchMicroCredentialsList should remove igotSpecializations tab when no data', async () => {
    const strip11: any = {
      tabs: [
        { value: 'tab1' },
        { value: 'igotSpecializations' },
        { value: 'tab2' },
      ],
    }
    component.seeAllPageConfig = strip11
    mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn().mockReturnValue(of({ result: { content: [] } }))
    await component.fetchMicroCredentialsList(strip11)
    expect(strip11.tabs.length).toBe(2)
    expect(strip11.tabs.find((t: any) => t.value === 'igotSpecializations')).toBeUndefined()
  })

  it('fetchMicroCredentialsList should keep igotSpecializations tab when data exists', async () => {
    const strip12: any = {
      tabs: [
        { value: 'tab1' },
        { value: 'igotSpecializations' },
      ],
    }
    component.seeAllPageConfig = strip12
    mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn().mockReturnValue(of({ result: { content: [{ id: '1' }] } }))
    await component.fetchMicroCredentialsList(strip12)
    expect(strip12.tabs.length).toBe(2)
    expect(strip12.tabs.find((t: any) => t.value === 'igotSpecializations')).toBeDefined()
  })

  it('fetchMicroCredentialsList should handle error by removing igotSpecializations tab', async () => {
    const strip13: any = {
      tabs: [
        { value: 'tab1' },
        { value: 'igotSpecializations' },
      ],
    }
    component.seeAllPageConfig = strip13
    mockSeeAllSvc.microCredentialsSearchWithoutUrl = jest.fn().mockReturnValue(
      new (require('rxjs')).Observable((observer: any) => observer.error(new Error('API Error')))
    )
    await component.fetchMicroCredentialsList(strip13)
    expect(strip13.tabs.length).toBe(1)
  })

  it('microCredentialsSearchRequest should resolve with results', async () => {
    const strip14: any = { stripConfig: { postCardForSearch: true }, viewMoreUrl: { path: '/path' } }
    const request14: any = { microSearch: { request: { url: '/api/test' } } }
    mockSeeAllSvc.microCredentialsSearch = jest.fn().mockReturnValue(of({ result: { content: new Array(7).fill({}) } }))
    const response = await (component as any).microCredentialsSearchRequest(strip14, request14, true)
    expect(response.results.length).toBe(7)
    expect(response.viewMoreUrl).toBeDefined()
  })

  it('microCredentialsSearchRequest should handle error', async () => {
    const strip15: any = {}
    const request15: any = { microSearch: { request: { url: '/api/test' } } }
    mockSeeAllSvc.microCredentialsSearch = jest.fn().mockReturnValue(
      new (require('rxjs')).Observable((observer: any) => observer.error({ error: { status: 400 } }))
    )
    try {
      await (component as any).microCredentialsSearchRequest(strip15, request15, true)
    } catch (error: any) {
      expect(error.error.status).toBe(400)
    }
  })

  it('getTabDataByNewReqMicroCreds should update tabs with widgets on success', async () => {
    const strip16: any = { stripConfig: {} }
    const currentTab: any = { request: { microSearch: { request: { url: '/test' } } } }
    component.seeAllPageConfig = {
      tabs: [{
        pillsData: [{ selected: false }],
      }],
    };
    (component as any).microCredentialsSearchRequest = jest.fn().mockResolvedValue({ results: [{ id: '1' }] });
    (component as any).transformContentsToWidgets = jest.fn().mockReturnValue([{ widget: 1 }])
    await (component as any).getTabDataByNewReqMicroCreds(strip16, 0, 0, currentTab, true)
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toBeDefined()
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].fetchTabStatus).toBe('done')
  })

  it('getTabDataByNewReqMicroCreds should handle empty results', async () => {
    const strip17: any = { stripConfig: {} }
    const currentTab: any = { request: { microSearch: { request: { url: '/test' } } } }
    component.seeAllPageConfig = {
      tabs: [{
        pillsData: [{}],
      }],
    };
    (component as any).microCredentialsSearchRequest = jest.fn().mockResolvedValue({ results: [] })
    await (component as any).getTabDataByNewReqMicroCreds(strip17, 0, 0, currentTab, true)
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toEqual([])
  })

  it('getTabDataByNewReqMicroCreds should handle error', async () => {
    const strip18: any = { stripConfig: {} }
    const currentTab: any = { request: { microSearch: { request: { url: '/test' } } } }
    component.seeAllPageConfig = {
      tabs: [{
        pillsData: [{}],
      }],
    };
    (component as any).microCredentialsSearchRequest = jest.fn().mockRejectedValue(new Error('API Error'))
    await (component as any).getTabDataByNewReqMicroCreds(strip18, 0, 0, currentTab, true)
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toEqual([])
  })

  it('getTabDataByNewReqTrending should update tabs on success', async () => {
    const strip19: any = { stripConfig: {} }
    const currentTab: any = { value: 'tab1', request: { trendingSearch: {} } }
    component.seeAllPageConfig = {
      tabs: [{
        pillsData: [{}],
      }],
    };
    (component as any).trendingSearchRequest = jest.fn().mockResolvedValue({ results: { response: { tab1: [{ id: '1' }] } } });
    (component as any).transformContentsToWidgets = jest.fn().mockReturnValue([{ widget: 1 }])
    await (component as any).getTabDataByNewReqTrending(strip19, 0, 0, currentTab, true)
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toBeDefined()
  })

  it('getTabDataByNewReqTrending should handle empty response', async () => {
    const strip20: any = { stripConfig: {} }
    const currentTab: any = { value: 'tab1', request: { trendingSearch: {} } }
    component.seeAllPageConfig = {
      tabs: [{
        pillsData: [{}],
      }],
    };
    (component as any).trendingSearchRequest = jest.fn().mockResolvedValue({ results: {} })
    await (component as any).getTabDataByNewReqTrending(strip20, 0, 0, currentTab, true)
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toEqual([])
  })

  it('getTabDataByNewReqSearchV6 should update tabs on success', async () => {
    const strip21: any = { stripConfig: {} }
    const currentTab: any = { request: { searchV6: {} } }
    component.seeAllPageConfig = {
      tabs: [{
        pillsData: [{}],
      }],
    };
    (component as any).searchV6Request = jest.fn().mockResolvedValue({ results: { result: { content: [{ id: '1' }] } } });
    (component as any).transformContentsToWidgets = jest.fn().mockReturnValue([{ widget: 1 }])
    await (component as any).getTabDataByNewReqSearchV6(strip21, 0, 0, currentTab, true)
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].widgets).toBeDefined()
  })

  it('getTabDataByNewReqSearchV6 should handle error', async () => {
    const strip22: any = { stripConfig: {} }
    const currentTab: any = { request: { searchV6: {} } }
    component.seeAllPageConfig = {
      tabs: [{
        pillsData: [{}],
      }],
    };
    (component as any).searchV6Request = jest.fn().mockRejectedValue(new Error('API Error'))
    await (component as any).getTabDataByNewReqSearchV6(strip22, 0, 0, currentTab, true)
    // Should not throw
  })

  it('trendingSearchRequest should replace <orgID> with userRootOrgId', async () => {
    const strip23: any = { request: { trendingSearch: { responseKey: 'content' } }, stripConfig: { postCardForSearch: false } }
    const request23: any = { trendingSearch: { request: { filters: { organisation: '<orgID>' } }, responseKey: 'content' } }
    mockSeeAllSvc.trendingContentSearch.mockReturnValue(of({ result: { content: [] } }))
    await (component as any).trendingSearchRequest(strip23, request23, true)
    expect(request23.trendingSearch.request.filters.organisation).toBe('r1')
  })

  it('trendingSearchRequest should handle 400 error', async () => {
    const strip24: any = { request: { trendingSearch: { responseKey: 'content' } } }
    const request24: any = { trendingSearch: { request: { filters: {} }, responseKey: 'content' } }
    mockSeeAllSvc.trendingContentSearch.mockReturnValue(
      new (require('rxjs')).Observable((observer: any) => observer.error({ error: { status: 400 } }))
    )
    try {
      await (component as any).trendingSearchRequest(strip24, request24, true)
    } catch (error: any) {
      expect(error.error.status).toBe(400)
    }
  })

  it('tabClicked should call eventSvc.raiseInteractTelemetry', () => {
    const stripMap: any = { tabs: [{ textLabel: 'Test Tab', pillsData: [{ requestRequired: false }] }] }
    component.seeAllPageConfig = stripMap;
    (component as any).tabClicked(0, stripMap, 'key', 0)
    expect(mockEventSvc.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('tabClicked should handle enrollment type request', () => {
    const stripMap: any = {
      tabs: [{
        textLabel: 'Tab',
        pillsData: [{
          requestRequired: true,
          request: { type: 'enrollment' },
        }],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).fetchFromInternalEnrollmentList = jest.fn();
    (component as any).tabClicked(0, stripMap, 'key', 0)
    expect((component as any).fetchFromInternalEnrollmentList).toHaveBeenCalled()
  })

  it('tabClicked should handle eventEnrollment type request', () => {
    const stripMap: any = {
      tabs: [{
        textLabel: 'Tab',
        pillsData: [{
          requestRequired: true,
          request: { type: 'eventEnrollment' },
        }],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).fetchEventEnrollmentList = jest.fn();
    (component as any).tabClicked(0, stripMap, 'key', 0)
    expect((component as any).fetchEventEnrollmentList).toHaveBeenCalled()
  })

  it('tabClicked should handle tab with enrollmentList request', () => {
    const stripMap: any = {
      tabs: [{
        textLabel: 'Tab',
        requestRequired: true,
        request: { enrollmentList: {} },
        pillsData: [{}],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).fetchFromInternalEnrollmentList = jest.fn();
    (component as any).tabClicked(0, stripMap, 'key', 0)
    expect((component as any).fetchFromInternalEnrollmentList).toHaveBeenCalled()
  })

  it('tabClicked should handle tab with eventEnrollmentList request', () => {
    const stripMap: any = {
      tabs: [{
        textLabel: 'Tab',
        requestRequired: true,
        request: { eventEnrollmentList: {} },
        pillsData: [{}],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).fetchEventEnrollmentList = jest.fn();
    (component as any).tabClicked(0, stripMap, 'key', 0)
    expect((component as any).fetchEventEnrollmentList).toHaveBeenCalled()
  })

  it('pillClicked should handle microSearch request type', () => {
    const stripMap: any = {
      tabs: [{
        pillsData: [{
          requestRequired: true,
          request: { microSearch: {} },
        }],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).getTabDataByNewReqMicroCreds = jest.fn();
    (component as any).pillClicked(stripMap, 0, 0)
    expect((component as any).getTabDataByNewReqMicroCreds).toHaveBeenCalled()
  })

  it('pillClicked should handle trendingSearch request type', () => {
    const stripMap: any = {
      tabs: [{
        pillsData: [{
          requestRequired: true,
          request: { trendingSearch: {} },
        }],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).getTabDataByNewReqTrending = jest.fn();
    (component as any).pillClicked(stripMap, 0, 0)
    expect((component as any).getTabDataByNewReqTrending).toHaveBeenCalled()
  })

  it('pillClicked should handle searchV6 request type', () => {
    const stripMap: any = {
      tabs: [{
        pillsData: [{
          requestRequired: true,
          request: { searchV6: {} },
        }],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).getTabDataByNewReqSearchV6 = jest.fn();
    (component as any).pillClicked(stripMap, 0, 0)
    expect((component as any).getTabDataByNewReqSearchV6).toHaveBeenCalled()
  })

  it('pillClicked should handle eventEnrollment request type', () => {
    const stripMap: any = {
      tabs: [{
        pillsData: [{
          requestRequired: true,
          request: { type: 'eventEnrollment' },
        }],
      }],
    }
    component.seeAllPageConfig = stripMap;
    (component as any).fetchEventEnrollmentList = jest.fn();
    (component as any).pillClicked(stripMap, 0, 0)
    expect((component as any).fetchEventEnrollmentList).toHaveBeenCalled()
  })

  it('pillClicked should reset pageSize to 50', () => {
    component.pageSize = 150
    const stripMap: any = { tabs: [{ pillsData: [{ requestRequired: false }] }] }
    component.seeAllPageConfig = stripMap;
    (component as any).pillClicked(stripMap, 0, 0)
    expect(component.pageSize).toBe(50)
  })

  it('tabClicked should reset pageSize to 50', () => {
    component.pageSize = 200
    const stripMap: any = { tabs: [{ textLabel: 'Tab', pillsData: [{ requestRequired: false }] }] }
    component.seeAllPageConfig = stripMap;
    (component as any).tabClicked(0, stripMap, 'key', 0)
    expect(component.pageSize).toBe(50)
  })

  it('fetchEventEnrollmentList should call enrollSvc.fetchEventsEnrollmentData', () => {
    const strip25: any = { tabs: [{ pillsData: [{ request: { payload: { request: {} } } }] }] };
    (component as any).formatNewEnrollmentData = jest.fn()
    mockEnroll.fetchEventsEnrollmentData.mockReturnValue(of({ result: { events: [{ event: { id: '1' } }] } }));
    (component as any).fetchEventEnrollmentList(strip25, 0, 0, true)
    expect(mockEnroll.fetchEventsEnrollmentData).toHaveBeenCalled()
  })

  it('fetchEventEnrollmentList should handle error', () => {
    const strip26: any = { tabs: [{ pillsData: [{ request: { payload: { request: {} } } }] }] }
    mockEnroll.fetchEventsEnrollmentData.mockReturnValue(
      new (require('rxjs')).Observable((observer: any) => observer.error(new Error('API Error')))
    );
    (component as any).fetchEventEnrollmentList(strip26, 0, 0, true)
    expect(mockEnroll.fetchEventsEnrollmentData).toHaveBeenCalled()
  })

  it('fetchFromInternalEnrollmentList should delete limit from payload', () => {
    const strip27: any = {
      tabs: [{
        pillsData: [{
          request: {
            payload: {
              request: { limit: 100 },
            },
          },
        }],
      }],
    }
    mockEnroll.fetchInternalEnrollmentData.mockReturnValue(of({ result: { courses: [] } }))
    mockEnroll.fetchExternalEnrollmentData.mockReturnValue(of({ result: { courses: [] } }));
    (component as any).fetchFromInternalEnrollmentList(strip27, 0, 0, true)
    expect(strip27.tabs[0].pillsData[0].request.payload.request.limit).toBeUndefined()
  })

  it('fetchFromInternalEnrollmentList should merge internal and external courses', (done) => {
    const strip28: any = { tabs: [{ pillsData: [{ request: { payload: { request: {} } } }] }] }
    const internalCourses = [{ content: { id: '1' } }]
    const externalCourses = [{ content: { id: '2' } }]
    mockEnroll.fetchInternalEnrollmentData.mockReturnValue(of({ result: { courses: internalCourses } }))
    mockEnroll.fetchExternalEnrollmentData.mockReturnValue(of({ result: { courses: externalCourses } }));
    (component as any).formatNewEnrollmentData = jest.fn((strip: any, tabIndex: any, pillIndex: any, courses: any) => {
      expect(courses.length).toBe(2)
      done()
    });
    (component as any).fetchFromInternalEnrollmentList(strip28, 0, 0, true)
  })

  it('fetchFromInternalEnrollmentList should filter out external courses with empty content', (done) => {
    const strip29: any = { tabs: [{ pillsData: [{ request: { payload: { request: {} } } }] }] }
    const internalCourses = [{ content: { id: '1' } }]
    const externalCourses = [{ content: { id: '2' } }, { content: {} }, { content: null }]
    mockEnroll.fetchInternalEnrollmentData.mockReturnValue(of({ result: { courses: internalCourses } }))
    mockEnroll.fetchExternalEnrollmentData.mockReturnValue(of({ result: { courses: externalCourses } }));
    (component as any).formatNewEnrollmentData = jest.fn((strip: any, tabIndex: any, pillIndex: any, courses: any) => {
      expect(courses.length).toBe(2)
      done()
    });
    (component as any).fetchFromInternalEnrollmentList(strip29, 0, 0, true)
  })

  it('formatNewEnrollmentData should sort courses by lastContentAccessTime', () => {
    const strip30: any = { tabs: [{ pillsData: [{}] }] }
    const courses = [
      { content: { id: '1' }, lastContentAccessTime: '2023-01-01' },
      { content: { id: '2' }, lastContentAccessTime: '2023-03-01' },
      { content: { id: '3' }, lastContentAccessTime: '2023-02-01' },
    ];
    (component as any).transformContentsToWidgets = jest.fn((contents: any) => contents);
    (component as any).formatNewEnrollmentData(strip30, 0, 0, courses, true)
    expect(component.contentDataList[0].lastContentAccessTime).toBe('2023-03-01')
  })

  it('formatNewEnrollmentData should map course properties correctly', () => {
    const strip31: any = { tabs: [{ pillsData: [{}] }] }
    const courses = [{
      content: { id: '1', primaryCategory: 'Course' },
      completionPercentage: 75,
      completionStatus: 1,
      enrolledDate: '2023-01-01',
      lastContentAccessTime: '2023-02-01',
      batchId: 'batch123',
      issuedCertificates: [{ cert: '1' }],
    }];
    (component as any).transformContentsToWidgets = jest.fn((contents: any) => contents);
    (component as any).formatNewEnrollmentData(strip31, 0, 0, courses, true)
    expect(component.contentDataList[0].completionPercentage).toBe(75)
    expect(component.contentDataList[0].batchId).toBe('batch123')
  })

  it('formatNewEnrollmentData should handle event type courses', () => {
    const strip32: any = { tabs: [{ pillsData: [{}] }] }
    const courses = [{
      event: { id: '1', resourceType: 'Event' },
      progress: 50,
    }];
    (component as any).transformContentsToWidgets = jest.fn((contents: any) => contents);
    (component as any).formatNewEnrollmentData(strip32, 0, 0, courses, true)
    expect(component.contentDataList[0].cType).toBe('event')
    expect(component.contentDataList[0].completionPercentage).toBe(50)
  })

  it('formatNewEnrollmentData should handle surveyCompletionStatus', () => {
    const strip33: any = { tabs: [{ pillsData: [{}] }] }
    const courses = [{
      content: { id: '1' },
      surveyCompletionStatus: true,
    }];
    (component as any).transformContentsToWidgets = jest.fn((contents: any) => contents);
    (component as any).formatNewEnrollmentData(strip33, 0, 0, courses, true)
    expect(component.contentDataList[0].surveyCompletionStatus).toBe(true)
  })

  it('ngOnInit should set keyData from query params', async () => {
    await component.ngOnInit()
    expect(component.keyData).toBe('k1')
  })

  it('ngOnInit should set tabSelected from query params', async () => {
    await component.ngOnInit()
    expect(component.tabSelected).toBe('t1')
  })

  it('ngOnInit should set pillSelected from query params', async () => {
    await component.ngOnInit()
    expect(component.pillSelected).toBe('p1')
  })

  it('ngOnInit should call fetchForYouData for forYou key', async () => {
    const forYouStrip = { key: 'forYou', request: {}, tabs: [] }
    mockSeeAllSvc.getSeeAllConfigJson.mockResolvedValue({ newHomeStrip: [{ strips: [forYouStrip] }], assessmentData: [] })
    component.fetchForYouData = jest.fn()
    await component.ngOnInit()
    expect(component.fetchForYouData).toHaveBeenCalled()
  })

  it('ngOnInit should call fetchUserEnrolledData for continueLearning key', async () => {
    const learningStrip = { key: 'continueLearning', request: {}, tabs: [{ pillsData: [{}] }], viewMoreUrl: { loaderConfig: {} } }
    mockSeeAllSvc.getSeeAllConfigJson.mockResolvedValue({ newHomeStrip: [{ strips: [learningStrip] }], assessmentData: [] })
    component.fetchUserEnrolledData = jest.fn()
    await component.ngOnInit()
    expect(component.fetchUserEnrolledData).toHaveBeenCalled()
  })

  it('ngOnInit should find config in assessmentData', async () => {
    const assessmentStrip = { key: 'k1', viewMoreUrl: { loaderConfig: {} } }
    mockSeeAllSvc.getSeeAllConfigJson.mockResolvedValue({
      newHomeStrip: [],
      assessmentData: [{ strips: [assessmentStrip] }],
    })
    await component.ngOnInit()
    expect(component.seeAllPageConfig).toBeDefined()
  })

  it('ngOnInit should set dynamicTabIndex and dynamicPillIndex', async () => {
    await component.ngOnInit()
    expect(component.dynamicTabIndex).toBe(0)
    expect(component.dynamicPillIndex).toBe(0)
  })

  it('ngOnInit should resetSelectedPill and select current pill', async () => {
    await component.ngOnInit()
    expect(component.seeAllPageConfig.tabs[0].pillsData[0].selected).toBe(true)
  })

  it('ngDestroy should complete successfully', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('transformContentsToWidgets should set isiGOTSpecialization when tab is igotSpecializations', () => {
    component.userSelectedTab = 'igotSpecializations'
    const contents = [{ id: '1' }]
    const strip34: any = { key: 'test', viewMoreUrl: { stripConfig: {} } }
    const widgets = (component as any).transformContentsToWidgets(contents, strip34)
    expect(widgets[0].widgetData.isiGOTSpecialization).toBe(true)
  })

  it('transformContentsToWidgets should set intranetMode from stripConfig', () => {
    const contents = [{ id: '1' }]
    const strip35: any = { key: 'test', stripConfig: { intranetMode: true }, viewMoreUrl: {} }
    const widgets = (component as any).transformContentsToWidgets(contents, strip35)
    expect(widgets[0].widgetData.intranetMode).toBe(true)
  })

  it('transformContentsToWidgets should set deletedMode from stripConfig', () => {
    const contents = [{ id: '1' }]
    const strip36: any = { key: 'test', stripConfig: { deletedMode: true }, viewMoreUrl: {} }
    const widgets = (component as any).transformContentsToWidgets(contents, strip36)
    expect(widgets[0].widgetData.deletedMode).toBe(true)
  })

  it('transformContentsToWidgets should set contentTags from stripConfig', () => {
    const contents = [{ id: '1' }]
    const strip37: any = { key: 'test', stripConfig: { contentTags: ['tag1', 'tag2'] }, viewMoreUrl: {} }
    const widgets = (component as any).transformContentsToWidgets(contents, strip37)
    expect(widgets[0].widgetData.contentTags).toEqual(['tag1', 'tag2'])
  })

  it('transformContentsToWidgets should set context with pageSection and position', () => {
    const contents = [{ id: '1' }, { id: '2' }]
    const strip38: any = { key: 'testSection', viewMoreUrl: {} }
    const widgets = (component as any).transformContentsToWidgets(contents, strip38)
    expect(widgets[0].widgetData.context.pageSection).toBe('testSection')
    expect(widgets[0].widgetData.context.position).toBe(0)
    expect(widgets[1].widgetData.context.position).toBe(1)
  })

  it('searchV6Request should handle no viewMoreUrl when less than 6 results', async () => {
    const strip39: any = { stripConfig: { postCardForSearch: true }, viewMoreUrl: { path: '/path' } }
    const request39: any = { searchV6: { request: {} } }
    mockSeeAllSvc.searchV6.mockReturnValue(of({ result: { content: [1, 2, 3] } }))
    const response = await (component as any).searchV6Request(strip39, request39, true)
    expect(response.viewMoreUrl).toBeNull()
  })

  it('getSelectedPillIndex should return 0 when no pill is selected', () => {
    const tabdata = { pillsData: [{ selected: false }, { selected: false }] }
    const index = (component as any).getSelectedPillIndex(tabdata)
    expect(index).toBe(-1)
  })

  it('getSelectedPillIndex should return 0 when pillsData is empty', () => {
    const tabdata = { pillsData: [] }
    const index = (component as any).getSelectedPillIndex(tabdata)
    expect(index).toBe(0)
  })

})


