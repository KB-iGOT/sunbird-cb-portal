import { UntypedFormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { DbmsConceptDropdownComponent } from './dbms-concept-dropdown.component'

describe('DbmsConceptDropdownComponent', () => {
  let component: DbmsConceptDropdownComponent
  let snackBar: any
  let dbmsSvc: any
  let eventSvc: any

  const tableResponse = [{ validationStatus: false }, {
    validationStatus: true,
    data: JSON.stringify({ tablename: 'users', data: [{ id: 1, name: 'A' }] }),
  }]

  beforeEach(() => {
    jest.useFakeTimers()
    snackBar = { open: jest.fn() }
    dbmsSvc = {
      initializeDatabase: jest.fn(() => of(tableResponse)),
      tableRefresh: jest.fn(() => of(tableResponse.slice(1))),
      fetchConceptData: jest.fn(() => of({ data: JSON.stringify([{ name: 'Q1', query: 'select 1' }]) })),
      runQuery: jest.fn(() => of({ validationStatus: true })),
      compositeQuery: jest.fn(() => of({ validationStatus: true })),
    }
    eventSvc = { raiseInteractTelemetry: jest.fn() }
    component = new DbmsConceptDropdownComponent(new UntypedFormBuilder(), snackBar, dbmsSvc, eventSvc)
    component.resourceContent = { content: { identifier: 'rdbms-1' }, rdbms: { dropdown: true, query: 'select *' } }
    component.dbRefreshSuccess = { nativeElement: { value: 'success' } } as any
    component.dbRefreshFailed = { nativeElement: { value: 'failed' } } as any
    component.someErrorOccurred = { nativeElement: { value: 'error' } } as any
  })

  afterEach(() => {
    component.ngOnDestroy()
    jest.useRealTimers()
  })

  it('initializes dropdown content and tables', () => {
    component.ngOnChanges()
    expect(component.dropdownQueryForm).toBeTruthy()
    expect(component.loadedTables[0]).toMatchObject({ tableName: 'users', tableColumns: ['id', 'name'] })
    expect(component.dropdownData).toEqual([{ name: 'Q1', query: 'select 1' }])
    expect(component.loading).toBe(false)
  })

  it('refreshes database and handles init failure', () => {
    component.initializeDb(true)
    expect(snackBar.open).toHaveBeenCalledWith('success', 'X')

    dbmsSvc.initializeDatabase.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.initializeDb(true)
    expect(snackBar.open).toHaveBeenCalledWith('failed', 'X')
  })

  it('selects dropdown option and runs normal and composite queries', () => {
    component.ngOnChanges()
    component.onSelectionChange(0)
    expect(component.selectedOption?.query).toBe('select 1')
    expect(component.loadedTables).toHaveLength(1)

    component.run()
    expect(dbmsSvc.runQuery).toHaveBeenCalledWith('select 1')
    expect(component.executedResult).toEqual({ validationStatus: true })
    expect(component.executed).toBe(false)

    component.contentData.compositeType = 'mysql'
    component.run()
    expect(dbmsSvc.compositeQuery).toHaveBeenCalledWith('select 1', 'mysql')
  })

  it('runs static query, records failures and skips when no query', () => {
    component.resourceContent.rdbms = { dropdown: false, query: 'select now()' }
    component.ngOnChanges()
    component.run()
    expect(dbmsSvc.runQuery).toHaveBeenCalledWith('select now()')

    dbmsSvc.runQuery.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.run()
    expect(component.errorMessage).toBe('error')

    component.contentData.query = ''
    component.executedResult = { old: true } as any
    component.run()
    expect(component.executedResult).toBeNull()
  })

  it('raises telemetry and repeats while timers are active', () => {
    component.resourceContent.content.identifier = 'rdbms-1'
    component.raiseInputChange()
    component.raiseClickEvent()

    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalledWith({ type: 'editor', subType: 'codeinput', id: 'rdbms-1' }, { id: 'rdbms-1' })
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalledWith({ type: 'editor', subType: 'buttonclick', id: 'rdbms-1' }, { id: 'rdbms-1' })

    component.isInput = true
    component.isClick = true
    jest.advanceTimersByTime(2 * 60000)
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalled()
  })
})
