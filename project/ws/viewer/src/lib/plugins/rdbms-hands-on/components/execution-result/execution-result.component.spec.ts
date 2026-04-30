jest.mock('../../rdbms-hands-on.model', () => ({ NSRdbmsHandsOn: {} }), { virtual: true })

import { ExecutionResultComponent } from './execution-result.component'

describe('ExecutionResultComponent', () => {
  let component: ExecutionResultComponent

  beforeEach(() => {
    component = new ExecutionResultComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have executedResult null by default', () => {
    expect(component.executedResult).toBeNull()
  })

  it('ngOnInit does nothing when executedResult is null', () => {
    component.executedResult = null
    expect(() => component.ngOnInit()).not.toThrow()
    expect(component.executedTable).toEqual([])
    expect(component.displayColumns).toEqual([])
    expect(component.telltext).toBe('')
  })

  it('ngOnInit parses executedResult.data when provided', () => {
    const tableData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    component.executedResult = {
      data: JSON.stringify(tableData),
      validationStatus: true,
      status: { code: 200, message: 'ok', rowCount: 2, warnings: '' } as any,
      tellTextMsg: 'Query ran OK',
    }
    component.ngOnInit()
    expect(component.executedTable).toEqual(tableData)
    expect(component.displayColumns).toEqual(['id', 'name'])
    expect(component.telltext).toBe('Query ran OK')
  })

  it('ngOnInit sets empty executedTable when data is empty string', () => {
    component.executedResult = {
      data: '',
      validationStatus: false,
      status: { code: 0, message: '', rowCount: 0, warnings: '' } as any,
      tellTextMsg: 'No data',
    }
    component.ngOnInit()
    expect(component.executedTable).toEqual([])
    expect(component.displayColumns).toEqual([])
    expect(component.telltext).toBe('No data')
  })

  it('ngOnInit sets empty displayColumns when table has no rows', () => {
    component.executedResult = {
      data: JSON.stringify([]),
      validationStatus: true,
      status: { code: 200, message: 'ok', rowCount: 0, warnings: '' } as any,
      tellTextMsg: '',
    }
    component.ngOnInit()
    expect(component.executedTable).toEqual([])
    expect(component.displayColumns).toEqual([])
  })
})
