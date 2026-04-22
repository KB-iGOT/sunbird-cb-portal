import { of, throwError } from 'rxjs'
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
    } as any

    mockConfigSvc = {
      sitePath: 'http://test.base',
    } as any

    mockSearchApi = {
      getSearchAutoCompleteResults: jest.fn().mockReturnValue(of([{ value: 'result' }])),
    } as any

    service = new GbSearchService(mockHttp, mockConfigSvc, mockSearchApi)
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create service instance', () => {
      expect(service).toBeTruthy()
      expect(service).toBeDefined()
    })

    it('should initialize searchConfig as null', () => {
      expect(service.searchConfig).toBeNull()
    })

    it('should initialize notifyObservable$', () => {
      expect(service.notifyObservable$).toBeDefined()
    })
  })

  describe('fetchSearchData', () => {
    it('should POST to SEARCH_V6 endpoint', () => {
      const req = { q: 'test', filters: {} }
      mockHttp.post.mockReturnValue(of({ result: { count: 10 } }))

      service.fetchSearchData(req).subscribe((response: any) => {
        expect(response).toEqual({ result: { count: 10 } })
      })

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', req)
    })

    it('should handle empty request', () => {
      const req = {}
      mockHttp.post.mockReturnValue(of({ result: {} }))

      service.fetchSearchData(req).subscribe((response: any) => {
        expect(response).toBeDefined()
      })

      expect(mockHttp.post).toHaveBeenCalled()
    })

    it('should handle error response', () => {
      const req = { q: 'test' }
      const mockError = { error: 'Search failed' }
      mockHttp.post.mockReturnValue(throwError(mockError))

      service.fetchSearchData(req).subscribe(
        () => fail('should have failed'),
        (error: any) => {
          expect(error).toEqual(mockError)
        }
      )
    })
  })

  describe('fetchSearchDataByCategory', () => {
    it('should POST to SEARCH_V4 endpoint', () => {
      const req = { q: 'cat', category: 'course' }
      mockHttp.post.mockReturnValue(of({ result: { count: 5 } }))

      service.fetchSearchDataByCategory(req).subscribe((response: any) => {
        expect(response).toEqual({ result: { count: 5 } })
      })

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/v4/search', req)
    })

    it('should handle category search with filters', () => {
      const req = { category: 'resource', filters: { contentType: ['Resource'] } }
      mockHttp.post.mockReturnValue(of({ result: { content: [] } }))

      service.fetchSearchDataByCategory(req).subscribe()

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/v4/search', req)
    })
  })

  describe('fetchSearchDataforCios', () => {
    it('should POST to SEARCH_EXT_CONTENT endpoint', () => {
      const req = { q: 'cios' }
      mockHttp.post.mockReturnValue(of({ result: { content: [] } }))

      service.fetchSearchDataforCios(req).subscribe((response: any) => {
        expect(response).toBeDefined()
      })

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/cios/v1/search/content', req)
    })

    it('should handle external content search', () => {
      const req = { query: 'external', source: 'cios' }
      mockHttp.post.mockReturnValue(of({ data: [] }))

      service.fetchSearchDataforCios(req).subscribe()

      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('notifyOther', () => {
    it('should emit data when provided', (done) => {
      const payload = { key: 'value' }

      service.notifyObservable$.subscribe((data: any) => {
        expect(data).toEqual(payload)
        done()
      })

      service.notifyOther(payload)
    })

    it('should not emit when data is null', (done) => {
      const nextSpy = jest.fn()
      const sub = service.notifyObservable$.subscribe(nextSpy)

      service.notifyOther(null)

      setTimeout(() => {
        expect(nextSpy).not.toHaveBeenCalled()
        sub.unsubscribe()
        done()
      }, 100)
    })

    it('should not emit when data is undefined', (done) => {
      const nextSpy = jest.fn()
      const sub = service.notifyObservable$.subscribe(nextSpy)

      service.notifyOther(undefined)

      setTimeout(() => {
        expect(nextSpy).not.toHaveBeenCalled()
        sub.unsubscribe()
        done()
      }, 100)
    })

    it('should emit multiple times for multiple calls', (done) => {
      const testData1 = { filter: 'type1' }
      const testData2 = { filter: 'type2' }
      const receivedData: any[] = []

      service.notifyObservable$.subscribe((data: any) => {
        receivedData.push(data)
        if (receivedData.length === 2) {
          expect(receivedData).toEqual([testData1, testData2])
          done()
        }
      })

      service.notifyOther(testData1)
      service.notifyOther(testData2)
    })
  })

  describe('getSearchConfig', () => {
    it('should fetch and cache config on first call', async () => {
      const mockConfig = { filters: ['category'], tabs: ['all'] }
      mockHttp.get.mockReturnValue(of(mockConfig))

      const first = await service.getSearchConfig()
      const second = await service.getSearchConfig()

      expect(mockHttp.get).toHaveBeenCalledTimes(1)
      expect(mockHttp.get).toHaveBeenCalledWith('http://test.base/feature/search.json')
      expect(first).toEqual(mockConfig)
      expect(second).toEqual(mockConfig)
    })

    it('should initialize searchConfig as empty object if null', async () => {
      const mockConfig = { tabs: ['all', 'courses'] }
      mockHttp.get.mockReturnValue(of(mockConfig))

      expect(service.searchConfig).toBeNull()

      await service.getSearchConfig()

      expect(service.searchConfig).toEqual(mockConfig)
    })

    it('should handle error when fetching config', async () => {
      const mockError = new Error('Failed to load config')
      mockHttp.get.mockReturnValue(throwError(mockError))

      try {
        await service.getSearchConfig()
        fail('should have thrown error')
      } catch (error: any) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('searchAutoComplete', () => {
    it('should call searchApi when language is single and not all', async () => {
      const params: any = { q: 'TEST', l: 'en' }
      const mockResults = [{ value: 'result' }]
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(of(mockResults))

      const result = await service.searchAutoComplete(params)

      expect(params.q).toBe('test')
      expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalled()
      expect(result).toEqual(mockResults)
    })

    it('should convert query to lowercase', async () => {
      const params: any = { q: 'UPPERCASE', l: 'hi' }
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(of([]))

      await service.searchAutoComplete(params)

      expect(params.q).toBe('uppercase')
      expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalled()
    })

    it('should return empty array when multiple languages provided', async () => {
      const multiLang: any = { q: 'TEST', l: 'en,hi' }

      const result = await service.searchAutoComplete(multiLang)

      expect(result).toEqual([])
      expect(mockSearchApi.getSearchAutoCompleteResults).not.toHaveBeenCalled()
    })

    it('should return empty array when language is "all"', async () => {
      const allLang: any = { q: 'TEST', l: 'all' }

      const result = await service.searchAutoComplete(allLang)

      expect(result).toEqual([])
      expect(mockSearchApi.getSearchAutoCompleteResults).not.toHaveBeenCalled()
    })

    it('should return empty array when language is "ALL" (uppercase)', async () => {
      const allLang: any = { q: 'test', l: 'ALL' }

      const result = await service.searchAutoComplete(allLang)

      expect(result).toEqual([])
    })

    it('should handle empty query string', async () => {
      const params: any = { q: '', l: 'en' }
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(of([]))

      const result = await service.searchAutoComplete(params)

      expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('searchCoursesv4', () => {
    it('should POST to SEARCH_V4 and return promise', async () => {
      const params: any = { request: { filters: {} } }
      const mockResponse = { data: 'ok', result: { count: 10 } }
      mockHttp.post.mockReturnValue(of(mockResponse))

      const result = await service.searchCoursesv4(params)

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/v4/search', params)
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty params', async () => {
      const params: any = {}
      mockHttp.post.mockReturnValue(of({}))

      const result = await service.searchCoursesv4(params)

      expect(result).toBeDefined()
    })
  })

  describe('getApplicationsById', () => {
    it('should POST to GetApplicationsById endpoint', () => {
      const body: any = { ids: ['1', '2', '3'] }
      const mockResponse = { applications: [] }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.getApplicationsById(body).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/forms/v2/bulkGetApplicationsById', body)
    })

    it('should handle empty ids array', () => {
      const body: any = { ids: [] }
      mockHttp.post.mockReturnValue(of({ applications: [] }))

      service.getApplicationsById(body).subscribe()

      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('searchConnections', () => {
    it('should POST to SEARCH_PEOPLE wrapped in request and return promise', async () => {
      const params: any = { query: 'x', filters: {} }
      const mockResponse = { list: [], count: 0 }
      mockHttp.post.mockReturnValue(of(mockResponse))

      const result = await service.searchConnections(params)

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v5/public/search', { request: params })
      expect(result).toEqual(mockResponse)
    })

    it('should wrap params in request object', async () => {
      const params: any = { query: 'test user' }
      mockHttp.post.mockReturnValue(of({ list: [] }))

      await service.searchConnections(params)

      const callArgs = mockHttp.post.mock.calls[0]
      expect(callArgs[1]).toEqual({ request: params })
    })
  })

  describe('searchCommunity', () => {
    it('should POST to SEARCH_COMMUNITY', async () => {
      const params: any = { query: 'community' }
      const mockResponse = { hits: [], total: 0 }
      mockHttp.post.mockReturnValue(of(mockResponse))

      const result = await service.searchCommunity(params)

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/community/v1/search', params)
      expect(result).toEqual(mockResponse)
    })

    it('should handle community search with filters', async () => {
      const params: any = { query: 'test', filters: { type: 'public' } }
      mockHttp.post.mockReturnValue(of({ hits: [] }))

      await service.searchCommunity(params)

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/community/v1/search', params)
    })
  })

  describe('searchResource', () => {
    it('should POST to SEARCH_V6', async () => {
      const params: any = { query: 'res' }
      const mockResponse = { items: [], count: 0 }
      mockHttp.post.mockReturnValue(of(mockResponse))

      const result = await service.searchResource(params)

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', params)
      expect(result).toEqual(mockResponse)
    })

    it('should handle resource search with filters', async () => {
      const params: any = { query: 'resource', filters: { contentType: ['Resource'] } }
      mockHttp.post.mockReturnValue(of({ items: [] }))

      await service.searchResource(params)

      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('nlpSearch', () => {
    it('should POST to SEARCH_NLP', async () => {
      const params: any = { q: 'nlp query' }
      const mockResponse = { result: [] }
      mockHttp.post.mockReturnValue(of(mockResponse))

      const result = await service.nlpSearch(params)

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/nlp/search', params)
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty NLP query', async () => {
      const params: any = { q: '' }
      mockHttp.post.mockReturnValue(of({}))

      const result = await service.nlpSearch(params)

      expect(result).toBeDefined()
    })
  })

  describe('recentCreate', () => {
    it('should POST to RECENT_CREATE', async () => {
      const req: any = { key: 'v', identifier: 'test123' }
      const mockResponse = { success: true }
      mockHttp.post.mockReturnValue(of(mockResponse))

      const result = await service.recentCreate(req)

      expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/create', req)
      expect(result).toEqual(mockResponse)
    })

    it('should handle recent create with multiple fields', async () => {
      const req: any = { identifier: 'id1', title: 'Title', contentType: 'Course' }
      mockHttp.post.mockReturnValue(of({}))

      await service.recentCreate(req)

      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('recentRead', () => {
    it('should GET RECENT_READ', () => {
      const mockResponse = { recent: [] }
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.recentRead().subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttp.get).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/read')
    })

    it('should handle empty recent searches', () => {
      mockHttp.get.mockReturnValue(of({ recent: [] }))

      service.recentRead().subscribe((response: any) => {
        expect(response.recent).toEqual([])
      })
    })
  })

  describe('recentDeleteByUser', () => {
    it('should DELETE RECENT_DELETE_BY_USERID', () => {
      const mockResponse = { success: true }
      mockHttp.delete.mockReturnValue(of(mockResponse))

      service.recentDeleteByUser().subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttp.delete).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/delete')
    })

    it('should handle deletion errors', () => {
      const mockError = { error: 'Deletion failed' }
      mockHttp.delete.mockReturnValue(throwError(mockError))

      service.recentDeleteByUser().subscribe(
        () => fail('should have failed'),
        (error: any) => {
          expect(error).toEqual(mockError)
        }
      )
    })
  })

  describe('recentDeleteByTime', () => {
    it('should DELETE RECENT_DELETE_BY_TIMESTAMP with id', () => {
      const mockResponse = { success: true }
      mockHttp.delete.mockReturnValue(of(mockResponse))

      service.recentDeleteByTime('123').subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttp.delete).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/delete/timestamp/123')
    })

    it('should handle different timestamp formats', () => {
      mockHttp.delete.mockReturnValue(of({}))

      service.recentDeleteByTime('1234567890').subscribe()

      expect(mockHttp.delete).toHaveBeenCalledWith('apis/proxies/v8/search/v1/recent/delete/timestamp/1234567890')
    })
  })

  describe('enrollment', () => {
    it('should POST to ENROLLMENT_API with userId', () => {
      const body: any = { request: { filters: {} } }
      const mockResponse = { courses: [] }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.enrollment(body, 'user1').subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/learner/course/v4/user/enrollment/list/user1', body)
    })

    it('should handle different user IDs', () => {
      const body: any = { request: {} }
      mockHttp.post.mockReturnValue(of({ courses: [] }))

      service.enrollment(body, 'testuser123').subscribe()

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/learner/course/v4/user/enrollment/list/testuser123', body)
    })
  })

  describe('searchExternalContent', () => {
    it('should POST to SEARCH_EXT_CONTENT', async () => {
      const params: any = { q: 'ext' }
      const mockResponse = { content: [] }
      mockHttp.post.mockReturnValue(of(mockResponse))

      const result = await service.searchExternalContent(params)

      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/cios/v1/search/content', params)
      expect(result).toEqual(mockResponse)
    })

    it('should handle external content search with filters', async () => {
      const params: any = { query: 'external', filters: { source: 'cios' } }
      mockHttp.post.mockReturnValue(of({ content: [] }))

      await service.searchExternalContent(params)

      expect(mockHttp.post).toHaveBeenCalled()
    })
  })

  describe('exploreContent', () => {
    it('should GET EXPLORE_API', () => {
      const mockResponse = { content: [], count: 0 }
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.exploreContent().subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttp.get).toHaveBeenCalledWith('/api/course/v1/explore')
    })

    it('should handle empty explore content', () => {
      mockHttp.get.mockReturnValue(of({ content: [] }))

      service.exploreContent().subscribe((response: any) => {
        expect(response.content).toEqual([])
      })
    })
  })

  describe('getFirstSortOption', () => {
    it('should return correct options for explore content tab', () => {
      const result = service.getFirstSortOption(true)

      expect(result.selectedOption).toBeDefined()
      expect(result.options).toBeDefined()
      expect(result.options.length).toBeGreaterThan(0)
    })

    it('should return correct options for search tab', () => {
      const result = service.getFirstSortOption(false)

      expect(result.selectedOption).toBeDefined()
      expect(result.options).toBeDefined()
      expect(result.options.length).toBeGreaterThan(0)
    })

    it('should filter out MostRelevent for explore tab', () => {
      const exploreResult = service.getFirstSortOption(true)
      const hasRelevant = exploreResult.options.some((opt: any) => opt.value === 'MostRelevent' || opt.value === 0)

      expect(hasRelevant).toBe(false)
    })

    it('should include all options for search tab', () => {
      const searchResult = service.getFirstSortOption(false)

      expect(searchResult.options.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('microCredentialsSearch', () => {
    it('should GET MICRO_CREDENTIALS', () => {
      const mockResponse = { credentials: [] }
      mockHttp.get.mockReturnValue(of(mockResponse))

      service.microCredentialsSearch().subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttp.get).toHaveBeenCalledWith('apis/proxies/v8/promotionalcontent/v1/assignedto/users')
    })

    it('should handle empty credentials', () => {
      mockHttp.get.mockReturnValue(of({ credentials: [] }))

      service.microCredentialsSearch().subscribe((response: any) => {
        expect(response.credentials).toEqual([])
      })
    })
  })

  describe('Observable subscriptions', () => {
    it('should allow multiple subscribers to notifyObservable$', (done) => {
      const testData = { filter: 'test' }
      let subscriber1Called = false
      let subscriber2Called = false

      service.notifyObservable$.subscribe((data: any) => {
        expect(data).toEqual(testData)
        subscriber1Called = true
        checkDone()
      })

      service.notifyObservable$.subscribe((data: any) => {
        expect(data).toEqual(testData)
        subscriber2Called = true
        checkDone()
      })

      service.notifyOther(testData)

      function checkDone() {
        if (subscriber1Called && subscriber2Called) {
          done()
        }
      }
    })
  })

  describe('Edge cases', () => {
    it('should handle null request in POST methods', async () => {
      mockHttp.post.mockReturnValue(of({}))

      await service.searchCoursesv4(null as any)

      expect(mockHttp.post).toHaveBeenCalled()
    })

    it('should handle undefined sitePath in getSearchConfig', async () => {
      mockConfigSvc.sitePath = undefined
      mockHttp.get.mockReturnValue(of({}))

      await service.getSearchConfig()

      expect(mockHttp.get).toHaveBeenCalledWith('undefined/feature/search.json')
    })

    it('should handle promise rejection in searchConnections', async () => {
      const mockError = new Error('Connection failed')
      mockHttp.post.mockReturnValue(throwError(mockError))

      try {
        await service.searchConnections({ query: 'test' } as any)
        fail('should have rejected')
      } catch (error: any) {
        expect(error).toBeDefined()
      }
    })
  })
})
