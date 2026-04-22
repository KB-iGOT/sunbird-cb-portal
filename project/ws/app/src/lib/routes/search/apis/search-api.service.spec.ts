import { of, throwError } from 'rxjs'
import { SearchApiService } from './search-api.service'
import { ISocialSearchRequest, ISocialSearchResult, ISearchAutoComplete } from '../models/search.model'
import { NSSearch } from '@sunbird-cb/collection'

describe('SearchApiService', () => {
  let service: SearchApiService
  let httpClientMock: any

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
    }
    service = new SearchApiService(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize with HttpClient', () => {
      expect(service).toBeInstanceOf(SearchApiService)
    })
  })

  describe('getSearchResults', () => {
    it('should call http.post with correct endpoint and request', () => {
      const request: ISocialSearchRequest = {
        query: 'test query',
        filters: {},
      } as any
      const mockResponse: ISocialSearchResult = {
        result: [],
        total: 0,
        filters: [],
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchResults(request).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/social/post/search',
        request
      )
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)
    })

    it('should return social search results', (done) => {
      const request: ISocialSearchRequest = {
        query: 'test query',
        filters: {},
      } as any
      const mockResponse: ISocialSearchResult = {
        result: [{ id: '1', title: 'Test' }] as any,
        total: 1,
        filters: [],
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchResults(request).subscribe((result) => {
        expect(result).toEqual(mockResponse)
        expect(result.total).toBe(1)
        expect(result.result.length).toBe(1)
        done()
      })
    })

    it('should handle empty search results', (done) => {
      const request: ISocialSearchRequest = {
        query: '',
        filters: {},
      } as any
      const mockResponse: ISocialSearchResult = {
        result: [],
        total: 0,
        filters: [],
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchResults(request).subscribe((result) => {
        expect(result.result.length).toBe(0)
        expect(result.total).toBe(0)
        done()
      })
    })

    it('should handle http errors', (done) => {
      const request: ISocialSearchRequest = {
        query: 'test',
        filters: {},
      } as any
      const error = new Error('HTTP Error')

      httpClientMock.post.mockReturnValue(throwError(error))

      service.getSearchResults(request).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })

    it('should handle request with filters', () => {
      const request: ISocialSearchRequest = {
        query: 'test',
        filters: { contentType: ['Resource'] },
      } as any
      const mockResponse: ISocialSearchResult = {
        result: [],
        total: 0,
        filters: [],
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchResults(request).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/social/post/search',
        request
      )
    })
  })

  describe('getSearchAutoCompleteResults', () => {
    it('should call http.get with correct endpoint and params', () => {
      const params = { q: 'test', l: 'en' }
      const mockResponse: ISearchAutoComplete[] = []

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.getSearchAutoCompleteResults(params).subscribe()

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/content/searchAutoComplete',
        { params }
      )
      expect(httpClientMock.get).toHaveBeenCalledTimes(1)
    })

    it('should return autocomplete suggestions', (done) => {
      const params = { q: 'angular', l: 'en' }
      const mockResponse: ISearchAutoComplete[] = [
        { suggestion: 'angular basics' } as any,
        { suggestion: 'angular advanced' } as any,
      ]

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.getSearchAutoCompleteResults(params).subscribe((result) => {
        expect(result).toEqual(mockResponse)
        expect(result.length).toBe(2)
        done()
      })
    })

    it('should return empty array when no suggestions', (done) => {
      const params = { q: 'xyz', l: 'en' }
      const mockResponse: ISearchAutoComplete[] = []

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.getSearchAutoCompleteResults(params).subscribe((result) => {
        expect(result).toEqual([])
        expect(result.length).toBe(0)
        done()
      })
    })

    it('should handle different languages', () => {
      const params = { q: 'test', l: 'hi' }
      const mockResponse: ISearchAutoComplete[] = []

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.getSearchAutoCompleteResults(params).subscribe()

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/content/searchAutoComplete',
        { params: { q: 'test', l: 'hi' } }
      )
    })

    it('should handle http errors', (done) => {
      const params = { q: 'test', l: 'en' }
      const error = new Error('HTTP Error')

      httpClientMock.get.mockReturnValue(throwError(error))

      service.getSearchAutoCompleteResults(params).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })

    it('should handle empty query', () => {
      const params = { q: '', l: 'en' }
      const mockResponse: ISearchAutoComplete[] = []

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.getSearchAutoCompleteResults(params).subscribe()

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/content/searchAutoComplete',
        { params }
      )
    })
  })

  describe('getSearchV6Results', () => {
    it('should call http.post with correct endpoint and body', () => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = []
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [],
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        body
      )
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)
    })

    it('should transform response with empty facets', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = []
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [],
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters).toBeDefined()
        expect(result.filters.length).toBe(0)
        done()
      })
    })

    it('should transform response with facets and searchconfig', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = [
        {
          name: 'contentType',
          values: [
            { name: 'Resource', count: 10 },
            { name: 'Course', count: 5 },
          ],
        },
        {
          name: 'complexityLevel',
          values: [
            { name: 'Beginner', count: 8 },
          ],
        },
      ]
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [{ name: 'contentType' }, { name: 'complexityLevel' }] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters).toBeDefined()
        expect(result.filters.length).toBe(2)
        expect(result.filters[0].displayName).toBe('contentType')
        expect(result.filters[0].type).toBe('contentType')
        expect(result.filters[0].content.length).toBe(2)
        expect(result.filters[0].content[0].displayName).toBe('Resource')
        expect(result.filters[0].content[0].count).toBe(10)
        expect(result.filters[1].displayName).toBe('complexityLevel')
        expect(result.filters[1].content.length).toBe(1)
        done()
      })
    })

    it('should handle searchconfig with no values', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = [
        {
          name: 'emptyFilter',
          values: [],
        },
      ]
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [{ name: 'emptyFilter' }] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters).toBeDefined()
        expect(result.filters.length).toBe(1)
        expect(result.filters[0].content.length).toBe(0)
        done()
      })
    })

    it('should handle catalogPaths filter with single content', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = [
        {
          name: 'catalogPaths',
          values: [
            {
              name: 'Parent',
              count: 1,
              children: [
                { name: 'Child1', count: 5 },
                { name: 'Child2', count: 3 },
              ],
            },
          ],
        },
      ]
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [{ name: 'catalogPaths' }] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters).toBeDefined()
        const catalogFilter = result.filters.find((f: any) => f.type === 'catalogPaths')
        expect(catalogFilter).toBeDefined()
        expect(catalogFilter?.content.length).toBe(2)
        expect(catalogFilter?.content[0].displayName).toBe('Child1')
        expect(catalogFilter?.content[1].displayName).toBe('Child2')
        done()
      })
    })

    it('should not modify catalogPaths filter when content length is not 1', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = [
        {
          name: 'catalogPaths',
          values: [
            { name: 'Path1', count: 5 },
            { name: 'Path2', count: 3 },
          ],
        },
      ]
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [{ name: 'catalogPaths' }] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters).toBeDefined()
        const catalogFilter = result.filters.find((f: any) => f.type === 'catalogPaths')
        expect(catalogFilter).toBeDefined()
        expect(catalogFilter?.content.length).toBe(2)
        expect(catalogFilter?.content[0].displayName).toBe('Path1')
        expect(catalogFilter?.content[1].displayName).toBe('Path2')
        done()
      })
    })

    it('should handle catalogPaths filter without children', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = [
        {
          name: 'catalogPaths',
          values: [
            { name: 'Parent', count: 1 },
          ],
        },
      ]
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [{ name: 'catalogPaths' }] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters).toBeDefined()
        const catalogFilter = result.filters.find((f: any) => f.type === 'catalogPaths')
        expect(catalogFilter).toBeDefined()
        expect(catalogFilter?.content).toEqual([])
        done()
      })
    })

    it('should handle multiple filters including catalogPaths', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = [
        {
          name: 'contentType',
          values: [{ name: 'Resource', count: 10 }],
        },
        {
          name: 'catalogPaths',
          values: [
            {
              name: 'Parent',
              count: 1,
              children: [{ name: 'Child', count: 5 }],
            },
          ],
        },
        {
          name: 'duration',
          values: [{ name: 'Short', count: 7 }],
        },
      ]
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [
            { name: 'contentType' },
            { name: 'catalogPaths' },
            { name: 'duration' },
          ] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters.length).toBe(3)
        const catalogFilter = result.filters.find((f: any) => f.type === 'catalogPaths')
        expect(catalogFilter?.content.length).toBe(1)
        expect(catalogFilter?.content[0].displayName).toBe('Child')
        done()
      })
    })

    it('should handle http errors', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = []
      const error = new Error('HTTP Error')

      httpClientMock.post.mockReturnValue(throwError(error))

      service.getSearchV6Results(body, searchConfig).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })

    it('should handle empty searchConfig with facets', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = []
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [{ name: 'someFilter' }] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters).toBeDefined()
        expect(result.filters.length).toBe(0)
        done()
      })
    })

    it('should preserve original response data', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = []
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [],
          content: [{ id: '1', name: 'Content1' }] as any,
          count: 1,
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.result.content.length).toBe(1)
        expect(result.result.count).toBe(1)
        done()
      })
    })

    it('should handle complex nested searchConfig structure', (done) => {
      const body: NSSearch.ISearchV6RequestV2 = {
        request: {
          query: 'test',
          filters: {},
        },
      } as any
      const searchConfig: any = [
        {
          name: 'category',
          values: [
            { name: 'Tech', count: 10 },
            { name: 'Business', count: 8 },
            { name: 'Design', count: 6 },
          ],
        },
      ]
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = {
        result: {
          facets: [{ name: 'category' }] as any,
          content: [],
        },
      } as any

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSearchV6Results(body, searchConfig).subscribe((result) => {
        expect(result.filters.length).toBe(1)
        expect(result.filters[0].content.length).toBe(3)
        expect(result.filters[0].content[0].type).toBe('Tech')
        expect(result.filters[0].content[1].type).toBe('Business')
        expect(result.filters[0].content[2].type).toBe('Design')
        done()
      })
    })
  })
})
