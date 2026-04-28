import { BehaviorSubject } from 'rxjs'
import { SearchFilterDisplayComponent } from './search-filter-display.component'

describe('SearchFilterDisplayComponent', () => {
  let component: SearchFilterDisplayComponent
  let router: any
  let queryParamMap$: BehaviorSubject<any>

  beforeEach(() => {
    router = { navigate: jest.fn() }
    queryParamMap$ = new BehaviorSubject({ has: (key: string) => key === 'f', get: () => JSON.stringify({ tag: ['one'] }) })
    component = new SearchFilterDisplayComponent(
      { queryParamMap: queryParamMap$, parent: { route: 'parent' } } as any,
      router,
      { translateSearchFilters: jest.fn(() => Promise.resolve({ tag: 'Tag' })) } as any,
      { userPreference: { selectedLocale: 'en' } } as any,
    )
  })

  it('initializes selected filters and translations', async () => {
    component.ngOnInit()
    await Promise.resolve()
    expect(component.searchRequest.filters).toEqual({ tag: ['one'] })
    expect(component.translatedFilters).toEqual({ tag: 'Tag' })
  })

  it('adds, removes and clears normal filters', () => {
    component.searchRequest.filters = { tag: ['one'] }
    component.applyFilters({ filterType: 'tag', unitFilter: { type: 'two' } as any })
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { f: JSON.stringify({ tag: ['one', 'two'] }) } }))

    component.applyFilters({ filterType: 'tag', unitFilter: { type: 'one' } as any })
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { f: JSON.stringify({}) } }))

    component.removeFilters()
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { f: null } }))
  })

  it('handles date published object filters', () => {
    component.searchRequest.filters = { dtPublished: [{ from: '1', to: '2', type: 'Last week' }] }
    component.applyFilters({ filterType: 'dtPublished', unitFilter: { type: 'Last month', from: '3', to: '4' } as any })
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { f: JSON.stringify({ dtPublished: [{ from: '1', to: '2', type: 'Last week' }, { from: '3', to: '4', type: 'Last month' }] }) },
    }))

    component.applyFilters({ filterType: 'dtPublished', unitFilter: { type: 'Last week', from: '1', to: '2' } as any })
    expect(router.navigate).toHaveBeenCalled()
  })

  it('tracks filter rows', () => {
    expect(component.filterUnitResponseTrackBy({ id: 'r1' } as any)).toBe('r1')
    expect(component.filterUnitTrackBy({ id: 'u1' } as any)).toBe('u1')
  })
})
