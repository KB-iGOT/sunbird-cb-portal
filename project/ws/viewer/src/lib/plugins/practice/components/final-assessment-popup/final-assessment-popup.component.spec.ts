import { FinalAssessmentPopupComponent } from './final-assessment-popup.component'

jest.mock('lodash', () => ({
  map: (arr: any[], fn: any) => arr.map(fn),
}))

function buildDialogRef() {
  return { close: jest.fn() }
}

function buildData(overrides: any = {}) {
  return {
    tableDetails: {
      tableData: [{ col1: 'val1' }],
      tableColumns: [{ key: 'col1', label: 'Column 1' }],
    },
    ...overrides,
  }
}

function buildComponent(data: any = buildData()) {
  const dialogRef = buildDialogRef()
  const comp = new FinalAssessmentPopupComponent(dialogRef as any, data)
  return { comp, dialogRef }
}

describe('FinalAssessmentPopupComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should set assessmentData from injected data', () => {
    const data = buildData()
    const { comp } = buildComponent(data)
    expect(comp.assessmentData).toBe(data)
  })

  it('should populate dataSource from tableDetails.tableData', () => {
    const data = buildData()
    const { comp } = buildComponent(data)
    expect(comp.dataSource.data).toEqual(data.tableDetails.tableData)
  })

  it('should set displayedColumns on ngOnInit when tableColumns present', () => {
    const data = buildData()
    const { comp } = buildComponent(data)
    comp.ngOnInit()
    expect(comp.displayedColumns).toEqual(data.tableDetails.tableColumns)
  })

  it('should not throw when data has no tableDetails', () => {
    const { comp } = buildComponent({})
    expect(() => comp.ngOnInit()).not.toThrow()
    expect(comp.displayedColumns).toEqual([])
  })

  it('should start countdown when autoRedirect is enabled', () => {
    const data = buildData({ autoRedirect: true, redirectSeconds: 3 })
    const { comp } = buildComponent(data)
    expect(comp.countdown).toBe(3)
    jest.advanceTimersByTime(1000)
    expect(comp.countdown).toBe(2)
    jest.advanceTimersByTime(2000)
    expect(comp.countdown).toBeLessThanOrEqual(0)
  })

  it('should clear interval when countdown reaches 0', () => {
    const data = buildData({ autoRedirect: true, redirectSeconds: 1 })
    const { comp } = buildComponent(data)
    jest.advanceTimersByTime(2000)
    expect(comp.countdown).toBeLessThanOrEqual(0)
  })

  it('should clear interval on ngOnDestroy', () => {
    const data = buildData({ autoRedirect: true, redirectSeconds: 5 })
    const { comp } = buildComponent(data)
    expect(() => comp.ngOnDestroy()).not.toThrow()
  })

  it('should call dialogRef.close with response on closePopup', () => {
    const { comp, dialogRef } = buildComponent()
    comp.closePopup('done')
    expect(dialogRef.close).toHaveBeenCalledWith('done')
  })

  it('getFinalColumns should return array of column keys', () => {
    const data = buildData()
    const { comp } = buildComponent(data)
    comp.ngOnInit()
    expect(comp.getFinalColumns).toEqual(['col1'])
  })

  it('getFinalColumns returns empty array when displayedColumns is empty', () => {
    const { comp } = buildComponent({})
    expect(comp.getFinalColumns).toEqual([])
  })

  it('setTableColumns sets displayedColumns', () => {
    const { comp } = buildComponent()
    comp.setTableColumns([{ key: 'a' }, { key: 'b' }])
    expect(comp.displayedColumns).toEqual([{ key: 'a' }, { key: 'b' }])
  })

  it('setTableDataSource sets data on dataSource', () => {
    const { comp } = buildComponent()
    comp.setTableDataSource([{ x: 1 }, { x: 2 }])
    expect(comp.dataSource.data).toEqual([{ x: 1 }, { x: 2 }])
  })

  it('should not start countdown when autoRedirect is false', () => {
    const data = buildData({ autoRedirect: false })
    const { comp } = buildComponent(data)
    expect(comp.countdown).toBe(5)
    jest.advanceTimersByTime(3000)
    expect(comp.countdown).toBe(5)
  })

  it('ngOnDestroy should not throw when no countdownInterval', () => {
    const { comp } = buildComponent({})
    comp.countdownInterval = null
    expect(() => comp.ngOnDestroy()).not.toThrow()
  })
})
