import { of, throwError } from 'rxjs'

jest.mock('@angular/core', () => ({
  Component: () => () => { },
  OnChanges: jest.fn(),
  Input: () => () => { },
  ElementRef: class { },
  ViewChild: () => () => { },
}), { virtual: true })

jest.mock('../../rdbms-hands-on.service', () => ({
  RdbmsHandsOnService: jest.fn(),
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  EventService: jest.fn(),
}), { virtual: true })

jest.mock('../../rdbms-hands-on.model', () => ({ NSRdbmsHandsOn: {} }), { virtual: true })

import { DbmsPlaygroundComponent } from './dbms-playground.component'

describe('DbmsPlaygroundComponent', () => {
  let component: DbmsPlaygroundComponent
  let mockDbmsSvc: any
  let mockEventSvc: any

  beforeEach(() => {
    mockDbmsSvc = {
      initializeDatabase: jest.fn().mockReturnValue(of({})),
      playground: jest.fn().mockReturnValue(of([{ data: 'result' }])),
    }
    mockEventSvc = {
      raiseInteractTelemetry: jest.fn(),
    }
    component = new DbmsPlaygroundComponent(mockDbmsSvc, mockEventSvc)
    component.resourceContent = {
      content: { identifier: 'do_123' },
    }
    component.someErrorOccurred = null
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default property values', () => {
    expect(component.firstInput).toBe(true)
    expect(component.firstClick).toBe(true)
    expect(component.userQuery).toBe('')
    expect(component.executed).toBe(false)
    expect(component.loading).toBe(true)
  })

  it('ngOnChanges resets state and calls initializeDatabase', () => {
    component.userQuery = 'SELECT 1'
    component.errorMessage = 'some error'
    component.executedResult = { data: 'x' } as any
    component.ngOnChanges()
    expect(component.userQuery).toBe('')
    expect(component.errorMessage).toBe('')
    expect(component.executedResult).toBeNull()
    expect(mockDbmsSvc.initializeDatabase).toHaveBeenCalledWith('do_123')
  })

  it('run() executes playground query and sets executedResult on success', () => {
    const mockResult = [{ data: 'result', status: {} }]
    mockDbmsSvc.playground.mockReturnValue(of(mockResult))
    component.userQuery = 'SELECT * FROM users'
    component.run()
    expect(component.executed).toBe(false)
    expect(component.executedResult).toEqual(mockResult[0])
  })

  it('run() handles error and sets errorMessage', () => {
    mockDbmsSvc.playground.mockReturnValue(throwError('err'))
    component.run()
    expect(component.executed).toBe(false)
    expect(component.errorMessage).toBe('')
  })

  it('raiseInputChange calls telemetry on first input and resets isInput', () => {
    component.firstInput = true
    jest.useFakeTimers()
    component.raiseInputChange()
    // raiseInteractTelemetry('editor','codeinput') resets isInput to false
    expect(component.isInput).toBe(false)
    expect(component.firstInput).toBe(false)
    expect(mockEventSvc.raiseInteractTelemetry).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('raiseInputChange does not call telemetry again on subsequent inputs', () => {
    component.firstInput = false
    component.raiseInputChange()
    expect(mockEventSvc.raiseInteractTelemetry).not.toHaveBeenCalled()
  })

  it('raiseClickEvent calls telemetry on first click and resets isClick', () => {
    component.firstClick = true
    jest.useFakeTimers()
    component.raiseClickEvent()
    // raiseInteractTelemetry('editor','buttonclick') resets isClick to false
    expect(component.isClick).toBe(false)
    expect(component.firstClick).toBe(false)
    expect(mockEventSvc.raiseInteractTelemetry).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('raiseClickEvent does not call telemetry again on subsequent clicks', () => {
    component.firstClick = false
    component.raiseClickEvent()
    expect(mockEventSvc.raiseInteractTelemetry).not.toHaveBeenCalled()
  })

  it('raiseInteractTelemetry calls eventSvc with correct params', () => {
    component.raiseInteractTelemetry('editor', 'codeinput')
    expect(mockEventSvc.raiseInteractTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'editor', subType: 'codeinput', id: 'do_123' }),
      expect.objectContaining({ id: 'do_123' }),
    )
  })

  it('raiseInteractTelemetry sets isInput false when event is codeinput', () => {
    component.isInput = true
    component.raiseInteractTelemetry('editor', 'codeinput')
    expect(component.isInput).toBe(false)
  })

  it('raiseInteractTelemetry sets isClick false when event is buttonclick', () => {
    component.isClick = true
    component.raiseInteractTelemetry('editor', 'buttonclick')
    expect(component.isClick).toBe(false)
  })
})
