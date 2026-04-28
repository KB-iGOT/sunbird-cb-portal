import { BehaviorSubject } from 'rxjs'
import { SearchInputHomeComponent } from './search-input-home.component'

describe('SearchInputHomeComponent', () => {
  let component: SearchInputHomeComponent
  let router: any
  let searchServ: any
  let queryParamMap$: BehaviorSubject<any>
  let route: any

  beforeEach(() => {
    router = { navigate: jest.fn() }
    searchServ = {
      getSearchConfig: jest.fn(() => Promise.resolve({ search: { isAutoCompleteAllowed: true, languageSearch: ['en', 'all', 'hi'] } })),
      getLanguageSearchIndex: jest.fn((lang: string) => lang === 'zh-CN' ? 'zh' : lang),
      searchAutoComplete: jest.fn(() => Promise.resolve([{ value: 'java' }])),
    }
    queryParamMap$ = new BehaviorSubject({ has: (key: string) => ['q', 'lang'].includes(key), get: (key: string) => key === 'q' ? 'angular' : 'en' })
    route = {
      snapshot: {
        queryParams: { q: 'start' },
        data: { searchPageData: { data: { search: { isAutoCompleteAllowed: true, languageSearch: ['en', 'all', 'hi'] } } } },
      },
      parent: { route: 'parent' },
      queryParamMap: queryParamMap$,
    }
    component = new SearchInputHomeComponent(
      route,
      router,
      searchServ,
      {
        activeLocale: { locals: ['en'] },
        userPreference: { selectedLangGroup: 'en,hi' },
        unMappedUser: { profileDetails: { profileStatus: 'not-my-user', employmentDetails: { departmentName: 'igot' } } },
      } as any,
      route,
    )
    component.searchInputElem = { nativeElement: { focus: jest.fn(), blur: jest.fn() } } as any
  })

  it('initializes from route data, focuses and builds languages', () => {
    component.ngOnInit()

    expect(component.disableMenu).toBe(true)
    expect(component.queryControl.value).toBe('angular')
    expect(component.searchLocale).toBe('en')
    expect(component.languageSearch[0]).toBe('all')
    expect(component.languageSearch).toContain('en,hi')
    expect(component.searchInputElem.nativeElement.focus).toHaveBeenCalled()
  })

  it('loads config when route data is missing', async () => {
    route.snapshot.data = {}
    component.ngOnInit()
    await Promise.resolve()
    await Promise.resolve()

    expect(searchServ.getSearchConfig).toHaveBeenCalled()
    expect(route.snapshot.data.searchPageData).toBeTruthy()
  })

  it('updates query for home and non-home contexts', () => {
    const emit = jest.spyOn(component.closed, 'emit')
    component.ref = 'home'
    component.updateQuery(' java ')
    expect(emit).toHaveBeenCalledWith(false)
    expect(router.navigate).toHaveBeenCalledWith(['/app/globalsearch'], expect.objectContaining({ queryParams: { q: 'java' } }))

    component.ref = ''
    component.updateQuery(' css ')
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { q: 'css' } }))
  })

  it('handles autocomplete, clear and language navigation', async () => {
    component.searchLocale = 'en'
    component.getSearchAutoCompleteResults('ja')
    await Promise.resolve()
    expect(component.autoCompleteResults).toEqual([{ value: 'java' }])

    component.searchLocale = 'en,hi'
    component.getSearchAutoCompleteResults('ja')
    expect(searchServ.searchAutoComplete).toHaveBeenCalledTimes(1)

    component.clearSearchText()
    expect(component.queryControl.value).toBeNull()

    component.queryControl.setValue('cloud')
    component.searchLanguage('hi')
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { lang: 'hi', q: 'cloud' } }))
  })

  it('computes locale and preferred languages', () => {
    expect(component.getActiveLocale()).toBe('en')
    expect(component.preferredLanguages).toBe('en,hi')
    component['configSvc'].userPreference = null
    expect(component.preferredLanguages).toBeNull()
    component.ngOnChanges()
    component.swapRemove(['en', 'all', 'hi'], 1, 0)
  })
})
