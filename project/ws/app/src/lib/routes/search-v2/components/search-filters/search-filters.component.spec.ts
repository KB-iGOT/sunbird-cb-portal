import { Subject, of } from 'rxjs'
import { SearchFiltersComponent } from './search-filters.component'

// Jest unit tests without Angular TestBed

describe('SearchFiltersComponent (v2, no TestBed)', () => {
  let searchSrvcMock: any
  let activatedRouteMock: any
  let translateMock: any
  let langTranslationsMock: any
  let routerMock: any
  let component: SearchFiltersComponent
  let originalLocalStorage: any

  beforeEach(() => {
    // backup and mock localStorage
    originalLocalStorage = (globalThis as any).localStorage
      ; (globalThis as any).localStorage = {
        getItem: (key: string) => (key === 'websiteLanguage' ? 'hi' : null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 1,
      }

    const queryParamSubject = new Subject<any>()

    searchSrvcMock = {
      notifyObservable$: queryParamSubject.asObservable(),
    }

    activatedRouteMock = {
      queryParamMap: new Subject<any>().asObservable(),
    }

    translateMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }

    langTranslationsMock = {
      translateLabel: jest.fn().mockReturnValue('Translated'),
      translateActualLabel: jest.fn().mockReturnValue('Actual'),
    }

    routerMock = {
      navigate: jest.fn(),
    }

    component = new SearchFiltersComponent(
      searchSrvcMock as any,
      activatedRouteMock as any,
      translateMock as any,
      langTranslationsMock as any,
      routerMock as any,
    )
  })

  afterEach(() => {
    ; (globalThis as any).localStorage = originalLocalStorage
    jest.clearAllMocks()
  })

  it('should construct and set language from localStorage', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit should initialize filterForm and default user filter when no query params', () => {
    const paramMap: any = {
      has: jest.fn().mockReturnValue(false),
      get: jest.fn(),
      params: {},
    }
    activatedRouteMock.queryParamMap = of(paramMap)

    // simple facets
    component.newfacets = [
      {
        name: 'primaryCategory',
        values: [
          { name: 'course', count: 1 },
        ],
      },
    ]

    component.ngOnInit()

    expect(component.filterForm).toBeDefined()
    expect(component.userFilters.length).toBe(1)
    expect(component.userFilters[0].ischecked).toBe(true)
  })

  it('ngOnInit should group mimeType facet into friendly categories', () => {
    const paramMap: any = {
      has: jest.fn().mockReturnValue(false),
      get: jest.fn(),
      params: {},
    }
    activatedRouteMock.queryParamMap = of(paramMap)

    component.newfacets = [
      {
        name: 'mimeType',
        values: [
          { name: 'video/mp4' },
          { name: 'video/x-youtube' },
          { name: 'application/x-mpegURL' },
          { name: 'application/json' },
          { name: 'application/quiz' },
          { name: 'image/jpeg' },
          { name: 'image/png' },
          { name: 'application/vnd.ekstep.html-archive' },
          { name: 'application/vnd.ekstep.ecml-archive' },
          { name: 'application/vnd.sunbird.questionset' },
        ],
      },
    ]

    component.ngOnInit()

    const values = component.filteroptions[0].values
    const names = values.map((v: any) => v.name)
    expect(names).toContain('Video')
    expect(names).toContain('Assessment')
    expect(names).toContain('Image')
    expect(names).toContain('Interactive Content')
    expect(names).toContain('Pratice / Final Assessment')
  })

  it('ngOnInit should add moderated courses filter when t param present', () => {
    const paramMap: any = {
      has: jest.fn((key: string) => key === 't'),
      get: jest.fn(),
      params: { t: 'true' },
    }
    activatedRouteMock.queryParamMap = of(paramMap)

    component.newfacets = [
      {
        name: 'primaryCategory',
        values: [
          { name: 'course', count: 1 },
        ],
      },
    ]

    component.ngOnInit()

    const hasModerated = component.userFilters.some((f: any) => f.name === 'moderated courses')
    expect(hasModerated).toBe(true)
    const inArray = component.myFilterArray.some((f: any) => f.name === 'moderated courses')
    expect(inArray).toBe(true)
  })

  it('modifyUserFilters should add new filter and emit appliedFilter', done => {
    component.queryParams = {
      has: jest.fn().mockReturnValue(false),
      params: {},
    }
    component.filteroptions = [
      {
        name: 'primaryCategory',
        values: [
          { name: 'video', ischecked: false },
        ],
      },
    ]

    const fil = { name: 'video', count: 1, ischecked: true }

    component.appliedFilter.subscribe((filters: any) => {
      expect(filters.length).toBe(1)
      expect(filters[0].name).toBe('video')
      done()
    })

    component.modifyUserFilters(fil, 'primaryCategory')

    expect(component.userFilters.length).toBe(1)
    expect(component.myFilterArray.length).toBe(1)
    expect(component.filteroptions[0].values[0].ischecked).toBe(true)
  })

  it('modifyUserFilters should remove existing filter and navigate when t param present', () => {
    component.queryParams = {
      has: jest.fn((key: string) => key === 't'),
      params: { t: 'true' },
    }
    component.userFilters = [
      { name: 'video', count: 1, ischecked: true },
    ]
    component.myFilterArray = [
      { name: 'video', mainType: 'primaryCategory' },
    ]
    component.filteroptions = [
      {
        name: 'primaryCategory',
        values: [
          { name: 'video', ischecked: true, qParam: 't' },
        ],
      },
    ]

    const fil = { name: 'video', count: 1, ischecked: false }

    component.modifyUserFilters(fil, 'primaryCategory')

    expect(component.userFilters.length).toBe(0)
    expect(component.myFilterArray.length).toBe(0)
    expect(component.filteroptions[0].values[0].ischecked).toBe(false)
    expect(routerMock.navigate).toHaveBeenCalled()
  })

  it('getFilterName should match using toCamelCase and toString', () => {
    component.userFilters = [
      { name: 'videoCourse' },
      { name: 'Video course' },
    ]
    const fil = { name: 'video course' }
    const result = component.getFilterName(fil)
    expect(result.length).toBeGreaterThan(0)
  })

  it('translate helpers and string utilities should work', () => {
    expect(component.translateLabels('label', 'type')).toBe('Translated')
    expect(component.translateActualLabels('label', 'type')).toBe('Actual')

    const camel = component.toCamelCase('hello world')
    expect(camel).toBe('helloWorld')

    const spaced = component.toString('helloWorld')
    expect(spaced).toBe('Hello World')

    const translatedTo = component.translateTo('some value')
    expect(translatedTo).toBe(component.toCamelCase('some value'))
  })

  it('ngOnDestroy should unsubscribe from subscription', () => {
    const unsubscribeSpy = jest.spyOn((component as any).subscription, 'unsubscribe')
    component.ngOnDestroy()
    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
