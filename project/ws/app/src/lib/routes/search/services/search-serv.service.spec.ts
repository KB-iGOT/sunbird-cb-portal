import { of } from 'rxjs'
import { SearchServService } from './search-serv.service'

describe('SearchServService', () => {
  let service: SearchServService
  let events: any
  let searchApi: any
  let configSrv: any
  let http: any

  beforeEach(() => {
    events = { dispatchEvent: jest.fn() }
    searchApi = {
      getSearchAutoCompleteResults: jest.fn(() => of([{ value: 'angular' }])),
      getSearchV6Results: jest.fn(() => of({ result: { content: [] } })),
      getSearchResults: jest.fn(() => of({ users: [] })),
    }
    configSrv = { sitePath: '/site', activeOrg: 'active-org', rootOrg: 'root-org' }
    http = { get: jest.fn(() => of({ search: { tabs: [{}], visibleFiltersV2: { lang: {}, contentType: {} } }, defaultsearch: 'default' })) }
    service = new SearchServService(events, searchApi, configSrv, http)
  })

  it('loads and caches search config', async () => {
    const config = await service.getSearchConfig()
    const second = await service.getSearchConfig()

    expect(config.defaultsearch).toBe('default')
    expect(second).toBe(config)
    expect(http.get).toHaveBeenCalledTimes(1)
    expect(http.get).toHaveBeenCalledWith('/site/feature/search.json')
  })

  it('resolves phrase search defaults from config', async () => {
    await expect(service.getApplyPhraseSearch()).resolves.toBe(true)
    service.searchConfig.search.tabs[0].phraseSearch = false
    await expect(service.getApplyPhraseSearch()).resolves.toBe(false)
  })

  it('fetches autocomplete only for one non-all locale and lowercases query', async () => {
    await expect(service.searchAutoComplete({ q: 'Angular', l: 'en' } as any)).resolves.toEqual([{ value: 'angular' }])
    await expect(service.searchAutoComplete({ q: 'Angular', l: 'en,hi' } as any)).resolves.toEqual([])
    await expect(service.searchAutoComplete({ q: 'Angular', l: 'all' } as any)).resolves.toEqual([])
    expect(searchApi.getSearchAutoCompleteResults).toHaveBeenCalledWith({ q: 'angular', l: 'en' })
  })

  it('wraps learning search as v6 request', done => {
    service.searchConfig = { search: { visibleFiltersV2: { lang: {}, contentType: {} } }, defaultsearch: 'default' }

    service.getLearning({
      request: {
        query: 'java',
        filters: { lang: ['en'] },
        sort_by: { lastUpdatedOn: 'desc' },
        fields: ['name'],
      },
    } as any).subscribe(() => {
      expect(searchApi.getSearchV6Results).toHaveBeenCalledWith({
        request: {
          query: 'java',
          filters: { lang: ['en'] },
          sort_by: { lastUpdatedOn: 'desc' },
          facets: ['lang', 'contentType'],
          fields: ['name'],
          fuzzy: false,
        },
      }, 'default')
      done()
    })
  })

  it('adds org details to social search request', () => {
    service.fetchSocialSearchUsers({ query: 'alex' } as any)
    expect(searchApi.getSearchResults).toHaveBeenCalledWith({ org: 'active-org', rootOrg: 'root-org', query: 'alex' })
  })

  it('builds selected filter set including tag paths', () => {
    const result = service.updateSelectedFiltersSet({ tags: ['a/b/c'], lang: ['English'], empty: [] })

    expect(result.filterReset).toBe(true)
    expect(Array.from(result.filterSet)).toEqual(['a', 'a/b', 'a/b/c', 'English'])
  })

  it('transforms and handles filters', () => {
    expect(service.transformSearchV6Filters([{ andFilters: [{ lang: ['en'] }, { contentType: ['Course'] }] }] as any))
      .toEqual({ lang: ['en'], contentType: ['Course'] })

    const result = service.handleFilters([
      { type: 'concepts', displayName: 'Concepts', content: [{ type: 'c1', displayName: 'C1' }] },
      { type: 'dtLastModified', displayName: 'Date', content: [] },
      {
        type: 'lang',
        displayName: 'Language',
        content: [{ type: 'English', displayName: 'English', children: [{ type: 'Hindi', displayName: 'Hindi' }] }],
      },
      { type: 'contentType', displayName: 'Content type', content: [] },
    ] as any, new Set(['English', 'Hindi']), { lang: ['English'] }, true)

    expect(result.concept).toEqual([{ type: 'c1', displayName: 'C1' }])
    expect(result.filtersRes).toHaveLength(1)
    expect(result.filtersRes[0].checked).toBe(true)
    expect(result.filtersRes[0].content[0].checked).toBe(true)
    expect((result.filtersRes[0].content[0].children || [])[0].checked).toBe(true)
  })

  it('maps docs, projects and khub filters', () => {
    expect(service.setTilesDocs([{ source: 'KSHOP', itemId: '1', title: 'Doc', dateCreated: '2020-01-01' }])[0])
      .toMatchObject({ itemId: '1', title: 'Doc', color: '3px solid #f26522', restricted: 'N' })
    expect(service.setTileProject([{ itemId: '2', mstProjectName: 'Project', dateStartDate: '2020-01-01' }])[0])
      .toMatchObject({ itemId: '2', title: 'Project', category: 'Project', source: 'PROMT' })
    expect(service.formatKhubFilters({ topics: [{ key: 'Angular', doc_count: 2 }] })).toEqual([
      { type: 'topics', displayName: 'Topics', content: [{ count: 2, displayName: 'Angular', type: 'Angular' }] },
    ])
  })

  it('formats filter values and display names', () => {
    expect(service.formatFilterForSearch({ lang: ['English', 'Hindi'], empty: [] })).toBe('"lang":["English","Hindi"]')
    expect(service.getDisplayName('automationCentral')).toBe('Tools')
    expect(service.getDisplayName('unknown')).toBe('unknown')
    expect(service.getLanguageSearchIndex('zh-CN')).toBe('zh')
    expect(service.getLanguageSearchIndex('en')).toBe('en')
  })

  it('dispatches search telemetry events', () => {
    service.raiseSearchEvent('query', { lang: ['en'] }, 'en')
    service.raiseSearchResponseEvent('query', {}, 10, 'en')

    expect(events.dispatchEvent).toHaveBeenCalledTimes(2)
    expect(events.dispatchEvent.mock.calls[0][0].data.object.query).toBe('query')
    expect(events.dispatchEvent.mock.calls[1][0].data.size).toBe(10)
  })

  it('translates filters with local storage cache and language fallback', async () => {
    localStorage.clear()
    http.get.mockReturnValueOnce(of({ lang: 'Hindi' }))

    await expect(service.translateSearchFilters('hi')).resolves.toEqual({ lang: 'Hindi' })
    await expect(service.translateSearchFilters('en,hi')).resolves.toEqual({})

    expect(http.get).toHaveBeenCalledWith('/apis/protected/v8/translate/filterdata/hi')
    expect(JSON.parse(localStorage.getItem('filtersTranslation') || '{}').hi).toEqual({ lang: 'Hindi' })
  })
})
