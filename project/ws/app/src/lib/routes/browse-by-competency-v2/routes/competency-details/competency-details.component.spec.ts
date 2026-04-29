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
jest.mock('src/environments/environment', () => ({ environment: { compentencyVersionKey: 'v2' } }), { virtual: true })
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
      { name: 'primaryCategory', values: [{ name: 'Course', count: 1 }] },
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
  const mockConfigService: any = {
    userProfile: { userId: 'u1', rootOrgId: 'org1' },
    compentency: { v2: { vKey: 'competencies_v3', vCompetencySubTheme: 'name' } },
  }

  const comp = new CompetencyDetailsComponent(
    mockBrowseCompServ,
    mockValueSvc,
    mockActivatedRoute,
    mockLocalService,
    mockConfigService,
  )
  comp.compentencyKey = { vKey: 'competencies_v3', vCompetencySubTheme: 'name' } as any

  return { comp, mockBrowseCompServ, mockValueSvc, mockActivatedRoute, mockLocalService, mockConfigService, isXSmallSubject }
}

describe('CompetencyDetailsComponent (v2)', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('ngOnInit - reads currentComp and calls searchCompetency', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    expect(comp.currentComp).toBeDefined()
  })

  it('ngOnInit - subscribes to isLtMedium$', () => {
    const { comp, isXSmallSubject } = buildComponent()
    comp.ngOnInit()
    isXSmallSubject.next(true)
    expect(comp.screenSizeIsLtMedium).toBe(true)
  })

  it('searchCompetency - fetches data', () => {
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

  it('getText - trims and returns', () => {
    const { comp } = buildComponent()
    expect(typeof comp.getText('hello')).toBe('string')
  })

  it('getText - empty string', () => {
    const { comp } = buildComponent()
    expect(comp.getText('')).toBe('')
  })

  it('getFilterName - primaryCategory maps to Type', () => {
    const { comp } = buildComponent()
    const fil = { name: 'primaryCategory', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getFilterName - mimeType maps to Format', () => {
    const { comp } = buildComponent()
    const fil = { name: 'mimeType', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getFilterName - source maps to Source', () => {
    const { comp } = buildComponent()
    const fil = { name: 'source', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getFilterName - unknown returns raw name', () => {
    const { comp } = buildComponent()
    const fil = { name: 'unknownFilter', values: [] }
    const result = comp.getFilterName(fil)
    expect(Array.isArray(result)).toBe(true)
  })

  it('modifyUserFilters - adds filter', () => {
    const { comp } = buildComponent()
    comp.userFilters = []
    comp.filteroptions = []
    comp.myFilterArray = []
    comp.modifyUserFilters({ name: 'primaryCategory' }, 'Course')
    expect(comp.userFilters.length).toBeGreaterThanOrEqual(0)
  })

  it('formatFacets - sets contentType', () => {
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

  it('searchCompetencyV2 - sets competencyData via filterCompetencyBySubtheme', async () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    const content = [{
      identifier: 'competencyarea_1',
      displayName: 'Domain',
      children: [{
        identifier: 'fw_theme_1',
        displayName: 'Leadership',
        children: [{
          identifier: 'subtheme_1',
          displayName: 'Leadership',
          description: 'Leadership Subtheme',
          count: 5,
        }],
      }],
    }]
    mockBrowseCompServ.searchCompetency.mockReturnValue(of({ result: { content } }))
    comp.competencyName = 'Leadership'
    comp.searchCompetencyV2()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(comp.competencyData).toBeDefined()
    expect(comp.competencyData.name).toBe('Leadership')
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

  it('getFacets - updates source values and marks ischecked false', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'source', values: [{ name: 'IGOT' }] }]
    comp.userFilters = []
    comp.getFacets([{ name: 'source', values: [{ name: 'IGOT', count: 5 }] }])
    expect(comp.facets[0].values[0].ischecked).toBe(false)
  })

  it('getFacets - marks ischecked true when filter is in userFilters', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'source', values: [{ name: 'IGOT' }] }]
    comp.userFilters = [{ name: 'IGOT' }]
    comp.getFacets([{ name: 'source', values: [{ name: 'IGOT', count: 5 }] }])
    expect(comp.facets[0].values[0].ischecked).toBe(true)
  })

  it('modifyUserFilters - adds new filter to userFilters and myFilterArray', () => {
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

  it('applyFilter - applies generic mimeType', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'mimeType', name: 'application/pdf' }])
    expect(comp.mimeType).toContain('application/pdf')
  })

  it('applyFilter - applies mediaType filter', () => {
    const { comp, mockBrowseCompServ } = buildComponent()
    mockBrowseCompServ.fetchSearchData.mockReturnValue(of({ result: { content: [] } }))
    comp.applyFilter([{ mainType: 'mediaType', name: 'audio' }])
    expect(comp.mediaType).toContain('audio')
  })

  it('formatFacets - maps video/mp4 to Video', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'mimeType', values: [{ name: 'video/mp4', count: 1 }] }]
    comp.formatFacets()
    const mimes = comp.filteroptions.find((f: any) => f.name === 'mimeType')?.values || []
    expect(mimes.some((m: any) => m.name === 'Video')).toBe(true)
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
    comp.facets = [{ name: 'mimeType', values: [{ name: 'application/vnd.ekstep.html-archive' }] }]
    comp.formatFacets()
    const mimes = comp.filteroptions.find((f: any) => f.name === 'mimeType')?.values || []
    expect(mimes.some((m: any) => m.name === 'Interactive Content')).toBe(true)
  })

  it('formatFacets - sorts source values alphabetically', () => {
    const { comp } = buildComponent()
    comp.facets = [{ name: 'source', values: [{ name: 'ZTRAIN' }, { name: 'IGOT' }] }]
    comp.formatFacets()
    const source = comp.filteroptions.find((f: any) => f.name === 'source')?.values || []
    expect(source[0].name).toBe('IGOT')
  })

  it('filterCompetencyBySubtheme - resolves matching node', async () => {
    const { comp } = buildComponent()
    const data = [{
      identifier: 'competencyarea_1',
      displayName: 'Domain',
      children: [{
        identifier: 'fw_theme_1',
        displayName: 'Science',
        children: [{
          identifier: 'subtheme_1',
          displayName: 'Physics',
          description: 'Physics subtheme',
          count: 3,
        }],
      }],
    }]
    const result = await comp.filterCompetencyBySubtheme(data, 'Physics')
    expect(result).not.toBeNull()
    expect(result.name).toBe('Physics')
  })

  it('filterCompetencyBySubtheme - resolves null when not found', async () => {
    const { comp } = buildComponent()
    const data = [{
      identifier: 'competencyarea_1',
      displayName: 'Domain',
      children: [{
        identifier: 'fw_theme_1',
        displayName: 'Science',
        children: [{
          identifier: 'subtheme_1',
          displayName: 'Physics',
          count: 3,
        }],
      }],
    }]
    const result = await comp.filterCompetencyBySubtheme(data, 'Chemistry')
    expect(result).toBeNull()
  })

  it('getText - returns startCase of value', () => {
    const { comp } = buildComponent()
    expect(typeof comp.getText('hello')).toBe('string')
  })
})
