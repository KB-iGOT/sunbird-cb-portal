import { of } from 'rxjs'

jest.mock('../models/profile-v2.model', () => ({ NSProfileDataV2: {} }), { virtual: true })

import { ProfileV2UtillService } from './profile-v2-utill.service'

describe('ProfileV2UtillService', () => {
  let service: ProfileV2UtillService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
    }
    service = new ProfileV2UtillService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchBadges should GET badges for a given wid', done => {
    const mockResponse = { badges: [] }
    mockHttp.get.mockReturnValue(of(mockResponse))

    service.fetchBadges('user-123').subscribe(res => {
      expect(res).toEqual(mockResponse)
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/badge/for/user-123',
      )
      done()
    })
  })

  it('reCalculateBadges should POST to badge update endpoint', done => {
    const mockResponse = { success: true }
    mockHttp.post.mockReturnValue(of(mockResponse))

    service.reCalculateBadges().subscribe(res => {
      expect(res).toEqual(mockResponse)
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/badge/update',
        {},
      )
      done()
    })
  })

  it('fetchRecentBadge should GET recent badge notifications', done => {
    const mockNotifications = { notifications: [] }
    mockHttp.get.mockReturnValue(of(mockNotifications))

    service.fetchRecentBadge().subscribe(res => {
      expect(res).toEqual(mockNotifications)
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/badge/notification',
      )
      done()
    })
  })
})
