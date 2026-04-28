import { BehaviorSubject, of } from 'rxjs'
jest.mock('lodash', () => {
  const get = (obj: any, path: string) => path.split('.').reduce((acc, key) => acc && acc[key], obj)
  return {
    __esModule: true,
    default: {
      toArray: (value: any) => Array.isArray(value) ? value : Object.values(value || {}),
      pickBy: (value: any, predicate: any) => {
        const result: any = {}
        Object.keys(value || {}).forEach(key => {
          if (predicate(value[key])) result[key] = value[key]
        })
        return result
      },
      includes: (value: any, search: any) => (value || '').includes(search),
      lowerCase: (value: any) => String(value || '').toLowerCase(),
      get,
      each: (value: any, iteratee: any) => (value || []).forEach(iteratee),
      orderBy: (value: any[], keys: string[], orders: string[]) => {
        const key = keys[0]
        const dir = orders[0]
        return [...(value || [])].sort((a, b) => {
          const av = String(get(a, key) || '')
          const bv = String(get(b, key) || '')
          return dir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
        })
      },
    },
  }
})
import { AllProvidersComponent } from './all-providers.component'

describe('AllProvidersComponent', () => {
  let component: AllProvidersComponent
  let browseProviderSvc: any
  let localService: any

  const providers = [
    { name: 'Beta', id: '2' },
    { name: 'Alpha', id: '1' },
    { name: '', id: 'bad' },
    null,
  ]

  beforeEach(() => {
    localStorage.clear()
    browseProviderSvc = {
      isLoading: jest.fn(() => of(false)),
      fetchAllProviders: jest.fn(() => of(providers)),
    }
    localService = {
      providers: new BehaviorSubject<any[]>([]),
      initProviders: jest.fn((data: any) => localService.providers.next(data)),
    }
    component = new AllProvidersComponent(
      browseProviderSvc,
      localService,
      { setDefaultLang: jest.fn(), use: jest.fn() } as any,
      {
        snapshot: {
          data: {
            contentData: {
              data: { result: { data: [{ link: 'logo.svg', contentPartnerName: 'Featured', internalOrgId: 'org-1' }] } },
            },
          },
        },
      } as any,
      { languageSelectedObservable: new BehaviorSubject(null) } as any,
    )
  })

  it('maps featured providers and initializes form/provider list', () => {
    expect(component.featuredProviders[0]).toMatchObject({ displayName: 'logo.svg', name: 'Featured', orgId: 'org-1', logoUrl: 'logo.svg' })

    component.ngOnInit()

    expect(component.searchForm).toBeTruthy()
    expect(component.displayLoader).toBeTruthy()
    expect(browseProviderSvc.fetchAllProviders).toHaveBeenCalled()
    expect(component.allProviders.map((p: any) => p.name)).toEqual(['Alpha', 'Beta'])
    expect(component.disableLoadMore).toBe(true)
  })

  it('filters, sorts and loads cached providers', () => {
    localService.providers.next([{ name: 'Gamma' }, { name: 'Alpha' }, { name: 'Beta' }])
    component.sortBy = 'desc'
    component.searchQuery = 'a'

    component.getAllProviders()

    expect(component.allProviders.map((p: any) => p.name)).toEqual(['Gamma', 'Beta', 'Alpha'])
    expect(component.clonesProviders).toEqual(component.allProviders)
  })

  it('updates query, filters channels and loads more', () => {
    component.allProviders = [{ name: 'Alpha' }, { name: 'Beta' }]
    component.clonesProviders = component.allProviders
    component.updateQuery('alp')
    expect(component.searchQuery).toBe('alp')
    expect(component.getAllProvidersReq.request.query).toBe('alp')
    expect(component.clonesProviders).toEqual([{ name: 'Alpha' }])

    component.filterChannles('')
    expect(component.clonesProviders).toEqual(component.allProviders)

    component.totalCount = 50
    component.loadMore()
    expect(component.page).toBe(2)
    expect(component.getAllProvidersReq.request.limit).toBe(40)
    expect(component.disableLoadMore).toBe(true)
  })

  it('sorts via form control and reacts to language selection', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    component.ngOnInit()
    component.sortType('desc')
    expect(component.sortBy).toBe('desc')
    expect(component.searchForm?.get('sortByControl')?.value).toBe('desc')
  })
})
