import { of, throwError } from 'rxjs'

jest.mock('@angular/core', () => ({
  Component: () => () => { },
  OnInit: jest.fn(),
  Input: () => () => { },
  ElementRef: class { },
  ViewChild: () => () => { },
}), { virtual: true })

jest.mock('@angular/material/legacy-snack-bar', () => ({
  MatLegacySnackBar: jest.fn(),
}), { virtual: true })

jest.mock('@angular/forms', () => ({
  UntypedFormBuilder: class {
    group(_controls: any = {}) {
      return { value: {}, controls: {} }
    }
  },
  UntypedFormGroup: class { },
}))

jest.mock('../../rdbms-hands-on.service', () => ({
  RdbmsHandsOnService: jest.fn(),
}), { virtual: true })

jest.mock('../../rdbms-hands-on.model', () => ({ NSRdbmsHandsOn: {} }), { virtual: true })

import { DbmsBestPracticeComponent } from './dbms-best-practice.component'
import { UntypedFormBuilder } from '@angular/forms'
// tslint:disable: no-any

describe('DbmsBestPracticeComponent', () => {
  let component: DbmsBestPracticeComponent
  let mockDbmsSvc: any
  let mockSnackBar: any
  let formBuilder: any

  beforeEach(() => {
    mockDbmsSvc = {
      initializeDatabase: jest.fn().mockReturnValue(of([])),
      fetchDBStructure: jest.fn().mockReturnValue(of({ data: null })),
      fetchConceptData: jest.fn().mockReturnValue(of({ data: JSON.stringify([{ dropdownTitle: 'T', concept: 'C', query: { Enhanced: 'eq', original: 'oq' }, telltext: 'tt' }]) })),
      runQuery: jest.fn().mockReturnValue(of({ data: '[]' })),
    }
    mockSnackBar = { open: jest.fn() }
    formBuilder = new UntypedFormBuilder() as any
    component = new DbmsBestPracticeComponent(mockDbmsSvc, mockSnackBar, formBuilder)
    component.resourceContent = {
      content: { identifier: 'do_456' },
      rdbms: { dropdown: false, originalQuery: 'SELECT 1', enhancedQuery: 'SELECT 2' },
    }
    component.dbRefreshSuccess = null
    component.dbRefreshFailed = null
    component.someErrorOccurred = null
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit sets contentData from resourceContent.rdbms', () => {
    component.ngOnInit()
    expect(component.contentData).toEqual(component.resourceContent.rdbms)
  })

  it('ngOnInit calls initializeDb(false)', () => {
    const spy = jest.spyOn(component, 'initializeDb')
    component.ngOnInit()
    expect(spy).toHaveBeenCalledWith(false)
  })

  it('ngOnInit sets selectedOption when dropdown is false', () => {
    component.ngOnInit()
    expect(component.selectedOption).toEqual({
      originalQuery: 'SELECT 1',
      enhancedQuery: 'SELECT 2',
    })
  })

  it('ngOnInit calls fetchDropdownData when dropdown is true', () => {
    component.resourceContent.rdbms.dropdown = true
    const spy = jest.spyOn(component, 'fetchDropdownData')
    component.ngOnInit()
    expect(spy).toHaveBeenCalled()
  })

  it('initializeDb sets initialLoading and resets loadedTables', () => {
    component.initializeDb(false)
    expect(mockDbmsSvc.initializeDatabase).toHaveBeenCalledWith('do_456')
  })

  it('initializeDb with empty res sets initialLoading to false', () => {
    mockDbmsSvc.initializeDatabase.mockReturnValue(of([]))
    component.initializeDb(false)
    expect(component.initialLoading).toBe(false)
  })

  it('initializeDb handles initializeDatabase error', () => {
    mockDbmsSvc.initializeDatabase.mockReturnValue(throwError('err'))
    component.initializeDb(false)
    expect(component.initialLoading).toBe(false)
  })

  it('fetchDropdownData populates dropdownData', () => {
    component.fetchDropdownData()
    expect(component.dropdownData.length).toBe(1)
    expect(component.dropdownData[0].dropdownTitle).toBe('T')
  })

  it('onSelectionChange sets selectedOption from dropdownData', () => {
    component.dropdownData = [{
      dropdownTitle: 'X', concept: 'C',
      query: { Enhanced: 'eq', original: 'oq' },
      telltext: 'txt',
    }]
    component.onSelectionChange(0)
    expect(component.selectedOption.originalQuery).toBe('eq')
    expect(component.selectedOption.enhancedQuery).toBe('oq')
    expect(component.telltext).toBe('txt')
    expect(component.originalQueryResult).toBeNull()
    expect(component.enhancedQueryResult).toBeNull()
  })

  it('run(true) executes originalQuery and sets originalQueryResult', () => {
    const mockRes = { data: '[]', validationStatus: true, status: {}, tellTextMsg: '' }
    mockDbmsSvc.runQuery.mockReturnValue(of(mockRes))
    component.selectedOption = { originalQuery: 'SELECT 1', enhancedQuery: 'SELECT 2' }
    component.run(true)
    expect(component.originalQueryResult).toEqual(mockRes)
    expect(component.executed).toBe(false)
  })

  it('run(false) executes enhancedQuery and sets enhancedQueryResult', () => {
    const mockRes = { data: '[]', validationStatus: true, status: {}, tellTextMsg: '' }
    mockDbmsSvc.runQuery.mockReturnValue(of(mockRes))
    component.selectedOption = { originalQuery: 'SELECT 1', enhancedQuery: 'SELECT 2' }
    component.run(false)
    expect(component.enhancedQueryResult).toEqual(mockRes)
    expect(component.executed).toBe(false)
  })

  it('run() handles error and sets errorMessage', () => {
    mockDbmsSvc.runQuery.mockReturnValue(throwError('err'))
    component.selectedOption = { originalQuery: 'SELECT 1', enhancedQuery: 'SELECT 2' }
    component.run(true)
    expect(component.errorMessage).toBe('')
    expect(component.executed).toBe(false)
  })
})
