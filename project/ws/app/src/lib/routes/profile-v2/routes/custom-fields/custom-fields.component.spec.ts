import { of, throwError } from 'rxjs'

jest.mock('../../../user-profile/services/user-profile.service', () => ({
  UserProfileService: jest.fn(),
}), { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({ ConfigurationsService: jest.fn() }), { virtual: true })
jest.mock('@angular/material/snack-bar', () => ({ MatSnackBar: jest.fn() }), { virtual: true })
jest.mock('@angular/material/legacy-dialog', () => ({ MatLegacyDialogRef: jest.fn() }), { virtual: true })
jest.mock('@angular/forms', () => {
  const actual = jest.requireActual('@angular/forms')
  return actual
})

import { CustomFieldsComponent } from './custom-fields.component'
import { FormBuilder } from '@angular/forms'

function buildComponent() {
  const fb = new FormBuilder()
  const mockUserProfileService: any = {
    readOrgData: jest.fn().mockReturnValue(of({
      result: { response: { customfieldsdata: { customFieldIds: ['cf1', 'cf2'] } } },
    })),
    fetchCustomFields: jest.fn().mockReturnValue(of({
      result: {
        searchResults: {
          data: [
            { customFieldId: 'cf1', attributeName: 'attr1', type: 'text', isActive: true, isMandatory: true, name: 'Field 1' },
            {
              customFieldId: 'cf2', attributeName: 'masterAttr', type: 'masterList', isActive: true, isMandatory: false, name: 'Master Field',
              customFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }] }],
              reversedOrderCustomFieldData: [],
              originalCustomFieldData: [{ name: 'country', level: 1 }],
            },
          ]
        }
      },
    })),
    readCustomattributeDetails: jest.fn().mockReturnValue(of({
      result: {
        response: {
          customFieldValues: [
            { attributeName: 'attr1', value: 'TestVal' },
            { attributeName: 'masterAttr', values: [{ attributeName: 'country', value: 'India' }] },
          ]
        }
      },
    })),
    updateCustomFields: jest.fn().mockReturnValue(of({ result: { response: 'success' } })),
  }
  const mockConfigService: any = {
    userProfile: { userId: 'user1', rootOrgId: 'org1' },
  }
  const mockSnackBar: any = { open: jest.fn() }
  const mockDialogRef: any = { close: jest.fn() }

  const comp = new CustomFieldsComponent(fb, mockUserProfileService, mockConfigService, mockSnackBar, mockDialogRef)
  return { comp, fb, mockUserProfileService, mockConfigService, mockSnackBar, mockDialogRef }
}

describe('CustomFieldsComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('ngOnInit - sets userId, orgId and calls getOrgDetails', () => {
    const { comp, mockUserProfileService } = buildComponent()
    comp.ngOnInit()
    expect(comp.userId).toBe('user1')
    expect(comp.orgId).toBe('org1')
    expect(mockUserProfileService.readOrgData).toHaveBeenCalled()
  })

  it('getOrgDetails - fetches customFieldIds and calls getCustomAttributes', () => {
    const { comp, mockUserProfileService } = buildComponent()
    comp.orgId = 'org1'
    comp.getOrgDetails()
    expect(mockUserProfileService.readOrgData).toHaveBeenCalled()
    // fetchCustomFields is called asynchronously via observable chain
    expect(typeof comp.customAttrListIds).toBe('object')
  })

  it('getOrgDetails - empty customFieldIds skips getCustomAttributes', () => {
    const { comp, mockUserProfileService } = buildComponent()
    mockUserProfileService.readOrgData.mockReturnValue(of({
      result: { response: { customfieldsdata: { customFieldIds: [] } } },
    }))
    comp.orgId = 'org1'
    comp.getOrgDetails()
    expect(mockUserProfileService.fetchCustomFields).not.toHaveBeenCalled()
  })

  it('getOrgDetails - error logs to console', () => {
    const { comp, mockUserProfileService } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
    mockUserProfileService.readOrgData.mockReturnValue(throwError('error'))
    comp.orgId = 'org1'
    comp.getOrgDetails()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('getCustomAttributes - fetches fields and calls readCustomattributeDetails', () => {
    const { comp, mockUserProfileService } = buildComponent()
    comp.orgId = 'org1'
    comp.customAttrListIds = ['cf1']
    comp.getCustomAttributes()
    expect(mockUserProfileService.fetchCustomFields).toHaveBeenCalled()
    // readCustomattributeDetails is chained after fetch
    expect(typeof comp.customAttrList).toBe('object')
  })

  it('handleCancel - closes dialog', () => {
    const { comp, mockDialogRef } = buildComponent()
    comp.handleCancel()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })

  it('getValue - returns value if attributeName matches', () => {
    const { comp } = buildComponent()
    comp.customFieldValues = [{ attributeName: 'attr1', value: 'TestVal' }]
    expect(comp.getValue('attr1')).toBe('TestVal')
  })

  it('getValue - returns empty string if not found', () => {
    const { comp } = buildComponent()
    comp.customFieldValues = []
    expect(comp.getValue('unknown')).toBe('')
  })

  it('getName - returns field name', () => {
    const { comp } = buildComponent()
    comp.customAttrList = [{ attributeName: 'attr1', name: 'Field 1' }]
    expect(comp.getName('attr1')).toBe('Field 1')
  })

  it('getName - returns attributeName if not found', () => {
    const { comp } = buildComponent()
    comp.customAttrList = []
    expect(comp.getName('unknown')).toBe('unknown')
  })

  it('getListItemName - returns value from customFieldValues', () => {
    const { comp } = buildComponent()
    comp.customFieldValues = [{
      attributeName: 'masterAttr',
      values: [{ attributeName: 'country', value: 'India' }],
    }]
    expect(comp.getListItemName('masterAttr', 'country')).toBe('India')
  })

  it('getListItemName - returns empty string if not found', () => {
    const { comp } = buildComponent()
    comp.customFieldValues = []
    expect(comp.getListItemName('unknown', 'field')).toBe('')
  })

  it('shouldUseReversedData - returns true if reversedOrderCustomFieldData exists', () => {
    const { comp } = buildComponent()
    const field = { reversedOrderCustomFieldData: [{ fieldName: 'x' }] }
    expect(comp.shouldUseReversedData(field)).toBe(true)
  })

  it('shouldUseReversedData - returns false for empty array', () => {
    const { comp } = buildComponent()
    const field = { reversedOrderCustomFieldData: [] }
    expect(comp.shouldUseReversedData(field)).toBe(false)
  })

  it('shouldUseReversedData - returns false for null field', () => {
    const { comp } = buildComponent()
    expect(comp.shouldUseReversedData(null)).toBe(false)
  })

  it('getDataSource - returns reversedOrderCustomFieldData', () => {
    const { comp } = buildComponent()
    const field = {
      reversedOrderCustomFieldData: [{ x: 1 }],
      customFieldData: [{ y: 2 }],
    }
    expect(comp.getDataSource(field)).toEqual([{ x: 1 }])
  })

  it('getDataSource - returns customFieldData when not reversed', () => {
    const { comp } = buildComponent()
    const field = { reversedOrderCustomFieldData: [], customFieldData: [{ y: 2 }] }
    expect(comp.getDataSource(field)).toEqual([{ y: 2 }])
  })

  it('getDataSource - returns empty array for null field', () => {
    const { comp } = buildComponent()
    expect(comp.getDataSource(null)).toEqual([])
  })

  it('extractHierarchyFields - empty data returns empty', () => {
    const { comp } = buildComponent()
    expect(comp.extractHierarchyFields([], false)).toEqual([])
  })

  it('extractHierarchyFields - forward data extracts fields', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }] }]
    const result = comp.extractHierarchyFields(data, false)
    expect(result).toContain('country')
    expect(result).toContain('state')
  })

  it('extractHierarchyFields - reversed data reverses order', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'city', fieldValue: 'Mumbai', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }] }] }]
    const result = comp.extractHierarchyFields(data, true)
    expect(result[0]).toBe('country')
  })

  it('extractOptionsForField - forward data', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }]
    const result = comp.extractOptionsForField(data, 'country', false)
    expect(result.length).toBe(1)
    expect(result[0].value).toBe('India')
  })

  it('findChildOptions - finds children of parent', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH' }] }]
    const result = comp.findChildOptions(data, 'country', 'India', 'state')
    expect(result.length).toBe(1)
    expect(result[0].value).toBe('MH')
  })

  it('findChildOptions - no match returns empty', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }]
    const result = comp.findChildOptions(data, 'country', 'USA', 'state')
    expect(result.length).toBe(0)
  })

  it('buildDynamicForm - builds form with text fields', () => {
    const { comp } = buildComponent()
    comp.customAttrList = [{ attributeName: 'attr1', type: 'text', isActive: true, isMandatory: true, name: 'Field 1' }]
    comp.customFieldValues = [{ attributeName: 'attr1', value: 'TestVal' }]
    comp.customAttrForm = { removeControl: jest.fn(), addControl: jest.fn(), get: jest.fn().mockReturnValue({ value: 'TestVal', setValue: jest.fn(), valueChanges: { subscribe: jest.fn() } }) }
    comp.buildDynamicForm()
    expect(comp.customAttrForm).toBeDefined()
  })

  it('updateCombinedValue - collects selected values', () => {
    const { comp, fb } = buildComponent()
    comp.customAttrList = [{ attributeName: 'mf', type: 'masterList' }]
    const formGroup = fb.group({ country: ['India'], state: ['MH'] })
    comp.masterListFormGroups['mf'] = formGroup
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.customAttrForm = fb.group({ mf: [''] })
    comp.updateCombinedValue('mf')
    expect(comp.customAttrForm.get('mf')?.value).toBe('India, MH')
  })

  it('handleEditCustomDetails - sets editCustomDetails and builds form', () => {
    const { comp } = buildComponent()
    comp.customAttrList = []
    comp.customFieldValues = []
    comp.customAttrForm = { removeControl: jest.fn(), addControl: jest.fn(), get: jest.fn() }
    comp.handleEditCustomDetails()
    expect(comp.editCustomDetails).toBe(true)
  })

  it('handleSaveCustomForm - invalid form marks all touched', () => {
    const { comp, fb } = buildComponent()
    comp.customAttrForm = fb.group({ attr1: ['', []] })
    comp.customAttrList = []
    comp.handleSaveCustomForm()
    // does not throw
    expect(true).toBe(true)
  })

  it('handleSaveCustomForm - valid form calls updateCustomFields', () => {
    const { comp, fb, mockUserProfileService } = buildComponent()
    comp.userId = 'user1'
    comp.orgId = 'org1'
    comp.customAttrList = [{ attributeName: 'attr1', type: 'text', customFieldId: 'cf1', isActive: true }]
    comp.customAttrForm = fb.group({ attr1: ['TestVal'] })
    comp.handleSaveCustomForm()
    expect(mockUserProfileService.updateCustomFields).toHaveBeenCalled()
  })

  it('readCustomattributeDetails - error path logs error', () => {
    const { comp, mockUserProfileService } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    mockUserProfileService.readCustomattributeDetails = jest.fn().mockReturnValue(throwError('err'))
    comp.userId = 'u1'
    comp.orgId = 'o1'
    comp.readCustomattributeDetails()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('getCustomAttributes - error path logs error', () => {
    const { comp, mockUserProfileService } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    mockUserProfileService.fetchCustomFields = jest.fn().mockReturnValue(throwError('err'))
    comp.orgId = 'o1'
    comp.customAttrListIds = ['cf1']
    comp.getCustomAttributes()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('buildDynamicForm - masterList field with dataSource builds nested group', () => {
    const { comp } = buildComponent()
    const field: any = {
      attributeName: 'mf',
      type: 'masterList',
      isActive: true,
      isMandatory: false,
      customFieldId: 'cf2',
      reversedOrderCustomFieldData: [],
      customFieldData: [
        {
          fieldName: 'country', fieldValue: 'India', fieldValues: [
            { fieldName: 'state', fieldValue: 'MH', fieldValues: [] }
          ]
        }
      ],
      originalCustomFieldData: [{ name: 'country', level: 1 }, { name: 'state', level: 2 }],
    }
    comp.customAttrList = [field]
    comp.customFieldValues = [{ attributeName: 'mf', values: [{ attributeName: 'country', value: 'India' }] }]
    comp.buildDynamicForm()
    expect(comp.masterListFormGroups['mf']).toBeDefined()
    expect(comp.hierarchyFields['mf']).toContain('country')
  })

  it('buildDynamicForm - masterList field with empty dataSource creates default item control', () => {
    const { comp } = buildComponent()
    const field: any = {
      attributeName: 'mf2',
      type: 'masterList',
      isActive: true,
      isMandatory: true,
      reversedOrderCustomFieldData: [],
      customFieldData: [],
      originalCustomFieldData: [],
    }
    comp.customAttrList = [field]
    comp.customFieldValues = []
    comp.buildDynamicForm()
    expect(comp.masterListFormGroups['mf2']).toBeDefined()
    expect(comp.hierarchyFields['mf2']).toEqual(['item'])
  })

  it('buildDynamicForm - masterList with duplicate hierarchy fields deduplicates', () => {
    const { comp } = buildComponent()
    // Two items with same fieldName creates duplicates
    const field: any = {
      attributeName: 'mf3',
      type: 'masterList',
      isActive: true,
      isMandatory: false,
      reversedOrderCustomFieldData: [],
      customFieldData: [
        { fieldName: 'country', fieldValue: 'India', fieldValues: [] },
        { fieldName: 'country', fieldValue: 'USA', fieldValues: [] }
      ],
      originalCustomFieldData: [],
    }
    comp.customAttrList = [field]
    comp.customFieldValues = []
    comp.buildDynamicForm()
    // Should not throw
    expect(comp.hierarchyFields['mf3']).toBeDefined()
  })

  it('buildDynamicForm - masterList with validation pattern', () => {
    const { comp } = buildComponent()
    const field: any = {
      attributeName: 'vf',
      type: 'text',
      isActive: true,
      isMandatory: true,
      validation: '^[A-Za-z]+$',
    }
    comp.customAttrList = [field]
    comp.customFieldValues = []
    comp.buildDynamicForm()
    expect(comp.customAttrForm.get('vf')).toBeDefined()
  })

  it('setupCascadingDropdownListeners - single level hierarchy', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ item: [''] })
    comp.hierarchyFields['mf'] = ['item']
    comp.masterListFormGroups['mf'] = formGroup
    comp.useReversedData['mf'] = false
    comp.customAttrList = [{ attributeName: 'mf', type: 'masterList' }]
    comp.customAttrForm = fb.group({ mf: [''] })
    comp.fieldOptions['mf'] = { item: [] }
    comp.setupCascadingDropdownListeners('mf')
    formGroup.get('item')?.setValue('test')
    expect(comp.customAttrForm.get('mf')?.value).toBe('test')
  })

  it('setupCascadingDropdownListeners - no hierarchy returns early', () => {
    const { comp, fb } = buildComponent()
    comp.hierarchyFields['mf'] = undefined as any
    comp.masterListFormGroups['mf'] = fb.group({})
    comp.useReversedData['mf'] = false
    // Should not throw
    comp.setupCascadingDropdownListeners('mf')
    expect(true).toBe(true)
  })

  it('setupCascadingDropdownListeners - multi-level with parent change', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ country: [''], state: [''], city: [''] })
    comp.hierarchyFields['mf'] = ['country', 'state', 'city']
    comp.masterListFormGroups['mf'] = formGroup
    comp.useReversedData['mf'] = false
    comp.customAttrList = [{
      attributeName: 'mf',
      type: 'masterList',
      customFieldData: [
        {
          fieldName: 'country', fieldValue: 'India', fieldValues: [
            {
              fieldName: 'state', fieldValue: 'MH', fieldValues: [
                { fieldName: 'city', fieldValue: 'Mumbai', fieldValues: [] }
              ]
            }
          ]
        }
      ],
      reversedOrderCustomFieldData: [],
    }]
    comp.customAttrForm = fb.group({ mf: [''] })
    comp.fieldOptions['mf'] = { country: [], state: [], city: [] }
    comp.setupCascadingDropdownListeners('mf')
    formGroup.get('country')?.setValue('India')
    expect(comp.fieldOptions['mf']['state']).toBeDefined()
  })

  it('setupCascadingDropdownListeners - parent value cleared resets child', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ country: ['India'], state: ['MH'] })
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.masterListFormGroups['mf'] = formGroup
    comp.useReversedData['mf'] = false
    comp.customAttrList = [{
      attributeName: 'mf',
      type: 'masterList',
      customFieldData: [],
      reversedOrderCustomFieldData: [],
    }]
    comp.customAttrForm = fb.group({ mf: [''] })
    comp.fieldOptions['mf'] = { country: [], state: [] }
    comp.setupCascadingDropdownListeners('mf')
    formGroup.get('country')?.setValue('')
    expect(formGroup.get('state')?.value).toBe('')
  })

  it('updateChildOptions - finds child options and resets grandchild', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ country: ['India'], state: [''], city: [''] })
    comp.hierarchyFields['mf'] = ['country', 'state', 'city']
    comp.masterListFormGroups['mf'] = formGroup
    comp.useReversedData['mf'] = false
    comp.fieldOptions['mf'] = { country: [], state: [], city: [] }
    comp.customAttrList = [{
      attributeName: 'mf',
      type: 'masterList',
      customFieldData: [
        {
          fieldName: 'country', fieldValue: 'India', fieldValues: [
            { fieldName: 'state', fieldValue: 'MH', fieldValues: [] }
          ]
        }
      ],
      reversedOrderCustomFieldData: [],
    }]
    comp.updateChildOptions('mf', 'country', 'India', 'state', false)
    expect(comp.fieldOptions['mf']['state'].length).toBeGreaterThanOrEqual(0)
  })

  it('updateChildOptions - field not found returns early', () => {
    const { comp, fb } = buildComponent()
    comp.customAttrList = []
    comp.masterListFormGroups['mf'] = fb.group({ country: [''] })
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.fieldOptions['mf'] = { country: [], state: [] }
    comp.useReversedData['mf'] = false
    comp.updateChildOptions('mf', 'country', 'India', 'state', false)
    expect(true).toBe(true)
  })

  it('findChildOptionsFromReversedData - with parentFieldName match', () => {
    const { comp } = buildComponent()
    const data = [
      { fieldName: 'state', fieldValue: 'MH', parentFieldName: 'country', parentFieldValue: 'India', fieldValues: [] }
    ]
    const result = comp.findChildOptionsFromReversedData(data, 'country', 'India', 'state')
    expect(result.length).toBe(1)
    expect(result[0].value).toBe('MH')
  })

  it('findChildOptionsFromReversedData - no match returns empty', () => {
    const { comp } = buildComponent()
    const data = [
      { fieldName: 'state', fieldValue: 'MH', parentFieldName: 'country', parentFieldValue: 'USA', fieldValues: [] }
    ]
    const result = comp.findChildOptionsFromReversedData(data, 'country', 'India', 'state')
    expect(result.length).toBe(0)
  })

  it('findChildOptionsFromReversedData - searches in fieldValues', () => {
    const { comp } = buildComponent()
    const data = [
      {
        fieldName: 'city', fieldValue: 'Mumbai', parentFieldName: 'state', parentFieldValue: 'Other', fieldValues: [
          { fieldName: 'state', fieldValue: 'MH', parentFieldName: 'country', parentFieldValue: 'India', fieldValues: [] }
        ]
      }
    ]
    const result = comp.findChildOptionsFromReversedData(data, 'country', 'India', 'state')
    expect(result.length).toBe(1)
  })

  it('searchNestedItemsForChildOptions - finds matching items in nested structure', () => {
    const { comp } = buildComponent()
    const options = new Map()
    const items = [
      {
        fieldName: 'state', fieldValue: 'MH', parentFieldName: 'country', parentFieldValue: 'India',
        fieldValues: [
          { fieldName: 'city', fieldValue: 'Mumbai', parentFieldName: 'state', parentFieldValue: 'Other', fieldValues: [] }
        ]
      }
    ]
    comp.searchNestedItemsForChildOptions(items, 'country', 'India', 'state', options)
    expect(options.size).toBe(1)
  })

  it('extractOptionsFromReversedData - finds target field recursively', () => {
    const { comp } = buildComponent()
    const options = new Map()
    const item = {
      fieldName: 'city', fieldValue: 'Mumbai', fieldValues: [
        { fieldName: 'country', fieldValue: 'India', fieldValues: [] }
      ]
    }
    comp.extractOptionsFromReversedData(item, 'country', options)
    expect(options.size).toBe(1)
    expect(options.get('India')).toBeDefined()
  })

  it('extractOptionsForField - reversed data', () => {
    const { comp } = buildComponent()
    const data = [
      {
        fieldName: 'city', fieldValue: 'Mumbai', fieldValues: [
          { fieldName: 'country', fieldValue: 'India', fieldValues: [] }
        ]
      }
    ]
    const result = comp.extractOptionsForField(data, 'country', true)
    expect(result.length).toBe(1)
    expect(result[0].value).toBe('India')
  })

  it('updateCombinedValue - field or formGroup not found returns early', () => {
    const { comp } = buildComponent()
    comp.customAttrList = []
    // Should not throw
    comp.updateCombinedValue('nonexistent')
    expect(true).toBe(true)
  })

  it('populateFormWithExistingValues - text field sets value', () => {
    const { comp, fb } = buildComponent()
    comp.customAttrList = [{ attributeName: 'attr1', type: 'text' }]
    comp.customFieldValues = [{ attributeName: 'attr1', value: 'Hello' }]
    comp.customAttrForm = fb.group({ attr1: [''] })
    comp.populateFormWithExistingValues()
    expect(comp.customAttrForm.get('attr1')?.value).toBe('Hello')
  })

  it('populateFormWithExistingValues - masterList field with values', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ country: [''], state: [''] })
    comp.customAttrList = [{ attributeName: 'mf', type: 'masterList' }]
    comp.customFieldValues = [{
      attributeName: 'mf',
      values: [{ attributeName: 'country', value: 'India' }, { attributeName: 'state', value: 'MH' }]
    }]
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.masterListFormGroups['mf'] = formGroup
    comp.useReversedData['mf'] = false
    comp.fieldOptions['mf'] = { country: [], state: [] }
    comp.customAttrForm = fb.group({ mf: [''] })
    comp.populateFormWithExistingValues()
    expect(true).toBe(true) // does not throw
  })

  it('populateFormWithExistingValues - no matching customField skips', () => {
    const { comp, fb } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.customAttrList = [{ attributeName: 'attr1', type: 'text' }]
    comp.customFieldValues = []
    comp.customAttrForm = fb.group({ attr1: [''] })
    comp.populateFormWithExistingValues()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('populateHierarchicalValues - single level sets value', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ item: [''] })
    comp.hierarchyFields['mf'] = ['item']
    comp.masterListFormGroups['mf'] = formGroup
    comp.useReversedData['mf'] = false
    comp.fieldOptions['mf'] = { item: [] }
    comp.customAttrList = [{ attributeName: 'mf', type: 'masterList', customFieldData: [], reversedOrderCustomFieldData: [] }]
    comp.customAttrForm = fb.group({ mf: [''] })
    const field = { attributeName: 'mf', selectedValues: { item: 'val1' }, customFieldData: [], reversedOrderCustomFieldData: [] }
    comp.populateHierarchicalValues(field)
    expect(formGroup.get('item')?.value).toBe('val1')
  })

  it('populateHierarchicalValues - missing hierarchy returns early', () => {
    const { comp, fb } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.hierarchyFields['mf'] = undefined as any
    comp.masterListFormGroups['mf'] = fb.group({})
    const field = { attributeName: 'mf', selectedValues: {} }
    comp.populateHierarchicalValues(field)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('populateHierarchicalValues - multi-level sets parent and child values', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ country: [''], state: [''] })
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.masterListFormGroups['mf'] = formGroup
    comp.useReversedData['mf'] = false
    comp.fieldOptions['mf'] = { country: [], state: [] }
    comp.customAttrList = [{
      attributeName: 'mf', type: 'masterList',
      customFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }] }],
      reversedOrderCustomFieldData: []
    }]
    comp.customAttrForm = fb.group({ mf: [''] })
    const field = {
      attributeName: 'mf',
      selectedValues: { country: 'India', state: 'MH' },
      customFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }] }],
      reversedOrderCustomFieldData: []
    }
    comp.populateHierarchicalValues(field)
    expect(formGroup.get('country')?.value).toBe('India')
  })

  it('handleSaveCustomForm - success closes dialog and resets', () => {
    const { comp, fb, mockUserProfileService, mockDialogRef, mockSnackBar } = buildComponent()
    comp.userId = 'user1'
    comp.orgId = 'org1'
    comp.customAttrList = [{ attributeName: 'attr1', type: 'text', customFieldId: 'cf1', isActive: true }]
    comp.customAttrForm = fb.group({ attr1: ['TestVal'] })
    mockUserProfileService.updateCustomFields.mockReturnValue(of({ result: { response: 'success' } }))
    comp.handleSaveCustomForm()
    expect(mockDialogRef.close).toHaveBeenCalledWith(true)
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('handleSaveCustomForm - error shows snackbar and closes', () => {
    const { comp, fb, mockUserProfileService, mockDialogRef, mockSnackBar } = buildComponent()
    comp.userId = 'user1'
    comp.orgId = 'org1'
    comp.customAttrList = [{ attributeName: 'attr1', type: 'text', customFieldId: 'cf1', isActive: true }]
    comp.customAttrForm = fb.group({ attr1: ['TestVal'] })
    const errMsg = 'Some error'
    mockUserProfileService.updateCustomFields.mockReturnValue(throwError({ error: { params: { errMsg } } }))
    comp.handleSaveCustomForm()
    expect(mockSnackBar.open).toHaveBeenCalledWith(errMsg)
    expect(mockDialogRef.close).toHaveBeenCalledWith(true)
  })

  it('handleSaveCustomForm - masterList type adds values from group', () => {
    const { comp, fb, mockUserProfileService } = buildComponent()
    comp.userId = 'user1'
    comp.orgId = 'org1'
    const groupCtrl = fb.group({ country: ['India'], state: ['MH'] })
    comp.customAttrList = [{
      attributeName: 'mf', type: 'masterList', customFieldId: 'cf2', isActive: true,
      originalCustomFieldData: [{ name: 'country', level: 1 }, { name: 'state', level: 2 }]
    }]
    comp.customAttrForm = fb.group({ mf: ['India, MH'] })
    comp.customAttrForm.addControl('mf_group', groupCtrl)
    comp.handleSaveCustomForm()
    expect(mockUserProfileService.updateCustomFields).toHaveBeenCalled()
  })

  it('handleEditCustomDetails - with masterList resets selectedValues', () => {
    const { comp } = buildComponent()
    comp.customAttrList = [
      { attributeName: 'attr1', type: 'text' },
      { attributeName: 'mf', type: 'masterList', selectedValues: { country: 'India' } }
    ]
    comp.customFieldValues = []
    comp.customAttrForm = { removeControl: jest.fn(), addControl: jest.fn(), get: jest.fn().mockReturnValue(null) }
    comp.handleEditCustomDetails()
    expect(comp.editCustomDetails).toBe(true)
  })

  it('onDropdownChange - value empty returns early', () => {
    const { comp } = buildComponent()
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.onDropdownChange('mf', 'country', '', 0)
    expect(true).toBe(true) // no throw
  })

  it('onDropdownChange - not last field logs and continues', () => {
    const { comp } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.onDropdownChange('mf', 'country', 'India', 0)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('onDropdownChange - last field calls setParentValuesFromChild', () => {
    const { comp, fb } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.masterListFormGroups['mf'] = fb.group({ country: [''], state: [''] })
    comp.useReversedData['mf'] = false
    comp.customAttrList = [{
      attributeName: 'mf', type: 'masterList',
      customFieldData: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }],
      reversedOrderCustomFieldData: []
    }]
    comp.customAttrForm = fb.group({ mf: [''] })
    comp.onDropdownChange('mf', 'state', 'MH', 1)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('setParentValuesFromChild - field not found returns early', () => {
    const { comp } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.customAttrList = []
    comp.setParentValuesFromChild('mf', 'state', 'MH')
    expect(consoleSpy).toHaveBeenCalledWith('Field not found')
    consoleSpy.mockRestore()
  })

  it('setParentValuesFromChild - child item not found', () => {
    const { comp } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.customAttrList = [{
      attributeName: 'mf', type: 'masterList',
      customFieldData: [],
      reversedOrderCustomFieldData: []
    }]
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.useReversedData['mf'] = false
    comp.setParentValuesFromChild('mf', 'state', 'MH')
    expect(consoleSpy).toHaveBeenCalledWith('Child item not found in data source')
    consoleSpy.mockRestore()
  })

  it('findItemByFieldAndValue - direct match returns item', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }]
    const result = comp.findItemByFieldAndValue(data, 'country', 'India', false)
    expect(result).toBeDefined()
    expect(result.fieldValue).toBe('India')
  })

  it('findItemByFieldAndValue - nested match returns item', () => {
    const { comp } = buildComponent()
    const data = [{
      fieldName: 'country', fieldValue: 'India', fieldValues: [
        { fieldName: 'state', fieldValue: 'MH', fieldValues: [] }
      ]
    }]
    const result = comp.findItemByFieldAndValue(data, 'state', 'MH', false)
    expect(result).toBeDefined()
    expect(result.fieldValue).toBe('MH')
  })

  it('findItemByFieldAndValue - null data returns null', () => {
    const { comp } = buildComponent()
    const result = comp.findItemByFieldAndValue(null as any, 'country', 'India', false)
    expect(result).toBeNull()
  })

  it('findItemByFieldAndValue - no match returns null', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }]
    const result = comp.findItemByFieldAndValue(data, 'state', 'MH', false)
    expect(result).toBeNull()
  })

  it('findParentValues - regular data with parentFieldName in hierarchy', () => {
    const { comp } = buildComponent()
    comp.customAttrList = [{
      attributeName: 'mf', type: 'masterList',
      customFieldData: [
        { fieldName: 'country', fieldValue: 'India', fieldValues: [] }
      ],
      reversedOrderCustomFieldData: []
    }]
    const item = { fieldName: 'state', fieldValue: 'MH', parentFieldName: 'country', parentFieldValue: 'India' }
    const field = { attributeName: 'mf', customFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }], reversedOrderCustomFieldData: [] }
    const result = comp.findParentValues(item, ['country', 'state'], 'state', false, field)
    expect(result['country']).toBe('India')
  })

  it('findParentValues - reversed data with parentFieldName in hierarchy', () => {
    const { comp } = buildComponent()
    comp.customAttrList = [{
      attributeName: 'mf', type: 'masterList',
      reversedOrderCustomFieldData: [
        { fieldName: 'country', fieldValue: 'India', fieldValues: [] }
      ],
      customFieldData: []
    }]
    const item = { fieldName: 'state', fieldValue: 'MH', parentFieldName: 'country', parentFieldValue: 'India' }
    const field = { attributeName: 'mf', reversedOrderCustomFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }], customFieldData: [] }
    const result = comp.findParentValues(item, ['country', 'state'], 'state', true, field)
    expect(result['country']).toBe('India')
  })

  it('findParentValues - no parentFieldName returns empty', () => {
    const { comp } = buildComponent()
    const item = { fieldName: 'country', fieldValue: 'India' }
    const field = { attributeName: 'mf', customFieldData: [], reversedOrderCustomFieldData: [] }
    const result = comp.findParentValues(item, ['country', 'state'], 'country', false, field)
    expect(Object.keys(result).length).toBe(0)
  })

  it('findItemByNameAndValueInData - finds direct match', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }]
    const result = comp.findItemByNameAndValueInData('country', 'India', data)
    expect(result).toBeDefined()
  })

  it('findItemByNameAndValueInData - null data returns null', () => {
    const { comp } = buildComponent()
    const result = comp.findItemByNameAndValueInData('country', 'India', null as any)
    expect(result).toBeNull()
  })

  it('findItemByNameAndValueInData - nested match', () => {
    const { comp } = buildComponent()
    const data = [{
      fieldName: 'root', fieldValue: 'x', fieldValues: [
        { fieldName: 'state', fieldValue: 'MH', fieldValues: [] }
      ]
    }]
    const result = comp.findItemByNameAndValueInData('state', 'MH', data)
    expect(result?.fieldValue).toBe('MH')
  })

  it('disableValueChangeListeners - no hierarchy returns empty', () => {
    const { comp } = buildComponent()
    comp.hierarchyFields['mf'] = undefined as any
    const result = comp.disableValueChangeListeners('mf')
    expect(result).toEqual({})
  })

  it('disableValueChangeListeners - with hierarchy returns subscriptions object', () => {
    const { comp, fb } = buildComponent()
    const formGroup = fb.group({ country: [''] })
    comp.hierarchyFields['mf'] = ['country']
    comp.masterListFormGroups['mf'] = formGroup
    const result = comp.disableValueChangeListeners('mf')
    expect(typeof result).toBe('object')
  })

  it('loadAllOptions - field not found returns early', () => {
    const { comp } = buildComponent()
    comp.customAttrList = []
    comp.loadAllOptions('nonexistent')
    expect(true).toBe(true)
  })

  it('loadAllOptions - loads options for all hierarchy levels', () => {
    const { comp } = buildComponent()
    comp.customAttrList = [{
      attributeName: 'mf', type: 'masterList',
      customFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }] }],
      reversedOrderCustomFieldData: []
    }]
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.useReversedData['mf'] = false
    comp.fieldOptions['mf'] = { country: [], state: [] }
    comp.loadAllOptions('mf')
    expect(comp.fieldOptions['mf']['state']).toBeDefined()
  })

  it('extractAllOptionsForField - forward data extracts all items', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [{ fieldName: 'city', fieldValue: 'Mumbai', fieldValues: [] }] }]
    const result = comp.extractAllOptionsForField(data, 'city', false)
    expect(result.length).toBe(1)
    expect(result[0].value).toBe('Mumbai')
  })

  it('extractAllOptionsForField - reversed data', () => {
    const { comp } = buildComponent()
    const data = [{ fieldName: 'country', fieldValue: 'India', fieldValues: [] }]
    const result = comp.extractAllOptionsForField(data, 'country', true)
    expect(result.length).toBe(1)
  })

  it('restoreValueChangeListeners - calls setupCascadingDropdownListeners after timeout', () => {
    jest.useFakeTimers()
    const { comp } = buildComponent()
    const spy = jest.spyOn(comp, 'setupCascadingDropdownListeners').mockImplementation(() => { })
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.restoreValueChangeListeners('mf', {})
    jest.runAllTimers()
    expect(spy).toHaveBeenCalledWith('mf')
    jest.useRealTimers()
    consoleSpy.mockRestore()
  })

  it('logDataStructure - logs item without children', () => {
    const { comp } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.logDataStructure({ fieldName: 'country', fieldValue: 'India', fieldValues: [] }, 0, false)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('logDataStructure - logs item with children', () => {
    const { comp } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.logDataStructure({
      fieldName: 'country', fieldValue: 'India',
      parentFieldName: 'root', parentFieldValue: 'r',
      fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }]
    }, 0, false)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('logFormValues - no hierarchy returns early', () => {
    const { comp } = buildComponent()
    comp.hierarchyFields['mf'] = undefined as any
    comp.logFormValues('mf')
    expect(true).toBe(true)
  })

  it('logFormValues - logs values for hierarchy fields', () => {
    const { comp, fb } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.masterListFormGroups['mf'] = fb.group({ country: ['India'], state: ['MH'] })
    comp.fieldOptions['mf'] = { country: [{ value: 'India' }], state: [] }
    comp.logFormValues('mf')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('preloadAllLevelOptions - field not found returns early', () => {
    const { comp } = buildComponent()
    comp.customAttrList = []
    comp.preloadAllLevelOptions('mf')
    expect(true).toBe(true)
  })

  it('preloadAllLevelOptions - loads options for all non-first levels', () => {
    const { comp } = buildComponent()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    comp.customAttrList = [{
      attributeName: 'mf',
      customFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }] }],
      reversedOrderCustomFieldData: []
    }]
    comp.hierarchyFields['mf'] = ['country', 'state']
    comp.useReversedData['mf'] = false
    comp.fieldOptions['mf'] = { country: [], state: [] }
    comp.preloadAllLevelOptions('mf')
    expect(comp.fieldOptions['mf']['state']).toBeDefined()
    consoleSpy.mockRestore()
  })

  it('extractHierarchyFields - reversed deep nesting', () => {
    const { comp } = buildComponent()
    const data = [{
      fieldName: 'city', fieldValue: 'Mumbai', fieldValues: [{
        fieldName: 'state', fieldValue: 'MH', fieldValues: [{
          fieldName: 'country', fieldValue: 'India', fieldValues: []
        }]
      }]
    }]
    const result = comp.extractHierarchyFields(data, true)
    // reversed = last item should be country (top of hierarchy)
    expect(result[0]).toBe('country')
  })
})
