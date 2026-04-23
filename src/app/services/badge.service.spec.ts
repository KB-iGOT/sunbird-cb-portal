import { BadgeService } from './badge.service'
import { of } from 'rxjs'

describe('BadgeService', () => {
  let service: BadgeService
  let httpMock: any

  beforeEach(() => {
    httpMock = {
      post: jest.fn(),
    }
    service = new BadgeService(httpMock as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('fetchBadgeDetails', () => {
    it('should call http.post with BADGE_DETAILS endpoint and requestBody', () => {
      const requestBody = { userId: 'user1', badgeType: 'gold' }
      const mockResponse = { badges: [] }
      httpMock.post.mockReturnValue(of(mockResponse))

      const result$ = service.fetchBadgeDetails(requestBody)

      result$.subscribe(res => {
        expect(res).toEqual(mockResponse)
      })
      expect(httpMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/user/v1/badge/details',
        requestBody
      )
    })

    it('should return observable from http.post', () => {
      const mockResponse = { result: 'success' }
      httpMock.post.mockReturnValue(of(mockResponse))

      let result: any
      service.fetchBadgeDetails({}).subscribe(res => (result = res))
      expect(result).toEqual(mockResponse)
    })
  })

  describe('generateBadge', () => {
    it('should call http.post with BADGE_DOWNLOAD endpoint and correct options', () => {
      const data = { badgeId: 'b1', userId: 'u1' }
      const mockResponse = { url: 'https://example.com/badge.pdf' }
      httpMock.post.mockReturnValue(of(mockResponse))

      const result$ = service.generateBadge(data)

      result$.subscribe(res => {
        expect(res).toEqual(mockResponse)
      })
      expect(httpMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/badge/dynamic/v1/generate',
        data,
        expect.objectContaining({
          withCredentials: true,
        })
      )
    })

    it('should include Content-Type application/json header', () => {
      httpMock.post.mockReturnValue(of({}))

      service.generateBadge({}).subscribe()

      const callArgs = httpMock.post.mock.calls[0]
      const options = callArgs[2]
      const headerValue = options.headers.get('Content-Type')
      expect(headerValue).toBe('application/json')
    })

    it('should set withCredentials to true', () => {
      httpMock.post.mockReturnValue(of({}))

      service.generateBadge({}).subscribe()

      const callArgs = httpMock.post.mock.calls[0]
      const options = callArgs[2]
      expect(options.withCredentials).toBe(true)
    })

    it('should return observable from http.post', () => {
      const mockResponse = { status: 'done' }
      httpMock.post.mockReturnValue(of(mockResponse))

      let result: any
      service.generateBadge({ id: 'test' }).subscribe(res => (result = res))
      expect(result).toEqual(mockResponse)
    })
  })
})
