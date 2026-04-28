import { BehaviorSubject } from 'rxjs'
import { GyaanFilterComponent } from './gyaan-filter.component'

describe('GyaanFilterComponent', () => {
  let component: GyaanFilterComponent
  let bottomSheetRef: any
  let queryParams$: BehaviorSubject<any>

  const facets = {
    contextYear: { values: [{ name: '2001' }, { name: '2003' }] },
    contentType: { values: [{ name: 'otherResources' }, { name: 'reports' }] },
    'sectorDetails_v1.sectorName': { values: [{ name: 'All' }, { name: 'Health' }] },
    sector: { values: [{ name: 'All' }, { name: 'Health' }] },
    invalid: 'bad',
  }

  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
    jest.spyOn(console, 'warn').mockImplementation()
    bottomSheetRef = { dismiss: jest.fn() }
    queryParams$ = new BehaviorSubject({ content: 'reports' })
    component = new GyaanFilterComponent(
      {
        facetsData: JSON.parse(JSON.stringify(facets)),
        facetsDataCopy: JSON.parse(JSON.stringify(facets)),
        filterDataLoading: false,
        selectedFilter: { sector: ['Health'] },
      },
      { setDefaultLang: jest.fn(), use: jest.fn() } as any,
      { queryParams: queryParams$ } as any,
      bottomSheetRef,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('initializes facets, years and selected values from bottom sheet data', () => {
    component.ngOnInit()

    expect(component.selectedContent).toBe('reports')
    expect(component.minValue).toBe(2001)
    expect(component.maxValue).toBe(2003)
    expect(component.localFilterData.invalid).toBeUndefined()
    expect(component.localFilterData.sector.values[1].checked).toBe(true)
  })

  it('emits default content type after view init once', () => {
    const emit = jest.spyOn(component.filterChange, 'emit')
    component.ngOnInit()
    component.ngAfterViewInit()
    jest.runOnlyPendingTimers()
    queryParams$.next({ content: 'reports' })
    jest.runOnlyPendingTimers()

    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith({ event: true, key: 'contentType', keyData: expect.objectContaining({ name: 'reports' }) })
  })

  it('dismisses apply and cancel payloads', () => {
    component.ngOnInit()
    component.openLink('apply')
    expect(bottomSheetRef.dismiss).toHaveBeenCalledWith({ filter: component.mobileSelectedFilter, facetData: component.facetsData })

    component.openLink('cancel')
    expect(bottomSheetRef.dismiss).toHaveBeenCalledWith({ filter: component.data.selectedFilter, facetData: component.facetsData })
  })

  it('clears mobile filters except resource category', () => {
    component.ngOnInit()
    component.mobileSelectedFilter = { sector: ['Health'], resourceCategory: 'Article' }
    component.facetsData.sector.values[1].checked = true

    component.clearFilter()

    expect(component.mobileSelectedFilter.sector).toEqual([])
    expect(component.mobileSelectedFilter.resourceCategory).toBe('')
    expect(component.localFilterData.sector.values).toHaveLength(2)
  })

  it('handles desktop and mobile selection rules', () => {
    const emit = jest.spyOn(component.filterChange, 'emit')
    component.ngOnInit()
    const values = component.localFilterData['sectorDetails_v1.sectorName'].values

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 })
    component.changeSelection(true, 'sectorDetails_v1.sectorName', values[0], values)
    expect(values.every((v: any) => v.checked)).toBe(true)
    component.changeSelection(true, 'sectorDetails_v1.sectorName', values[1], values)
    expect(values[0].checked).toBe(false)
    expect(emit).toHaveBeenCalledWith({ event: true, key: 'sectorDetails_v1.sectorName', keyData: values[1] })

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 })
    component.changeSelection(true, 'sector', { name: 'Health' }, values)
    expect(component.mobileSelectedFilter.sector).not.toContain('Health')
    component.changeSelection(true, 'resourceCategory', { name: 'Article' }, values)
    expect(component.mobileSelectedFilter.resourceCategory).toBe('Article')
  })

  it('searches facets, changes content and slider years', () => {
    const emit = jest.spyOn(component.filterChange, 'emit')
    component.ngOnInit()
    component.getSearch('heal', 'sector')
    expect(component.localFilterData.sector.values).toEqual([{ name: 'Health' }])
    component.getSearch('x', 'missing')

    component.onContentChange({ value: 'reports' })
    expect(component.selectedContent).toBe('reports')
    expect(emit).toHaveBeenCalledWith({ event: true, key: 'content', keyData: 'reports' })

    expect(component.formatLabel(2020)).toBe('2020')
    expect(component.returnZero()).toBe(0)
    component.changeSlider({ value: 2001, highValue: 2003 })
    expect(emit).toHaveBeenCalledWith({ event: true, key: 'contextYear', keyData: [2001, 2002, 2003] })
  })

  it('uses website language and supports input facets without bottom sheet data', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const translate = { setDefaultLang: jest.fn(), use: jest.fn() }
    const plain = new GyaanFilterComponent(null, translate as any, { queryParams: new BehaviorSubject({}) } as any, bottomSheetRef)
    plain.facetsData = JSON.parse(JSON.stringify(facets))
    plain['facetsDataCopy'] = JSON.parse(JSON.stringify(facets))

    plain.ngOnInit()
    plain.ngAfterViewInit()
    jest.runOnlyPendingTimers()

    expect(translate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translate.use).toHaveBeenCalledWith('hi')
    expect(plain.selectedContent).toBe('otherResources')
    expect(plain.localFilterData.invalid).toBeUndefined()
  })

  it('returns early when default content facet is unavailable', () => {
    const emit = jest.spyOn(component.filterChange, 'emit')
    component.data.facetsDataCopy = { contextYear: { values: [] } }
    component.data.facetsData = { contextYear: { values: [] } }
    component.data.selectedFilter = {}
    component.ngOnInit()
    component.ngAfterViewInit()
    jest.runOnlyPendingTimers()

    expect(emit).not.toHaveBeenCalled()
  })
})
