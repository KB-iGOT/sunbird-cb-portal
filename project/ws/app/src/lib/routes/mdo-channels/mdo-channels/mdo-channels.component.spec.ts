import { BehaviorSubject, of } from 'rxjs'
jest.mock('lodash', () => {
  const get = (obj: any, path: string) => path.split('.').reduce((acc: any, key: string) => acc && acc[key], obj)
  const orderBy = (value: any[], keys: string[], orders: string[]) => [...(value || [])].sort((a, b) => {
    const av = String(get(a, keys[0]) || '')
    const bv = String(get(b, keys[0]) || '')
    return orders[0] === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
  })
  const fns = {
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
  }
  return { __esModule: true, default: fns, ...fns }
})
import { MdoChannelsComponent } from './mdo-channels.component'

describe('MdoChannelsComponent', () => {
  let component: MdoChannelsComponent
  let localService: any
  let events: any

  beforeEach(() => {
    localStorage.clear()
    localService = { providers: new BehaviorSubject<any[]>([]), initProviders: jest.fn((data: any) => localService.providers.next(data)) }
    events = { raiseInteractTelemetry: jest.fn() }
    component = new MdoChannelsComponent(
      { isLoading: jest.fn(() => of(false)), fetchAllProviders: jest.fn(() => of([{ name: 'Beta' }, { name: 'Alpha' }, null])) } as any,
      localService,
      { setDefaultLang: jest.fn(), use: jest.fn() } as any,
      { languageSelectedObservable: new BehaviorSubject(null) } as any,
      events,
      ({ snapshot: { data: { channelData: { data: { result: { data: { orgList: [{ orgName: 'Org B', identifier: 'b' }, { orgName: 'Org A', identifier: 'a' }] } } } } } } } as any),
    )
  })

  it('maps route channels and initializes form', () => {
    expect(component.allProviders).toHaveLength(2)
    component.ngOnInit()
    expect(component.searchForm).toBeTruthy()
    expect(component.displayLoader).toBeTruthy()
  })

  it('loads providers from api and cache with search/sort', () => {
    component.sortBy = 'asc'
    component.getAllProviders()
    expect(component.allProviders.map((p: any) => p.name)).toEqual(['Alpha', 'Beta'])

    localService.providers.next([{ name: 'Gamma' }, { name: 'Alpha' }])
    component.searchQuery = 'a'
    component.sortBy = 'desc'
    component.getAllProviders()
    expect(component.allProviders.map((p: any) => p.name)).toEqual(['Gamma', 'Alpha'])
  })

  it('updates query, filters channels, loads more, sorts and raises telemetry', () => {
    component.allProviders = [{ orgName: 'Alpha', identifier: 'a' }, { orgName: 'Beta', identifier: 'b' }]
    component.clonesProviders = component.allProviders
    component.updateQuery('alp')
    expect(component.clonesProviders).toEqual([{ orgName: 'Alpha', identifier: 'a' }])
    component.filterChannles('')
    expect(component.clonesProviders).toEqual(component.allProviders)

    component.totalCount = 50
    component.loadMore()
    expect(component.page).toBe(2)
    expect(component.getAllProvidersReq.request.limit).toBe(40)

    component.ngOnInit()
    component.sortType('desc')
    expect(component.sortBy).toBe('desc')
    component.raiseMDOChannleCard({ identifier: 'a' })
    expect(events.raiseInteractTelemetry).toHaveBeenCalled()
  })
})
