import { SearchApiService } from './search-api.service'
import { of } from 'rxjs'

describe('SearchApiService', () => {
  let service: SearchApiService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(() => of([])),
      post: jest.fn(() => of({ result: { facets: [], count: 0 }, filters: [] })),
    }
    service = new SearchApiService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getSearchResults posts to social post search', done => {
    const req = { query: 'test' }
    service.getSearchResults(req).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('social/post/search'), req
      )
      done()
    })
  })

  it('getSearchAutoCompleteResults calls http.get with params', done => {
    const params = { q: 'test', l: 'en' }
    service.getSearchAutoCompleteResults(params).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('sunbirdigot/read'), { params }
      )
      done()
    })
  })

  it('getSearchV6Results calls http.post with body', () => {
    const body = { filters: [], query: '' }
    service.getSearchV6Results(body)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('sunbirdigot/search'), body
    )
  })

  it('getSearchV6Results maps response with non-empty facets', done => {
    mockHttp.post.mockReturnValue(of({
      result: {
        facets: [{ name: 'contentType', values: [{ name: 'Course', count: 5 }] }],
        count: 1,
      },
      filters: [],
    }))
    service.getSearchV6Results({}).subscribe((res: any) => {
      expect(res).toBeDefined()
      expect(res.filters).toBeDefined()
      done()
    })
  })

  it('getSearchV4Results calls http.post with body', () => {
    const body = { filters: [], query: '' }
    service.getSearchV4Results(body)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('v4/search'), body
    )
  })

  it('getSearch calls http.post to sunbirdigot endpoint', () => {
    const req: any = { request: { query: 'test', filters: { contentType: ['Course'] } } }
    service.getSearch(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('sunbirdigot'), expect.any(Object)
    )
  })

  it('getSearchV6Results maps catalogPaths filter with single content', done => {
    mockHttp.post.mockReturnValue(of({
      result: {
        facets: [{ name: 'catalogPaths', values: [{ name: 'Cat1', count: 3 }] }],
        count: 1,
      },
      filters: [{ type: 'catalogPaths', content: [{ children: ['child1', 'child2'] }] }],
    }))
    service.getSearchV6Results({}).subscribe((res: any) => {
      expect(res).toBeDefined()
      done()
    })
  })

  it('getSearchV4Results maps response with facets', done => {
    mockHttp.post.mockReturnValue(of({
      result: {
        facets: [{ name: 'primaryCategory', values: [{ name: 'Course', count: 10 }] }],
        count: 1,
      },
      filters: [],
    }))
    service.getSearchV4Results({}).subscribe((res: any) => {
      expect(res).toBeDefined()
      done()
    })
  })

  it('getSearch builds request with locale array', () => {
    const req: any = { request: { query: 'tech', filters: { contentType: ['Course'] } } }
    service.getSearch(req)
    const callBody = mockHttp.post.mock.calls[0][1]
    expect(callBody.locale).toEqual(['en'])
  })
})
