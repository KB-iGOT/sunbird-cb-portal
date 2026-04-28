import { BehaviorSubject } from 'rxjs'
import { FilterDisplayComponent } from './filter-display.component'

describe('FilterDisplayComponent', () => {
  let component: FilterDisplayComponent
  let router: any
  let queryParamMap$: BehaviorSubject<any>
  let searchServ: any

  beforeEach(() => {
    router = { navigate: jest.fn() }
    queryParamMap$ = new BehaviorSubject({ has: (key: string) => key === 'f', get: () => JSON.stringify({ lang: ['en'] }) })
    searchServ = { translateSearchFilters: jest.fn(() => Promise.resolve({ Lang: { value: { English: 'English' } } })) }
    document.body.innerHTML = '<div id="loader"></div>'
    component = new FilterDisplayComponent(
      {
        parent: {
          snapshot: {
            data: {
              searchPageData: {
                data: { search: { tabs: [{ titleKey: 'learning', searchQuery: { advancedFilters: [{ name: 'popular', filters: { type: ['Course'] } }] } }] } },
              },
            },
          },
        },
        queryParamMap: queryParamMap$,
      } as any,
      router,
      searchServ,
      { userPreference: { selectedLocale: 'hi' } } as any,
    )
    component.routeComp = 'learning'
  })

  it('initializes translations, advanced filters and query filters', async () => {
    component.ngOnInit()
    await Promise.resolve()

    expect(searchServ.translateSearchFilters).toHaveBeenCalledWith('hi')
    expect(component.translatedFilters.lang).toBeTruthy()
    expect(component.advancedFilters).toEqual([{ name: 'popular', filters: { type: ['Course'] } }])
    expect(component.searchRequest.filters).toEqual({ lang: ['en'] })
  })

  it('navigates advanced filter, add, remove and clear filters', () => {
    component.searchRequest.filters = { lang: ['en'] }

    component.advancedFilterClick({ filters: { type: ['Course'] } } as any)
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { f: JSON.stringify({ type: ['Course'] }) } }))

    component.addFilter({ key: 'contentType', value: 'Course' })
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { f: JSON.stringify({ lang: ['en'], contentType: ['Course'] }) } }))

    component.removeFilter({ key: 'lang', value: 'en' })
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { f: JSON.stringify({}) } }))

    component.removeFilters()
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { f: null } }))
  })

  it('toggles filters through applyFilters and tracks rows', () => {
    component.searchRequest.filters = { lang: ['en'] }
    component.filtersResponse = [{ id: 'f1' } as any]
    component.applyFilters({ unitFilter: { id: 'en', type: 'en' } as any, filterType: 'lang' })
    expect(component.filtersResponse).toEqual([])

    component.searchRequest.filters = {}
    component.applyFilters({ unitFilter: { id: 'course', type: 'Course' } as any, filterType: 'contentType' })
    expect(router.navigate).toHaveBeenCalled()

    expect(component.filterUnitResponseTrackBy({ id: 'r1' } as any)).toBe('r1')
    expect(component.filterUnitTrackBy({ id: 'u1' } as any)).toBe('u1')
  })

  it('lowercases nested filters and displays loader', () => {
    const filterObj: any = { Lang: { value: { English: { value: {} } } } }
    component.lowerCaseFilter(filterObj, ['Lang'])
    expect(filterObj.lang).toBeTruthy()

    component.displayLoader('true')
    expect(document.getElementById('loader')?.style.display).toBe('block')
    component.displayLoader('false')
    expect(document.getElementById('loader')?.style.display).toBe('none')
  })
})
