import { BehaviorSubject, of, throwError } from 'rxjs'
import { SocialSearchComponent } from './social-search.component'

describe('SocialSearchComponent', () => {
  let component: SocialSearchComponent
  let emitter: any
  let socialServ: any
  let queryParamMap$: BehaviorSubject<any>

  const filter = { id: 'f1', type: 'tag', displayName: 'Tag', checked: false, content: [{ type: 'one', checked: false }] }

  beforeEach(() => {
    emitter = {
      dataStr: new BehaviorSubject([{ id: 'existing' }]),
      sendMessage: jest.fn(),
    }
    socialServ = {
      fetchSearchTimelineData: jest.fn(() => of({ total: 2, result: [{ id: 'p1' }], filters: [{ ...filter, content: [{ type: 'one', checked: false }] }] })),
    }
    queryParamMap$ = new BehaviorSubject({
      has: (key: string) => ['search', 'f'].includes(key),
      get: (key: string) => key === 'search' ? 'policy' : JSON.stringify({ tag: ['one'] }),
    })
    component = new SocialSearchComponent(
      emitter,
      { pageNavBar: { color: 'blue' } } as any,
      { isXSmall$: of(false), isLtMedium$: of(false) } as any,
      { queryParamMap: queryParamMap$ } as any,
      socialServ,
    )
  })

  it('initializes query/filter state and fetches first page', () => {
    component.ngOnInit()

    expect(component.screenSizeIsLtMedium).toBe(false)
    expect(component.queryEntered).toBe('policy')
    expect(component.searchRequest.filters).toEqual({ tag: ['one'] })
    expect(component.searchResult.result).toEqual([{ id: 'p1' }])
    expect(component.searchResult.filters[0].checked).toBe(true)
    expect(component.searchResult.filters[0].content[0].checked).toBe(true)
    expect(component.timelineFetchStatus).toBe('hasMore')
    expect(emitter.sendMessage).toHaveBeenCalled()
  })

  it('fetches more pages, handles none and error states', () => {
    component.getSearchResults('next')
    expect(component.socialSearchReq.pageNo).toBe(1)

    socialServ.fetchSearchTimelineData.mockReturnValueOnce(of({ total: 0 }))
    component.getSearchResults('firstCall')
    expect(component.timelineFetchStatus).toBe('none')

    socialServ.fetchSearchTimelineData.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.getSearchResults('firstCall')
    expect(component.timelineFetchStatus).toBe('error')
  })

  it('truncates html and toggles filter panel', () => {
    expect(component.truncateHTML('short')).toBe('short')
    expect(component.truncateHTML(`<p>${'x'.repeat(200)}</p>`)).toContain(",'...'")

    component.closeFilter(false)
    expect(component.showFilter).toBe(false)
    expect(component.sideNavBarOpened).toBe(false)
  })

  it('reads filter data stream and handles small screens', () => {
    const small = new SocialSearchComponent(
      emitter,
      { pageNavBar: {} } as any,
      { isXSmall$: of(true), isLtMedium$: of(true) } as any,
      { queryParamMap: new BehaviorSubject({ has: () => false, get: () => null }) } as any,
      socialServ,
    )
    small.ngOnInit()
    expect(small.sideNavBarOpened).toBe(false)
    expect(small.showFilter).toBe(false)

    emitter.dataStr.next([{ id: 'new' }])
    small.setDataStr()
    expect(small.filtersResponse).toEqual([{ id: 'new' }])
  })
})
