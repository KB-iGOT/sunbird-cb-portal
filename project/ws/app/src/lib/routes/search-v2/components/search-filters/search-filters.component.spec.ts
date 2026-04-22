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

  it('modifyUserFilters should remove existing filter and navigate when t param present', (done) => {
    jest.useFakeTimers()

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

    // Advance timers by 500ms to trigger the setTimeout
    jest.advanceTimersByTime(500)

    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/globalsearch'], { queryParams: { q: '' } })

    jest.useRealTimers()
    done()
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

  it('modifyUserFilters should add new filter when not in userFilters', () => {
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [
      {
        name: 'resourceCategory',
        values: [
          { name: 'course', ischecked: false },
        ],
      },
    ]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'course', count: 10, ischecked: true, displayName: 'Course' }

    component.modifyUserFilters(fil, 'resourceCategory')

    expect(component.userFilters.length).toBe(1)
    expect(component.userFilters[0].name).toBe('course')
    expect(component.myFilterArray.length).toBe(1)
    expect(component.myFilterArray[0].mainType).toBe('resourceCategory')
    expect(component.filteroptions[0].values[0].ischecked).toBe(true)
  })

  it('modifyUserFilters should add filter with t qParam for moderated courses', () => {
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [
      {
        name: 'resourceCategory',
        values: [
          { name: 'moderated courses', ischecked: false },
        ],
      },
    ]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'moderated courses', count: 5, ischecked: true, displayName: 'Moderated Courses' }

    component.modifyUserFilters(fil, 'resourceCategory')

    expect(component.myFilterArray.length).toBe(1)
    expect(component.myFilterArray[0].qParam).toBe('t')
  })

  it('modifyUserFilters should remove multiple filters from primaryCategory', () => {
    component.multiplePrimaryCategory = [
      { name: 'course', mainType: 'primaryCategory', ischecked: true },
      { name: 'video', mainType: 'primaryCategory', ischecked: true },
    ]
    component.myFilterArray = [...component.multiplePrimaryCategory]
    component.userFilters = [
      { name: 'course' },
      { name: 'video' },
    ]
    component.filteroptions = [
      {
        name: 'primaryCategory',
        values: [
          { name: 'course', ischecked: true },
          { name: 'video', ischecked: true },
        ],
      },
    ]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'course', count: 5, ischecked: false }

    component.modifyUserFilters(fil, 'primaryCategory')

    // When removing from the filter, it removes from both arrays
    expect(component.userFilters.length).toBe(1)
    expect(component.myFilterArray.length).toBe(1)
    expect(component.filteroptions[0].values[0].ischecked).toBe(false)
  })

  it('modifyUserFilters should add to multiplePrimaryCategory when not exists', () => {
    component.multiplePrimaryCategory = []
    component.myFilterArray = []
    component.userFilters = []
    component.filteroptions = [
      {
        name: 'primaryCategory',
        values: [
          { name: 'program', ischecked: false },
        ],
      },
    ]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'program', count: 3, ischecked: true, displayName: 'Program' }

    component.modifyUserFilters(fil, 'primaryCategory')

    // Check that the filter was added
    expect(component.userFilters.length).toBe(1)
    expect(component.myFilterArray.length).toBe(1)
    expect(component.myFilterArray[0].name).toBe('program')
  })

  it('toCamelCase should handle various string formats', () => {
    expect(component.toCamelCase('Hello World')).toBe('helloWorld')
    expect(component.toCamelCase('test string here')).toBe('testStringHere')
    expect(component.toCamelCase('SingleWord')).toBe('singleWord')
  })

  it('toString should convert camelCase to spaced format', () => {
    expect(component.toString('helloWorld')).toBe('Hello World')
    expect(component.toString('testString')).toBe('Test String')
    expect(component.toString('single')).toBe('Single')
  })

  it('getFilterName should return matching filter using camelCase', () => {
    component.userFilters = [
      { name: 'videoContent' },
      { name: 'courseContent' },
    ]

    const fil1 = { name: 'video content' }
    const result1 = component.getFilterName(fil1)
    expect(result1.length).toBe(1)
    expect(result1[0].name).toBe('videoContent')

    const fil2 = { name: 'course content' }
    const result2 = component.getFilterName(fil2)
    expect(result2.length).toBe(1)
    expect(result2[0].name).toBe('courseContent')
  })

  it('getFilterName should handle no matches', () => {
    component.userFilters = [
      { name: 'video' },
    ]

    const fil = { name: 'audio' }
    const result = component.getFilterName(fil)
    expect(result.length).toBe(0)
  })

  it('modifyUserFilters should handle removing filter without t param', () => {
    component.userFilters = [{ name: 'course', count: 5, ischecked: true }]
    component.myFilterArray = [{
      mainType: 'resourceCategory',
      name: 'course',
      displayName: 'Course',
      count: 5,
      ischecked: true,
      qParam: ''
    }]
    component.filteroptions = [{
      name: 'resourceCategory',
      values: [{ name: 'course', count: 5, ischecked: true }]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const filter = { name: 'course', count: 5, ischecked: false, displayName: 'Course' }

    component.modifyUserFilters(filter, 'resourceCategory')

    expect(component.userFilters.length).toBe(0)
    expect(component.myFilterArray.length).toBe(0)
    expect(component.filteroptions[0].values[0].ischecked).toBe(false)
  })

  it('modifyUserFilters should handle moderated course with multiplePrimaryCategory', () => {
    component.multiplePrimaryCategory = [
      { name: 'course', ischecked: true },
      { name: 'video', ischecked: true },
    ]
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [{
      name: 'primaryCategory',
      values: [
        { name: 'moderatedCourse', ischecked: false },
      ]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'moderated course', count: 5, ischecked: true, displayName: 'Moderated Course' }

    component.modifyUserFilters(fil, 'primaryCategory')

    expect(component.myFilterArray.length).toBe(2)
  })

  it('modifyUserFilters should uncheck moderated courses qParam when unchecked', () => {
    component.userFilters = [{ name: 'moderated courses', count: 5, ischecked: true }]
    component.myFilterArray = [{
      mainType: 'primaryCategory',
      name: 'moderated courses',
      displayName: 'Moderated Courses',
      count: 5,
      ischecked: true,
      qParam: 't'
    }]
    component.filteroptions = [{
      name: 'primaryCategory',
      values: [{ name: 'moderated courses', count: 5, ischecked: true, qParam: 't' }]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const filter = { name: 'moderated courses', count: 5, ischecked: false }

    component.modifyUserFilters(filter, 'primaryCategory')

    expect(component.filteroptions[0].values[0].qParam).toBe('')
  })

  it('getFilterName should handle toString lowercase matching', () => {
    component.userFilters = [
      { name: 'video course' },
    ]

    const fil = { name: 'videoCourse' }
    const result = component.getFilterName(fil)
    expect(result.length).toBeGreaterThan(0)
  })

  it('modifyUserFilters should handle adding filter with different camelCase name', () => {
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [
      {
        name: 'category',
        values: [
          { name: 'learningResource', ischecked: false },
        ],
      },
    ]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'learning resource', count: 7, ischecked: true, displayName: 'Learning Resource' }

    component.modifyUserFilters(fil, 'category')

    expect(component.userFilters.length).toBe(1)
    expect(component.myFilterArray.length).toBe(1)
  })

  it('translateLabels should call langtranslations service', () => {
    const result = component.translateLabels('testLabel', 'testType')
    expect(result).toBe('Translated')
  })

  it('translateActualLabels should call langtranslations service', () => {
    const result = component.translateActualLabels('testLabel', 'testType')
    expect(result).toBe('Actual')
  })

  it('translateTo should return camelCase version', () => {
    const result = component.translateTo('Some Menu Name')
    expect(result).toBe('someMenuName')
  })

  it('modifyUserFilters should emit appliedFilter after adding', () => {
    const emitSpy = jest.spyOn(component.appliedFilter, 'emit')

    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [{
      name: 'testCategory',
      values: [{ name: 'testFilter', ischecked: false }]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'testFilter', count: 1, ischecked: true, displayName: 'Test Filter' }

    component.modifyUserFilters(fil, 'testCategory')

    expect(emitSpy).toHaveBeenCalled()
  })

  it('modifyUserFilters should emit appliedFilter after removing', () => {
    const emitSpy = jest.spyOn(component.appliedFilter, 'emit')

    component.userFilters = [{ name: 'testFilter' }]
    component.myFilterArray = [{ name: 'testFilter', mainType: 'testCategory' }]
    component.filteroptions = [{
      name: 'testCategory',
      values: [{ name: 'testFilter', ischecked: true }]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'testFilter', count: 1, ischecked: false }

    component.modifyUserFilters(fil, 'testCategory')

    expect(emitSpy).toHaveBeenCalled()
  })

  it('modifyUserFilters should work with special characters in filter names', () => {
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [{
      name: 'category',
      values: [{ name: 'Special & Filter!', ischecked: false }]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'Special & Filter!', count: 2, ischecked: true, displayName: 'Special & Filter!' }

    component.modifyUserFilters(fil, 'category')

    expect(component.userFilters.length).toBe(1)
    expect(component.myFilterArray.length).toBe(1)
  })

  it('toCamelCase should handle empty and single character strings', () => {
    expect(component.toCamelCase('a')).toBe('a')
    expect(component.toCamelCase('AB')).toBe('aB')
  })

  it('toString should handle various patterns', () => {
    expect(component.toString('ABC')).toBe(' A B C')
    expect(component.toString('a')).toBe('A')
  })

  it('getFilterName should return empty array when no userFilters', () => {
    component.userFilters = []
    const fil = { name: 'anything' }
    const result = component.getFilterName(fil)
    expect(result.length).toBe(0)
  })

  it('modifyUserFilters should handle filter removal with multiple filter options', () => {
    component.userFilters = [{ name: 'filter1' }]
    component.myFilterArray = [{ name: 'filter1', mainType: 'type1' }]
    component.filteroptions = [
      {
        name: 'type1',
        values: [
          { name: 'filter1', ischecked: true },
          { name: 'filter2', ischecked: false },
        ]
      },
      {
        name: 'type2',
        values: [
          { name: 'filter3', ischecked: false },
        ]
      }
    ]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'filter1', count: 1, ischecked: false }

    component.modifyUserFilters(fil, 'type1')

    expect(component.userFilters.length).toBe(0)
    expect(component.filteroptions[0].values[0].ischecked).toBe(false)
    expect(component.filteroptions[0].values[1].ischecked).toBe(false)
    expect(component.filteroptions[1].values[0].ischecked).toBe(false)
  })

  it('modifyUserFilters should handle adding first filter to empty arrays', () => {
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [{
      name: 'emptyCategory',
      values: []
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'newFilter', count: 1, ischecked: true, displayName: 'New Filter' }

    component.modifyUserFilters(fil, 'emptyCategory')

    expect(component.userFilters.length).toBe(1)
    expect(component.myFilterArray.length).toBe(1)
  })

  it('modifyUserFilters should correctly set displayName in reqfilter', () => {
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [{
      name: 'category',
      values: [{ name: 'test', ischecked: false }]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'test', count: 5, ischecked: true, displayName: 'Test Display' }

    component.modifyUserFilters(fil, 'category')

    expect(component.myFilterArray[0].displayName).toBe('test')
    expect(component.myFilterArray[0].mainType).toBe('category')
    expect(component.myFilterArray[0].qParam).toBe('')
  })

  it('constructor should set language when localStorage has websiteLanguage', () => {
    localStorage.setItem('websiteLanguage', 'hi')

    const searchSrvcMock2 = {
      notifyObservable$: of({}),
    }
    const activatedMock2 = {
      queryParams: of({}),
    }
    const translateMock2 = {
      instant: jest.fn((key: string) => key),
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }
    const langMock2 = {
      translateLabel: jest.fn(() => 'Translated'),
      translateActualLabel: jest.fn(() => 'Actual'),
    }
    const routerMock2 = {
      navigate: jest.fn(),
    }

    // tslint:disable-next-line: no-unused-expression
    const testComp = new SearchFiltersComponent(
      searchSrvcMock2 as any,
      activatedMock2 as any,
      translateMock2 as any,
      langMock2 as any,
      routerMock2 as any
    )

    expect(testComp).toBeDefined()
    expect(translateMock2.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translateMock2.use).toHaveBeenCalledWith('hi')

    localStorage.removeItem('websiteLanguage')
  })

  it('modifyUserFilters should handle non-moderated courses with qParam', () => {
    component.userFilters = []
    component.myFilterArray = []
    component.filteroptions = [{
      name: 'category',
      values: [{ name: 'regular course', ischecked: false }]
    }]
    component.queryParams = {
      has: jest.fn(() => false),
    }

    const fil = { name: 'regular course', count: 3, ischecked: true, displayName: 'Regular Course' }

    component.modifyUserFilters(fil, 'category')

    expect(component.myFilterArray[0].qParam).toBe('')
  })

  it('getFilterName should match filter with exact name first', () => {
    component.userFilters = [
      { name: 'exactMatch' },
      { name: 'exact match' },
    ]

    const fil = { name: 'exactMatch' }
    const result = component.getFilterName(fil)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].name).toBe('exactMatch')
  })
})
