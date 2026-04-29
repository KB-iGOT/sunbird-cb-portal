import { PersonProfileService } from './person-profile.service'
import { of } from 'rxjs'

jest.mock('@sunbird-cb/collection', () => ({
  NsPlaylist: {},
  NsGoal: { EGoalTypes: { COMMON: 'common', MY: 'my' } },
  NsDiscussionForum: {},
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class {
    hostPath = 'localhost'
  },
}), { virtual: true })

describe('PersonProfileService', () => {
  let service: PersonProfileService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(() => of({ data: [] })),
      post: jest.fn(() => of({ data: [] })),
    }
    mockConfigSvc = { hostPath: 'localhost' }
    service = new PersonProfileService(mockHttp, mockConfigSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchUserInterestsV2 calls http.get with wid', () => {
    service.fetchUserInterestsV2('user123')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('wid=user123'))
  })

  it('lastlearnt calls http.get with pageSize=20', () => {
    service.lastlearnt()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('pageSize=20'))
  })

  it('getFollowers calls http.post without pageState', () => {
    service.getFollowers('user1', 10)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('getFollowersv3'),
      { fetchSize: 10, id: 'user1' }
    )
  })

  it('getFollowers calls http.post with pageState', () => {
    service.getFollowers('user1', 10, 'page_token_abc')
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('getFollowersv3'),
      { fetchSize: 10, id: 'user1', followersPageState: 'page_token_abc' }
    )
  })

  it('fetchdetails calls http.post with wid', () => {
    service.fetchdetails('user1')
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('detailV3'),
      { wid: 'user1' }
    )
  })

  it('getFollowingv3 calls http.post with params', () => {
    service.getFollowingv3('user1', true, false, 'user')
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('getFollowingv3'),
      { type: 'user', id: 'user1' },
      expect.any(Object)
    )
  })

  it('getFollowing calls http.get with type when provided', () => {
    service.getFollowing('user1', 'user')
    expect(mockHttp.get).toHaveBeenCalledWith(
      expect.stringContaining('type=user')
    )
  })

  it('getFollowing calls http.get without type', () => {
    service.getFollowing('user1')
    expect(mockHttp.get).toHaveBeenCalledWith(
      expect.stringContaining('wid=user1')
    )
  })

  it('getPlaylists calls http.get with wid param', () => {
    service.getPlaylists('user1')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('wid=user1'))
  })

  it('getUserGoals calls http.get with type, sourceFields, wid', () => {
    service.getUserGoals('common' as any, 'name,id', 'user1')
    expect(mockHttp.get).toHaveBeenCalledWith(
      expect.stringContaining('common')
    )
  })

  it('fetchTimelineDataProfile calls http.post with wid in URL', () => {
    const req: any = { pgNo: 0, pgSize: 10 }
    service.fetchTimelineDataProfile('user1', req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('wid=user1'), req
    )
  })

  it('wid BehaviorSubject starts as empty string', done => {
    service.wid.subscribe(val => {
      expect(val).toBe('')
      done()
    })
  })

  it('isfollowevent is an EventEmitter', () => {
    expect(service.isfollowevent).toBeDefined()
    expect(typeof service.isfollowevent.emit).toBe('function')
  })
})
