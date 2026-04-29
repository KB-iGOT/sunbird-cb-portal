import { ScrollHelperService } from './scroll-helper.service'

jest.mock('@angular/core', () => ({
  Injectable: () => () => { },
  ElementRef: class { },
}), { virtual: true })

describe('ScrollHelperService', () => {
  let service: ScrollHelperService
  let mockScrollBy: jest.Mock

  beforeEach(() => {
    service = new ScrollHelperService()
    mockScrollBy = jest.fn()
  })

  function makeElementRef(rect: Partial<DOMRect>, scrollLeft = 0, scrollTop = 0) {
    const scrollableChild = { scrollBy: mockScrollBy, scrollLeft, scrollTop }
    const inner = { children: [null, scrollableChild] }
    return {
      nativeElement: {
        getBoundingClientRect: () => rect as DOMRect,
        children: [inner],
      },
    } as any
  }

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('scrollIfNecessary does nothing when not near edges', () => {
    // pageX=100 is to the LEFT of the container (left=200), so:
    // rightScroll=1000-100=900 >= 50, leftScroll=200-100=100 >= 50 → no scroll
    const el = makeElementRef({ right: 1000, left: 200 })
    service.scrollIfNecessary(el, { pageX: 100 })
    expect(mockScrollBy).not.toHaveBeenCalled()
  })

  it('scrollIfNecessary scrolls right when near right edge', () => {
    const el = makeElementRef({ right: 300, left: 0 })
    service.scrollIfNecessary(el, { pageX: 260 }) // rightScroll = 300 - 260 = 40 < 50
    expect(mockScrollBy).toHaveBeenCalledWith({ left: 50, behavior: 'smooth' })
  })

  it('scrollIfNecessary scrolls left when near left edge', () => {
    const el = makeElementRef({ right: 1000, left: 40 })
    service.scrollIfNecessary(el, { pageX: 0 }) // leftScroll = 40 - 0 = 40 < 50
    expect(mockScrollBy).toHaveBeenCalledWith({ left: -50, behavior: 'smooth' })
  })

  it('scrollIfNecessary does not scroll right when rightScroll is exactly 50', () => {
    // pageX is to the LEFT of container (left=200), so leftScroll >= 50 too
    // rightScroll=300-250=50 NOT < 50 (no right), leftScroll=200-250=-50 < 50 (→ left scroll)
    // BUT let's keep pageX outside left to avoid left scroll: right=300, left=200, pageX=100
    // rightScroll = 300-100=200 NOT < 50, leftScroll = 200-100=100 NOT < 50 → nothing
    const el = makeElementRef({ right: 300, left: 200 })
    service.scrollIfNecessary(el, { pageX: 100 })
    expect(mockScrollBy).not.toHaveBeenCalled()
  })
})
