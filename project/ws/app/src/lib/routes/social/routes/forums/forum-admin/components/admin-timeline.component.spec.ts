import { BehaviorSubject, of, throwError } from 'rxjs'
import { AdminTimelineComponent } from './admin-timeline.component'

describe('AdminTimelineComponent', () => {
  let component: AdminTimelineComponent
  let emitter: any
  let forumSvc: any

  const response = { hits: 2, result: [{ id: 'p1' }] }

  beforeEach(() => {
    emitter = {
      predefinedAdminFilterSelected: new BehaviorSubject(['Blog']),
      sendFilterStatus: jest.fn(),
      sendStatusOfPredefinedFilter: jest.fn(),
      setActiveComponent: jest.fn(),
    }
    forumSvc = { fetchAdminTimelineData: jest.fn(() => of(response)) }
    component = new AdminTimelineComponent(
      emitter,
      forumSvc,
      { pageNavBar: { color: 'blue' } } as any,
      { isXSmall$: of(false) } as any,
    )
  })

  it('initializes emitter flags and fetches flagged timeline', () => {
    expect(emitter.sendFilterStatus).toHaveBeenCalledWith(false)
    expect(emitter.sendStatusOfPredefinedFilter).toHaveBeenCalledWith(false)

    component.ngOnInit()

    expect(emitter.setActiveComponent).toHaveBeenCalledWith('AdminTimelineComponent')
    expect(component.adminTimelineFlaggedResponse.result).toEqual([{ id: 'p1' }])
    expect(component.timelineFetchStatus).toBe('hasMore')
  })

  it('switches tabs and fetches deleted timeline', () => {
    component.tabClick({ index: 1 })
    expect(component.activeTab).toBe('DeletedTab')
    expect(component.adminTimelineDeletedResponse.result).toEqual([{ id: 'p1' }])

    component.tabClick({ index: 0 })
    expect(component.activeTab).toBe('FLaggedTab')
  })

  it('marks posts hidden from child events', () => {
    component.adminTimelineFlaggedResponse.result = [{ id: 'p1' }, { id: 'p2' }] as any
    component.receiveMessage('p2')
    expect(component.adminTimelineFlaggedResponse.result[1].hidden).toBe(true)

    component.adminTimelineDeletedResponse.result = [{ id: 'd1' }] as any
    component.updateDletedPost('d1')
    expect(component.adminTimelineDeletedResponse.result[0].hidden).toBe(true)
  })

  it('handles empty, done and error timeline states', () => {
    component.timelineFetchStatus = 'done'
    component.fetchTimelineData()
    expect(forumSvc.fetchAdminTimelineData).not.toHaveBeenCalled()

    component.timelineFetchStatus = 'none'
    forumSvc.fetchAdminTimelineData.mockReturnValueOnce(of({ hits: 0, result: null }))
    component.fetchTimelineData()
    expect(component.timelineFetchStatus).toBe('none')

    forumSvc.fetchAdminTimelineData.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.getAdminDeletedPosts()
    expect(component.timelineFetchStatus).toBe('error')
  })
})
