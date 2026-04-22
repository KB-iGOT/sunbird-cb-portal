import { GbSearchService } from './gb-search.service'
import { of, throwError } from 'rxjs'

describe('GbSearchService (no TestBed)', () => {
  let service: GbSearchService
  let mockHttpClient: any
  let mockConfigSrv: any
  let mockSearchApi: any

  beforeEach(() => {
    // Mock HttpClient
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
    } as any

    // Mock ConfigurationsService
    mockConfigSrv = {
      sitePath: 'https://test-portal.com',
    } as any

    // Mock SearchApiService
    mockSearchApi = {
      getSearchAutoCompleteResults: jest.fn(),
    } as any

    // Create service instance
    service = new GbSearchService(mockHttpClient, mockConfigSrv, mockSearchApi)

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined()
      expect(service.searchConfig).toBeNull()
    })

    it('should initialize notifyObservable$', () => {
      expect(service.notifyObservable$).toBeDefined()
    })
  })

  describe('fetchSearchData', () => {
    it('should call http post with correct endpoint and request', () => {
      const mockRequest = { query: 'test', filters: {} }
      const mockResponse = { result: { count: 10, content: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchSearchData(mockRequest).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        mockRequest
      )
    })

    it('should handle empty request', () => {
      const mockRequest = {}
      const mockResponse = { result: { count: 0, content: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchSearchData(mockRequest).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalled()
    })

    it('should handle error response', () => {
      const mockRequest = { query: 'test' }
      const mockError = { error: 'Network error' }
      mockHttpClient.post.mockReturnValue(throwError(mockError))

      service.fetchSearchData(mockRequest).subscribe(
        () => fail('should have failed'),
        (error: any) => {
          expect(error).toEqual(mockError)
        }
      )
    })
  })

  describe('fetchSearchDataByCategory', () => {
    it('should call http post with V4 endpoint and request', () => {
      const mockRequest = { category: 'course', filters: {} }
      const mockResponse = { result: { count: 5, content: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchSearchDataByCategory(mockRequest).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/v4/search',
        mockRequest
      )
    })

    it('should handle category search with filters', () => {
      const mockRequest = {
        category: 'resource',
        filters: { contentType: ['Resource'], complexityLevel: ['Beginner'] },
      }
      const mockResponse = { result: { count: 15, content: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchSearchDataByCategory(mockRequest).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/v4/search',
        mockRequest
      )
    })
  })

  describe('fetchSearchDataforCios', () => {
    it('should call http post with CIOS endpoint and request', () => {
      const mockRequest = { query: 'external content', source: 'cios' }
      const mockResponse = { result: { content: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.fetchSearchDataforCios(mockRequest).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/cios/v1/search/content',
        mockRequest
      )
    })

    it('should handle error from CIOS endpoint', () => {
      const mockRequest = { query: 'test' }
      const mockError = { error: 'CIOS service unavailable' }
      mockHttpClient.post.mockReturnValue(throwError(mockError))

      service.fetchSearchDataforCios(mockRequest).subscribe(
        () => fail('should have failed'),
        (error: any) => {
          expect(error).toEqual(mockError)
        }
      )
    })
  })

  describe('notifyOther', () => {
    it('should emit data through removeFilter subject', (done) => {
      const testData = { filter: 'category', value: 'course' }

      service.notifyObservable$.subscribe((data: any) => {
        expect(data).toEqual(testData)
        done()
      })

      service.notifyOther(testData)
    })

    it('should not emit when data is null', (done) => {
      let emitted = false

      const subscription = service.notifyObservable$.subscribe(() => {
        emitted = true
      })

      service.notifyOther(null)

      setTimeout(() => {
        expect(emitted).toBe(false)
        subscription.unsubscribe()
        done()
      }, 100)
    })

    it('should not emit when data is undefined', (done) => {
      let emitted = false

      const subscription = service.notifyObservable$.subscribe(() => {
        emitted = true
      })

      service.notifyOther(undefined)

      setTimeout(() => {
        expect(emitted).toBe(false)
        subscription.unsubscribe()
        done()
      }, 100)
    })

    it('should emit multiple times for multiple calls', (done) => {
      const testData1 = { filter: 'type1', value: 'value1' }
      const testData2 = { filter: 'type2', value: 'value2' }
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
    it('should fetch search config when not cached', async () => {
      const mockConfig = {
        filters: ['category', 'contentType'],
        tabs: ['all', 'courses', 'resources'],
      }
      mockHttpClient.get.mockReturnValue(of(mockConfig))

      const result = await service.getSearchConfig()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://test-portal.com/feature/search.json'
      )
      expect(result).toEqual(mockConfig)
      expect(service.searchConfig).toEqual(mockConfig)
    })

    it('should return cached config on subsequent calls', async () => {
      const mockConfig = {
        filters: ['category', 'contentType'],
        tabs: ['all', 'courses'],
      }
      mockHttpClient.get.mockReturnValue(of(mockConfig))

      // First call - should fetch
      const result1 = await service.getSearchConfig()
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(mockConfig)

      // Second call - should use cache
      const result2 = await service.getSearchConfig()
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1) // Still 1, not called again
      expect(result2).toEqual(mockConfig)
    })

    it('should initialize searchConfig as empty object if null', async () => {
      const mockConfig = { tabs: ['all'] }
      mockHttpClient.get.mockReturnValue(of(mockConfig))

      expect(service.searchConfig).toBeNull()

      await service.getSearchConfig()

      expect(service.searchConfig).toEqual(mockConfig)
    })

    it('should handle error when fetching config', async () => {
      const mockError = new Error('Failed to load config')
      mockHttpClient.get.mockReturnValue(throwError(mockError))

      try {
        await service.getSearchConfig()
        fail('should have thrown error')
      } catch (error: any) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('searchAutoComplete', () => {
    it('should call searchApi when single language is provided', async () => {
      const mockParams = { q: 'Test Query', l: 'en' }
      const mockResults = [
        { term: 'test result 1', type: 'content' },
        { term: 'test result 2', type: 'content' },
      ]
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(of(mockResults))

      const result = await service.searchAutoComplete(mockParams)

      expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalledWith({
        q: 'test query',
        l: 'en',
      })
      expect(result).toEqual(mockResults)
    })

    it('should convert query to lowercase', async () => {
      const mockParams = { q: 'UPPERCASE QUERY', l: 'hi' }
      const mockResults: any[] = []
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(of(mockResults))

      await service.searchAutoComplete(mockParams)

      expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalledWith({
        q: 'uppercase query',
        l: 'hi',
      })
    })

    it('should return empty array when multiple languages provided', async () => {
      const mockParams = { q: 'test', l: 'en,hi,ta' }

      const result = await service.searchAutoComplete(mockParams)

      expect(result).toEqual([])
      expect(mockSearchApi.getSearchAutoCompleteResults).not.toHaveBeenCalled()
    })

    it('should return empty array when language is "all"', async () => {
      const mockParams = { q: 'test query', l: 'all' }

      const result = await service.searchAutoComplete(mockParams)

      expect(result).toEqual([])
      expect(mockSearchApi.getSearchAutoCompleteResults).not.toHaveBeenCalled()
    })

    it('should return empty array when language is "ALL" (uppercase)', async () => {
      const mockParams = { q: 'test query', l: 'ALL' }

      const result = await service.searchAutoComplete(mockParams)

      expect(result).toEqual([])
      expect(mockSearchApi.getSearchAutoCompleteResults).not.toHaveBeenCalled()
    })

    it('should handle empty query string', async () => {
      const mockParams = { q: '', l: 'en' }
      const mockResults: any[] = []
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(of(mockResults))

      const result = await service.searchAutoComplete(mockParams)

      expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalledWith({
        q: '',
        l: 'en',
      })
      expect(result).toEqual(mockResults)
    })

    it('should handle two languages separated by comma', async () => {
      const mockParams = { q: 'test', l: 'en,hi' }

      const result = await service.searchAutoComplete(mockParams)

      expect(result).toEqual([])
      expect(mockSearchApi.getSearchAutoCompleteResults).not.toHaveBeenCalled()
    })

    it('should call API for single language with special characters', async () => {
      const mockParams = { q: 'Test @#$ Query!', l: 'ta' }
      const mockResults = [{ term: 'special chars result', type: 'content' }]
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(of(mockResults))

      const result = await service.searchAutoComplete(mockParams)

      expect(mockSearchApi.getSearchAutoCompleteResults).toHaveBeenCalledWith({
        q: 'test @#$ query!',
        l: 'ta',
      })
      expect(result).toEqual(mockResults)
    })
  })

  describe('API_END_POINTS', () => {
    it('should use correct endpoints for all methods', () => {
      const mockRequest = { test: 'data' }
      mockHttpClient.post.mockReturnValue(of({}))

      service.fetchSearchData(mockRequest)
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        mockRequest
      )

      service.fetchSearchDataByCategory(mockRequest)
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/v4/search',
        mockRequest
      )

      service.fetchSearchDataforCios(mockRequest)
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/cios/v1/search/content',
        mockRequest
      )
    })
  })

  describe('Observable subscription', () => {
    it('should allow multiple subscribers to notifyObservable$', (done) => {
      const testData = { filter: 'test', value: 'data' }
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

  describe('Edge cases and error handling', () => {
    it('should handle null request in fetchSearchData', () => {
      mockHttpClient.post.mockReturnValue(of({ result: {} }))

      service.fetchSearchData(null).subscribe((response: any) => {
        expect(response).toBeDefined()
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        null
      )
    })

    it('should handle undefined sitePath in getSearchConfig', async () => {
      mockConfigSrv.sitePath = undefined
      mockHttpClient.get.mockReturnValue(of({}))

      await service.getSearchConfig()

      expect(mockHttpClient.get).toHaveBeenCalledWith('undefined/feature/search.json')
    })

    it('should handle promise rejection in searchAutoComplete', async () => {
      const mockParams = { q: 'test', l: 'en' }
      const mockError = new Error('API error')
      mockSearchApi.getSearchAutoCompleteResults.mockReturnValue(
        throwError(mockError)
      )

      try {
        await service.searchAutoComplete(mockParams)
        fail('should have rejected')
      } catch (error: any) {
        expect(error).toBeDefined()
      }
    })
  })
})
