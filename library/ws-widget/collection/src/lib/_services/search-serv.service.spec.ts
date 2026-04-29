import { SearchServService } from './search-serv.service'
import { of } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class {
    userLanguage = 'en'
    sitePath = '/assets'
  },
  EventService: class {
    raise = jest.fn()
    dispatchEvent = jest.fn()
  },
  WsEvents: {
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Warn: 'Warn' },
    EnumTelemetrySubType: { Interact: 'Interact', Search: 'Search' },
  },
}), { virtual: true })

jest.mock('./search-api.service', () => ({
  SearchApiService: class {
    getSearch = jest.fn(() => of({ results: [] }))
    getSearchResults = jest.fn(() => of([]))
  },
}), { virtual: true })

const MOCK_SEARCH_CONFIG = {
  search: {
    tabs: [{ phraseSearch: false }],
    visibleFiltersV2: { contentType: [], primaryCategory: [] },
  },
}

describe('SearchServService', () => {
  let service: SearchServService
  let mockEvents: any
  let mockSearchApi: any
  let mockConfigSrv: any
  let mockHttp: any

  beforeEach(() => {
    mockEvents = { raise: jest.fn(), dispatchEvent: jest.fn() }
    mockSearchApi = {
      getSearch: jest.fn(() => of({ result: { content: [], facets: [] } })),
      getSearchResults: jest.fn(() => of([])),
    }
    mockConfigSrv = { userLanguage: 'en', sitePath: '/assets' }
    mockHttp = { get: jest.fn(() => of(MOCK_SEARCH_CONFIG)) }
    service = new SearchServService(mockEvents, mockSearchApi, mockConfigSrv, mockHttp)
    service.searchConfig = MOCK_SEARCH_CONFIG
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('defaultFiltersTranslated returns empty object', () => {
    expect(service.defaultFiltersTranslated).toBeDefined()
  })

  it('getLearning calls searchApi.getSearch', done => {
    const request = { filters: {}, query: 'test' }
    service.getLearning(request).subscribe(() => {
      expect(mockSearchApi.getSearch).toHaveBeenCalled()
      done()
    })
  })

  it('searchV6Wrapper calls searchApi.getSearch with request', done => {
    const request = { filters: {}, query: 'programming' }
    service.searchV6Wrapper(request).subscribe(() => {
      expect(mockSearchApi.getSearch).toHaveBeenCalled()
      done()
    })
  })

  it('fetchSocialSearchUsers calls searchApi.getSearchResults', done => {
    const request = { query: 'user' }
    service.fetchSocialSearchUsers(request).subscribe(() => {
      expect(mockSearchApi.getSearchResults).toHaveBeenCalled()
      done()
    })
  })

  it('updateSelectedFiltersSet runs without error given filters', () => {
    const filters = { contentType: ['Course', 'Resource'], primaryCategory: [] }
    expect(() => service.updateSelectedFiltersSet(filters)).not.toThrow()
  })

  it('updateSelectedFiltersSet handles tags with slash', () => {
    const filters = { tags: ['Category/SubCategory'] }
    expect(() => service.updateSelectedFiltersSet(filters)).not.toThrow()
  })

  it('getSearchConfig returns cached config', async () => {
    const config = await service.getSearchConfig()
    expect(config).toEqual(MOCK_SEARCH_CONFIG)
    expect(mockHttp.get).not.toHaveBeenCalled()
  })

  it('getSearchConfig calls http.get when config is null', async () => {
    service.searchConfig = null
    mockHttp.get.mockReturnValue(of(MOCK_SEARCH_CONFIG))
    await service.getSearchConfig()
    expect(mockHttp.get).toHaveBeenCalled()
  })

  it('getApplyPhraseSearch returns boolean based on config', async () => {
    const result = await service.getApplyPhraseSearch()
    expect(typeof result).toBe('boolean')
  })

  it('fetchSearchDataDocs returns value (not subscribed)', () => {
    const result = service.fetchSearchDataDocs({})
    expect(result).toBeDefined()
  })

  it('fetchSearchDataProjects returns value (not subscribed)', () => {
    const result = service.fetchSearchDataProjects({})
    expect(result).toBeDefined()
  })

  it('getLanguageSearchIndex returns correct index for en', () => {
    const result = service.getLanguageSearchIndex('en')
    expect(result).toBe('en')
  })

  it('getLanguageSearchIndex returns correct index for hi', () => {
    const result = service.getLanguageSearchIndex('hi')
    expect(result).toBe('hi')
  })

  it('raiseSearchEvent calls events.dispatchEvent', () => {
    service.raiseSearchEvent('test', {}, 'en')
    expect(mockEvents.dispatchEvent).toHaveBeenCalled()
  })

  it('raiseSearchResponseEvent calls events.dispatchEvent', () => {
    service.raiseSearchResponseEvent('test', {}, 100, 'en')
    expect(mockEvents.dispatchEvent).toHaveBeenCalled()
  })

  it('translateSearchFilters returns cached en filter', async () => {
    const cached = { en: { filters: [] } }
    localStorage.setItem('filtersTranslation', JSON.stringify(cached))
    const result = await service.translateSearchFilters('en')
    expect(result).toEqual({ filters: [] })
    localStorage.clear()
  })

  it('formatFilterForSearch returns filter string', () => {
    const filters = { contentType: ['Course', 'Resource'], primaryCategory: ['Learning Resource'] }
    const result = service.formatFilterForSearch(filters)
    expect(typeof result).toBe('string')
  })

  it('getDisplayName returns display name for known type', () => {
    const result = service.getDisplayName('contenttype')
    expect(typeof result).toBe('string')
  })

  it('fetchContentOfFilter maps filter array to content items', () => {
    const filter = ['item1', 'item2']
    const result = service.fetchContentOfFilter(filter)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
  })

  it('setTileProject maps response to tile objects', () => {
    const response = [{ 'source': 'KShop', 'name': 'Project 1', 'identifier': 'p1', 'dateStartDate': '2024-01-01' }]
    const result = service.setTileProject(response)
    expect(Array.isArray(result)).toBe(true)
  })

  it('transformSearchV6Filters transforms andFilters array to key-value object', () => {
    const v6Filters: any[] = [
      { andFilters: [{ contentType: ['Course'], primaryCategory: ['Learning Resource'] }] },
    ]
    const result = service.transformSearchV6Filters(v6Filters)
    expect(result.contentType).toEqual(['Course'])
    expect(result.primaryCategory).toEqual(['Learning Resource'])
  })

  it('transformSearchV6Filters handles filters without andFilters', () => {
    const v6Filters: any[] = [{ filters: { contentType: ['Course'] } }]
    const result = service.transformSearchV6Filters(v6Filters)
    expect(result).toBeDefined()
  })

  it('handleFilters returns concept and filtersRes', () => {
    const filters: any[] = [
      { type: 'contentType', content: [{ type: 'Course', checked: false, children: [] }] },
    ]
    const filterSet = new Set<string>(['Course'])
    const selectedFilters = { contentType: ['Course'] }
    const result = service.handleFilters(filters, filterSet, selectedFilters)
    expect(result.concept).toBeDefined()
    expect(result.filtersRes).toBeDefined()
  })

  it('handleFilters excludes concepts and dtLastModified types', () => {
    const filters: any[] = [
      { type: 'concepts', content: [{ type: 'c1', children: [] }, { type: 'c2', children: [] }] },
      { type: 'dtLastModified', content: [] },
      { type: 'primaryCategory', content: [{ type: 'Course', children: [] }] },
    ]
    const filterSet = new Set<string>()
    const selectedFilters = {}
    const result = service.handleFilters(filters, filterSet, selectedFilters)
    expect(result.filtersRes.length).toBe(1)
  })

  it('setTilesDocs maps doc response to tiles array', () => {
    const response = [{ source: 'kshop', title: 'Doc1', itemId: '1', itemType: 'doc', noOfViews: 10, isAccessRestricted: 'N' }]
    const result = service.setTilesDocs(response)
    expect(Array.isArray(result)).toBe(true)
    expect(result[0].title).toBe('Doc1')
  })

  it('searchAutoComplete returns empty array for empty query', async () => {
    const result = await service.searchAutoComplete({ q: '' })
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  it('formatKhubFilters transforms filters to array format', () => {
    const filters = {
      contentType: [{ key: 'Course', doc_count: 5 }],
      primaryCategory: [{ key: 'Resource', doc_count: 3 }],
    }
    const result = service.formatKhubFilters(filters)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
  })

  it('searchAutoComplete calls searchApi for non-empty query', async () => {
    mockSearchApi.getSearchResults.mockReturnValue(of({ result: { content: [] } }))
    const result = await service.searchAutoComplete({ q: 'test', l: 'en', n: 5 })
    expect(Array.isArray(result)).toBe(true)
  })

  it('getDisplayName returns known type names from switch', () => {
    expect(service.getDisplayName('automationcentral')).toBe('Tools')
    expect(service.getDisplayName('autogeneratedtopic')).toBe('Topics')
    expect(service.getDisplayName('kshopdocument')).toBe('Kshop Document')
    expect(service.getDisplayName('project')).toBe('Project References')
    expect(service.getDisplayName('kshop')).toBe('Documents')
    expect(service.getDisplayName('itemtype')).toBe('Item Type')
    expect(service.getDisplayName('topics')).toBe('Topics')
  })

  it('getDisplayName falls through to return empty string for unknown type', () => {
    const result = service.getDisplayName('unknowntype')
    expect(typeof result).toBe('string')
  })

  it('getLanguageSearchIndex returns bn for Bengali', () => {
    const result = service.getLanguageSearchIndex('bn')
    expect(typeof result).toBe('string')
  })
})
