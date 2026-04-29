import { ForumService } from './forum.service'
import { of, throwError } from 'rxjs'

jest.mock('../models/SocialForumposts.model', () => ({
  SocialForum: {
    EForumKind: { FORUM: 'FORUM' },
    EForumViewType: { ACTIVEALL: 'ACTIVEALL' },
  },
}), { virtual: true })

describe('ForumService', () => {
  let service: ForumService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(() => of({})),
      get: jest.fn(() => of({})),
    }
    service = new ForumService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchTimelineData posts to SOCIAL_TIMELINE', () => {
    const req: any = { pgNo: 0, pgSize: 10 }
    service.fetchTimelineData(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/social/post/timeline'), req
    )
  })

  it('fetchModeratorTimelineData posts to SOCIAL_MODERATOR_TIMELINE', () => {
    const req: any = { type: 'PENDING' }
    service.fetchModeratorTimelineData(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/social/moderator/timeline'), req
    )
  })

  it('fetchForums posts to SOCIAL_FORUMVIEW', () => {
    const req: any = { pgNo: 0, pgSize: 20 }
    service.fetchForums(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/social/forum/forumTimeline'), req
    )
  })

  it('fetchMyPosts posts to SOCIAL_TIMELINE', () => {
    const req: any = { wid: 'u1' }
    service.fetchMyPosts(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/social/post/timeline'), req
    )
  })

  it('fetchAdminTimelineData posts to SOCIAL_ADMIN_TIMELINE', () => {
    const req: any = { postKind: 'BLOG' }
    service.fetchAdminTimelineData(req)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/social/admin/timeline'), req
    )
  })

  it('fetchForumById posts to SOCIAL_FORUM_BY_ID with id', () => {
    service.fetchForumById('forum123')
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/social/viewForum'), { id: 'forum123' }
    )
  })

  it('getForumsDetails returns observable and calls fetchForums internally', done => {
    const mockResponse = { result: [] }
    mockHttp.post.mockReturnValue(of(mockResponse))
    const req: any = { pgNo: 0, pgSize: 20 }
    service.getForumsDetails(req).subscribe(data => {
      expect(data).toEqual(mockResponse)
      done()
    })
  })

  it('getForumsDetails handles error from http', done => {
    mockHttp.post.mockReturnValue(throwError(() => new Error('Network error')))
    const req: any = { pgNo: 0, pgSize: 20 }
    service.getForumsDetails(req).subscribe(data => {
      // error case emits undefined
      expect(data).toBeUndefined()
      done()
    })
  })
})
