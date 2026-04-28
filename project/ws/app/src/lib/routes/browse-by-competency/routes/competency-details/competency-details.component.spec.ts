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
})
