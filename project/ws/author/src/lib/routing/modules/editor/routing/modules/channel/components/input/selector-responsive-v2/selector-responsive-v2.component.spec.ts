import { SelectorResponsiveV2Component } from './selector-responsive-v2.component'

describe('SelectorResponsiveV2Component', () => {
  let component: SelectorResponsiveV2Component

  const strip = (minWidth: number, maxWidth: number): any => ({
    minWidth,
    maxWidth,
    widget: { widgetType: 'selector', widgetSubType: 'image', widgetData: {} },
  })

  beforeEach(() => {
    jest.useFakeTimers()
    component = new SelectorResponsiveV2Component({} as any)
    component.size = 3
    component.content = {
      type: 'image',
      subType: 'responsiveImage',
      selectFrom: [strip(0, 500090000)],
    } as any
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('initializes current strip and splits screen types for configured size', () => {
    component.ngOnInit()
    expect(component.content.selectFrom).toHaveLength(3)
    expect(component.content.selectFrom.map((s: any) => [s.minWidth, s.maxWidth])).toEqual([
      [841, 500090000],
      [481, 840],
      [0, 480],
    ])
  })

  it('changes index and current size for known screen types', () => {
    component.content.selectFrom = [strip(0, 480), strip(481, 840), strip(841, 500090000), strip(481, 500090000)]

    component.onIndexChange(0)
    expect(component.currentSize).toBe(1)
    component.onIndexChange(1)
    expect(component.currentSize).toBe(2)
    component.onIndexChange(2)
    expect(component.currentSize).toBe(3)
    component.onIndexChange(3)
    expect(component.currentSize).toBe(2)
  })

  it('reinitializes child image map when image map index changes', () => {
    component.content.type = 'imageMap'
    component.content.selectFrom = [strip(0, 480)]
    component.imageMapComponent = { ngOnInit: jest.fn(), ngAfterViewInit: jest.fn() } as any

    component.onIndexChange(0)
    jest.advanceTimersByTime(110)

    expect(component.imageMapComponent.ngOnInit).toHaveBeenCalled()
    expect(component.imageMapComponent.ngAfterViewInit).toHaveBeenCalled()
  })

  it('returns screen type labels and custom fallback', () => {
    component.content.selectFrom = [
      strip(0, 480),
      strip(481, 840),
      strip(841, 500090000),
      strip(0, 500090000),
      strip(481, 500090000),
      strip(100, 200),
    ]

    expect(component.getType(0)).toBe('mob')
    expect(component.getType(1)).toBe('tab')
    expect(component.getType(2)).toBe('desktop')
    expect(component.getType(3)).toBe('common')
    expect(component.getType(4)).toBe('tabDesktop')
    expect(component.getType(5)).toBe('100px - 200px')
    expect(component.getType(5, true)).toBe('custom')
  })

  it('sets screen widths, adds and removes strips', () => {
    component.currentStrip = component.content.selectFrom[0]
    ;['mob', 'tabDesktop', 'tab', 'desktop', 'custom'].forEach(value => component.setScreenWidth({ value }))
    expect(component.currentStrip).toMatchObject({ minWidth: 0, maxWidth: 500090000 })

    component.addStrip()
    expect(component.index).toBe(1)
    expect(component.content.selectFrom).toHaveLength(2)

    component.removeStrip()
    expect(component.content.selectFrom).toHaveLength(1)
    component.removeStrip()
    expect(component.content.selectFrom).toHaveLength(1)
  })

  it('generates image and image-map widget data', () => {
    const imageWidget = component.generateWidget()
    expect(imageWidget.widgetData.type).toBe('responsiveImage')

    component.content.type = 'imageMap'
    const mapWidget = component.generateWidget()
    expect(mapWidget).toBeTruthy()
  })
})
