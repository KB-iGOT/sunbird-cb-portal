import { ForumHandlerService } from './forum-handler.service'

jest.mock('../../models/SocialForumposts.model', () => ({
  SocialForum: {
    ETimelineType: { ALL: 'ALL', FOLLOWING: 'FOLLOWING', TRENDING: 'TRENDING' },
    EPostKind: { BLOG: 'BLOG', QUERY: 'QUERY', UPDATE: 'UPDATE' },
  },
}), { virtual: true })

describe('ForumHandlerService', () => {
  let service: ForumHandlerService

  beforeEach(() => {
    service = new ForumHandlerService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('dataStr starts as empty array', done => {
    service.dataStr.subscribe(val => {
      expect(val).toEqual([])
      done()
    })
  })

  it('sendMessage emits data', done => {
    const data = [{ id: 1 }, { id: 2 }]
    service.dataStr.subscribe(val => {
      if (val.length > 0) {
        expect(val).toEqual(data)
        done()
      }
    })
    service.sendMessage(data)
  })

  it('sendFilterStatus sets filterStatus and filterStatusDataReceived', () => {
    service.sendFilterStatus(true)
    expect(service.filterStatus).toBe(true)
    expect(service.filterStatusDataReceived).toBe(true)

    service.sendFilterStatus(false)
    expect(service.filterStatus).toBe(false)
  })

  it('sendReasonOfFlagging sets reasonoOfFlagging', () => {
    service.sendReasonOfFlagging('Spam')
    expect(service.reasonoOfFlagging).toBe('Spam')
  })

  it('sendStatusOfPredefinedFilter sets predefinedFiltersExist', () => {
    service.sendStatusOfPredefinedFilter(true)
    expect(service.predefinedFiltersExist).toBe(true)

    service.sendStatusOfPredefinedFilter(false)
    expect(service.predefinedFiltersExist).toBe(false)
  })

  it('sendPredinedFilterSelected emits the timeline type', done => {
    let emitCount = 0
    service.predefinedFilterSelected.subscribe(val => {
      emitCount++
      if (emitCount === 2) {
        expect(val).toBe('FOLLOWING')
        done()
      }
    })
    service.sendPredinedFilterSelected('FOLLOWING' as any)
  })

  it('sendPredefinedAdminFilterSelected emits admin filter array', done => {
    let emitCount = 0
    const filters = ['BLOG', 'QUERY'] as any[]
    service.predefinedAdminFilterSelected.subscribe(val => {
      emitCount++
      if (emitCount === 2) {
        expect(val).toEqual(filters)
        done()
      }
    })
    service.sendPredefinedAdminFilterSelected(filters as any)
  })

  it('setActiveComponent emits the component name', done => {
    let emitCount = 0
    service.componentActive.subscribe(val => {
      emitCount++
      if (emitCount === 2) {
        expect(val).toBe('mypost')
        done()
      }
    })
    service.setActiveComponent('mypost')
  })

  it('filterStatus defaults to false', () => {
    expect(service.filterStatus).toBe(false)
  })

  it('reasonOfRejection defaults to empty string', () => {
    expect(service.reasonOfRejection).toBe('')
  })
})
