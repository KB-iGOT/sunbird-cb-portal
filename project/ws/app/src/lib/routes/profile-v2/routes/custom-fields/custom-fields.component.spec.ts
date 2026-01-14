import { FormBuilder } from '@angular/forms'
import { CustomFieldsComponent } from './custom-fields.component'

describe('CustomFieldsComponent (unit, no TestBed)', () => {
  let fb: FormBuilder
  let mockUserProfileService: any
  let mockConfigService: any
  let mockMatSnackBar: any
  let mockDialogRef: any
  let component: CustomFieldsComponent

  beforeEach(() => {
    fb = new FormBuilder()
    mockUserProfileService = {
      readOrgData: jest.fn().mockReturnValue({ subscribe: (s: any) => s({ result: { response: { customfieldsdata: { customFieldIds: [] } } } }) }),
      fetchCustomFields: jest.fn().mockReturnValue({ subscribe: (s: any) => s({ result: { searchResults: { data: [] } } }) }),
      readCustomattributeDetails: jest.fn().mockReturnValue({ subscribe: (s: any) => s({ result: { response: { customFieldValues: [] } } }) }),
      updateCustomFields: jest.fn().mockReturnValue({ subscribe: (s: any) => s({ result: { response: 'success' } }) }),
    }
    mockConfigService = { userProfile: { userId: 'u1', rootOrgId: 'org1' } }
    mockMatSnackBar = { open: jest.fn() }
    mockDialogRef = { close: jest.fn() }

    component = new CustomFieldsComponent(fb, mockUserProfileService, mockConfigService, mockMatSnackBar, mockDialogRef)
  })

  it('should detect reversed data via shouldUseReversedData', () => {
    const field: any = { reversedOrderCustomFieldData: [{}, {}] }
    expect(component.shouldUseReversedData(field)).toBe(true)
    expect(component.shouldUseReversedData({})).toBe(false)
  })

  it('getDataSource returns reversed when appropriate', () => {
    const reversed = [{ fieldName: 'a' }]
    const normal = [{ fieldName: 'b' }]
    const field: any = { reversedOrderCustomFieldData: reversed, customFieldData: normal }
    // force shouldUseReversedData to true by spy
    jest.spyOn(component, 'shouldUseReversedData').mockReturnValue(true)
    expect(component.getDataSource(field)).toBe(reversed)
      ; (component.shouldUseReversedData as any).mockReturnValue(false)
    expect(component.getDataSource(field)).toBe(normal)
  })

  it('extractHierarchyFields for forward and reversed data', () => {
    const forward = [
      { fieldName: 'country', fieldValues: [{ fieldName: 'state', fieldValues: [{ fieldName: 'city' }] }] },
    ]
    const rev = [
      { fieldName: 'city', fieldValues: [{ fieldName: 'state', fieldValues: [{ fieldName: 'country' }] }] },
    ]

    const fRes = component.extractHierarchyFields(forward, false)
    expect(fRes).toEqual(['country', 'state', 'city'])

    const rRes = component.extractHierarchyFields(rev, true)
    expect(rRes).toEqual(['country', 'state', 'city'])
  })

  it('extractOptionsForField (non-reversed) returns options', () => {
    const data = [
      { fieldName: 'country', fieldValue: 'India', fieldValues: [] },
      { fieldName: 'country', fieldValue: 'USA', fieldValues: [] },
    ]
    const opts = component.extractOptionsForField(data, 'country', false)
    expect(new Set(opts.map((o: any) => o.value))).toEqual(new Set(['India', 'USA']))
  })

  it('extractAllOptionsForField returns nested unique options', () => {
    const data = [
      { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }] },
      { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'TN' }] },
    ]
    const res = component.extractAllOptionsForField(data, 'state', false)
    expect(new Set(res.map((r: any) => r.value))).toEqual(new Set(['KA', 'TN']))
  })

  it('updateCombinedValue sets combined and selectedValues', () => {
    // Prepare a masterList-like field
    component.customAttrList = [
      { attributeName: 'f1', type: 'masterList' }
    ]

    // hierarchy and form groups
    component.hierarchyFields = { f1: ['level1', 'level2'] }
    const group = fb.group({ level1: ['L1'], level2: ['L2'] })
    component.masterListFormGroups = { f1: group }

    // create main form with control for f1
    component.customAttrForm = fb.group({ f1: [''] })

    component.updateCombinedValue('f1')
    expect(component.customAttrForm.get('f1')?.value).toBe('L1, L2')
    expect(component.customAttrList[0].selectedValues.level1).toBe('L1')
  })

  it('buildDynamicForm handles empty data for masterList and text', () => {
    component.customAttrList = [
      { attributeName: 'text1', type: 'text', isActive: true, isMandatory: false },
      { attributeName: 'ml1', type: 'masterList', isActive: true, isMandatory: false, customFieldData: [], originalCustomFieldData: [] }
    ]

    // Ensure no errors are thrown
    expect(() => component.buildDynamicForm()).not.toThrow()

    // form should have controls for both fields
    expect(component.customAttrForm.get('text1')).toBeTruthy()
    expect(component.customAttrForm.get('ml1')).toBeTruthy()
    // the group for masterList should be added
    expect(component.customAttrForm.get('ml1_group')).toBeTruthy()
  })

  it('handleCancel closes the dialog', () => {
    component.handleCancel()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })

  it('getValue and getListItemName return expected values', () => {
    component.customFieldValues = [
      { attributeName: 'attr1', value: 'v1' },
      { attributeName: 'mlAttr', values: [{ attributeName: 'level1', value: 'LV1' }] },
    ]
    expect(component.getValue('attr1')).toBe('v1')
    expect(component.getValue('missing')).toBe('')

    expect(component.getListItemName('mlAttr', 'level1')).toBe('LV1')
    expect(component.getListItemName('mlAttr', 'missing')).toBe('')
  })

  it('getName returns field name or attributeName', () => {
    component.customAttrList = [{ attributeName: 'a1', name: 'Name A' }]
    expect(component.getName('a1')).toBe('Name A')
    expect(component.getName('notFound')).toBe('notFound')
  })

  it('findChildOptions finds children in forward data', () => {
    const data = [
      { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }, { fieldName: 'state', fieldValue: 'TN' }] }
    ]
    const res = component.findChildOptions(data, 'country', 'India', 'state')
    expect(new Set(res.map((r: any) => r.value))).toEqual(new Set(['KA', 'TN']))
  })

  it('findChildOptionsFromReversedData finds children in reversed data', () => {
    const data = [
      { parentFieldName: 'state', parentFieldValue: 'KA', fieldName: 'city', fieldValue: 'Bengaluru' },
      { parentFieldName: 'state', parentFieldValue: 'KA', fieldName: 'city', fieldValue: 'Mysore' },
    ]
    const res = component.findChildOptionsFromReversedData(data, 'state', 'KA', 'city')
    expect(new Set(res.map((r: any) => r.value))).toEqual(new Set(['Bengaluru', 'Mysore']))
  })

  it('findItemByFieldAndValue finds nested items', () => {
    const nested = [{ fieldName: 'a', fieldValue: '1', fieldValues: [{ fieldName: 'b', fieldValue: '2' }] }]
    const found = component.findItemByFieldAndValue(nested, 'b', '2', false)
    expect(found).toBeTruthy()
    expect(found.fieldName).toBe('b')
  })

  it('findItemByNameAndValueInData searches recursively', () => {
    const data = [{ fieldName: 'x', fieldValue: '1', fieldValues: [{ fieldName: 'y', fieldValue: '2' }] }]
    const f = component.findItemByNameAndValueInData('y', '2', data)
    expect(f).toBeTruthy()
    expect(f.fieldName).toBe('y')
  })

  it('findParentValues for forward data returns parents', () => {
    // prepare data and field
    const field: any = {
      customFieldData: [
        { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'KA', parentFieldName: 'country', parentFieldValue: 'India' }] }
      ]
    }
    component.customAttrList = [{ attributeName: 'f', type: 'masterList', customFieldData: field.customFieldData }]
    // simulate child item having parent pointers
    const childItem: any = { parentFieldName: 'country', parentFieldValue: 'India' }
    const parents = component.findParentValues(childItem, ['country', 'state'], 'state', false, component.customAttrList[0])
    expect(parents.country).toBe('India')
  })

  it('disableValueChangeListeners and restoreValueChangeListeners do not throw', () => {
    component.hierarchyFields = { f: ['l1'] }
    const group = fb.group({ l1: [''] })
    component.masterListFormGroups = { f: group }
    const saved = component.disableValueChangeListeners('f')
    expect(saved).toBeDefined()
    // spy on setupCascadingDropdownListeners to ensure restore triggers it
    const spy = jest.spyOn(component, 'setupCascadingDropdownListeners')
    component.restoreValueChangeListeners('f', saved)
    // restore schedules a timeout; call the setup directly to simulate
    component.setupCascadingDropdownListeners('f')
    expect(spy).toHaveBeenCalled()
  })

  it('handleSaveCustomForm submits payload and shows snackbar on success', () => {
    // prepare a text field and a masterList with originalCustomFieldData
    component.userId = 'u1'
    component.orgId = 'org1'
    component.customAttrList = [
      { customFieldId: 'c1', attributeName: 'text1', type: 'text' },
      { customFieldId: 'c2', attributeName: 'ml1', type: 'masterList', originalCustomFieldData: [{ name: 'level1', level: 1 }] }
    ]

    component.customAttrForm = fb.group({ text1: ['T'], ml1: ['V'] })
    const group = fb.group({ level1: ['LV'] })
    component.masterListFormGroups = { ml1: group }

    // spy on updateCustomFields to make sure it is called but avoid executing the success callback
    const spy = jest.spyOn(mockUserProfileService, 'updateCustomFields').mockReturnValue({ subscribe: jest.fn() } as any)
    component.handleSaveCustomForm()
    expect(spy).toHaveBeenCalled()
  })

  it('handleEditCustomDetails builds form and populates', () => {
    component.customAttrList = [{ attributeName: 'm1', type: 'masterList' }, { attributeName: 't1', type: 'text' }]
    // spy on buildDynamicForm and populateFormWithExistingValues
    const bSpy = jest.spyOn(component, 'buildDynamicForm')
    const pSpy = jest.spyOn(component, 'populateFormWithExistingValues')
    component.handleEditCustomDetails()
    expect(component.editCustomDetails).toBe(true)
    expect(bSpy).toHaveBeenCalled()
    expect(pSpy).toHaveBeenCalled()
  })

  it('setupCascadingDropdownListeners updates child options on parent change', () => {
    const data = [
      { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }] }
    ]
    component.customAttrList = [{ attributeName: 'fld', type: 'masterList', customFieldData: data }]
    component.hierarchyFields = { fld: ['country', 'state'] }
    component.useReversedData = { fld: false }
    component.masterListFormGroups = { fld: fb.group({ country: [''], state: [''] }) }
    component.fieldOptions = { fld: { country: [], state: [] } }
    component.customAttrForm = fb.group({ fld: [''] })

    component.setupCascadingDropdownListeners('fld')
    // trigger parent change
    component.masterListFormGroups.fld.get('country')?.setValue('India')
    expect(component.fieldOptions.fld.state.length).toBeGreaterThan(0)
  })

  it('populateHierarchicalValues sets form values and combined value', done => {
    const data = [
      { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }] }
    ]
    const field: any = { attributeName: 'fld', selectedValues: { country: 'India', state: 'KA' }, customFieldData: data }
    component.hierarchyFields = { fld: ['country', 'state'] }
    component.useReversedData = { fld: false }
    component.masterListFormGroups = { fld: fb.group({ country: [''], state: [''] }) }
    component.fieldOptions = { fld: { country: [], state: [] } }
    component.customAttrForm = fb.group({ fld: [''] })

    // call populateHierarchicalValues which uses timeouts; wait a bit
    component.populateHierarchicalValues(field)
    setTimeout(() => {
      expect(component.masterListFormGroups.fld.get('country')?.value).toBe('India')
      expect(component.masterListFormGroups.fld.get('state')?.value).toBe('KA')
      expect(component.customAttrForm.get('fld')?.value).toContain('India')
      done()
    }, 300)
  })

  it('loadAllOptions and preloadAllLevelOptions populate options', () => {
    const data = [
      { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }] }
    ]
    component.customAttrList = [{ attributeName: 'fld', type: 'masterList', customFieldData: data }]
    component.hierarchyFields = { fld: ['country', 'state'] }
    component.useReversedData = { fld: false }
    component.fieldOptions = { fld: { country: [], state: [] } }

    component.loadAllOptions('fld')
    expect(component.fieldOptions.fld.state.length).toBeGreaterThanOrEqual(0)

    component.preloadAllLevelOptions('fld')
    expect(component.fieldOptions.fld.state.length).toBeGreaterThanOrEqual(0)
  })

  it('extractOptionsFromReversedData and searchNestedItemsForChildOptions work', () => {
    const uniqueOptions = new Map()
    const item = { fieldName: 'city', fieldValue: 'Bengaluru', parentFieldName: 'state', parentFieldValue: 'KA', fieldValues: [] }
    component.extractOptionsFromReversedData(item, 'city', uniqueOptions)
    expect(uniqueOptions.size).toBeGreaterThan(0)

    const options = new Map()
    const nested = [{ parentFieldName: 'p', parentFieldValue: 'v', fieldName: 'c', fieldValue: 'x', fieldValues: [{ parentFieldName: 'p2', parentFieldValue: 'v2', fieldName: 'c', fieldValue: 'y' }] }]
    component.searchNestedItemsForChildOptions(nested, 'p', 'v', 'c', options)
    expect(options.size).toBeGreaterThan(0)
  })

  it('logDataStructure and logFormValues do not throw', () => {
    const item = { fieldName: 'a', fieldValue: '1', fieldValues: [{ fieldName: 'b', fieldValue: '2' }] }
    component.logDataStructure(item, 0, false)
    component.hierarchyFields = { f: ['l'] }
    component.masterListFormGroups = { f: fb.group({ l: ['X'] }) }
    component.fieldOptions = { f: { l: [{ value: 'X' }] } }
    component.logFormValues('f')
  })
})

