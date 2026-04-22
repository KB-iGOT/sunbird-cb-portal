import { ProfileEntryEditComponent, endDateValidator, startDateValidator, issuedDateValidator, urlOrDocumentValidator } from './profile-entry-edit.component'
import { of, throwError, Subject } from 'rxjs'

describe('ProfileEntryEditComponent', () => {
  let component: any
  let mockDialogRef: any
  let mockProfileV2RevampService: any
  let mockSnackBar: any
  let mockPipeImgUrl: any
  let mockFormBuilder: any

  const createMockFormControl = (initialValue: any = '') => {
    const valueChangesSubject = new Subject()
    return {
      value: initialValue,
      setValue: jest.fn(function (val: any) { this.value = val }),
      patchValue: jest.fn(function (val: any) { this.value = val }),
      disable: jest.fn(),
      enable: jest.fn(),
      clearValidators: jest.fn(),
      setValidators: jest.fn(),
      updateValueAndValidity: jest.fn(),
      markAsTouched: jest.fn(),
      markAsDirty: jest.fn(),
      valueChanges: valueChangesSubject.asObservable(),
      reset: jest.fn(),
      touched: false,
      hasError: jest.fn().mockReturnValue(false),
      _triggerValueChange: (val: any) => valueChangesSubject.next(val),
    }
  }

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockProfileV2RevampService = {
      getOrgSearch: jest.fn().mockReturnValue(of({ result: { response: { count: 1, content: [] } } })),
      searchIgotDesignation: jest.fn().mockReturnValue(of({ result: { Term: [], count: 0 } })),
      getStatesList: jest.fn().mockReturnValue(of({ result: { statesList: [] } })),
      getDistrictsList: jest.fn().mockReturnValue(of({ result: { districtsList: [{ districts: [] }] } })),
      updateAchievementPic: jest.fn().mockReturnValue(of({ result: { url: '/userAchievements/test.png' } })),
      getEducationsQualificationsSearch: jest.fn().mockReturnValue(of({ result: { result: [], count: 0 } })),
      searchDesignation: jest.fn().mockReturnValue(of({ result: { result: { data: [], totalCount: 0 } } })),
      fetchCompetencyV6: jest.fn().mockReturnValue(of({ params: { status: 'successful' }, result: { framework: { categories: [{ code: 'competencyarea', terms: [] }, { code: 'theme', terms: [] }, { code: 'subtheme', terms: [] }] } } })),
    }
    mockSnackBar = { open: jest.fn() }
    mockPipeImgUrl = { transform: jest.fn().mockReturnValue('mockedUrl') }
    mockFormBuilder = {
      group: jest.fn().mockImplementation((obj: any, options?: any) => {
        const controls: any = {}
        Object.keys(obj).forEach(key => {
          controls[key] = createMockFormControl(obj[key][0] || '')
        })
        return {
          controls,
          get: (name: string) => controls[name],
          patchValue: jest.fn(),
          getRawValue: jest.fn().mockReturnValue({}),
          valid: true,
          value: {},
          updateValueAndValidity: jest.fn(),
          validators: options?.validators || null,
        }
      }),
    }

    component = new ProfileEntryEditComponent(
      mockFormBuilder as any,
      mockDialogRef,
      { header: '', entryDetails: {} },
      mockProfileV2RevampService,
      mockSnackBar,
      mockPipeImgUrl
    )
    component.entryForm = mockFormBuilder.group({
      orgName: ['', []],
      searchOrgName: ['', []],
      designation: ['', []],
      searchDesignation: ['', []],
      orgState: ['', []],
      orgDistrict: ['', []],
      startDate: ['', []],
      endDate: ['', []],
      currentlyWorking: ['', []],
      description: ['', []],
      degree: ['', []],
      searchDegrees: ['', []],
      otherDegree: ['', []],
      fieldOfStudy: ['', []],
      institutionName: ['', []],
      searchInstitute: ['', []],
      otherInstituteName: ['', []],
      startYear: ['', []],
      endYear: ['', []],
      title: ['', []],
      issuedOrganisation: ['', []],
      issuedDate: ['', []],
      uploadedDocumentUrl: ['', []],
      fileName: ['', []],
      url: ['', []],
      competencies_v6: [[], []],
    })
  })

  describe('Basic Component Tests', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should call dialogRef.close on handleCancel', () => {
      component.handleCancel()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should call dialogRef.close with form value on handleSubmit if form is valid', () => {
      component.header = ''
      component.entryForm.valid = true
      component.entryForm.value = { test: 1 }
      component.handleSubmit()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ test: 1 })
    })

    it('should call markFormGroupTouched if form is invalid on handleSubmit', () => {
      component.entryForm.valid = false
      const spy = jest.spyOn(component, 'markFormGroupTouched')
      component.handleSubmit()
      expect(spy).toHaveBeenCalled()
    })

    it('should add org details for Service History in handleSubmit', () => {
      component.header = 'Service History'
      component.selctedOrgDetails = { orgName: 'A', orgLogo: 'B', orgId: 'C', rootOrgId: 'D' }
      component.entryForm.valid = true
      component.entryForm.value = { orgName: 'A' }
      component.handleSubmit()
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        orgName: 'A',
        orgLogo: 'B',
        orgId: 'C',
        rootOrgId: 'D',
      })
    })

    it('should handle Achievements form in handleSubmit with uploadedDocumentUrl', () => {
      component.header = 'Achievements'
      component.entryForm.valid = true
      component.entryForm.getRawValue = jest.fn().mockReturnValue({
        uploadedDocumentUrl: 'test.png',
        url: 'http://test.com',
        learningHours: '10'
      })
      component.handleSubmit()
      expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({
        learningHours: 10,
        url: '',
      }))
    })

    it('should handle Achievements form in handleSubmit with url', () => {
      component.header = 'Achievements'
      component.entryForm.valid = true
      component.entryForm.getRawValue = jest.fn().mockReturnValue({
        uploadedDocumentUrl: '',
        url: 'http://test.com',
        fileName: 'test',
        learningHours: ''
      })
      component.handleSubmit()
      expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({
        learningHours: '',
        uploadedDocumentUrl: '',
        fileName: '',
      }))
    })

    it('should mark all controls as touched in markFormGroupTouched', () => {
      const mockControl: any = { markAsTouched: jest.fn() }
      const formGroup: any = { controls: { a: mockControl } }
      component.markFormGroupTouched(formGroup)
      expect(mockControl.markAsTouched).toHaveBeenCalled()
    })

    it('should return true if control has error and is touched in hasError', () => {
      component.entryForm.get = jest.fn().mockReturnValue({
        touched: true,
        hasError: jest.fn().mockReturnValue(true),
      })
      expect(component.hasError('test', 'required')).toBe(true)
    })

    it('should return false if control is not touched or has no error in hasError', () => {
      component.entryForm.get = jest.fn().mockReturnValue({
        touched: false,
        hasError: jest.fn().mockReturnValue(false),
      })
      expect(component.hasError('test', 'required')).toBe(false)
    })

    it('should call snackBar.open in openSnackbar', () => {
      component.openSnackbar('msg', 1000)
      expect(mockSnackBar.open).toHaveBeenCalledWith('msg', 'X', { duration: 1000 })
    })
  })

  describe('ngOnInit and initForm', () => {
    it('should call initForm on ngOnInit', () => {
      component.initForm = jest.fn()
      component.ngOnInit()
      expect(component.initForm).toHaveBeenCalled()
    })

    it('should call createServiceHistoryForm for Service History header', () => {
      component.header = 'Service History'
      component.createServiceHistoryForm = jest.fn()
      component.initForm()
      expect(component.createServiceHistoryForm).toHaveBeenCalled()
    })

    it('should call createEducationalQualificationsForm for Educational qualifications header', () => {
      component.header = 'Educational qualifications'
      component.generateYearsList = jest.fn()
      component.createEducationalQualificationsForm = jest.fn()
      component.initForm()
      expect(component.generateYearsList).toHaveBeenCalled()
      expect(component.createEducationalQualificationsForm).toHaveBeenCalled()
    })

    it('should call createAchievementsForm for Achievements header', () => {
      component.header = 'Achievements'
      component.createAchievementsForm = jest.fn()
      component.initForm()
      expect(component.createAchievementsForm).toHaveBeenCalled()
    })
  })

  describe('Service History', () => {
    it('should create service history form and call required methods', () => {
      component.entryDetails = {}
      component.getOrgList = jest.fn()
      component.checkSelectedOrgHasDesignations = jest.fn()
      component.getStatesList = jest.fn()
      component.serviceHistoryValueChangeFunctions = jest.fn()
      component.createServiceHistoryForm()
      expect(component.getOrgList).toHaveBeenCalled()
      expect(component.checkSelectedOrgHasDesignations).toHaveBeenCalled()
      expect(component.getStatesList).toHaveBeenCalled()
      expect(component.serviceHistoryValueChangeFunctions).toHaveBeenCalled()
    })

    it('should handle getOrgList success', (done) => {
      const content = [{ orgName: 'Test', identifier: '1', rootOrgId: 'root1', imgUrl: 'img1' }]
      mockProfileV2RevampService.getOrgSearch = jest.fn().mockReturnValue(of({ result: { response: { count: 1, content } } }))
      component.orgOffset = 0
      component.getOrgList()
      setTimeout(() => {
        expect(component.orgList).toEqual(content)
        expect(component.isLoadingMoreOrganisations).toBe(false)
        done()
      }, 100)
    })

    it('should handle getOrgList error', (done) => {
      mockProfileV2RevampService.getOrgSearch = jest.fn().mockReturnValue(throwError({ error: 'test' }))
      component.openSnackbar = jest.fn()
      component.getOrgList()
      setTimeout(() => {
        expect(component.openSnackbar).toHaveBeenCalled()
        done()
      }, 100)
    })

    it('should check current organisation present', () => {
      component.selctedOrgDetails = { orgName: 'Test', orgId: '1', orgLogo: 'logo', rootOrgId: 'root' }
      component.orgList = []
      component.checkCurrentOrganisationPresent()
      expect(component.orgList.length).toBe(1)
      expect(component.orgList[0].orgName).toBe('Test')
    })

    it('should setup scroll listener for org', () => {
      const searchOrgNameControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(searchOrgNameControl)
      component.getOrgList = jest.fn()
      document.querySelector = jest.fn().mockReturnValue({ addEventListener: jest.fn(), focus: jest.fn() })
      component.setupScrollListenerForOrg(true)
      expect(searchOrgNameControl.setValue).toHaveBeenCalledWith('')
      expect(component.getOrgList).toHaveBeenCalled()
    })

    it('should handle org dropdown closed', () => {
      const searchOrgNameControl = createMockFormControl('test')
      component.entryForm.get = jest.fn().mockReturnValue(searchOrgNameControl)
      component.checkCurrentOrganisationPresent = jest.fn()
      component.onOrganisationDropdownClosed()
      expect(searchOrgNameControl.setValue).toHaveBeenCalledWith('')
      expect(component.checkCurrentOrganisationPresent).toHaveBeenCalled()
    })

    it('should handle onOrganisationSelectScroll', () => {
      component.isLoadingMoreOrganisations = false
      component.organisationsCount = 100
      component.orgList = Array(50).fill({})
      component.orgOffset = 0
      component.getOrgList = jest.fn()
      const event = {
        target: {
          scrollTop: 100,
          clientHeight: 50,
          scrollHeight: 155
        }
      }
      component.onOrganisationSelectScroll(event)
      expect(component.orgOffset).toBe(1)
      expect(component.getOrgList).toHaveBeenCalled()
    })
  })

  describe('Designations', () => {
    it('should check selected org has designations', (done) => {
      component.selctedOrgDetails = { rootOrgId: 'root1' }
      mockProfileV2RevampService.searchIgotDesignation = jest.fn().mockReturnValue(of({ result: { count: 5 } }))
      component.getdesignationsMeta = jest.fn()
      component.checkSelectedOrgHasDesignations()
      setTimeout(() => {
        expect(component.selectedOrgHasDesignations).toBe(true)
        expect(component.getdesignationsMeta).toHaveBeenCalled()
        done()
      }, 100)
    })

    it('should handle checkSelectedOrgHasDesignations error', (done) => {
      component.selctedOrgDetails = { rootOrgId: 'root1' }
      mockProfileV2RevampService.searchIgotDesignation = jest.fn().mockReturnValue(throwError({ error: 'test' }))
      component.getdesignationsMeta = jest.fn()
      component.checkSelectedOrgHasDesignations()
      setTimeout(() => {
        expect(component.selectedOrgHasDesignations).toBe(false)
        expect(component.getdesignationsMeta).toHaveBeenCalled()
        done()
      }, 100)
    })

    it('should get igot designations success', (done) => {
      component.selctedOrgDetails = { rootOrgId: 'root1' }
      component.selectedOrgHasDesignations = true
      component.designationsOffset = 0
      const terms = [{ name: 'Manager', status: 'Active' }]
      mockProfileV2RevampService.searchIgotDesignation = jest.fn().mockReturnValue(of({ result: { Term: terms, count: 1 } }))
      component.checkCurrentDesignationPresent = jest.fn()
      component.getIgotDesignations()
      setTimeout(() => {
        expect(component.designationsMeta).toEqual(terms)
        expect(component.isLoadingMoreDesignations).toBe(false)
        done()
      }, 100)
    })

    it('should handle get igot designations error', (done) => {
      component.selctedOrgDetails = { rootOrgId: 'root1' }
      component.selectedOrgHasDesignations = true
      mockProfileV2RevampService.searchIgotDesignation = jest.fn().mockReturnValue(throwError({ error: 'test' }))
      component.openSnackbar = jest.fn()
      component.getIgotDesignations()
      setTimeout(() => {
        expect(component.openSnackbar).toHaveBeenCalled()
        expect(component.isLoadingMoreDesignations).toBe(false)
        done()
      }, 100)
    })

    it('should get default designations success', (done) => {
      component.designationsOffset = 0
      const data = [{ designation: 'Manager', status: 'Active' }]
      mockProfileV2RevampService.searchDesignation = jest.fn().mockReturnValue(of({ result: { result: { data, totalCount: 1 } } }))
      component.checkCurrentDesignationPresent = jest.fn()
      component.getDefaultDesignations()
      setTimeout(() => {
        expect(component.designationsMeta[0].name).toBe('Manager')
        expect(component.isLoadingMoreDesignations).toBe(false)
        done()
      }, 100)
    })

    it('should handle get default designations error', (done) => {
      mockProfileV2RevampService.searchDesignation = jest.fn().mockReturnValue(throwError({ error: 'test' }))
      component.openSnackbar = jest.fn()
      component.getDefaultDesignations()
      setTimeout(() => {
        expect(component.openSnackbar).toHaveBeenCalled()
        expect(component.isLoadingMoreDesignations).toBe(false)
        done()
      }, 100)
    })

    it('should check current designation present', () => {
      component.designationsMeta = []
      const designationControl = createMockFormControl('Engineer')
      component.entryForm.get = jest.fn().mockReturnValue(designationControl)
      component.checkCurrentDesignationPresent()
      expect(component.designationsMeta.length).toBe(1)
      expect(component.designationsMeta[0].name).toBe('Engineer')
    })

    it('should handle onDesignationSelectScroll', () => {
      component.isLoadingMoreDesignations = false
      component.designationsMeta = Array(50).fill({})
      component.designationsTotalCount = 100
      component.designationsOffset = 0
      component.getdesignationsMeta = jest.fn()
      const event = {
        target: {
          scrollTop: 100,
          clientHeight: 50,
          scrollHeight: 155
        }
      }
      component.onDesignationSelectScroll(event)
      expect(component.isLoadingMoreDesignations).toBe(true)
      expect(component.designationsOffset).toBe(1)
      expect(component.getdesignationsMeta).toHaveBeenCalled()
    })

    it('should handle designation dropdown closed', () => {
      const searchDesignationControl = createMockFormControl('test')
      component.entryForm.get = jest.fn().mockReturnValue(searchDesignationControl)
      component.checkCurrentDesignationPresent = jest.fn()
      component.onDesignationDropdownClosed()
      expect(searchDesignationControl.setValue).toHaveBeenCalledWith('')
      expect(component.checkCurrentDesignationPresent).toHaveBeenCalled()
    })

    it('should setup scroll listener for designation', () => {
      const searchDesignationControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(searchDesignationControl)
      component.getdesignationsMeta = jest.fn()
      document.querySelector = jest.fn().mockReturnValue({ addEventListener: jest.fn(), focus: jest.fn() })
      component.setupScrollListener(true)
      expect(searchDesignationControl.setValue).toHaveBeenCalledWith('')
      expect(component.designationsOffset).toBe(0)
      expect(component.getdesignationsMeta).toHaveBeenCalled()
    })
  })

  describe('States and Districts', () => {
    it('should handle getStatesList success', (done) => {
      const statesList = [{ name: 'Karnataka', code: 'KA' }]
      mockProfileV2RevampService.getStatesList = jest.fn().mockReturnValue(of({ result: { statesList } }))
      component.entryDetails = { orgState: 'Karnataka' }
      component.getDistrictsList = jest.fn()
      const stateControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(stateControl)
      component.getStatesList()
      setTimeout(() => {
        expect(component.statesList).toEqual(statesList)
        expect(stateControl.patchValue).toHaveBeenCalledWith('Karnataka')
        done()
      }, 100)
    })

    it('should handle getStatesList error', (done) => {
      mockProfileV2RevampService.getStatesList = jest.fn().mockReturnValue(throwError({ error: 'test' }))
      component.openSnackbar = jest.fn()
      component.getStatesList()
      setTimeout(() => {
        expect(component.openSnackbar).toHaveBeenCalled()
        done()
      }, 100)
    })

    it('should handle getDistrictsList success', (done) => {
      const districtsList = ['Bangalore', 'Mysore']
      mockProfileV2RevampService.getDistrictsList = jest.fn().mockReturnValue(of({ result: { districtsList: [{ districts: districtsList }] } }))
      const orgDistrictControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(orgDistrictControl)
      component.getDistrictsList('Karnataka')
      setTimeout(() => {
        expect(component.districtsList).toEqual(districtsList)
        expect(orgDistrictControl.enable).toHaveBeenCalled()
        done()
      }, 100)
    })

    it('should handle getDistrictsList error', (done) => {
      mockProfileV2RevampService.getDistrictsList = jest.fn().mockReturnValue(throwError({ error: 'test' }))
      component.openSnackbar = jest.fn()
      const orgDistrictControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(orgDistrictControl)
      component.getDistrictsList('Karnataka')
      setTimeout(() => {
        expect(component.openSnackbar).toHaveBeenCalled()
        done()
      }, 100)
    })

    it('should disable orgDistrictControl if state is empty in getDistrictsList', () => {
      const disable = jest.fn()
      component.entryForm.get = jest.fn().mockReturnValue({ disable })
      component.getDistrictsList('')
      expect(disable).toHaveBeenCalled()
    })

    it('should patchValue on currentlyWorkingControl and disable endDateControl on onCurrentlyWorkingChange(true)', () => {
      const patchValue = jest.fn()
      const setValue = jest.fn()
      const disable = jest.fn()
      const clearValidators = jest.fn()
      const updateValueAndValidity = jest.fn()
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'currentlyWorking') return { patchValue }
        if (name === 'endDate') return { setValue, disable, clearValidators, updateValueAndValidity }
        return null
      })
      component.onCurrentlyWorkingChange(true)
      expect(patchValue).toHaveBeenCalled()
      expect(setValue).toHaveBeenCalled()
      expect(disable).toHaveBeenCalled()
      expect(clearValidators).toHaveBeenCalled()
      expect(updateValueAndValidity).toHaveBeenCalled()
    })

    it('should enable endDateControl and setValidators on onCurrentlyWorkingChange(false)', () => {
      const enable = jest.fn()
      const setValidators = jest.fn()
      const updateValueAndValidity = jest.fn()
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'currentlyWorking') return { patchValue: jest.fn() }
        if (name === 'endDate') return { enable, setValidators, updateValueAndValidity }
        return null
      })
      component.onCurrentlyWorkingChange(false)
      expect(enable).toHaveBeenCalled()
      expect(setValidators).toHaveBeenCalled()
      expect(updateValueAndValidity).toHaveBeenCalled()
    })

    it('should set endDate to null if endDate < selectedStartDate in onStartDateChange', () => {
      const setValue = jest.fn()
      component.entryForm.get = jest.fn().mockReturnValue({ value: '2020-01-01', setValue })
      component.onStartDateChange(new Date('2022-01-01'))
      expect(setValue).toHaveBeenCalledWith(null)
    })

    it('should not set endDate to null if endDate >= selectedStartDate in onStartDateChange', () => {
      const setValue = jest.fn()
      component.entryForm.get = jest.fn().mockReturnValue({ value: '2023-01-01', setValue })
      component.onStartDateChange(new Date('2022-01-01'))
      expect(setValue).not.toHaveBeenCalled()
    })
  })

  describe('Educational Qualifications', () => {
    it('should create educational qualifications form', () => {
      component.generateYearsList = jest.fn()
      component.educationFormValuChange = jest.fn()
      component.createEducationalQualificationsForm()
      expect(component.generateYearsList).toHaveBeenCalled()
      expect(component.educationFormValuChange).toHaveBeenCalled()
    })

    it('should generate years list', () => {
      component.generateYearsList()
      expect(component.yeasersList.length).toBeGreaterThan(0)
    })

    it('should handle getEducationalQualifications success for degree', (done) => {
      const result = [{ name: 'B.Tech' }, { name: 'M.Tech' }]
      mockProfileV2RevampService.getEducationsQualificationsSearch = jest.fn().mockReturnValue(of({ result: { result, count: 2 } }))
      component.degreePageNumber = 0
      component.checkCurrentDegreePresent = jest.fn()
      component.getEducationalQualifications('degree', 0, '')
      setTimeout(() => {
        expect(component.filterDegreesMeta.length).toBeGreaterThan(0)
        expect(component.isLoadingMoredegrees).toBe(false)
        done()
      }, 100)
    })

    it('should handle getEducationalQualifications success for institute', (done) => {
      const result = [{ name: 'IIT' }, { name: 'MIT' }]
      mockProfileV2RevampService.getEducationsQualificationsSearch = jest.fn().mockReturnValue(of({ result: { result, count: 2 } }))
      component.institutePageNumber = 0
      component.checkCurrentInstitutePresent = jest.fn()
      component.getEducationalQualifications('institute', 0, '')
      setTimeout(() => {
        expect(component.filterInstitutionsList.length).toBeGreaterThan(0)
        expect(component.isLoadingMoreInstitutions).toBe(false)
        done()
      }, 100)
    })

    it('should handle getEducationalQualifications error', (done) => {
      mockProfileV2RevampService.getEducationsQualificationsSearch = jest.fn().mockReturnValue(throwError({ error: 'test' }))
      component.openSnackbar = jest.fn()
      component.getEducationalQualifications('degree', 0, '')
      setTimeout(() => {
        expect(component.openSnackbar).toHaveBeenCalled()
        expect(component.isLoadingMoredegrees).toBe(false)
        done()
      }, 100)
    })

    it('should check current degree present', () => {
      component.filterDegreesMeta = []
      const degreeControl = createMockFormControl('B.Tech')
      component.entryForm.get = jest.fn().mockReturnValue(degreeControl)
      component.checkCurrentDegreePresent()
      expect(component.filterDegreesMeta.length).toBe(1)
      expect(component.filterDegreesMeta[0].name).toBe('B.Tech')
    })

    it('should check current institute present', () => {
      component.filterInstitutionsList = []
      const instituteControl = createMockFormControl('IIT')
      component.entryForm.get = jest.fn().mockReturnValue(instituteControl)
      component.checkCurrentInstitutePresent()
      expect(component.filterInstitutionsList.length).toBe(1)
      expect(component.filterInstitutionsList[0].name).toBe('IIT')
    })

    it('should setup scroll listener for degrees', () => {
      const searchDegreeControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(searchDegreeControl)
      component.checkCurrentDegreePresent = jest.fn()
      document.querySelector = jest.fn().mockReturnValue({ addEventListener: jest.fn(), focus: jest.fn() })
      component.setupScrollListenerForDegrees(true)
      expect(searchDegreeControl.setValue).toHaveBeenCalledWith('')
    })

    it('should handle onDegreesSelectScroll', () => {
      component.isLoadingMoredegrees = false
      component.filterDegreesMeta = Array(50).fill({ name: 'test' })
      component.degreeTotalCount = 100
      component.degreePageNumber = 0
      component.degreesFilterEnable = false
      component.getEducationalQualifications = jest.fn()
      const event = {
        target: {
          scrollTop: 100,
          clientHeight: 50,
          scrollHeight: 150
        }
      }
      component.onDegreesSelectScroll(event)
      expect(component.isLoadingMoredegrees).toBe(true)
      expect(component.degreePageNumber).toBe(1)
      expect(component.getEducationalQualifications).toHaveBeenCalled()
    })

    it('should handle onDegreesDropdownClosed', (done) => {
      const degreeControl = createMockFormControl('B.Tech')
      const searchDegreeControl = createMockFormControl('test')
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'degree') return degreeControl
        if (name === 'searchDegrees') return searchDegreeControl
        return null
      })
      component.checkCurrentDegreePresent = jest.fn()
      component.onDegreesDropdownClosed()
      setTimeout(() => {
        expect(searchDegreeControl.setValue).toHaveBeenCalledWith('')
        done()
      }, 150)
    })

    it('should setup institute scroll listener', () => {
      const searchInstituteControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(searchInstituteControl)
      component.checkCurrentInstitutePresent = jest.fn()
      document.querySelector = jest.fn().mockReturnValue({ addEventListener: jest.fn(), focus: jest.fn() })
      component.setupInstituteScrollListener(true)
      expect(searchInstituteControl.setValue).toHaveBeenCalledWith('')
    })

    it('should handle onInstituteSelectScroll', () => {
      component.isLoadingMoreInstitutions = false
      component.filterInstitutionsList = Array(50).fill({ name: 'test' })
      component.instituteTotalCount = 100
      component.institutePageNumber = 0
      component.inistitutionFilterEnable = false
      component.getEducationalQualifications = jest.fn()
      const event = {
        target: {
          scrollTop: 100,
          clientHeight: 50,
          scrollHeight: 150
        }
      }
      component.onInstituteSelectScroll(event)
      expect(component.isLoadingMoreInstitutions).toBe(true)
      expect(component.institutePageNumber).toBe(1)
      expect(component.getEducationalQualifications).toHaveBeenCalled()
    })

    it('should handle onInstituteDropdownClosed', (done) => {
      const instituteControl = createMockFormControl('IIT')
      const searchInstituteControl = createMockFormControl('test')
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'institutionName') return instituteControl
        if (name === 'searchInstitute') return searchInstituteControl
        return null
      })
      component.onInstituteDropdownClosed()
      setTimeout(() => {
        expect(searchInstituteControl.setValue).toHaveBeenCalledWith('')
        done()
      }, 150)
    })

    it('should call patchValue and updateValueAndValidity in onDegreeChange', () => {
      const setValidators = jest.fn()
      const clearValidators = jest.fn()
      const setValue = jest.fn()
      const updateValueAndValidity = jest.fn()
      component.entryForm.get = jest.fn().mockReturnValue({ setValidators, clearValidators, setValue, updateValueAndValidity })
      component.onDegreeChange('other')
      expect(setValidators).toHaveBeenCalled()
      component.onDegreeChange('not-other')
      expect(clearValidators).toHaveBeenCalled()
      expect(setValue).toHaveBeenCalled()
      expect(updateValueAndValidity).toHaveBeenCalled()
    })

    it('should call setValidators and updateValueAndValidity in onInstituteChange', () => {
      const setValidators = jest.fn()
      const clearValidators = jest.fn()
      const setValue = jest.fn()
      const updateValueAndValidity = jest.fn()
      component.entryForm.get = jest.fn().mockReturnValue({ setValidators, clearValidators, setValue, updateValueAndValidity })
      component.onInstituteChange('Other')
      expect(setValidators).toHaveBeenCalled()
      component.onInstituteChange('not-Other')
      expect(clearValidators).toHaveBeenCalled()
      expect(setValue).toHaveBeenCalled()
      expect(updateValueAndValidity).toHaveBeenCalled()
      component.onInstituteChange('Other', true)
      expect(setValidators).toHaveBeenCalled()
    })

    it('should return true/false from isEndYearDisabled', () => {
      component.entryForm.get = jest.fn().mockReturnValue({ value: 2020 })
      expect(component.isEndYearDisabled(2019)).toBe(true)
      expect(component.isEndYearDisabled(2021)).toBe(false)
      component.entryForm.get = jest.fn().mockReturnValue({ value: undefined })
      expect(component.isEndYearDisabled(2021)).toBe(false)
    })

    it('should patchValue endYear to null in onStartYearChange', () => {
      component.entryForm.get = jest.fn().mockReturnValue({ value: 2019 })
      component.entryForm.patchValue = jest.fn()
      component.onStartYearChange(2020)
      expect(component.entryForm.patchValue).toHaveBeenCalledWith({ endYear: null })
    })

    it('should not patchValue endYear if endYear >= value in onStartYearChange', () => {
      component.entryForm.get = jest.fn().mockReturnValue({ value: 2022 })
      component.entryForm.patchValue = jest.fn()
      component.onStartYearChange(2020)
      expect(component.entryForm.patchValue).not.toHaveBeenCalled()
    })
  })

  describe('Achievements and Competencies', () => {
    it('should create achievements form', () => {
      component.valueChanges = jest.fn()
      component.addCompetencyMeta = jest.fn()
      component.entryDetails = {}
      component.createAchievementsForm()
      expect(component.valueChanges).toHaveBeenCalled()
      expect(component.addCompetencyMeta).toHaveBeenCalled()
    })

    it('should load competency master successfully', (done) => {
      const response = {
        params: { status: 'successful' },
        result: {
          framework: {
            categories: [
              { code: 'competencyarea', terms: [{ name: 'Area1', identifier: '1' }] },
              { code: 'theme', terms: [{ name: 'Theme1', identifier: '2' }] },
              { code: 'subtheme', terms: [{ name: 'SubTheme1', identifier: '3' }] }
            ]
          }
        }
      }
      mockProfileV2RevampService.fetchCompetencyV6 = jest.fn().mockReturnValue(of(response))
      component.loadCompetencyMaster()
      setTimeout(() => {
        expect(component.allCompetencies.length).toBe(1)
        expect(component.allThemeData.length).toBe(1)
        expect(component.allSubThemeData.length).toBe(1)
        done()
      }, 100)
    })

    it('should handle compAreaSelected', () => {
      component.allCompetencies = [{ identifier: '1', name: 'Area1', associations: [{ name: 'Theme1' }] }]
      component.resetCompSubfields = jest.fn()
      component.compAreaSelected({ identifier: '1', name: 'Area1' })
      expect(component.resetCompSubfields).toHaveBeenCalled()
      expect(component.seletedCompetencyArea.name).toBe('Area1')
      expect(component.expand).toBe(true)
    })

    it('should handle compThemeSelected', () => {
      component.allCompetencyTheme = [{ identifier: '2', name: 'Theme1' }]
      component.allThemeData = [{ identifier: '2', associations: [{ name: 'SubTheme1' }] }]
      component.compThemeSelected({ identifier: '2', name: 'Theme1' })
      expect(component.seletedCompetencyTheme.name).toBe('Theme1')
      expect(component.allCompetencySubtheme.length).toBe(1)
    })

    it('should handle compSubThemeSelected', () => {
      component.compSubThemeSelected({ identifier: '3', name: 'SubTheme1' })
      expect(component.seletedCompetencySubTheme.name).toBe('SubTheme1')
      expect(component.enableCompetencyAdd).toBe(true)
    })

    it('should add competency', () => {
      component.seletedCompetencyArea = { identifier: '1', name: 'Area1', refId: 'ref1', description: 'desc1' }
      component.seletedCompetencyTheme = { identifier: '2', name: 'Theme1', refId: 'ref2', description: 'desc2', category: 'theme' }
      component.seletedCompetencySubTheme = { identifier: '3', name: 'SubTheme1', refId: 'ref3', description: 'desc3' }
      const control = createMockFormControl([])
      component.entryForm.get = jest.fn().mockReturnValue(control)
      component.resetCompfields = jest.fn()
      component.addCompetency()
      expect(control.value.length).toBe(1)
      expect(control.setValue).toHaveBeenCalled()
      expect(component.resetCompfields).toHaveBeenCalled()
    })

    it('should not add duplicate competency', () => {
      const existingComp = { competencyAreaIdentifier: '1', competencyThemeIdentifier: '2', competencySubThemeIdentifier: '3' }
      component.seletedCompetencyArea = { identifier: '1', name: 'Area1' }
      component.seletedCompetencyTheme = { identifier: '2', name: 'Theme1' }
      component.seletedCompetencySubTheme = { identifier: '3', name: 'SubTheme1' }
      const control = createMockFormControl([existingComp])
      component.entryForm.get = jest.fn().mockReturnValue(control)
      component.openSnackbar = jest.fn()
      component.addCompetency()
      expect(component.openSnackbar).toHaveBeenCalledWith('This competency is already added.')
    })

    it('should return early if required competency selections are missing', () => {
      component.seletedCompetencyArea = null
      component.seletedCompetencyTheme = null
      component.seletedCompetencySubTheme = null
      const control = createMockFormControl([])
      component.entryForm.get = jest.fn().mockReturnValue(control)
      component.addCompetency()
      expect(control.setValue).not.toHaveBeenCalled()
    })

    it('should remove competency', () => {
      const comp = { competencyAreaName: 'Area1', competencyThemeName: 'Theme1', competencySubThemeName: 'SubTheme1' }
      const control = createMockFormControl([comp])
      component.entryForm.get = jest.fn().mockReturnValue(control)
      component.removeCompetencyV2('Area1', 'Theme1', 'SubTheme1')
      expect(control.setValue).toHaveBeenCalled()
      expect(control.value.length).toBe(0)
    })

    it('should get unique areas', () => {
      component.entryForm.get = jest.fn().mockReturnValue({
        value: [
          { competencyAreaName: 'Area1' },
          { competencyAreaName: 'Area1' },
          { competencyAreaName: 'Area2' }
        ]
      })
      const areas = component.uniqueAreas
      expect(areas.length).toBe(2)
      expect(areas).toContain('Area1')
      expect(areas).toContain('Area2')
    })

    it('should get unique themes for area', () => {
      component.entryForm.get = jest.fn().mockReturnValue({
        value: [
          { competencyAreaName: 'Area1', competencyThemeName: 'Theme1' },
          { competencyAreaName: 'Area1', competencyThemeName: 'Theme2' },
          { competencyAreaName: 'Area2', competencyThemeName: 'Theme3' }
        ]
      })
      const themes = component.getUniqueThemesForArea('Area1')
      expect(themes.length).toBe(2)
      expect(themes).toContain('Theme1')
      expect(themes).toContain('Theme2')
    })

    it('should get subthemes for area and theme', () => {
      component.entryForm.get = jest.fn().mockReturnValue({
        value: [
          { competencyAreaName: 'Area1', competencyThemeName: 'Theme1', competencySubThemeName: 'Sub1' },
          { competencyAreaName: 'Area1', competencyThemeName: 'Theme1', competencySubThemeName: 'Sub2' }
        ]
      })
      const subs = component.getSubthemesForAreaAndTheme('Area1', 'Theme1')
      expect(subs.length).toBe(2)
      expect(subs).toContain('Sub1')
      expect(subs).toContain('Sub2')
    })

    it('should get total rows for area', () => {
      component.getUniqueThemesForArea = jest.fn().mockReturnValue(['Theme1', 'Theme2'])
      component.getSubthemesForAreaAndTheme = jest.fn().mockReturnValue(['Sub1', 'Sub2'])
      const total = component.getTotalRowsForArea('Area1')
      expect(total).toBe(4)
    })

    it('should update query for theme', () => {
      component.allCompetencyTheme = [{ name: 'Theme1' }, { name: 'Theme2' }]
      component.updateQuery('Theme1', 'theme')
      expect(component.filteredallCompetencyTheme.length).toBe(1)
    })

    it('should update query for subtheme', () => {
      component.allCompetencySubtheme = [{ name: 'Sub1' }, { name: 'Sub2' }]
      component.updateQuery('Sub1', 'subtheme')
      expect(component.filteredallCompetencySubtheme.length).toBe(1)
    })

    it('should reset search for theme', () => {
      component.queryThemeControl.setValue = jest.fn()
      component.allCompetencyTheme = [{ name: 'Theme1' }]
      component.resetSearch('theme')
      expect(component.queryThemeControl.setValue).toHaveBeenCalledWith('')
      expect(component.filteredallCompetencyTheme).toEqual(component.allCompetencyTheme)
    })

    it('should reset search for subtheme', () => {
      component.querySubThemeControl.setValue = jest.fn()
      component.allCompetencySubtheme = [{ name: 'Sub1' }]
      component.resetSearch('subtheme')
      expect(component.querySubThemeControl.setValue).toHaveBeenCalledWith('')
      expect(component.filteredallCompetencySubtheme).toEqual(component.allCompetencySubtheme)
    })

    it('should reset comp fields', () => {
      component.queryThemeControl.setValue = jest.fn()
      component.querySubThemeControl.setValue = jest.fn()
      component.resetCompfields()
      expect(component.enableCompetencyAdd).toBe(false)
      expect(component.selectedAreaValue).toBeNull()
      expect(component.seletedCompetencyArea).toBeNull()
      expect(component.queryThemeControl.setValue).toHaveBeenCalledWith('')
    })

    it('should reset comp subfields', () => {
      component.queryThemeControl.setValue = jest.fn()
      component.querySubThemeControl.setValue = jest.fn()
      component.resetCompSubfields()
      expect(component.enableCompetencyAdd).toBe(false)
      expect(component.seletedCompetencyTheme).toBeNull()
      expect(component.queryThemeControl.setValue).toHaveBeenCalledWith('')
    })

    it('should toggle table', () => {
      component.isTableExpanded = true
      component.toggleTable()
      expect(component.isTableExpanded).toBe(false)
      component.toggleTable()
      expect(component.isTableExpanded).toBe(true)
    })

    it('should filter values', () => {
      const array = [{ name: 'Test1' }, { name: 'Test2' }, { name: 'Other' }]
      const result = component.filterValues('test', array)
      expect(result.length).toBe(2)
    })

    it('should return all values when search is empty', () => {
      const array = [{ name: 'Test1' }, { name: 'Test2' }]
      const result = component.filterValues('', array)
      expect(result.length).toBe(2)
    })

    it('should return competencies value', () => {
      const competencies = [{ name: 'Comp1' }]
      component.entryForm.get = jest.fn().mockReturnValue({ value: competencies })
      expect(component.competenciesValue).toEqual(competencies)
    })

    it('should return empty array if competencies control is null', () => {
      component.entryForm.get = jest.fn().mockReturnValue(null)
      expect(component.competenciesValue).toEqual([])
    })
  })

  describe('File Upload', () => {
    it('should call removeFile correctly', () => {
      const patchValue = jest.fn()
      const updateValueAndValidity = jest.fn()
      const enable = jest.fn()
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'uploadedDocumentUrl' || name === 'fileName') return { patchValue, updateValueAndValidity }
        if (name === 'url') return { patchValue, enable, updateValueAndValidity }
        return null
      })
      component.removeFile()
      expect(patchValue).toHaveBeenCalled()
      expect(updateValueAndValidity).toHaveBeenCalled()
      expect(enable).toHaveBeenCalled()
      expect(component.disableUpload).toBe(false)
      expect(component.disableUrl).toBe(false)
    })

    it('should call openSnackbar if file is not correct image type in onFileSelected', () => {
      component.openSnackbar = jest.fn()
      component.onFileSelected([{ type: 'application/pdf', size: 100 }])
      expect(component.openSnackbar).toHaveBeenCalledWith('Only PNG, JPG, and JPEG images are supported')
    })

    it('should call openSnackbar if image size > 2MB in onFileSelected', () => {
      component.openSnackbar = jest.fn()
      component.onFileSelected([{ type: 'image/png', size: 2500 * 1024 }])
      expect(component.openSnackbar).toHaveBeenCalledWith('Selected image size is more than 2MB.')
    })

    it('should call saveImage if file is image and size < 2MB in onFileSelected', () => {
      component.saveImage = jest.fn()
      const file = { type: 'image/png', size: 100 * 1024, name: 'test.png' }
      const mockReader: any = { readAsDataURL: jest.fn() }
      global.FileReader = jest.fn(() => mockReader) as any
      component.onFileSelected([file])
      expect(mockReader.readAsDataURL).toHaveBeenCalled()
      expect(component.saveImage).toHaveBeenCalledWith(file)
    })

    it('should return early if files array is empty', () => {
      component.saveImage = jest.fn()
      component.onFileSelected([])
      expect(component.saveImage).not.toHaveBeenCalled()
    })

    it('should call preventDefaultCDK and onFileSelected in onDrop', () => {
      component.preventDefaultCDK = jest.fn()
      component.onFileSelected = jest.fn()
      const files: any = [{ type: 'image/png' }]
      const event: any = { dataTransfer: { files }, preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { style: {} } }
      component.onDrop(event)
      expect(component.preventDefaultCDK).toHaveBeenCalled()
      expect(component.onFileSelected).toHaveBeenCalledWith(files)
    })

    it('should prevent default in preventDefaultCDK', () => {
      const event: any = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { style: {} } }
      component.preventDefaultCDK(event, 'enter')
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(event.target.style.opacity).toBe('0.5')
      component.preventDefaultCDK(event, 'leave')
      expect(event.target.style.opacity).toBe('1')
    })

    it('should handle saveImage success', (done) => {
      const file = new Blob(['test'], { type: 'image/png' })
      Object.defineProperty(file, 'name', { value: 'test.png' })
      const patchValue = jest.fn()
      const updateValueAndValidity = jest.fn()
      const disable = jest.fn()
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'uploadedDocumentUrl' || name === 'fileName') return { patchValue, updateValueAndValidity }
        if (name === 'url') return { patchValue, disable, updateValueAndValidity }
        return null
      })
      mockProfileV2RevampService.updateAchievementPic = jest.fn().mockReturnValue(of({ result: { url: '/userAchievements/test.png' } }))
      component.saveImage(file)
      setTimeout(() => {
        expect(patchValue).toHaveBeenCalled()
        expect(updateValueAndValidity).toHaveBeenCalled()
        expect(disable).toHaveBeenCalled()
        expect(component.disableUrl).toBe(true)
        done()
      }, 100)
    })

    it('should handle saveImage error', (done) => {
      const file = new Blob(['test'], { type: 'image/png' })
      Object.defineProperty(file, 'name', { value: 'test.png' })
      mockProfileV2RevampService.updateAchievementPic = jest.fn().mockReturnValue(throwError({ error: { message: 'Upload failed' } }))
      component.openSnackbar = jest.fn()
      component.entryForm.get = jest.fn().mockReturnValue({ patchValue: jest.fn(), updateValueAndValidity: jest.fn(), disable: jest.fn() })
      component.saveImage(file)
      setTimeout(() => {
        expect(component.openSnackbar).toHaveBeenCalledWith('Upload failed')
        done()
      }, 100)
    })
  })

  describe('Utility Methods', () => {
    it('should prevent alphabet input', () => {
      const event: any = { key: 'a', preventDefault: jest.fn() }
      component.preventAlphabetInput(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not prevent numeric input', () => {
      const event: any = { key: '5', preventDefault: jest.fn() }
      component.preventAlphabetInput(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should not prevent allowed keys', () => {
      const event: any = { key: 'Backspace', preventDefault: jest.fn() }
      component.preventAlphabetInput(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should prevent alphabet paste', () => {
      const event: any = { clipboardData: { getData: jest.fn().mockReturnValue('abc') }, preventDefault: jest.fn() }
      component.preventAlphabetPaste(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not prevent numeric paste', () => {
      const event: any = { clipboardData: { getData: jest.fn().mockReturnValue('123') }, preventDefault: jest.fn() }
      component.preventAlphabetPaste(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should prevent non-numeric input', () => {
      const event: any = { key: 'a', preventDefault: jest.fn() }
      component.preventNonNumericInput(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not prevent numeric input in preventNonNumericInput', () => {
      const event: any = { key: '5', preventDefault: jest.fn() }
      component.preventNonNumericInput(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should prevent non-numeric paste', () => {
      const event: any = { clipboardData: { getData: jest.fn().mockReturnValue('abc123') }, preventDefault: jest.fn() }
      component.preventNonNumericPaste(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not prevent numeric-only paste', () => {
      const event: any = { clipboardData: { getData: jest.fn().mockReturnValue('123') }, preventDefault: jest.fn() }
      component.preventNonNumericPaste(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should get name of the file - short name', () => {
      const name = component.getNameOfTheFile('test.png')
      expect(name).toBe('test.png')
    })

    it('should get name of the file - long name', () => {
      const longName = 'a'.repeat(60) + '.png'
      const name = component.getNameOfTheFile(longName)
      expect(name).toContain('...')
      expect(name.length).toBe(53)
    })
  })

  describe('Validators', () => {
    describe('endDateValidator', () => {
      it('should return error if endDate < startDate', () => {
        const control: any = {
          parent: {
            get: () => ({ value: '2024-01-01' }),
          },
          value: '2023-01-01',
        }
        expect(endDateValidator('startDate')(control)).toEqual({ endDateLessThanStartDate: true })
      })

      it('should return null if endDate is valid', () => {
        const control: any = {
          parent: {
            get: () => ({ value: '2022-01-01' }),
          },
          value: '2023-01-01',
        }
        expect(endDateValidator('startDate')(control)).toBeNull()
      })

      it('should return null if endDate is not set', () => {
        const control: any = { parent: { get: () => ({ value: '2022-01-01' }) }, value: null }
        expect(endDateValidator('startDate')(control)).toBeNull()
      })
    })

    describe('startDateValidator', () => {
      it('should return error if startDate > endDate', () => {
        const control: any = {
          parent: {
            get: () => ({ value: '2022-01-01' }),
          },
          value: '2023-01-01',
        }
        expect(startDateValidator('endDate')(control)).toEqual({ startDateGreaterThanEndDate: true })
      })

      it('should return null if startDate is valid', () => {
        const control: any = {
          parent: {
            get: () => ({ value: '2024-01-01' }),
          },
          value: '2023-01-01',
        }
        expect(startDateValidator('endDate')(control)).toBeNull()
      })

      it('should return null if startDate is not set', () => {
        const control: any = { parent: { get: () => ({ value: '2024-01-01' }) }, value: null }
        expect(startDateValidator('endDate')(control)).toBeNull()
      })
    })

    describe('issuedDateValidator', () => {
      it('should return error if issuedDate < endDate', () => {
        const control: any = {
          parent: {
            get: () => ({ value: '2024-01-01' }),
          },
          value: '2023-01-01',
        }
        expect(issuedDateValidator('endDate')(control)).toEqual({ issuedDateBeforeEndDate: true })
      })

      it('should return null if issuedDate is valid', () => {
        const control: any = {
          parent: {
            get: () => ({ value: '2022-01-01' }),
          },
          value: '2023-01-01',
        }
        expect(issuedDateValidator('endDate')(control)).toBeNull()
      })

      it('should return null if issuedDate is not set', () => {
        const control: any = { parent: { get: () => ({ value: '2022-01-01' }) }, value: null }
        expect(issuedDateValidator('endDate')(control)).toBeNull()
      })
    })

    describe('urlOrDocumentValidator', () => {
      it('should return error if both url and uploadedDocumentUrl are empty', () => {
        const formGroup: any = {
          get: (name: string) => {
            if (name === 'url') return { value: '' }
            if (name === 'uploadedDocumentUrl') return { value: '' }
            return null
          }
        }
        expect(urlOrDocumentValidator()(formGroup)).toEqual({ urlOrDocumentRequired: true })
      })

      it('should return null if url is provided', () => {
        const formGroup: any = {
          get: (name: string) => {
            if (name === 'url') return { value: 'http://test.com' }
            if (name === 'uploadedDocumentUrl') return { value: '' }
            return null
          }
        }
        expect(urlOrDocumentValidator()(formGroup)).toBeNull()
      })

      it('should return null if uploadedDocumentUrl is provided', () => {
        const formGroup: any = {
          get: (name: string) => {
            if (name === 'url') return { value: '' }
            if (name === 'uploadedDocumentUrl') return { value: 'test.png' }
            return null
          }
        }
        expect(urlOrDocumentValidator()(formGroup)).toBeNull()
      })
    })
  })

  describe('Additional Coverage Tests', () => {
    it('should handle serviceHistoryValueChangeFunctions with orgName value change', (done) => {
      const orgNameControl = createMockFormControl('')
      const designationControl = createMockFormControl('')
      const searchDesignationControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'orgName') return orgNameControl
        if (name === 'designation') return designationControl
        if (name === 'searchDesignation') return searchDesignationControl
        return createMockFormControl('')
      })
      component.orgList = [{ orgName: 'TestOrg', identifier: '123', rootOrgId: 'root123', imgUrl: 'logo.png' }]
      component.checkSelectedOrgHasDesignations = jest.fn()
      component.serviceHistoryValueChangeFunctions()
      setTimeout(() => {
        orgNameControl._triggerValueChange('TestOrg')
        setTimeout(() => {
          expect(component.selctedOrgDetails.orgId).toBe('123')
          expect(component.selctedOrgDetails.rootOrgId).toBe('root123')
          done()
        }, 50)
      }, 50)
    })

    it('should handle getdesignationsMeta return early if no rootOrgId', () => {
      component.selctedOrgDetails = {}
      component.isLoadingMoreDesignations = false
      const spy = jest.spyOn(mockProfileV2RevampService, 'searchIgotDesignation')
      component.getdesignationsMeta()
      expect(spy).not.toHaveBeenCalled()
      expect(component.isLoadingMoreDesignations).toBe(false)
    })

    it('should handle createServiceHistoryForm with existing details', () => {
      component.entryDetails = {
        orgName: 'TestOrg',
        orgId: '123',
        orgLogo: 'logo.png',
        rootOrgId: 'root123',
        orgState: 'Karnataka',
        currentlyWorking: 'true',
        startDate: '2020-01-01'
      }
      component.getOrgList = jest.fn()
      component.checkSelectedOrgHasDesignations = jest.fn()
      component.getStatesList = jest.fn()
      component.serviceHistoryValueChangeFunctions = jest.fn()
      const orgDistrictControl = createMockFormControl('')
      const endDateControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'orgDistrict') return orgDistrictControl
        if (name === 'endDate') return endDateControl
        return null
      })
      component.createServiceHistoryForm()
      expect(component.selctedOrgDetails.orgName).toBe('TestOrg')
      expect(component.isCurrentlyWorking).toBe(true)
    })

    it('should create achievements form with existing fileName', () => {
      component.entryDetails = {
        contextData: {
          title: 'Achievement Title',
          fileName: 'cert.png',
          uploadedDocumentUrl: '/path/to/cert.png',
          url: '',
          endDate: '2023-01-01',
          issuedDate: '2023-01-15'
        }
      }
      component.valueChanges = jest.fn()
      component.addCompetencyMeta = jest.fn()
      component.createAchievementsForm()
      expect(component.disableUrl).toBe(true)
      expect(component.disableUpload).toBe(false)
      expect(component.valueChanges).toHaveBeenCalled()
      expect(component.addCompetencyMeta).toHaveBeenCalled()
    })

    it('should create achievements form with existing url', () => {
      component.entryDetails = {
        contextData: {
          title: 'Achievement Title',
          url: 'http://test.com',
          fileName: '',
          uploadedDocumentUrl: ''
        }
      }
      component.valueChanges = jest.fn()
      component.addCompetencyMeta = jest.fn()
      component.createAchievementsForm()
      expect(component.disableUpload).toBe(true)
      expect(component.disableUrl).toBe(false)
      expect(component.valueChanges).toHaveBeenCalled()
    })

    it('should handle valueChanges for url control', (done) => {
      const urlControl = createMockFormControl('')
      const documentUrlControl = createMockFormControl('test.png')
      const fileNameControl = createMockFormControl('test')
      component.entryForm = {
        get: jest.fn().mockImplementation((name: string) => {
          if (name === 'url') return urlControl
          if (name === 'uploadedDocumentUrl') return documentUrlControl
          if (name === 'fileName') return fileNameControl
          return null
        }),
        updateValueAndValidity: jest.fn()
      } as any
      component.valueChanges()
      setTimeout(() => {
        urlControl._triggerValueChange('http://test.com')
        setTimeout(() => {
          expect(documentUrlControl.patchValue).toHaveBeenCalledWith('')
          expect(component.disableUpload).toBe(true)
          done()
        }, 50)
      }, 50)
    })

    it('should handle valueChanges for documentUrl control', (done) => {
      const urlControl = createMockFormControl('')
      const documentUrlControl = createMockFormControl('')
      component.entryForm = {
        get: jest.fn().mockImplementation((name: string) => {
          if (name === 'url') return urlControl
          if (name === 'uploadedDocumentUrl') return documentUrlControl
          return null
        }),
        updateValueAndValidity: jest.fn()
      } as any
      component.valueChanges()
      setTimeout(() => {
        documentUrlControl._triggerValueChange('test.png')
        setTimeout(() => {
          expect(component.entryForm.updateValueAndValidity).toHaveBeenCalled()
          done()
        }, 50)
      }, 50)
    })

    it('should handle addCompetencyMeta without competencies_v6 control', () => {
      component.entryForm.get = jest.fn().mockReturnValue(null)
      component.entryForm.addControl = jest.fn()
      component.loadCompetencyMaster = jest.fn()
      component.addCompetencyMeta()
      expect(component.entryForm.addControl).toHaveBeenCalled()
    })

    it('should handle loadCompetencyMaster with unsuccessful response', (done) => {
      const response = {
        params: { status: 'failed' },
        result: {}
      }
      mockProfileV2RevampService.fetchCompetencyV6 = jest.fn().mockReturnValue(of(response))
      component.loadCompetencyMaster()
      setTimeout(() => {
        expect(component.allCompetencies).toEqual([])
        expect(component.filteredallCompetencies).toEqual([])
        done()
      }, 100)
    })

    it('should handle canPush to check duplicates', () => {
      const arr = [{ competencyAreaIdentifier: '1', competencyThemeIdentifier: '2', competencySubThemeIdentifier: '3' }]
      const obj1 = { competencyAreaIdentifier: '1', competencyThemeIdentifier: '2', competencySubThemeIdentifier: '3' }
      const obj2 = { competencyAreaIdentifier: '1', competencyThemeIdentifier: '2', competencySubThemeIdentifier: '4' }
      expect(component.canPush(arr, obj1)).toBe(false)
      expect(component.canPush(arr, obj2)).toBe(true)
    })

    it('should return empty array for uniqueAreas when competenciesValue is empty', () => {
      component.entryForm.get = jest.fn().mockReturnValue({ value: [] })
      expect(component.uniqueAreas).toEqual([])
    })

    it('should return empty array for getUniqueThemesForArea when competenciesValue is empty', () => {
      component.entryForm.get = jest.fn().mockReturnValue({ value: [] })
      expect(component.getUniqueThemesForArea('Area1')).toEqual([])
    })

    it('should return empty array for getSubthemesForAreaAndTheme when competenciesValue is empty', () => {
      component.entryForm.get = jest.fn().mockReturnValue({ value: [] })
      expect(component.getSubthemesForAreaAndTheme('Area1', 'Theme1')).toEqual([])
    })

    it('should handle removeCompetencyV2 when control is null', () => {
      component.entryForm.get = jest.fn().mockReturnValue(null)
      expect(() => component.removeCompetencyV2('Area1', 'Theme1', 'Sub1')).not.toThrow()
    })

    it('should handle removeCompetencyV2 when competency not found', () => {
      const control = createMockFormControl([{ competencyAreaName: 'Area2', competencyThemeName: 'Theme2', competencySubThemeName: 'Sub2' }])
      component.entryForm.get = jest.fn().mockReturnValue(control)
      component.removeCompetencyV2('Area1', 'Theme1', 'Sub1')
      expect(control.setValue).not.toHaveBeenCalled()
    })

    it('should handle educationFormValuChange with existing degree and institute', (done) => {
      component.entryDetails = {
        degree: 'B.Tech',
        institutionName: 'IIT'
      }
      const searchDegreeControl = createMockFormControl('')
      const degreeControl = createMockFormControl('')
      const searchInstituteControl = createMockFormControl('')
      const institutionNameControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockImplementation((name: string) => {
        if (name === 'searchDegrees') return searchDegreeControl
        if (name === 'degree') return degreeControl
        if (name === 'searchInstitute') return searchInstituteControl
        if (name === 'institutionName') return institutionNameControl
        return null
      })
      component.getEducationalQualifications = jest.fn()
      component.onInstituteChange = jest.fn()
      component.educationFormValuChange()
      setTimeout(() => {
        expect(searchDegreeControl.setValue).toHaveBeenCalledWith('B.Tech')
        expect(searchInstituteControl.setValue).toHaveBeenCalledWith('IIT')
        done()
      }, 100)
    })

    it('should handle getDistrictsList with isFirstTime true', (done) => {
      component.entryDetails = { orgDistrict: 'Bangalore' }
      const districtsList = ['Bangalore', 'Mysore']
      mockProfileV2RevampService.getDistrictsList = jest.fn().mockReturnValue(of({ result: { districtsList: [{ districts: districtsList }] } }))
      const orgDistrictControl = createMockFormControl('')
      component.entryForm.get = jest.fn().mockReturnValue(orgDistrictControl)
      component.getDistrictsList('Karnataka', true)
      setTimeout(() => {
        expect(orgDistrictControl.patchValue).toHaveBeenCalledWith('Bangalore')
        done()
      }, 100)
    })

    it('should append organizations on subsequent calls', (done) => {
      component.orgList = [{ orgName: 'Org1', identifier: '1', rootOrgId: 'root1', imgUrl: 'img1' }]
      component.orgOffset = 1
      const newContent = [{ orgName: 'Org2', identifier: '2', rootOrgId: 'root2', imgUrl: 'img2' }]
      mockProfileV2RevampService.getOrgSearch = jest.fn().mockReturnValue(of({ result: { response: { count: 2, content: newContent } } }))
      component.getOrgList()
      setTimeout(() => {
        expect(component.orgList.length).toBe(2)
        expect(component.orgList[1].orgName).toBe('Org2')
        done()
      }, 100)
    })

    it('should append designations on subsequent calls to getIgotDesignations', (done) => {
      component.selctedOrgDetails = { rootOrgId: 'root1' }
      component.selectedOrgHasDesignations = true
      component.designationsOffset = 1
      component.designationsMeta = [{ name: 'Manager', status: 'Active' }]
      const newTerms = [{ name: 'Engineer', status: 'Active' }]
      mockProfileV2RevampService.searchIgotDesignation = jest.fn().mockReturnValue(of({ result: { Term: newTerms, count: 2 } }))
      component.checkCurrentDesignationPresent = jest.fn()
      component.getIgotDesignations()
      setTimeout(() => {
        expect(component.designationsMeta.length).toBe(2)
        expect(component.designationsMeta[1].name).toBe('Engineer')
        done()
      }, 100)
    })

    it('should append designations on subsequent calls to getDefaultDesignations', (done) => {
      component.designationsOffset = 1
      component.designationsMeta = [{ name: 'Manager', status: 'Active' }]
      const newData = [{ designation: 'Engineer', status: 'Active' }]
      mockProfileV2RevampService.searchDesignation = jest.fn().mockReturnValue(of({ result: { result: { data: newData, totalCount: 2 } } }))
      component.checkCurrentDesignationPresent = jest.fn()
      component.getDefaultDesignations()
      setTimeout(() => {
        expect(component.designationsMeta.length).toBe(2)
        expect(component.designationsMeta[1].name).toBe('Engineer')
        done()
      }, 100)
    })

    it('should append degrees on subsequent calls', (done) => {
      component.degreePageNumber = 1
      component.filterDegreesMeta = [{ name: 'B.Tech' }, { name: 'Other' }]
      const newResult = [{ name: 'M.Tech' }]
      mockProfileV2RevampService.getEducationsQualificationsSearch = jest.fn().mockReturnValue(of({ result: { result: newResult, count: 2 } }))
      component.checkCurrentDegreePresent = jest.fn()
      component.getEducationalQualifications('degree', 1, '')
      setTimeout(() => {
        expect(component.filterDegreesMeta.length).toBe(3)
        done()
      }, 100)
    })

    it('should append institutes on subsequent calls', (done) => {
      component.institutePageNumber = 1
      component.filterInstitutionsList = [{ name: 'IIT' }, { name: 'Other' }]
      const newResult = [{ name: 'MIT' }]
      mockProfileV2RevampService.getEducationsQualificationsSearch = jest.fn().mockReturnValue(of({ result: { result: newResult, count: 2 } }))
      component.checkCurrentInstitutePresent = jest.fn()
      component.getEducationalQualifications('institute', 1, '')
      setTimeout(() => {
        expect(component.filterInstitutionsList.length).toBe(3)
        done()
      }, 100)
    })

    it('should handle resetSearch for theme without subtheme selected', () => {
      component.queryThemeControl.setValue = jest.fn()
      component.querySubThemeControl.setValue = jest.fn()
      component.seletedCompetencySubTheme = null
      component.allCompetencyTheme = [{ name: 'Theme1' }]
      component.resetSearch('theme')
      expect(component.queryThemeControl.setValue).toHaveBeenCalledWith('')
      expect(component.querySubThemeControl.setValue).toHaveBeenCalledWith('')
      expect(component.filteredallCompetencySubtheme).toEqual([])
    })

    it('should handle resetSearch for theme with subtheme selected', () => {
      component.queryThemeControl.setValue = jest.fn()
      component.querySubThemeControl.setValue = jest.fn()
      component.seletedCompetencySubTheme = { name: 'Sub1' }
      component.allCompetencyTheme = [{ name: 'Theme1' }]
      component.resetSearch('theme')
      expect(component.querySubThemeControl.setValue).toHaveBeenCalledWith('')
    })
  })
})
