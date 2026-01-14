import { of, throwError } from 'rxjs'
import { SeeAllService } from './see-all.service'

// High coverage Jest tests without Angular TestBed

describe('SeeAllService (no TestBed)', () => {
  let httpClientMock: any
  let formSvcMock: any
  let service: SeeAllService

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
    }
    formSvcMock = {
      homeFormReadData: jest.fn(),
    }
    service = new SeeAllService(httpClientMock as any, formSvcMock as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create service instance', () => {
    expect(service).toBeTruthy()
  })

  it('fetchDynamicContent should POST by default', done => {
    const url = '/dynamic'
    const body = { key: 'value' }
    const response = { result: 'ok' }
    httpClientMock.post.mockReturnValue(of(response))

    service.fetchDynamicContent(url, body).subscribe(res => {
      expect(res).toEqual(response)
      const call = httpClientMock.post.mock.calls[0] as any[]
      expect(call[0]).toBe(url)
      expect(call[1]).toBe(body)
      done()
    })
  })

  it('fetchDynamicContent should GET when isGetApi is true', done => {
    const url = '/dynamic-get'
    const response = { result: 'ok' }
    httpClientMock.get.mockReturnValue(of(response))

    service.fetchDynamicContent(url, { key: 'value' }, true).subscribe(res => {
      expect(res).toEqual(response)
      const call = httpClientMock.get.mock.calls[0] as any[]
      expect(call[0]).toBe(url)
      expect(httpClientMock.post).not.toHaveBeenCalled()
      done()
    })
  })

  it('fetchSearchData should POST to SEARCH_V6 endpoint', () => {
    httpClientMock.post.mockReturnValue(of({}))
    const payload = { query: 'text' }

    service.fetchSearchData(payload).subscribe()

    const call = httpClientMock.post.mock.calls[0] as any[]
    expect(call[0]).toBe('/apis/proxies/v8/sunbirdigot/search')
    expect(call[1]).toBe(payload)
  })

  it('trendingContentSearch should default query and POST to trending endpoint', () => {
    httpClientMock.post.mockReturnValue(of({}))
    const req: any = {}

    service.trendingContentSearch(req).subscribe()

    const call = httpClientMock.post.mock.calls[0] as any[]
    expect(call[0]).toBe('apis/proxies/v8/trending/content/search')
    expect(call[1]).toBe(req)
    expect(req.query).toBe('')
  })

  it('microCredentialsSearch should use provided or default URL', () => {
    httpClientMock.get.mockReturnValue(of({}))

    service.microCredentialsSearch('custom-url').subscribe()
    service.microCredentialsSearch(null as any).subscribe()

    const firstCall = httpClientMock.get.mock.calls[0] as any[]
    const secondCall = httpClientMock.get.mock.calls[1] as any[]
    expect(firstCall[0]).toBe('custom-url')
    expect(secondCall[0]).toBe('apis/proxies/v8/promotionalcontent/v1/assignedto/users')
  })

  it('microCredentialsSearchWithoutUrl should GET from default MICRO_CREDENTIALS endpoint', () => {
    httpClientMock.get.mockReturnValue(of({}))

    service.microCredentialsSearchWithoutUrl().subscribe()

    const call = httpClientMock.get.mock.calls[0] as any[]
    expect(call[0]).toBe('apis/proxies/v8/promotionalcontent/v1/assignedto/users')
  })

  it('notifyOther should emit value on notifyObservable$', done => {
    const payload = { key: 'value' }

    service.notifyObservable$.subscribe(data => {
      expect(data).toBe(payload)
      done()
    })

    service.notifyOther(payload)
  })

  it('getSeeAllConfigJson should fetch once and cache config', async () => {
    const configResponse = { data: 'config' }
    formSvcMock.homeFormReadData.mockReturnValue(of(configResponse))

    const first = await service.getSeeAllConfigJson()
    const second = await service.getSeeAllConfigJson('other', 'different')

    expect(first).toEqual(configResponse)
    expect(second).toEqual(configResponse)
    expect(formSvcMock.homeFormReadData).toHaveBeenCalledTimes(1)

    const requestArg = (formSvcMock.homeFormReadData.mock.calls[0] as any[])[0]
    expect(requestArg.request.type).toBe('page')
    expect(requestArg.request.subType).toBe('home')
  })

  it('searchV6 should GET when api.path is present and ensure query default', () => {
    const req: any = { api: { path: '/custom-search' } }
    httpClientMock.get.mockReturnValue(of({}))

    service.searchV6(req).subscribe()

    const call = httpClientMock.get.mock.calls[0] as any[]
    expect(call[0]).toBe('/custom-search')
    expect(req.query).toBe('')
    expect(httpClientMock.post).not.toHaveBeenCalled()
  })

  it('searchV6 should POST to SEARCH_V6 when api.path is missing', () => {
    const req: any = {}
    httpClientMock.post.mockReturnValue(of({}))

    service.searchV6(req).subscribe()

    const call = httpClientMock.post.mock.calls[0] as any[]
    expect(call[0]).toBe('/apis/proxies/v8/sunbirdigot/search')
    expect(call[1]).toBe(req)
    expect(req.query).toBe('')
  })

  it('fetchDesigantionsData should map courseList when present', async () => {
    const courseList = ['c1', 'c2']
    httpClientMock.get.mockReturnValue(of({ result: { courseList } }))

    const outer = await service.fetchDesigantionsData('/designations').toPromise()
    const inner = await outer

    expect(inner).toEqual(courseList)
  })

  it('fetchDesigantionsData should return empty string when courseList missing', async () => {
    httpClientMock.get.mockReturnValue(of({}))

    const outer = await service.fetchDesigantionsData('/designations').toPromise()
    const inner = await outer

    expect(inner).toBe('')
  })

  it('handleError should map ErrorEvent to error message', done => {
    const errLike: any = { error: new ErrorEvent('network', { message: 'failed' }) }

    service.handleError(errLike).subscribe({
      next: () => {
        // not expected
      },
      error: (err: any) => {
        expect(err).toBe('Error: failed')
        done()
      },
    })
  })

  it('getApplicationsById should POST to bulkGetApplicationsById endpoint', () => {
    httpClientMock.post.mockReturnValue(of({}))
    const body = { ids: ['a', 'b'] }

    service.getApplicationsById(body).subscribe()

    const call = httpClientMock.post.mock.calls[0] as any[]
    expect(call[0]).toBe('apis/proxies/v8/forms/v2/bulkGetApplicationsById')
    expect(call[1]).toBe(body)
  })
})
