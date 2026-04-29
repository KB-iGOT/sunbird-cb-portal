import { RatingService } from './rating.service'
import { of } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({ ConfigurationsService: class { } }), { virtual: true })
jest.mock('@sunbird-cb/toc', () => ({ NsAppRating: {} }), { virtual: true })

describe('RatingService', () => {
  let service: RatingService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(() => of({ result: [] })),
      post: jest.fn(() => of({ result: [] })),
    }
    service = new RatingService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getRating calls http.get for normal URL', () => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app/toc' }, writable: true })
    service.getRating('content1', 'Resource', 'user1')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('content1'))
  })

  it('addOrUpdateRating calls http.post to upsert endpoint', () => {
    const req: any = { contentId: 'c1', rating: 4 }
    service.addOrUpdateRating(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('ratings/v1/upsert'), req
    )
  })

  it('getRatingSummary calls http.get with contentId and type (non-preview)', () => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app/toc' }, writable: true })
    service.getRatingSummary('c1', 'Resource')
    expect(mockHttp.get).toHaveBeenCalledWith(
      expect.stringContaining('c1')
    )
  })

  it('getRatingLookup calls http.post to ratingLookUp endpoint', () => {
    const req: any = { contentId: 'c1' }
    service.getRatingLookup(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('ratingLookUp'), req
    )
  })

  it('getRatingReply calls http.post to ratings/v2/read', () => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
    const req: any = { contentId: 'c1' }
    service.getRatingReply(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('ratings/v2/read'), req
    )
  })

  it('getAuthorReply calls http.get with contentId and userId', () => {
    service.getAuthorReply('c1', 'u1')
    expect(mockHttp.get).toHaveBeenCalledWith(
      expect.stringContaining('c1')
    )
  })

  describe('getRatingIcon', () => {
    it('returns star when ratingIndex <= floor(avg)', () => {
      expect(service.getRatingIcon(3, 3.5)).toBe('star')
    })
    it('returns star_half when decimal part between 0.29 and 0.71', () => {
      expect(service.getRatingIcon(4, 3.5)).toBe('star_half')
    })
    it('returns star when ratingIndex is beyond range', () => {
      expect(service.getRatingIcon(5, 3.8)).toBe('star')
    })
    it('returns star when avg is 0 (falsy)', () => {
      expect(service.getRatingIcon(3, 0)).toBe('star')
    })
  })

  describe('getRatingIconClass', () => {
    it('returns true when ratingIndex <= floor(avg)', () => {
      expect(service.getRatingIconClass(3, 4)).toBe(true)
    })
    it('returns false when avg is 0', () => {
      expect(service.getRatingIconClass(5, 0)).toBe(false)
    })
    it('returns true when decimal part between 0.29 and 0.71', () => {
      expect(service.getRatingIconClass(4, 3.5)).toBe(true)
    })
    it('returns true when decimal > 0.71', () => {
      expect(service.getRatingIconClass(4, 3.8)).toBe(true)
    })
    it('returns false when decimal < 0.29', () => {
      expect(service.getRatingIconClass(4, 3.1)).toBe(false)
    })
  })
})

