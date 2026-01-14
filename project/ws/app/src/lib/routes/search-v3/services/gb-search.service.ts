import { of } from 'rxjs'

import { GbSearchService } from './gb-search.service'

describe('GbSearchService (no TestBed)', () => {
  let service: GbSearchService
  let mockHttp: any
  let mockConfigSvc: any
  let mockSearchApi: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    }

    mockConfigSvc = {
      sitePath: 'http://test.base',
    }

    mockSearchApi = {
      getSearchAutoCompleteResults: jest.fn().mockReturnValue(of([{ value: 'result' }])),
    }

    service = new GbSearchService(mockHttp, mockConfigSvc, mockSearchApi)
  })

  it('should create service instance', () => {
    expect(service).toBeTruthy()
  })

  it('fetchSearchData should POST to SEARCH_V6', () => {
    const req = { q: 'test' }
    mockHttp.post.mockReturnValue(of({}))

    service.fetchSearchData(req).subscribe()

    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', req)
  })

  it('fetchSearchDataByCategory should POST to SEARCH_V4', () => {
    const req = { q: 'cat' }
    mockHttp.post.mockReturnValue(of({}))

    service.fetchSearchDataByCategory(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/v4/search', req)
  })

  it('fetchSearchDataforCios should POST to SEARCH_EXT_CONTENT', () => {
    const req = { q: 'cios' }
    mockHttp.post.mockReturnValue(of({}))

    service.fetchSearchDataforCios(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/cios/v1/search/content', req)
  })

  it('notifyOther should emit data when provided', done => {
    const payload = { key: 'value' }
    service.notifyObservable$.subscribe(d => {
      expect(d).toEqual(payload)
      done()
    })

    service.notifyOther(payload)
  })

  it('notifyOther should not emit when data is falsy', done => {
    const nextSpy = jest.fn()
    const sub = service.notifyObservable$.subscribe(nextSpy)

    service.notifyOther(null)

    setTimeout(() => {
      expect(nextSpy).not.toHaveBeenCalled()
      sub.unsubscribe()
      done()
    }, 0)
  })

  it('getSearchConfig should fetch and cache config on first call', async () => {
    mockHttp.get.mockReturnValue(of({ key: 'value' }))

    const first = await service.getSearchConfig()
    const second = await service.getSearchConfig()

    expect(mockHttp.get).toHaveBeenCalledTimes(1)
    expect(first).toEqual({ key: 'value' })
    expect(second).toEqual({ key: 'value' })
  })

  it('searchAutoComplete should call searchApi when language is single and not all', async () => {
    const params: any = { q: 'TEST', l: 'en' }

    const result = await service.searchAutoComplete(params)

    expect(params.q).toBe('test')
    expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalled()
    expect(result).toEqual([{ value: 'result' }])
  })

  it('searchAutoComplete should return empty array when multiple languages or all', async () => {
    const multiLang: any = { q: 'TEST', l: 'en,hi' }
    const allLang: any = { q: 'TEST', l: 'all' }

    const resultMulti = await service.searchAutoComplete(multiLang)
    const resultAll = await service.searchAutoComplete(allLang)

    expect(resultMulti).toEqual([])
    expect(resultAll).toEqual([])
    expect(mockSearchApi.getSearchAutoCompleteResults).not.toHaveBeenCalled()
  })

  it('searchCoursesv4 should POST to SEARCH_V4 and return a promise', async () => {
    const params: any = { request: {} }
    mockHttp.post.mockReturnValue(of({ data: 'ok' }))

    const result = await service.searchCoursesv4(params)

    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/v4/search', params)
    expect(result).toEqual({ data: 'ok' })
  })

  it('getApplicationsById should POST to GetApplicationsById', () => {
    const body: any = { ids: ['1'] }
    mockHttp.post.mockReturnValue(of({}))

    service.getApplicationsById(body).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/forms/v2/bulkGetApplicationsById', body)
  })

  it('searchConnections should POST to SEARCH_PEOPLE wrapped in request and return promise', async () => {
    const params: any = { query: 'x' }
    mockHttp.post.mockReturnValue(of({ list: [] }))

    const result = await service.searchConnections(params)

    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v5/public/search', { request: params })
    expect(result).toEqual({ list: [] })
  })

  it('searchCommunity should POST to SEARCH_COMMUNITY', async () => {
    const params: any = { query: 'community' }
    mockHttp.post.mockReturnValue(of({ hits: [] }))

    const result = await service.searchCommunity(params)

    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/community/v1/search', params)
    expect(result).toEqual({ hits: [] })
  })

  it('searchResource should POST to SEARCH_V6', async () => {
    const params: any = { query: 'res' }
    mockHttp.post.mockReturnValue(of({ items: [] }))

    const result = await service.searchResource(params)

    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', params)
    expect(result).toEqual({ items: [] })
  })

  it('nlpSearch should POST to SEARCH_NLP', async () => {
    const params: any = { q: 'nlp' }
    mockHttp.post.mockReturnValue(of({}))

    const result = await service.nlpSearch(params)
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/nlp/search', params)
    expect(result).toEqual({})
  })

  it('recentCreate should POST to RECENT_CREATE', async () => {
    const req: any = { key: 'v' }
    mockHttp.post.mockReturnValue(of({}))

    const result = await service.recentCreate(req)
    expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/create', req)
    expect(result).toEqual({})
  })

  it('recentRead should GET RECENT_READ', () => {
    mockHttp.get.mockReturnValue(of({}))

    service.recentRead().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/read')
  })

  it('recentDeleteByUser should DELETE RECENT_DELETE_BY_USERID', () => {
    mockHttp.delete.mockReturnValue(of({}))

    service.recentDeleteByUser().subscribe()
    expect(mockHttp.delete).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/delete')
  })

  it('recentDeleteByTime should DELETE RECENT_DELETE_BY_TIMESTAMP with id', () => {
    mockHttp.delete.mockReturnValue(of({}))

    service.recentDeleteByTime('123').subscribe()
    expect(mockHttp.delete).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/delete/timestamp/123')
  })

  it('enrollment should POST to ENROLLMENT_API', () => {
    const body: any = { request: {} }
    mockHttp.post.mockReturnValue(of({}))

    service.enrollment(body, 'user1').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/learner/course/v4/user/enrollment/list/user1', body)
  })

  it('searchExternalContent should POST to SEARCH_EXT_CONTENT', async () => {
    const params: any = { q: 'ext' }
    mockHttp.post.mockReturnValue(of({}))

    const result = await service.searchExternalContent(params)
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/cios/v1/search/content', params)
    expect(result).toEqual({})
  })

  it('exploreContent should GET EXPLORE_API', () => {
    mockHttp.get.mockReturnValue(of({}))

    service.exploreContent().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/api/course/v1/explore')
  })

  it('getFirstSortOption should return correct options based on tab', () => {
    const exploreResult = service.getFirstSortOption(true)
    const searchResult = service.getFirstSortOption(false)

    expect(exploreResult.selectedOption).toBeDefined()
    expect(exploreResult.options.length).toBeGreaterThan(0)

    expect(searchResult.selectedOption).toBeDefined()
    expect(searchResult.options.length).toBeGreaterThan(0)
  })

  it('microCredentialsSearch should GET MICRO_CREDENTIALS', () => {
    mockHttp.get.mockReturnValue(of({}))

    service.microCredentialsSearch().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('apis/proxies/v8/promotionalcontent/v1/assignedto/users')
  })
})