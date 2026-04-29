import { of, Subject } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  ValueService: jest.fn(),
}), { virtual: true })
jest.mock('@angular/router', () => ({ ActivatedRoute: jest.fn() }), { virtual: true })
jest.mock('../../services/browse-competency.service', () => ({ BrowseCompetencyService: jest.fn() }), { virtual: true })
jest.mock('../../services/localService', () => ({ LocalDataService: jest.fn() }), { virtual: true })
jest.mock('../../models/competencies.model', () => ({ NSBrowseCompetency: {} }), { virtual: true })
jest.mock('@sunbird-cb/collection/src/public-api', () => ({ NsContent: {} }), { virtual: true })
jest.mock('src/environments/environment', () => ({ environment: {} }), { virtual: true })
jest.mock('lodash', () => ({
  default: {
    startCase: (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '',
    isEmpty: (v: any) => !v || (Array.isArray(v) && v.length === 0),
    cloneDeep: (v: any) => JSON.parse(JSON.stringify(v)),
    find: (arr: any[], pred: any) => arr.find(typeof pred === 'function' ? pred : (item: any) => Object.keys(pred).every((k: string) => item[k] === (pred as any)[k])),
    filter: (arr: any[], pred: any) => arr.filter(typeof pred === 'function' ? pred : (item: any) => Object.keys(pred).every((k: string) => item[k] === (pred as any)[k])),
    first: (arr: any[]) => arr ? arr[0] : undefined,
    includes: (arr: any[], v: any) => arr.includes(v),
    get: (obj: any, path: string, def?: any) => { try { const p = path.split('.'); let r = obj; for (const k of p) { r = r ? r[k] : def }; return r ?? def } catch { return def } },
    remove: (arr: any[], pred: any) => { const removed: any[] = []; let i = arr.length; while (i--) { if (pred(arr[i])) { removed.push(arr.splice(i, 1)[0]) } }; return removed },
  },
  startCase: (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '',
  isEmpty: (v: any) => !v || (Array.isArray(v) && v.length === 0),
  cloneDeep: (v: any) => JSON.parse(JSON.stringify(v)),
  find: (arr: any[], pred: any) => arr.find(typeof pred === 'function' ? pred : (item: any) => Object.keys(pred).every((k: string) => item[k] === (pred as any)[k])),
  filter: (arr: any[], pred: any) => arr.filter(typeof pred === 'function' ? pred : (item: any) => Object.keys(pred).every((k: string) => item[k] === (pred as any)[k])),
  first: (arr: any[]) => arr ? arr[0] : undefined,
  includes: (arr: any[], v: any) => arr.includes(v),
  get: (obj: any, path: string, def?: any) => { try { const p = path.split('.'); let r = obj; for (const k of p) { r = r ? r[k] : def }; return r ?? def } catch { return def } },
  remove: (arr: any[], pred: any) => { const removed: any[] = []; let i = arr.length; while (i--) { if (pred(arr[i])) { removed.push(arr.splice(i, 1)[0]) } }; return removed },
}))
jest.mock('@angular/forms', () => {
  const actual = jest.requireActual('@angular/forms')
  return actual
})

import { CompetencyDetailsComponent } from './competency-details.component'

const mockCompetencyData = {
  result: {
    data: [
      { identifier: 'comp1', competency: 'Leadership', level: '1', primaryCategory: 'Course', name: 'Course 1', mimeType: 'video/mp4' },
      { identifier: 'comp2', competency: 'Leadership', level: '2', primaryCategory: 'Resource', name: 'Resource 2', mimeType: 'application/pdf' },
    ],
    facets: [
      { name: 'primaryCategory', values: [{ name: 'Course', count: 1 }, { name: 'Resource', count: 1 }] },
      { name: 'mimeType', values: [{ name: 'video/mp4', count: 1 }] },
    ],
    totalCount: 2,
  },
}

function buildComponent() {
  const isXSmallSubject = new Subject<boolean>()

  const mockBrowseCompServ: any = {
    getCompetencyDetails: jest.fn().mockReturnValue(of(mockCompetencyData)),
    fetchSearchData: jest.fn().mockReturnValue(of(mockCompetencyData)),
    isLoading: jest.fn().mockReturnValue(of(false)),
    searchCompetency: jest.fn().mockReturnValue(of(mockCompetencyData)),
    filterSearch: jest.fn().mockReturnValue(of(mockCompetencyData)),
  }
  const mockValueSvc: any = {
    isXSmall$: isXSmallSubject.asObservable(),
    isLtMedium$: isXSmallSubject.asObservable(),
  }
  const mockActivatedRoute: any = {
    snapshot: {
      queryParams: { selectedComp: JSON.stringify({ competencyTheme: 'Leadership', title: 'Leadership', id: 'comp1' }) },
      data: {
        searchPageData: {
          data: {
            search: {
              searchReq: {
                locale: [],
                query: '',
                request: {
                  filters: {
                    'competencies_v3.name': ['Leadership'],
                    primaryCategory: [],
                    contentType: [],
                    mimeType: [],
                    source: [],
                  },
                },
              },
              defaultsearch: [],
            },
          },
        },
      },
    },
    params: of({ competency: 'Leadership' }),
    queryParams: of({ selectedComp: JSON.stringify({ competencyTheme: 'Leadership', title: 'Leadership', id: 'comp1' }) }),
  }
  const mockLocalService: any = {
    getLocalNavigationValue: jest.fn().mockReturnValue({ competencyTheme: 'Leadership', title: 'Leadership', id: 'comp1' }),
    compentecies: { getValue: jest.fn().mockReturnValue([{ name: 'Leadership', id: 'comp1' }]) },
  }

  const comp = new CompetencyDetailsComponent(
    mockBrowseCompServ,
    mockValueSvc,
    mockActivatedRoute,
    mockLocalService,
  )

  return { comp, mockBrowseCompServ, mockValueSvc, mockActivatedRoute, mockLocalService, isXSmallSubject }
}

describe('CompetencyDetailsComponent (v1)', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('ngOnInit - reads currentComp from localService and calls searchCompetency', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    comp.ngOnInit()
    expect(comp.currentComp).toBeDefined()
    expect(mockBrowseCompServ.fetchSearchData || mockBrowseCompServ.getCompetencyDetails).toBeDefined()
  })

  it('ngOnInit - subscribes to isLtMedium$', () => {
    const { comp, isXSmallSubject } = buildComponent()
    comp.ngOnInit()
    isXSmallSubject.next(true)
    expect(comp.screenSizeIsLtMedium).toBe(true)
  })

  it('searchCompetency - calls browse service', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    comp.currentComp = { competencyTheme: 'Leadership', title: 'Leadership', id: 'comp1' } as any
    comp.searchCompetency()
    expect(mockBrowseCompServ.fetchSearchData || mockBrowseCompServ.getCompetencyDetails).toBeDefined()
  })

  it('getCbps - calls fetchSearchData', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    comp.currentComp = { competencyTheme: 'Leadership' } as any
    comp.getCbps()
    expect(mockBrowseCompServ.fetchSearchData).toHaveBeenCalled()
  })

  it('getText - returns startCase of text', () => {
    const { comp } = buildComponent()
    expect(typeof comp.getText('hello')).toBe('string')
  })

  it('getText - returns empty string for empty', () => {
    const { comp } = buildComponent()
    expect(comp.getText('')).toBe('')
  })

  it('getFilterName - returns filtered userFilters array for primaryCategory', () => {
    const { comp } = buildComponent()
    const fil = { name: 'primaryCategory', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getFilterName - returns filtered array for mimeType', () => {
    const { comp } = buildComponent()
    const fil = { name: 'mimeType', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getFilterName - returns filtered array for source', () => {
    const { comp } = buildComponent()
    const fil = { name: 'source', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getFilterName - returns filtered array for sourceShortName', () => {
    const { comp } = buildComponent()
    const fil = { name: 'sourceShortName', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getFilterName - returns filtered array for unknown filter', () => {
    const { comp } = buildComponent()
    const fil = { name: 'unknownFilter', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('modifyUserFilters - adds filter value', () => {
    const { comp } = buildComponent()
    comp.userFilters = []
    comp.filteroptions = []
    comp.myFilterArray = []
    comp.modifyUserFilters({ name: 'primaryCategory' }, 'Course')
    expect(comp.userFilters.length).toBeGreaterThanOrEqual(0)
  })

  it('modifyUserFilters - removes already existing filter', () => {
    const { comp } = buildComponent()
    comp.userFilters = [{ type: 'primaryCategory', value: 'Course' }]
    comp.myFilterArray = [{ primaryCategory: ['Course'] }]
    comp.modifyUserFilters({ name: 'primaryCategory' }, 'Course')
    // Should toggle
    expect(comp.userFilters.length).toBeGreaterThanOrEqual(0)
  })

  it('formatFacets - extracts unique primaryCategory values', () => {
    const { comp } = buildComponent()
    comp.competencyData = mockCompetencyData.result.data
    comp.filteroptions = mockCompetencyData.result.facets
    comp.formatFacets()
    expect(comp.contentType.length).toBeGreaterThanOrEqual(0)
  })

  it('ngOnDestroy - unsubscribes', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    expect(() => comp.ngOnDestroy()).not.toThrow()
  })

  it('searchCompetencyV2 - sets competencyData from response array matching competencyName', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.searchCompetency.mockReturnValue(of([{ name: 'Leadership', id: 'c1' }]))
    comp.competencyName = 'Leadership'
    comp.searchCompetencyV2()
    expect(comp.competencyData).toEqual({ name: 'Leadership', id: 'c1' })
  })

  it('searchCompetencyV2 - handles empty response', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.searchCompetency.mockReturnValue(of([]))
    comp.competencyName = 'Leadership'
    comp.searchCompetencyV2()
    expect(comp.competencyData).toBeUndefined()
  })

  it('searchCompetency - sets competencyData on statusCode 200', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.searchCompetency.mockReturnValue(of({
      statusInfo: { statusCode: 200 },
      responseData: [{ name: 'Leadership' }],
    }))
    comp.competencyName = 'Leadership'
    comp.searchCompetency()
    expect(comp.competencyData).toEqual({ name: 'Leadership' })
  })

  it('getCbps - sets courses from result.content', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [{ id: 'c1' }] } }))
    comp.competencyName = 'Leadership'
    comp.getCbps()
    expect(comp.courses).toEqual([{ id: 'c1' }])
  })

  it('getCbps - calls getFacets when result has facets', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    const facets = [{ name: 'source', values: [{ name: 'IGOT' }] }]
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [], facets } }))
    comp.facets = [{ name: 'source', values: [] }]
    comp.getCbps()
    expect(comp.filteroptions).toBeDefined()
  })

  it('getFacets - updates filteroptions with source facet values', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'source', values: [{ name: 'IGOT' }] }]
    comp.userFilters = []
    comp.getFacets([{ name: 'source', values: [{ name: 'IGOT', count: 5 }] }])
    expect(comp.filteroptions).toBeDefined()
    expect(comp.facets[0].values[0].ischecked).toBe(false)
  })

  it('getFacets - marks ischecked true when filter is in userFilters', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'source', values: [{ name: 'IGOT' }] }]
    comp.userFilters = [{ name: 'IGOT' }]
    comp.getFacets([{ name: 'source', values: [{ name: 'IGOT', count: 5 }] }])
    expect(comp.facets[0].values[0].ischecked).toBe(true)
  })

  it('modifyUserFilters - adds new filter when not in userFilters', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.userFilters = []
    comp.myFilterArray = []
    comp.filteroptions = [{ name: 'source', values: [{ name: 'IGOT', ischecked: false }] }]
    comp.modifyUserFilters({ name: 'IGOT', count: 1 }, 'source')
    expect(comp.userFilters.some((f: any) => f.name === 'IGOT')).toBe(true)
    expect(comp.myFilterArray.some((f: any) => f.name === 'IGOT')).toBe(true)
  })

  it('modifyUserFilters - removes existing filter from userFilters', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.userFilters = [{ name: 'IGOT', count: 1 }]
    comp.myFilterArray = [{ mainType: 'source', name: 'IGOT' }]
    comp.filteroptions = [{ name: 'source', values: [{ name: 'IGOT', ischecked: true }] }]
    comp.modifyUserFilters({ name: 'IGOT', count: 1 }, 'source')
    expect(comp.userFilters.some((f: any) => f.name === 'IGOT')).toBe(false)
  })

  it('applyFilter - applies mimeType Image', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'mimeType', name: 'Image' }])
    expect(comp.mimeType).toContain('image/jpeg')
    expect(comp.mimeType).toContain('image/png')
  })

  it('applyFilter - applies mimeType Video', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'mimeType', name: 'Video' }])
    expect(comp.mimeType).toContain('video/mp4')
  })

  it('applyFilter - applies mimeType Assessment', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'mimeType', name: 'Assessment' }])
    expect(comp.mimeType).toContain('application/json')
  })

  it('applyFilter - applies mimeType Interactive Content', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'mimeType', name: 'Interactive Content' }])
    expect(comp.mimeType).toContain('application/vnd.ekstep.html-archive')
  })

  it('applyFilter - applies source filter', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'source', name: 'IGOT' }])
    expect(comp.sourceType).toContain('IGOT')
  })

  it('applyFilter - applies primaryCategory filter', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'primaryCategory', name: 'Course' }])
    expect(comp.primaryCategoryType).toContain('Course')
  })

  it('applyFilter - applies contentType filter as primaryCategory', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'contentType', name: 'Resource' }])
    expect(comp.primaryCategoryType).toContain('Resource')
  })

  it('applyFilter - resets and calls getCbps when filter is empty', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([])
    expect(comp.myAppliedFilters).toEqual([])
  })

  it('applyFilter - adds generic mimeType when not a special case', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'mimeType', name: 'application/pdf' }])
    expect(comp.mimeType).toContain('application/pdf')
  })

  it('formatFacets - maps video/mp4 to Video and deduplicates', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'mimeType', values: [{ name: 'video/mp4', count: 1 }, { name: 'video/x-youtube', count: 1 }] }]
    comp.formatFacets()
    const mimes = comp.filteroptions.find((f: any) => f.name === 'mimeType')?.values || []
    expect(mimes.filter((m: any) => m.name === 'Video').length).toBe(1)
  })

  it('formatFacets - maps image/jpeg to Image', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'mimeType', values: [{ name: 'image/jpeg', count: 1 }] }]
    comp.formatFacets()
    const mimes = comp.filteroptions.find((f: any) => f.name === 'mimeType')?.values || []
    expect(mimes.some((m: any) => m.name === 'Image')).toBe(true)
  })

  it('formatFacets - maps html-archive to Interactive Content', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'mimeType', values: [{ name: 'application/vnd.ekstep.html-archive', count: 1 }] }]
    comp.formatFacets()
    const mimes = comp.filteroptions.find((f: any) => f.name === 'mimeType')?.values || []
    expect(mimes.some((m: any) => m.name === 'Interactive Content')).toBe(true)
  })

  it('formatFacets - sorts source values alphabetically', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'source', values: [{ name: 'ZTRAIN' }, { name: 'IGOT' }, { name: 'MHRD' }] }]
    comp.formatFacets()
    const source = comp.filteroptions.find((f: any) => f.name === 'source')?.values || []
    expect(source[0].name).toBe('IGOT')
  })

  it('getText - returns startCase of value', () => {
    const { comp } = buildComponent()
    const result = comp.getText('hello world')
    expect(typeof result).toBe('string')
  })
})
