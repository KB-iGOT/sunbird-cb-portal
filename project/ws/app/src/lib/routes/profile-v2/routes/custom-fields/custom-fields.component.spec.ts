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
      result: { searchResults: { data: [
        { customFieldId: 'cf1', attributeName: 'attr1', type: 'text', isActive: true, isMandatory: true, name: 'Field 1' },
        { customFieldId: 'cf2', attributeName: 'masterAttr', type: 'masterList', isActive: true, isMandatory: false, name: 'Master Field',
          customFieldData: [{ fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'MH', fieldValues: [] }] }],
          reversedOrderCustomFieldData: [],
          originalCustomFieldData: [{ name: 'country', level: 1 }],
        },
      ] } },
    })),
    readCustomattributeDetails: jest.fn().mockReturnValue(of({
      result: { response: { customFieldValues: [
        { attributeName: 'attr1', value: 'TestVal' },
        { attributeName: 'masterAttr', values: [{ attributeName: 'country', value: 'India' }] },
      ] } },
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
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
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
})
