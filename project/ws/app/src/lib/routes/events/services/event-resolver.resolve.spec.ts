import { of, throwError } from 'rxjs'

jest.mock('@angular/core', () => ({ Injectable: () => (target: any) => target }), { virtual: true })
jest.mock('@angular/router', () => ({
  ActivatedRouteSnapshot: jest.fn(),
  RouterStateSnapshot: jest.fn(),
}), { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({
  IResolveResponse: jest.fn(),
  NsContent: {},
}), { virtual: true })
jest.mock('./events.service', () => ({
  EventService: jest.fn(),
}), { virtual: true })

import { EventResolve } from './event-resolver.resolve'

describe('EventResolve', () => {
  let resolver: EventResolve
  let mockEventSvc: any

  beforeEach(() => {
    mockEventSvc = {
      getEventData: jest.fn(),
    }
    resolver = new EventResolve(mockEventSvc)
  })

  it('should create', () => {
    expect(resolver).toBeTruthy()
  })

  it('should extract eventId from URL with do_ prefix and call getEventData', (done) => {
    const eventId = 'do_12345'
    const mockEvent = { id: eventId, name: 'Test Event' }
    mockEventSvc.getEventData.mockReturnValue(
      of({ result: { event: mockEvent } })
    )
    const route: any = {}
    const state: any = { url: `/app/events/${eventId}/overview` }

    resolver.resolve(route, state)!.subscribe(result => {
      expect(mockEventSvc.getEventData).toHaveBeenCalledWith(eventId)
      expect(result.data).toEqual(mockEvent)
      expect(result.error).toBe('mimeTypeMismatch')
      done()
    })
  })

  it('should return empty eventId when URL has no do_ segment', (done) => {
    const mockEvent = { id: '', name: 'Some Event' }
    mockEventSvc.getEventData.mockReturnValue(
      of({ result: { event: mockEvent } })
    )
    const route: any = {}
    const state: any = { url: '/app/events/overview' }

    resolver.resolve(route, state)!.subscribe(result => {
      expect(mockEventSvc.getEventData).toHaveBeenCalledWith('')
      expect(result.data).toEqual(mockEvent)
      done()
    })
  })

  it('should handle multiple do_ segments and take the last one', (done) => {
    mockEventSvc.getEventData.mockReturnValue(
      of({ result: { event: {} } })
    )
    const route: any = {}
    const state: any = { url: '/app/do_111/events/do_222/overview' }

    resolver.resolve(route, state)!.subscribe(() => {
      expect(mockEventSvc.getEventData).toHaveBeenCalledWith('do_222')
      done()
    })
  })

  it('should return observable with error when getEventData fails', (done) => {
    const error = new Error('Network error')
    mockEventSvc.getEventData.mockReturnValue(throwError(error))
    const route: any = {}
    const state: any = { url: `/app/events/do_999/overview` }

    resolver.resolve(route, state)!.subscribe(result => {
      expect(result.error).toBe(error)
      expect(result.data).toBeNull()
      done()
    })
  })

  it('should return an observable', () => {
    mockEventSvc.getEventData.mockReturnValue(of({ result: { event: {} } }))
    const route: any = {}
    const state: any = { url: '/app/events/do_abc' }
    const result = resolver.resolve(route, state)
    expect(result).toBeDefined()
    expect(typeof result!.subscribe).toBe('function')
  })
})
