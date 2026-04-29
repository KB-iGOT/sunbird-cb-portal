import { BrowseCompetencyService } from './browse-competency.service'
import { of } from 'rxjs'

function buildService(overrides: any = {}) {
  const mockHttp: any = {
    post: jest.fn().mockReturnValue(of({ result: { data: [] } })),
    get: jest.fn().mockReturnValue(of({ competencies: [] })),
    ...overrides.http,
  }
  const svc = new BrowseCompetencyService(mockHttp)
  return { svc, mockHttp }
}

describe('BrowseCompetencyService', () => {
  it('should create', () => {
    const { svc } = buildService()
    expect(svc).toBeTruthy()
  })

  it('isLoading - returns observable boolean', (done) => {
    const { svc } = buildService()
    svc.isLoading().subscribe((val: any) => {
      expect(typeof val).toBe('boolean')
      done()
    })
  })

  it('isSearchLoading - returns observable boolean', (done) => {
    const { svc } = buildService()
    svc.isSearchLoading().subscribe((val: any) => {
      expect(typeof val).toBe('boolean')
      done()
    })
  })

  it('fetchSearchData - calls http.post with correct endpoint', (done) => {
    const { svc, mockHttp } = buildService()
    const request = { filters: { status: ['Live'] } }
    svc.fetchSearchData(request).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', request)
      done()
    })
  })

  it('fetchSearchData - returns observable response', (done) => {
    const { svc } = buildService()
    svc.fetchSearchData({ query: 'test' }).subscribe((result: any) => {
      expect(result).toEqual({ result: { data: [] } })
      done()
    })
  })

  it('searchCompetency - calls http.get with correct endpoint', (done) => {
    const { svc, mockHttp } = buildService()
    svc.searchCompetency({}).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/searchBy/competency')
      done()
    })
  })

  it('notifyOther - emits data via notifyObservable$', (done) => {
    const { svc } = buildService()
    svc.notifyObservable$.subscribe((data: any) => {
      expect(data).toEqual({ filter: 'competency1' })
      done()
    })
    svc.notifyOther({ filter: 'competency1' })
  })

  it('notifyOther - does not emit when data is null/undefined', () => {
    const { svc } = buildService()
    const emitSpy = jest.fn()
    svc.notifyObservable$.subscribe(emitSpy)
    svc.notifyOther(null)
    svc.notifyOther(undefined)
    expect(emitSpy).not.toHaveBeenCalled()
  })

  it('isLoading starts as false', (done) => {
    const { svc } = buildService()
    svc.isLoading().subscribe((val: boolean) => {
      expect(val).toBe(false)
      done()
    })
  })

  it('isSearchLoading starts as false', (done) => {
    const { svc } = buildService()
    svc.isSearchLoading().subscribe((val: boolean) => {
      expect(val).toBe(false)
      done()
    })
  })
})
