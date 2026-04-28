import { of, throwError } from 'rxjs'
import { DbmsExerciseComponent } from './dbms-exercise.component'

describe('DbmsExerciseComponent', () => {
  let component: DbmsExerciseComponent
  let snackBar: any
  let dbmsSvc: any
  let dialog: any
  let eventSvc: any

  beforeEach(() => {
    jest.useFakeTimers()
    snackBar = { open: jest.fn() }
    dbmsSvc = {
      initializeDatabase: jest.fn(() => of([])),
      fetchDBStructure: jest.fn(() => of({ data: JSON.stringify([{ table: 'users' }]) })),
      fetchExpectedOutput: jest.fn(() => of({ validationStatus: true })),
      verifyQuery: jest.fn(() => of({ validationStatus: true, tellTextMsg: 'ok' })),
      submitQuery: jest.fn(() => of({
        verifyResult: { validationStatus: true },
        submissionMessage: 'submitted',
        submitionStatus: true,
        tellTextMsg: 'done',
      })),
    }
    dialog = { open: jest.fn(() => ({ afterClosed: () => of('submit') })) }
    eventSvc = { raiseInteractTelemetry: jest.fn() }
    component = new DbmsExerciseComponent(snackBar, dbmsSvc, dialog, eventSvc)
    component.resourceContent = { content: { identifier: 'db-1' }, rdbms: { query: 'select 1', expectedOutput: true } }
    component.dbRefreshSuccess = { nativeElement: { value: 'success' } } as any
    component.dbRefreshFailed = { nativeElement: { value: 'failed' } } as any
    component.someErrorOccurred = { nativeElement: { value: 'error' } } as any
  })

  afterEach(() => {
    component.ngOnDestroy()
    jest.useRealTimers()
  })

  it('initializes db structure and expected output', () => {
    component.ngOnChanges()
    expect(component.contentData.query).toBe('select 1')
    expect(component.dbStructure).toEqual([{ table: 'users' }])
    expect(component.expectedOutput).toEqual({ validationStatus: true })
    expect(component.initialLoading).toBe(true)
    expect(component.loading).toBe(false)
  })

  it('shows refresh success/failure and expected output failure', () => {
    component.contentData = component.resourceContent.rdbms
    component.initializeDb(true)
    expect(snackBar.open).toHaveBeenCalledWith('success', 'X')

    dbmsSvc.fetchExpectedOutput.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.initializeDb(false)
    expect(component.expectedOutputErrorMsg).toBe('error')

    dbmsSvc.initializeDatabase.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.initializeDb(true)
    expect(snackBar.open).toHaveBeenCalledWith('failed', 'X')
  })

  it('verifies query and handles verify failure and empty query', () => {
    component.contentData = component.resourceContent.rdbms
    component.verify()
    expect(dbmsSvc.verifyQuery).toHaveBeenCalledWith({ input_data: 'select 1', ignore_error: true }, 'db-1')
    expect(component.executedResult).toEqual({ validationStatus: true, tellTextMsg: 'ok' })
    expect(component.telltext).toBe('ok')

    dbmsSvc.verifyQuery.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.verify()
    expect(component.errorMessage).toBe('error')
    expect(component.verified).toBe(false)

    component.contentData.query = ''
    component.verify()
    expect(component.executedResult).toBeNull()
  })

  it('submits query, confirms invalid submission and handles submit failure', () => {
    component.contentData = component.resourceContent.rdbms
    component.submit()
    expect(component.submissionResult).toEqual({ message: 'submitted', status: true })
    expect(component.ignoreError).toBe(false)

    dbmsSvc.submitQuery.mockReturnValueOnce(of({ verifyResult: { validationStatus: false }, tellTextMsg: 'bad' }))
    component.submit()
    expect(dialog.open).toHaveBeenCalled()
    expect(component.ignoreError).toBe(false)

    dbmsSvc.submitQuery.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.submit()
    expect(component.errorMessage).toBe('error')
    expect(component.submitted).toBe(false)
  })

  it('raises telemetry and repeats while timers are active', () => {
    component.raiseInputChange()
    component.raiseClickEvent()
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalledWith({ type: 'editor', subType: 'codeinput', id: 'db-1' }, { id: 'db-1' })
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalledWith({ type: 'editor', subType: 'buttonclick', id: 'db-1' }, { id: 'db-1' })

    component.isInput = true
    component.isClick = true
    jest.advanceTimersByTime(2 * 60000)
    expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalled()
  })
})
