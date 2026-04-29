import { PaginationComponent } from './pagination.component'

jest.mock('@angular/cdk/layout', () => ({
  BreakpointObserver: class {
    observe = jest.fn(() => ({ subscribe: jest.fn() }))
    isMatched = jest.fn(() => false)
  },
  Breakpoints: { Handset: 'Handset', Tablet: 'Tablet' },
}), { virtual: true })

const makeComponent = () => {
  const mockBreakpoint = {
    observe: jest.fn(() => ({ subscribe: jest.fn() })),
    isMatched: jest.fn(() => false),
  }
  const comp = new PaginationComponent(mockBreakpoint as any)
  comp.defaultPaginationSize = 10
  comp.totalItemsCount = 100
  comp.numberOfPaginationVisable = 5
  comp.pageChange = { emit: jest.fn() } as any
  return { comp, mockBreakpoint }
}

describe('PaginationComponent', () => {
  it('should create', () => {
    const { comp } = makeComponent()
    expect(comp).toBeTruthy()
  })

  it('paginationDup(c, m) returns array of pages', () => {
    const { comp } = makeComponent()
    const pages = comp.paginationDup(3, 10)
    expect(Array.isArray(pages)).toBe(true)
    expect(pages.length).toBeGreaterThan(0)
  })

  it('paginationDup(c, m) with c=1 returns first pages', () => {
    const { comp } = makeComponent()
    const pages = comp.paginationDup(1, 10)
    expect(pages[0]).toBe(1)
  })

  it('goToPage sets currentPage and emits pageChange', () => {
    const { comp } = makeComponent()
    const emitSpy = jest.fn()
    comp.pageChange = { emit: emitSpy } as any
    comp.goToPage(3)
    expect(emitSpy).toHaveBeenCalled()
  })

  it('navigateToLastPage calls goToPage with last page', () => {
    const { comp } = makeComponent()
    const goSpy = jest.spyOn(comp, 'goToPage')
    comp.navigateToLastPage(10)
    expect(goSpy).toHaveBeenCalledWith(10)
  })

  it('navigateToFirstPage calls goToPage with the page arg when not current', () => {
    const { comp } = makeComponent()
    const goSpy = jest.spyOn(comp, 'goToPage')
    comp.navigateToFirstPage(3)
    expect(goSpy).toHaveBeenCalledWith(3)
  })

  it('navigateToNextPage increments currentPage', () => {
    const { comp } = makeComponent()
    comp.goToPage(3)
    const emitSpy = jest.fn()
    comp.pageChange = { emit: emitSpy } as any
    comp.navigateToNextPage(10)
    expect(emitSpy).toHaveBeenCalled()
  })

  it('navigateToPrevPage decrements currentPage', () => {
    const { comp } = makeComponent()
    comp.goToPage(3)
    const emitSpy = jest.fn()
    comp.pageChange = { emit: emitSpy } as any
    comp.navigateToPrevPage(10)
    expect(emitSpy).toHaveBeenCalled()
  })

  it('onChangePageSize updates defaultPaginationSize and emits', () => {
    const { comp } = makeComponent()
    const emitSpy = jest.fn()
    comp.pageChange = { emit: emitSpy } as any
    comp.onChangePageSize({ value: 20 })
    expect(comp.defaultPaginationSize).toBe(20)
    expect(emitSpy).toHaveBeenCalled()
  })

  it('currentPage getter/setter work correctly', () => {
    const { comp } = makeComponent()
    comp.currentPage = 5
    expect(comp.currentPage).toBe(5)
  })

  it('paginationInListing builds pagination from totalItemsCount', () => {
    const { comp } = makeComponent()
    comp.goToPage(1)
    comp.paginationInListing()
    expect(comp.pagination).toBeDefined()
  })
})

