import { ContentReadResolverService } from './content-read-resolver.service'
import { of, throwError } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({ IResolveResponse: {} }), { virtual: true })

describe('ContentReadResolverService', () => {
  let service: ContentReadResolverService
  let mockHttp: any

  beforeEach(() => {
    localStorage.setItem('websiteLanguage', 'en')
    mockHttp = { post: jest.fn(() => of({ result: [] })) }
    service = new ContentReadResolverService(mockHttp)
  })

  afterEach(() => { localStorage.clear() })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('resolve calls http.post and wraps in data/error response', done => {
    const mockData = { contentPartners: [] }
    mockHttp.post.mockReturnValue(of(mockData))
    service.resolve({} as any, {} as any).subscribe(res => {
      expect(res.data).toEqual(mockData)
      expect(res.error).toBeNull()
      done()
    })
  })

  it('resolve returns error object on http failure', done => {
    const err = new Error('Network error')
    mockHttp.post.mockReturnValue(throwError(() => err))
    service.resolve({} as any, {} as any).subscribe(res => {
      expect(res.data).toBeNull()
      expect(res.error).toBeTruthy()
      done()
    })
  })

  it('resolve calls POST to contentpartner search endpoint', () => {
    service.resolve({} as any, {} as any).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(
      '/apis/proxies/v8/contentpartner/v1/search',
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('resolve passes filterCriteriaMap with isActive=true', () => {
    service.resolve({} as any, {} as any).subscribe()
    const callBody = mockHttp.post.mock.calls[0][1]
    expect(callBody.filterCriteriaMap.isActive).toBe(true)
  })
})
