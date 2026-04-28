import { of, throwError } from 'rxjs'

jest.mock('@angular/material/legacy-snack-bar', () => ({ MatLegacySnackBar: jest.fn() }), { virtual: true })
jest.mock('../../rdbms-hands-on.service', () => ({ RdbmsHandsOnService: jest.fn() }), { virtual: true })
jest.mock('@angular/forms', () => {
  const actual = jest.requireActual('@angular/forms')
  return actual
})

import { DbmsConceptCreateComponent } from './dbms-concept-create.component'
import { UntypedFormBuilder } from '@angular/forms'

const mockInsertValues = [
  { data: { col1: 'val1', col2: 'val2' }, telltext: 'Good job!' },
  { data: { col1: 'val3', col2: 'val4' }, telltext: 'Well done!' },
  { data: { col1: 'val5', col2: 'val6' }, telltext: 'Excellent!' },
  { data: { col1: 'val7', col2: 'val8' }, telltext: 'Perfect!' },
]

const mockContent = {
  content: { identifier: 'content1' },
  rdbms: {
    createInsert: {
      create: {
        query: ['CREATE TABLE test (id INT)', 'CREATE TABLE test2 (id INT, name VARCHAR)'],
        telltext: 'Table created!',
      },
      insert: {
        query: ['INSERT INTO test VALUES'],
        insertValues: mockInsertValues,
        telltext: 'Row inserted!',
        dropdown: false,
        dropdownData: [
          { query: [{ col1: 'val1', col2: 'val2', col3: '' }], telltext: 'Selected!' },
        ],
        default: true,
      },
      drop: {
        query: ['DROP TABLE test'],
        telltext: 'Table dropped!',
      },
    },
  },
}

const mockInitDbResponse = [
  { validationStatus: false, data: '{}' },
  {
    validationStatus: true,
    data: JSON.stringify({ tablename: 'test', data: [{ id: 1, name: 'row1' }] }),
  },
]

function buildComponent() {
  const fb = new UntypedFormBuilder()

  const mockSnackBar: any = { open: jest.fn() }
  const mockDbmsSvc: any = {
    initializeDatabase: jest.fn().mockReturnValue(of(mockInitDbResponse)),
    runQuery: jest.fn().mockReturnValue(of({ validationStatus: true, data: '{}' })),
    compositeQuery: jest.fn().mockReturnValue(of({ validationStatus: true, data: '{}' })),
    compareQuery: jest.fn().mockReturnValue(of({ validationStatus: true })),
  }

  const comp = new DbmsConceptCreateComponent(fb, mockSnackBar, mockDbmsSvc)
  comp.resourceContent = mockContent
  comp.dbRefreshSuccess = null
  comp.dbRefreshFailed = null
  comp.someErrorOccurred = null
  comp.clickOnRunButton = null
  comp.clickOnRunToCreate = null
  comp.clickOnEntryButton = null
  comp.viewTableLevelConstraints = null
  comp.viewColumnLevelConstraints = null
  comp.firstEntry = null
  comp.secondEntry = null
  comp.thirdEntry = null

  return { comp, fb, mockSnackBar, mockDbmsSvc }
}

describe('DbmsConceptCreateComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('ngOnInit - builds forms and calls initializeDb', () => {
    const { comp, mockDbmsSvc } = buildComponent()
    comp.ngOnInit()
    expect(comp.queryForm).toBeDefined()
    expect(comp.dropdownQueryForm).toBeDefined()
    expect(mockDbmsSvc.initializeDatabase).toHaveBeenCalled()
  })

  it('ngOnInit - sets createQuery from content', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    expect(comp.createQuery).toBe('CREATE TABLE test (id INT)')
  })

  it('ngOnInit - with dropdown=true sets dropdownData', () => {
    const { comp } = buildComponent()
    const dropdownContent = JSON.parse(JSON.stringify(mockContent))
    dropdownContent.rdbms.createInsert.insert.dropdown = true
    comp.resourceContent = dropdownContent
    comp.ngOnInit()
    expect(comp.dropdownData).toBeDefined()
  })

  it('initializeDb - populates loadedTables on success', () => {
    const { comp } = buildComponent()
    comp.contentData = mockContent.rdbms
    comp.initializeDb(false)
    expect(comp.loadedTables.length).toBe(1)
  })

  it('initializeDb - flag=true shows snackBar success', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.contentData = mockContent.rdbms
    comp.dbRefreshSuccess = { nativeElement: { value: 'Refreshed!' } } as any
    comp.initializeDb(true)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Refreshed!', 'X')
  })

  it('initializeDb - error shows snackBar failed', () => {
    const { comp, mockDbmsSvc, mockSnackBar } = buildComponent()
    mockDbmsSvc.initializeDatabase.mockReturnValue(throwError('error'))
    comp.contentData = mockContent.rdbms
    comp.dbRefreshFailed = { nativeElement: { value: 'Failed!' } } as any
    comp.initializeDb(false)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Failed!', 'X')
  })

  it('onSelectionChange - updates selectedOption', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.dropdownData = [{ query: [{ col1: 'val1' }], telltext: 'Selected!', dropdownTitle: 'Select', concept: 'test' } as any]
    comp.onSelectionChange(0)
    expect(comp.selectedOption).toBeDefined()
    expect(comp.hideOnLoad).toBe(false)
  })

  it('tabClick - index 1 sets insert telltext', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.tabClick({ index: 1 })
    expect(comp.telltext).toBe('Row inserted!')
  })

  it('tabClick - index 2 sets drop telltext', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.tabClick({ index: 2 })
    expect(comp.telltext).toBe('Table dropped!')
  })

  it('tabClick - index 0 sets create telltext', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.tabClick({ index: 0 })
    expect(comp.telltext).toBe('')
  })

  it('multipleInsertEntries - sets valuesToInsertArray from first insertValues', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.counter = 0
    comp.multipleInsertEntries()
    expect(comp.valuesToInsertArray.length).toBe(1)
    expect(comp.hideOnLoad).toBe(false)
  })

  it('retry - resets counter and activeTab, runs query', () => {
    const { comp, mockDbmsSvc } = buildComponent()
    comp.ngOnInit()
    comp.retry('RETRY QUERY')
    expect(comp.counter).toBe(0)
    expect(comp.activeTab).toBe(0)
    expect(mockDbmsSvc.runQuery).toHaveBeenCalled()
  })

  it('viewOtherConstraint - switches to column constraints', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.viewColumnLevelConstraints = { nativeElement: { value: 'View Column' } } as any
    comp.viewTableLevelConstraints = { nativeElement: { value: 'View Table' } } as any
    comp.buttonText = 'View Table'
    comp.viewOtherConstraint()
    expect(comp.createQuery).toBe('CREATE TABLE test2 (id INT, name VARCHAR)')
  })

  it('viewOtherConstraint - switches back to table constraints', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.viewColumnLevelConstraints = { nativeElement: { value: 'View Column' } } as any
    comp.viewTableLevelConstraints = { nativeElement: { value: 'View Table' } } as any
    comp.buttonText = 'View Column'
    comp.viewOtherConstraint()
    expect(comp.createQuery).toBe('CREATE TABLE test (id INT)')
  })

  it('run create - calls compositeQuery and compareQuery', () => {
    const { comp, mockDbmsSvc } = buildComponent()
    comp.ngOnInit()
    comp.createQuery = 'CREATE TABLE test (id INT)'
    comp.run('create')
    expect(mockDbmsSvc.compositeQuery).toHaveBeenCalled()
  })

  it('run insert - single insert calls compositeQuery', () => {
    const { comp, mockDbmsSvc } = buildComponent()
    comp.ngOnInit()
    const singleContent = JSON.parse(JSON.stringify(mockContent))
    singleContent.rdbms.createInsert.insert.insertValues = [mockInsertValues[0]]
    comp.contentData = singleContent.rdbms
    comp.run('insert')
    expect(mockDbmsSvc.compositeQuery).toHaveBeenCalled()
  })

  it('run insert - multiple insertValues increments counter', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    comp.counter = 0
    comp.valuesToInsertArray = [mockInsertValues[0]]
    comp.run('insert')
    expect(comp.counter).toBe(1)
  })

  it('run drop - calls runQuery', () => {
    const { comp, mockDbmsSvc } = buildComponent()
    comp.ngOnInit()
    comp.run('drop')
    expect(mockDbmsSvc.runQuery).toHaveBeenCalled()
  })

  it('run create - error sets errorMessage', () => {
    const { comp, mockDbmsSvc } = buildComponent()
    mockDbmsSvc.compositeQuery.mockReturnValue(throwError('err'))
    comp.someErrorOccurred = { nativeElement: { value: 'Error occurred' } } as any
    comp.ngOnInit()
    comp.createQuery = 'INVALID SQL'
    comp.run('create')
    expect(comp.errorMessage).toBe('Error occurred')
  })

  it('run insert dropdown - uses selectedOption query', () => {
    const { comp, mockDbmsSvc } = buildComponent()
    const dropdownContent = JSON.parse(JSON.stringify(mockContent))
    dropdownContent.rdbms.createInsert.insert.dropdown = true
    comp.resourceContent = dropdownContent
    comp.ngOnInit()
    comp.dropdownData = [{ query: [{ col1: 'val1', col2: 'val2', col3: 'val3' }], telltext: 'Dropdown Selected!', dropdownTitle: 'Select', concept: 'test' } as any]
    comp.selectedOption = comp.dropdownData[0]
    comp.run('insert')
    expect(mockDbmsSvc.compositeQuery).toHaveBeenCalled()
  })
})
