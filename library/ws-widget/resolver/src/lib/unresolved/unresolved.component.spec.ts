import { UnresolvedComponent } from './unresolved.component'

// Mock window.location.href
const originalLocation = window.location

function buildComponent(href = 'http://localhost/') {
  Object.defineProperty(window, 'location', {
    value: { href },
    configurable: true,
    writable: true,
  })
  const comp = new UnresolvedComponent()
  return comp
}

afterAll(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    configurable: true,
    writable: true,
  })
})

describe('UnresolvedComponent', () => {
  it('should create', () => {
    const comp = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should have showData true by default', () => {
    const comp = buildComponent()
    expect(comp.showData).toBe(true)
  })

  it('should have previewMode false by default', () => {
    const comp = buildComponent()
    expect(comp.previewMode).toBe(false)
  })

  it('ngOnInit - sets previewMode true when URL contains preview', () => {
    const comp = buildComponent('http://localhost/preview/content')
    comp.ngOnInit()
    expect(comp.previewMode).toBe(true)
  })

  it('ngOnInit - sets previewMode true when URL contains channel', () => {
    const comp = buildComponent('http://localhost/channel/123')
    comp.ngOnInit()
    expect(comp.previewMode).toBe(true)
  })

  it('ngOnInit - sets previewMode false when URL has neither preview nor channel', () => {
    const comp = buildComponent('http://localhost/learn/course/123')
    comp.ngOnInit()
    expect(comp.previewMode).toBe(false)
  })

  it('should have searchArray with preview and channel', () => {
    const comp = buildComponent()
    expect(comp.searchArray).toContain('preview')
    expect(comp.searchArray).toContain('channel')
  })

  it('widgetData should be settable', () => {
    const comp = buildComponent()
    comp.widgetData = { foo: 'bar' }
    expect(comp.widgetData).toEqual({ foo: 'bar' })
  })

  it('ngOnInit - URL with channel word sets previewMode true', () => {
    const comp = buildComponent('http://localhost/app/channel/explore')
    comp.ngOnInit()
    expect(comp.previewMode).toBe(true)
  })
})
