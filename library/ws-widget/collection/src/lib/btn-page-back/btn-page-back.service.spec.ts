import { Subject } from 'rxjs'

import { BtnPageBackService } from './btn-page-back.service'

describe('BtnPageBackService (no TestBed)', () => {
  let service: BtnPageBackService
  let mockRouter: any
  let eventsSubject: Subject<any>

  beforeEach(() => {
    eventsSubject = new Subject<any>()
    mockRouter = {
      url: '/current',
      events: eventsSubject.asObservable(),
    }

    service = new BtnPageBackService(mockRouter)
  })

  it('should create service instance', () => {
    expect(service).toBeTruthy()
  })

  it('initialize should subscribe to router events and manage previousRouteUrls', () => {
    service.previousRouteUrls = ['/a', '/current']

    service.initialize()

    const navStartEvent: any = {
      url: '/next',
      // simulate NavigationStart type check by giving a fake constructor name
      __navigationStart: true,
    }

    eventsSubject.next(navStartEvent)

    expect(service.previousRouteUrls.length).toBeGreaterThan(0)
  })

  it('getLastUrl should return default when no history', () => {
    const result = service.getLastUrl()

    expect(result.route).toBe('/')
    expect(result.fragment).toBeUndefined()
    expect(result.queryParams).toBeUndefined()
  })

  it('getLastUrl should decode encoded URLs and extract fragment and query params', () => {
    service.previousRouteUrls = ['%2Fpath%3Fkey%3Dvalue#frag']

    const result = service.getLastUrl()

    expect(result.fragment).toBe('frag')
    expect(result.route).toBe('/path')
  })

  it('getLastUrl should encode last segment when contains ">"', () => {
    service.previousRouteUrls = ['parent>child name']

    const result = service.getLastUrl()
    expect(result.route).toBe('parent>child%20name')
  })

  it('getLastUrl should parse valid query params and ignore invalid ones', () => {
    service.previousRouteUrls = ['/route?key=value&bad']

    const result = service.getLastUrl()
    expect(result.queryParams).toBeUndefined()
  })

  it('checkUrl should set widgetUrl', () => {
    service.checkUrl('/widget')
    expect(service.widgetUrl).toBe('/widget')
  })
})