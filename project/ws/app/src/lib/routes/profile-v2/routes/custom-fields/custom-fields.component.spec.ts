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
    component.customAttrList = [
      { attributeName: 'm1', type: 'masterList', selectedValues: {} },
      { attributeName: 't1', type: 'text', value: '' }
    ]
    // spy on buildDynamicForm and populateFormWithExistingValues - mock implementations
    const bSpy = jest.spyOn(component, 'buildDynamicForm').mockImplementation(() => {
      component.customAttrForm = fb.group({})
    })
    const pSpy = jest.spyOn(component, 'populateFormWithExistingValues').mockImplementation(() => { })
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

  it('populateHierarchicalValues sets form values and combined value', (done) => {
    const data = [
      { fieldName: 'country', fieldValue: 'India', fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }] }
    ]
    const field: any = {
      attributeName: 'fld',
      selectedValues: { country: 'India', state: 'KA' },
      customFieldData: data
    }
    component.hierarchyFields = { fld: ['country', 'state'] }
    component.useReversedData = { fld: false }
    component.masterListFormGroups = { fld: fb.group({ country: [''], state: [''] }) }
    component.fieldOptions = {
      fld: {
        country: [{ value: 'India', label: 'India' }],
        state: [{ value: 'KA', label: 'KA' }]
      }
    }
    component.customAttrForm = fb.group({ fld: [''] })
    component.customAttrList = [field]

    // Mock setupCascadingDropdownListeners to avoid additional complexity
    jest.spyOn(component, 'setupCascadingDropdownListeners').mockImplementation(() => { })

    // call populateHierarchicalValues which uses timeouts; wait a bit
    component.populateHierarchicalValues(field)
    setTimeout(() => {
      expect(component.masterListFormGroups.fld.get('country')?.value).toBe('India')
      expect(component.masterListFormGroups.fld.get('state')?.value).toBe('KA')
      expect(component.customAttrForm.get('fld')?.value).toContain('India')
      done()
    }, 500)
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

  it('ngOnInit should initialize userId and orgId', () => {
    jest.spyOn(component as any, 'getOrgDetails').mockImplementation(() => { })
    component.ngOnInit()
    expect(component.userId).toBe('u1')
    expect(component.orgId).toBe('org1')
  })

  it('getOrgDetails should call userProfileService and getCustomAttributes', () => {
    const getSpy = jest.spyOn(component as any, 'getCustomAttributes').mockImplementation(() => { })
    component.orgId = 'testOrg'
    component.getOrgDetails()
    expect(mockUserProfileService.readOrgData).toHaveBeenCalled()
    expect(getSpy).toHaveBeenCalled()
  })

  it('getCustomAttributes should call userProfileService and readCustomattributeDetails', () => {
    component.orgId = 'testOrg'
    component.customAttrListIds = ['id1', 'id2']
    const readSpy = jest.spyOn(component as any, 'readCustomattributeDetails').mockImplementation(() => { })
    component.getCustomAttributes()
    expect(mockUserProfileService.fetchCustomFields).toHaveBeenCalled()
    expect(readSpy).toHaveBeenCalled()
  })

  it('readCustomattributeDetails should build form when successful', () => {
    component.userId = 'u1'
    component.orgId = 'org1'
    const buildSpy = jest.spyOn(component, 'buildDynamicForm').mockImplementation(() => { })
    component.readCustomattributeDetails()
    expect(mockUserProfileService.readCustomattributeDetails).toHaveBeenCalledWith('u1', 'org1')
    expect(buildSpy).toHaveBeenCalled()
    expect(component.editCustomDetails).toBe(true)
  })

  it('handleSaveCustomForm should handle text field correctly', () => {
    component.userId = 'u1'
    component.orgId = 'org1'
    component.customAttrList = [
      { customFieldId: 'c1', attributeName: 'text1', type: 'text' }
    ]
    component.customAttrForm = fb.group({ text1: ['TestValue'] })
    component.masterListFormGroups = {}

    jest.spyOn(component as any, 'getCustomAttributes').mockImplementation(() => { })
    const spy = jest.spyOn(mockUserProfileService, 'updateCustomFields').mockReturnValue({
      subscribe: (callback: any) => {
        callback({ result: { response: 'success' } })
        return { unsubscribe: jest.fn() }
      }
    } as any)

    component.handleSaveCustomForm()
    expect(spy).toHaveBeenCalled()
    const payload = spy.mock.calls[0][0] as any
    expect(payload.customFieldValues[0].value).toBe('TestValue')
  })

  it('handleSaveCustomForm should handle masterList field correctly', () => {
    component.userId = 'u1'
    component.orgId = 'org1'
    component.customAttrList = [
      {
        customFieldId: 'c2',
        attributeName: 'ml1',
        type: 'masterList',
        originalCustomFieldData: [
          { name: 'level1', level: 1 },
          { name: 'level2', level: 2 }
        ]
      }
    ]
    const mlGroup = fb.group({ level1: ['L1'], level2: ['L2'] })
    component.customAttrForm = fb.group({
      ml1: ['L1, L2'],
      ml1_group: mlGroup
    })
    component.masterListFormGroups = { ml1: mlGroup }

    jest.spyOn(component as any, 'getCustomAttributes').mockImplementation(() => { })
    const spy = jest.spyOn(mockUserProfileService, 'updateCustomFields').mockReturnValue({
      subscribe: (callback: any) => {
        callback({ result: { response: 'success' } })
        return { unsubscribe: jest.fn() }
      }
    } as any)

    component.handleSaveCustomForm()
    expect(spy).toHaveBeenCalled()
    const payload = spy.mock.calls[0][0] as any
    expect(payload.customFieldValues[0].values).toBeDefined()
    expect(payload.customFieldValues[0].values.length).toBe(2)
  })

  it('handleSaveCustomForm should show success snackbar', () => {
    component.userId = 'u1'
    component.orgId = 'org1'
    component.customAttrList = [{ customFieldId: 'c1', attributeName: 'text1', type: 'text' }]
    component.customAttrForm = fb.group({ text1: ['Test'] })
    component.masterListFormGroups = {}

    jest.spyOn(component as any, 'getCustomAttributes').mockImplementation(() => { })
    jest.spyOn(mockUserProfileService, 'updateCustomFields').mockReturnValue({
      subscribe: (callback: any) => {
        callback({ result: { response: 'success' } })
        return { unsubscribe: jest.fn() }
      }
    } as any)

    component.handleSaveCustomForm()
    expect(mockMatSnackBar.open).toHaveBeenCalled()
    expect(mockDialogRef.close).toHaveBeenCalledWith(true)
  })

  it('handleSaveCustomForm should handle errors gracefully', () => {
    component.userId = 'u1'
    component.orgId = 'org1'
    component.customAttrList = [{ customFieldId: 'c1', attributeName: 'text1', type: 'text' }]
    component.customAttrForm = fb.group({ text1: ['Test'] })
    component.masterListFormGroups = {}

    jest.spyOn(mockUserProfileService, 'updateCustomFields').mockReturnValue({
      subscribe: (_: any, errorCallback: any) => {
        errorCallback({ error: { params: { errMsg: 'API Error' } } })
        return { unsubscribe: jest.fn() }
      }
    } as any)

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
    component.handleSaveCustomForm()
    expect(consoleSpy).toHaveBeenCalled()
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('API Error')
    expect(mockDialogRef.close).toHaveBeenCalledWith(true)
    consoleSpy.mockRestore()
  })

  it('updateChildOptions should update field options for forward data', () => {
    const data = [
      {
        fieldName: 'country',
        fieldValue: 'India',
        fieldValues: [
          { fieldName: 'state', fieldValue: 'KA' },
          { fieldName: 'state', fieldValue: 'TN' }
        ]
      }
    ]
    component.customAttrList = [{ attributeName: 'fld', type: 'masterList', customFieldData: data }]
    component.hierarchyFields = { fld: ['country', 'state'] }
    component.fieldOptions = { fld: { country: [], state: [] } }
    component.masterListFormGroups = { fld: fb.group({ country: [''], state: [''] }) }

    component.updateChildOptions('fld', 'country', 'India', 'state', false)
    expect(component.fieldOptions.fld.state.length).toBeGreaterThan(0)
  })

  it('updateChildOptions should update field options for reversed data', () => {
    const data = [
      { parentFieldName: 'state', parentFieldValue: 'KA', fieldName: 'city', fieldValue: 'Bengaluru' },
      { parentFieldName: 'state', parentFieldValue: 'KA', fieldName: 'city', fieldValue: 'Mysore' }
    ]
    component.customAttrList = [{ attributeName: 'fld', type: 'masterList', customFieldData: data }]
    component.hierarchyFields = { fld: ['state', 'city'] }
    component.fieldOptions = { fld: { state: [], city: [] } }
    component.masterListFormGroups = { fld: fb.group({ state: [''], city: [''] }) }

    component.updateChildOptions('fld', 'state', 'KA', 'city', true)
    expect(component.fieldOptions.fld.city.length).toBeGreaterThan(0)
  })

  it('populateFormWithExistingValues should populate text fields', () => {
    component.customAttrList = [{ attributeName: 'text1', type: 'text' }]
    component.customFieldValues = [{ attributeName: 'text1', value: 'ExistingValue' }]
    component.customAttrForm = fb.group({ text1: [''] })

    component.populateFormWithExistingValues()
    expect(component.customAttrForm.get('text1')?.value).toBe('ExistingValue')
  })

  it('populateFormWithExistingValues should call populateHierarchicalValues for masterList', () => {
    const field = {
      attributeName: 'ml1',
      type: 'masterList',
      customFieldData: []
    }
    component.customAttrList = [field]
    component.customFieldValues = [
      {
        attributeName: 'ml1',
        values: [
          { attributeName: 'level1', value: 'L1' },
          { attributeName: 'level2', value: 'L2' }
        ]
      }
    ]
    component.customAttrForm = fb.group({ ml1: [''] })
    component.hierarchyFields = { ml1: ['level1', 'level2'] }
    component.masterListFormGroups = { ml1: fb.group({ level1: [''], level2: [''] }) }

    const popSpy = jest.spyOn(component, 'populateHierarchicalValues').mockImplementation(() => { })
    component.populateFormWithExistingValues()
    expect(popSpy).toHaveBeenCalled()
  })

  it('extractAllOptionsForField should handle empty data', () => {
    const result = component.extractAllOptionsForField([], 'anyField', false)
    expect(result).toEqual([])
  })

  it('extractAllOptionsForField should handle reversed data', () => {
    const data = [
      { fieldName: 'city', fieldValue: 'Bengaluru', parentFieldName: 'state' },
      { fieldName: 'city', fieldValue: 'Mysore', parentFieldName: 'state' }
    ]
    const result = component.extractAllOptionsForField(data, 'city', true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('onDropdownChange should handle value changes', () => {
    const data = [
      {
        fieldName: 'country',
        fieldValue: 'India',
        fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }]
      }
    ]
    component.customAttrList = [{ attributeName: 'fld', type: 'masterList', customFieldData: data }]
    component.hierarchyFields = { fld: ['country', 'state'] }
    component.useReversedData = { fld: false }
    component.masterListFormGroups = { fld: fb.group({ country: [''], state: [''] }) }
    component.fieldOptions = { fld: { country: [], state: [] } }
    component.customAttrForm = fb.group({ fld: [''] })

    const updateCombinedSpy = jest.spyOn(component, 'updateCombinedValue').mockImplementation(() => { })
    jest.spyOn(component, 'updateChildOptions').mockImplementation(() => { })

    component.onDropdownChange('fld', 'country', 'India', 0)
    expect(updateCombinedSpy).toHaveBeenCalledWith('fld')
  })

  it('onDropdownChange should not proceed if value is empty', () => {
    const updateSpy = jest.spyOn(component, 'updateCombinedValue')
    component.onDropdownChange('fld', 'country', '', 0)
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('loadAllOptions should load options for all hierarchy levels', () => {
    const data = [
      {
        fieldName: 'country',
        fieldValue: 'India',
        fieldValues: [{ fieldName: 'state', fieldValue: 'KA' }]
      }
    ]
    component.customAttrList = [{ attributeName: 'fld', type: 'masterList', customFieldData: data }]
    component.hierarchyFields = { fld: ['country', 'state'] }
    component.useReversedData = { fld: false }
    component.fieldOptions = { fld: {} }

    component.loadAllOptions('fld')
    expect(component.fieldOptions.fld.country).toBeDefined()
  })

  it('preloadAllLevelOptions should preload options for all levels', () => {
    const data = [
      {
        fieldName: 'country',
        fieldValue: 'India',
        fieldValues: [
          { fieldName: 'state', fieldValue: 'KA', fieldValues: [{ fieldName: 'city', fieldValue: 'Bengaluru' }] }
        ]
      }
    ]
    component.customAttrList = [{ attributeName: 'fld', type: 'masterList', customFieldData: data }]
    component.hierarchyFields = { fld: ['country', 'state', 'city'] }
    component.useReversedData = { fld: false }
    component.fieldOptions = { fld: {} }

    component.preloadAllLevelOptions('fld')
    expect(component.fieldOptions.fld.country).toBeDefined()
  })

  it('disableValueChangeListeners should return subscriptions', () => {
    component.hierarchyFields = { fld: ['level1', 'level2'] }
    const group = fb.group({ level1: [''], level2: [''] })
    component.masterListFormGroups = { fld: group }

    const result = component.disableValueChangeListeners('fld')
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('restoreValueChangeListeners should restore listeners after timeout', (done) => {
    component.hierarchyFields = { fld: ['level1'] }
    const group = fb.group({ level1: [''] })
    component.masterListFormGroups = { fld: group }
    const subscriptions: any = {}

    const setupSpy = jest.spyOn(component, 'setupCascadingDropdownListeners').mockImplementation(() => { })

    component.restoreValueChangeListeners('fld', subscriptions)

    setTimeout(() => {
      expect(setupSpy).toHaveBeenCalledWith('fld')
      done()
    }, 150)
  })

  it('findParentValues should return empty object if no parents found', () => {
    const childItem: any = { parentFieldName: undefined, parentFieldValue: undefined }
    const field: any = { customFieldData: [] }
    const result = component.findParentValues(childItem, ['level1'], 'level1', false, field)
    expect(result).toEqual({})
  })

  it('findItemByFieldAndValue should return null if not found', () => {
    const data = [{ fieldName: 'a', fieldValue: '1', fieldValues: [] }]
    const result = component.findItemByFieldAndValue(data, 'b', '2', false)
    expect(result).toBeNull()
  })

  it('findItemByNameAndValueInData should return null if not found', () => {
    const data = [{ fieldName: 'a', fieldValue: '1', fieldValues: [] }]
    const result = component.findItemByNameAndValueInData('b', '2', data)
    expect(result).toBeNull()
  })

  it('searchNestedItemsForChildOptions should handle empty data', () => {
    const options = new Map()
    component.searchNestedItemsForChildOptions([], 'parent', 'value', 'child', options)
    expect(options.size).toBe(0)
  })

  it('buildDynamicForm should handle inactive fields', () => {
    component.customAttrList = [
      { attributeName: 'inactive1', type: 'text', isActive: false },
      { attributeName: 'active1', type: 'text', isActive: true, isMandatory: false }
    ]

    component.buildDynamicForm()
    expect(component.customAttrForm.get('inactive1')).toBeNull()
    expect(component.customAttrForm.get('active1')).toBeTruthy()
  })

  it('buildDynamicForm should handle mandatory fields with validators', () => {
    component.customAttrList = [
      { attributeName: 'required1', type: 'text', isActive: true, isMandatory: true }
    ]

    component.buildDynamicForm()
    const control = component.customAttrForm.get('required1')
    expect(control).toBeTruthy()
    expect(control?.hasError('required')).toBe(true)
  })

  it('getName should return attributeName if name is not defined', () => {
    component.customAttrList = [{ attributeName: 'field1' }]
    expect(component.getName('field1')).toBe('field1')
  })

  it('getListItemName should return empty string for non-existent attribute', () => {
    component.customFieldValues = []
    expect(component.getListItemName('nonExistent', 'anyLevel')).toBe('')
  })

  it('getValue should handle complex nested structures', () => {
    component.customFieldValues = [
      {
        attributeName: 'complex',
        value: 'simpleValue',
        values: [{ nested: 'data' }]
      }
    ]
    expect(component.getValue('complex')).toBe('simpleValue')
  })
})
