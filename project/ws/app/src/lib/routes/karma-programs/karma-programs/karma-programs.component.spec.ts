import { BehaviorSubject, of } from 'rxjs'
jest.mock('lodash', () => {
  const get = (obj: any, path: string) => path.split('.').reduce((acc, key) => acc && acc[key], obj)
  const orderBy = (value: any[], keys: string[], orders: string[]) => [...(value || [])].sort((a, b) => {
    const av = String(get(a, keys[0]) || '')
    const bv = String(get(b, keys[0]) || '')
    return orders[0] === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
  })
  return { __esModule: true, default: {
    toArray: (v: any) => Array.isArray(v) ? v : Object.values(v || {}),
    pickBy: (v: any, p: any) => Object.keys(v || {}).reduce((acc: any, key: string) => {
      if (p(v[key])) acc[key] = v[key]
      return acc
    }, {}),
    includes: (v: any, s: any) => String(v || '').includes(s),
    lowerCase: (v: any) => String(v || '').toLowerCase(),
    get,
    each: (v: any, cb: any) => (v || []).forEach(cb),
    orderBy,
  } }
})
import { KarmaProgramsComponent } from './karma-programs.component'

describe('KarmaProgramsComponent', () => {
  let component: KarmaProgramsComponent
  let localService: any
  let events: any

  beforeEach(() => {
    localStorage.clear()
    localService = { providers: new BehaviorSubject<any[]>([]), initProviders: jest.fn((data: any) => localService.providers.next(data)) }
    events = { raiseInteractTelemetry: jest.fn() }
    component = new KarmaProgramsComponent(
      { isLoading: jest.fn(() => of(false)), fetchAllProviders: jest.fn(() => of([{ title: 'Beta' }, { title: 'Alpha' }, null])) } as any,
      localService,
      { setDefaultLang: jest.fn(), use: jest.fn() } as any,
      { snapshot: { data: { programData: { data: { result: { data: [{ title: 'Program 1', children: [{}] }, { title: 'Empty', children: [] }] } } } } } } as any,
      { languageSelectedObservable: new BehaviorSubject(null) } as any,
      events,
    )
  })

  it('maps route programs and initializes form', () => {
    expect(component.allProviders).toEqual([{ title: 'Program 1', children: [{}] }])
    component.ngOnInit()
    expect(component.searchForm).toBeTruthy()
    expect(component.displayLoader).toBeTruthy()
  })

  it('loads providers from api and cache with search/sort', () => {
    component.sortBy = 'asc'
    component.getAllProviders()
    expect(component.allProviders.map((p: any) => p.title)).toEqual(['Alpha', 'Beta'])

    localService.providers.next([{ title: 'Gamma' }, { title: 'Alpha' }])
    component.searchQuery = 'a'
    component.sortBy = 'desc'
    component.getAllProviders()
    expect(component.allProviders.map((p: any) => p.title)).toEqual(['Gamma', 'Alpha'])
  })

  it('updates query, filters channels, loads more, sorts and raises telemetry', () => {
    component.allProviders = [{ title: 'Alpha', orgId: 'o1' }, { title: 'Beta', orgId: 'o2' }]
    component.clonesProviders = component.allProviders
    component.updateQuery('alp')
    expect(component.clonesProviders).toEqual([{ title: 'Alpha', orgId: 'o1' }])
    component.filterChannles('')
    expect(component.clonesProviders).toEqual(component.allProviders)

    component.totalCount = 50
    component.loadMore()
    expect(component.page).toBe(2)
    expect(component.getAllProvidersReq.request.limit).toBe(40)

    component.ngOnInit()
    component.sortType('desc')
    expect(component.sortBy).toBe('desc')
    component.raiseTelemetryInteratEvent({ title: 'Alpha', orgId: 'o1' })
    expect(events.raiseInteractTelemetry).toHaveBeenCalled()
  })
})
