import { BrowseProviderService } from './browse-provider.service'
import { of } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({ NsContent: {} }), { virtual: true })

describe('BrowseProviderService', () => {
  let service: BrowseProviderService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(() => of({ result: [] })),
      get: jest.fn(() => of({ result: [] })),
    }
    service = new BrowseProviderService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchSearchData posts to SEARCH_V6 and returns observable', done => {
    const req = { query: 'test' }
    service.fetchSearchData(req).subscribe(res => {
      expect(res).toBeDefined()
      done()
    })
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('sunbirdigot/search'), req
    )
  })

  it('fetchSearchData sets displayLoader$ true then false after finalize', done => {
    const loaderValues: boolean[] = []
    service.isLoading().subscribe(v => loaderValues.push(v))
    mockHttp.post.mockReturnValue(of({}))
    service.fetchSearchData({}).subscribe(() => {
      expect(loaderValues).toContain(true)
      done()
    })
  })

  it('fetchSearchV4Data posts to SEARCH_V4', done => {
    const req = { query: 'test' }
    service.fetchSearchV4Data(req).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('v4/search'), req
      )
      done()
    })
  })

  it('fetchAllProviders calls http.get on ALL_PROVIDERS', done => {
    service.fetchAllProviders({}).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('searchBy/provider')
      )
      done()
    })
  })

  it('notifyOther emits data through notifyObservable$', done => {
    service.notifyObservable$.subscribe(data => {
      expect(data).toEqual({ filter: 'removed' })
      done()
    })
    service.notifyOther({ filter: 'removed' })
  })

  it('notifyOther does not emit when data is falsy', () => {
    const spy = jest.fn()
    service.notifyObservable$.subscribe(spy)
    service.notifyOther(null)
    expect(spy).not.toHaveBeenCalled()
  })

  it('postApiMethod posts to given URL', () => {
    service.postApiMethod('/api/test', { query: '' })
    expect(mockHttp.post).toHaveBeenCalledWith('/api/test', { query: '' })
  })

  it('postApiMethod defaults query to empty string when missing', () => {
    service.postApiMethod('/api/test', {})
    const callArgs = mockHttp.post.mock.calls[0][1]
    expect(callArgs.query).toBe('')
  })

  it('getApiMethod calls http.get on given URL', () => {
    service.getApiMethod('/api/data')
    expect(mockHttp.get).toHaveBeenCalledWith('/api/data')
  })

  it('isLoading returns observable of boolean', done => {
    service.isLoading().subscribe(v => {
      expect(typeof v).toBe('boolean')
      done()
    })
  })
})
