import { SocialSearchService } from './social-search.service'
import { of } from 'rxjs'

jest.mock('@angular/common/http', () => ({
  HttpClient: class { },
}), { virtual: true })

describe('SocialSearchService', () => {
  let service: SocialSearchService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = { post: jest.fn(() => of({ results: [] })) }
    service = new SocialSearchService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchSearchTimelineData calls http.post with request body', () => {
    const req: any = { query: 'test', filters: {} }
    service.fetchSearchTimelineData(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('social/post/search'), req
    )
  })

  it('fetchSearchTimelineData returns observable', done => {
    const req: any = { query: 'hello' }
    service.fetchSearchTimelineData(req).subscribe(res => {
      expect(res).toBeDefined()
      done()
    })
  })

  it('fetchSearchTimelineData posts to protected v8 endpoint', () => {
    const req: any = { query: 'social' }
    service.fetchSearchTimelineData(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/apis/protected/v8'), req
    )
  })
})
