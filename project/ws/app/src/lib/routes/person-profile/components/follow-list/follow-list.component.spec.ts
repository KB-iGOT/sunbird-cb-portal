import { BehaviorSubject, of, throwError } from 'rxjs'
import { FollowListComponent } from './follow-list.component'

describe('FollowListComponent', () => {
  let component: FollowListComponent
  let personprofileSvc: any

  const followers = ['u1', 'u2', 'u3', 'u4', 'u5'].map(id => ({ id })) as any

  beforeEach(() => {
    personprofileSvc = {
      isfollowevent: new BehaviorSubject(false),
      getFollowers: jest.fn(() => of({ person: { data: followers } })),
    }
    component = new FollowListComponent(personprofileSvc, { userProfile: { userId: 'me' } } as any)
    component.wid = 'user-1'
    component.followers = followers
  })

  it('initializes followers and current user', () => {
    component.ngOnInit()
    expect(component.currentUserId).toBe('me')
    expect(component.isInitialized).toBe(true)
    expect(component.followerCurrentDisplay).toEqual(followers.slice(0, 4))
    expect(component.previousFollowersDisable).toBe(true)
  })

  it('reacts to wid changes after initialization', () => {
    component.isInitialized = true
    component.ngOnChanges({ wid: { currentValue: 'user-2', previousValue: 'user-1' } } as any)
    expect(component.wid).toBe('user-2')
    expect(component.followerCurrentDisplay).toEqual(followers.slice(0, 4))
  })

  it('fetches followers from api and handles errors', () => {
    component.fetchFollowerApi()
    expect(personprofileSvc.getFollowers).toHaveBeenCalledWith('user-1', 0)
    expect(component.followersFetchStatus).toBe('done')
    expect(component.followerCurrentDisplay).toEqual(followers.slice(0, 4))

    personprofileSvc.getFollowers.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.fetchFollowerApi()
    expect(component.followersFetchStatus).toBe('error')
  })

  it('paginates followers forward and backward', () => {
    component.fetchFollowers()
    component.fetchNextFollowers()
    expect(component.followerCurrentDisplay).toEqual(followers.slice(4, 8))
    expect(component.nextFollowersDisable).toBe(true)

    component.fetchPreviousFollowers()
    expect(component.followerCurrentDisplay).toEqual(followers.slice(0, 4))
    expect(component.previousFollowersDisable).toBe(true)
  })

  it('refreshes on follow event', () => {
    personprofileSvc.isfollowevent.next(true)
    expect(personprofileSvc.getFollowers).toHaveBeenCalled()
    expect(component.nextFollowersDisable).toBe(false)
    expect(component.previousFollowersDisable).toBe(false)
  })
})
