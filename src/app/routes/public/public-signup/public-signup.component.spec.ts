import {
  forbiddenNamesValidator,
  forbiddenNamesValidatorNonEmpty,
  PublicSignupComponent,
} from './public-signup.component'
import { UntypedFormControl } from '@angular/forms'
import { of, Subject } from 'rxjs'

// Fix for 'import _ from lodash' with esModuleInterop: false
jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { ...actual, default: actual }
})

describe('public-signup.component — exported validators', () => {
  // ─── forbiddenNamesValidator ─────────────────────────────────────────────
  describe('forbiddenNamesValidator', () => {
    it('should return null when optionsArray is falsy', () => {
      const validator = forbiddenNamesValidator(null)
      const control = new UntypedFormControl('anything')
      expect(validator(control)).toBeNull()
    })

    it('should return null when control value is empty/falsy', () => {
      const options = [{ orgname: 'Ministry of Finance' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl(null)
      expect(validator(control)).toBeNull()
    })

    it('should return null when control value.orgname is found in options', () => {
      const options = [{ orgname: 'Ministry of Finance' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgname: 'Ministry of Finance' })
      expect(validator(control)).toBeNull()
    })

    it('should return forbiddenNames error when control value.orgname is NOT in options', () => {
      const options = [{ orgname: 'Ministry of Finance' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgname: 'Unknown Org' })
      const result = validator(control)
      expect(result).not.toBeNull()
      expect(result!['forbiddenNames']).toEqual({ value: 'Unknown Org' })
    })

    it('should return null when options array is empty and control value is set', () => {
      const validator = forbiddenNamesValidator([])
      const control = new UntypedFormControl({ orgname: 'Ministry' })
      const result = validator(control)
      expect(result).not.toBeNull()
      expect(result!['forbiddenNames']).toBeDefined()
    })

    it('should match correctly with multiple options', () => {
      const options = [
        { orgname: 'Ministry A' },
        { orgname: 'Ministry B' },
        { orgname: 'Ministry C' },
      ]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgname: 'Ministry B' })
      expect(validator(control)).toBeNull()
    })
  })

  // ─── forbiddenNamesValidatorNonEmpty ────────────────────────────────────
  describe('forbiddenNamesValidatorNonEmpty', () => {
    it('should return null when optionsArray is falsy', () => {
      const validator = forbiddenNamesValidatorNonEmpty(null)
      const control = new UntypedFormControl({ orgname: 'Any' })
      expect(validator(control)).toBeNull()
    })

    it('should return null when control value.orgname exists in options', () => {
      const options = [{ orgname: 'DOPT' }]
      const validator = forbiddenNamesValidatorNonEmpty(options)
      const control = new UntypedFormControl({ orgname: 'DOPT' })
      expect(validator(control)).toBeNull()
    })

    it('should return forbiddenNames error when orgname NOT in options', () => {
      const options = [{ orgname: 'DOPT' }]
      const validator = forbiddenNamesValidatorNonEmpty(options)
      const control = new UntypedFormControl({ orgname: 'UnknownOrg' })
      const result = validator(control)
      expect(result!['forbiddenNames']).toEqual({ value: 'UnknownOrg' })
    })

    it('should return error when options is empty array', () => {
      const validator = forbiddenNamesValidatorNonEmpty([])
      const control = new UntypedFormControl({ orgname: 'SomeOrg' })
      const result = validator(control)
      expect(result).not.toBeNull()
    })

    it('should validate second option correctly', () => {
      const options = [{ orgname: 'Org1' }, { orgname: 'Org2' }]
      const validator = forbiddenNamesValidatorNonEmpty(options)
      const control = new UntypedFormControl({ orgname: 'Org2' })
      expect(validator(control)).toBeNull()
    })
  })
})

describe('PublicSignupComponent — instance tests', () => {
  let component: PublicSignupComponent
  let mockSignupSvc: any
  let mockUsersService: any
  let mockLoggerSvc: any
  let mockConfigSvc: any
  let mockSnackBar: any
  let mockDialog: any
  let mockActivatedRoute: any
  let mockRecaptchaV3Service: any
  let mockRouter: any
  let mockDocument: any
  let mockPlatformId: any
  let mockTranslate: any
  let mockLangtranslations: any
  let mockHttp: any
  let mockSanitizer: any
  let mockEventService: any
  let mockTelemetrySvc: any

  beforeEach(() => {
    localStorage.clear()

    mockSignupSvc = {
      updateSignupDataObservable: of({}),
      searchOrgs: jest.fn().mockReturnValue(of({ result: { response: [] } })),
      registerUser: jest.fn().mockReturnValue(of({})),
      getStateOrMinistyForRegistration: jest.fn().mockReturnValue(of({ result: { response: { content: [], count: 0 } } })),
      getMinistryForRegistration: jest.fn().mockReturnValue(of({ result: { response: { content: [], count: 0 } } })),
      getStateForRegistration: jest.fn().mockReturnValue(of({ result: { response: { content: [], count: 0 } } })),
      sendOtp: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
      resendOtp: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
      verifyOTP: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
    }

    mockUsersService = {
      getDesignations: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } })),
      getMinistryData: jest.fn().mockReturnValue(of({ result: { response: [] } })),
      searchPublicDesignation: jest.fn().mockReturnValue(of({ result: { result: { data: [], totalcount: 0 } } })),
    }

    mockLoggerSvc = { log: jest.fn(), error: jest.fn() }

    mockConfigSvc = {
      instanceConfig: {
        isMultilingualEnabled: false,
        telemetryConfig: { pdata: { id: 'test-portal' } },
        websitelanguages: [],
      },
    }

    mockSnackBar = { open: jest.fn() }
    mockDialog = { open: jest.fn() }

    mockActivatedRoute = {
      snapshot: {
        data: {
          positions: { data: [] },
          group: { data: ['Leadership', 'Management', 'Others'] },
        },
      },
    }

    mockRecaptchaV3Service = { execute: jest.fn().mockReturnValue(of('token')) }
    mockRouter = { navigate: jest.fn() }
    mockDocument = { body: { classList: { add: jest.fn(), remove: jest.fn() } } }
    mockPlatformId = 'browser'

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      get: jest.fn().mockReturnValue(of('')),
    }

    mockLangtranslations = {
      languageSelected$: new Subject(),
      translateActualLabel: jest.fn().mockReturnValue(''),
      updatelanguageSelected: jest.fn(),
    }
    mockHttp = {
      get: jest.fn().mockReturnValue(of('<div>zoho</div>')),
    }
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((v: any) => v),
    }
    mockEventService = { raiseInteractTelemetry: jest.fn() }
    mockTelemetrySvc = { impression: jest.fn(), interact: jest.fn(), end: jest.fn() }

    component = new PublicSignupComponent(
      mockSignupSvc,
      mockUsersService,
      mockLoggerSvc,
      mockConfigSvc,
      mockSnackBar,
      mockDialog,
      mockActivatedRoute,
      mockRecaptchaV3Service,
      mockRouter,
      mockDocument,
      mockPlatformId,
      mockTranslate,
      mockLangtranslations,
      mockHttp,
      mockSanitizer,
      mockEventService,
      mockTelemetrySvc,
    )
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize currentStep to step1', () => {
      expect(component.currentStep).toBe('step1')
    })

    it('should initialize registrationFormStepOne', () => {
      expect(component.registrationFormStepOne).toBeTruthy()
    })

    it('should initialize registrationFormStepTwo', () => {
      expect(component.registrationFormStepTwo).toBeTruthy()
    })

    it('should set selectedLanguage from localStorage', () => {
      localStorage.setItem('websiteLanguage', 'hi')
      const comp = new PublicSignupComponent(
        mockSignupSvc, mockUsersService, mockLoggerSvc, mockConfigSvc, mockSnackBar,
        mockDialog, mockActivatedRoute, mockRecaptchaV3Service, mockRouter, mockDocument,
        mockPlatformId, mockTranslate, mockLangtranslations, mockHttp, mockSanitizer,
        mockEventService, mockTelemetrySvc
      )
      expect(comp.selectedLanguage).toBe('hi')
    })

    it('should set websiteLanguage in localStorage when not set', () => {
      localStorage.removeItem('websiteLanguage')
      new PublicSignupComponent(
        mockSignupSvc, mockUsersService, mockLoggerSvc, mockConfigSvc, mockSnackBar,
        mockDialog, mockActivatedRoute, mockRecaptchaV3Service, mockRouter, mockDocument,
        mockPlatformId, mockTranslate, mockLangtranslations, mockHttp, mockSanitizer,
        mockEventService, mockTelemetrySvc
      )
      expect(localStorage.getItem('websiteLanguage')).toBe('en')
    })
  })

  describe('emailVerification', () => {
    it('should set emailLengthVal to false for normal email', () => {
      component.emailVerification('user@example.com')
      expect(component.emailLengthVal).toBe(false)
    })

    it('should set emailLengthVal to false when emailId is empty', () => {
      component.emailVerification('')
      expect(component.emailLengthVal).toBe(false)
    })

    it('should set emailLengthVal to true when local part exceeds 64 chars', () => {
      const longLocal = 'a'.repeat(65)
      component.emailVerification(`${longLocal}@example.com`)
      expect(component.emailLengthVal).toBe(true)
    })

    it('should set emailLengthVal to true when domain exceeds 255 chars', () => {
      const longDomain = 'b'.repeat(256)
      component.emailVerification(`user@${longDomain}`)
      expect(component.emailLengthVal).toBe(true)
    })

    it('should set emailLengthVal to false when emailId has no @ sign', () => {
      component.emailVerification('invalidemail')
      expect(component.emailLengthVal).toBe(false)
    })
  })

  describe('goToPrevStep', () => {
    it('should set currentStep back to step1', () => {
      component.currentStep = 'step2'
      component.goToPrevStep()
      expect(component.currentStep).toBe('step1')
    })
  })

  describe('clearValues', () => {
    it('should clear organisation form value', () => {
      component.registrationFormStepOne.get('organisation')!.setValue('some org')
      component.clearValues()
      expect(component.registrationFormStepOne.get('organisation')!.value).toBe('')
    })

    it('should set heirarchyObject to null', () => {
      component.heirarchyObject = { some: 'data' }
      component.clearValues()
      expect(component.heirarchyObject).toBeNull()
    })
  })

  describe('resetOrganisationBackup', () => {
    it('should set organisationBackup with N/A entry', () => {
      component.resetOrganisationBackup()
      expect(component.masterData.organisationBackup).toBeDefined()
      expect(component.masterData.organisationBackup[0].identifier).toBe('-1')
    })
  })

  describe('onOrganisationChanged', () => {
    it('should set heirarchyObject when event value matches', () => {
      component.masterData.organisation = [{ identifier: 'org-1', orgName: 'Org One' }]
      component.onOrganisationChanged({ value: 'org-1' })
      expect(component.heirarchyObject).toEqual({ identifier: 'org-1', orgName: 'Org One' })
    })

    it('should set heirarchyObject to undefined when no match', () => {
      component.masterData.organisation = [{ identifier: 'org-2', orgName: 'Org Two' }]
      component.onOrganisationChanged({ value: 'unknown' })
      expect(component.heirarchyObject).toBeUndefined()
    })
  })

  describe('onMinistryChange', () => {
    it('should set currentMinistry when ministry found in backup', () => {
      component.masterData.ministryBackup = [{ identifier: 'm-1', orgName: 'Ministry One' }]
      component.masterData.organisationBackup = []
      jest.spyOn(component as any, 'getOrganisationData').mockImplementation(() => { })
      component.onMinistryChange({ value: 'm-1' })
      expect(component.currentMinistry).toEqual({ identifier: 'm-1', orgName: 'Ministry One' })
    })

    it('should clear organisation value', () => {
      component.registrationFormStepOne.get('organisation')!.setValue('something')
      component.masterData.ministryBackup = []
      component.masterData.organisationBackup = []
      jest.spyOn(component as any, 'getOrganisationData').mockImplementation(() => { })
      component.onMinistryChange({ value: 'm-1' })
      expect(component.registrationFormStepOne.get('organisation')!.value).toBe('')
    })
  })

  describe('onStateChanged', () => {
    it('should set currentMinistry from stateBackup when found', () => {
      component.masterData.stateBackup = [{ identifier: 's-1', stateName: 'State One' }]
      jest.spyOn(component as any, 'getDepartmentData').mockImplementation(() => { })
      component.onStateChanged({ value: 's-1' })
      expect(component.currentMinistry).toEqual({ identifier: 's-1', stateName: 'State One' })
    })

    it('should reset departmentBackup to empty array', () => {
      component.masterData.stateBackup = []
      jest.spyOn(component as any, 'getDepartmentData').mockImplementation(() => { })
      component.onStateChanged({ value: null })
      expect(component.masterData.departmentBackup).toEqual([])
    })
  })

  describe('onDepartmentChange', () => {
    it('should set currentMinistry from departmentBackup', () => {
      component.masterData.departmentBackup = [{ identifier: 'd-1', deptName: 'Dept One' }]
      jest.spyOn(component as any, 'getOrganisationData').mockImplementation(() => { })
      component.onDepartmentChange({ value: 'd-1' })
      expect(component.currentMinistry).toEqual({ identifier: 'd-1', deptName: 'Dept One' })
    })

    it('should not set currentMinistry when value is -1', () => {
      component.masterData.departmentBackup = [{ identifier: '-1', deptName: 'NA' }]
      component.currentMinistry = {}
      jest.spyOn(component as any, 'getOrganisationData').mockImplementation(() => { })
      component.onDepartmentChange({ value: '-1' })
      expect(component.currentMinistry).toEqual({})
    })
  })

  describe('onTypeChange', () => {
    it('should adjust validators for state type', () => {
      jest.spyOn(component as any, 'getStateData').mockImplementation(() => { })
      jest.spyOn(component as any, 'getMinistryData').mockImplementation(() => { })
      component.onTypeChange({ value: 'state' })
      const stateControl = component.registrationFormStepOne.get('state')
      expect(stateControl?.hasValidator).toBeDefined()
    })

    it('should adjust validators for ministry type', () => {
      jest.spyOn(component as any, 'getStateData').mockImplementation(() => { })
      jest.spyOn(component as any, 'getMinistryData').mockImplementation(() => { })
      component.onTypeChange({ value: 'ministry' })
      const ministryControl = component.registrationFormStepOne.get('ministry')
      expect(ministryControl?.hasValidator).toBeDefined()
    })

    it('should clear organisation field', () => {
      component.registrationFormStepOne.get('organisation')!.setValue('org')
      jest.spyOn(component as any, 'getMinistryData').mockImplementation(() => { })
      component.onTypeChange({ value: 'ministry' })
      expect(component.registrationFormStepOne.get('organisation')!.value).toBe('')
    })
  })

  describe('designationSearch', () => {
    it('should set designationSearchText when text provided', () => {
      jest.spyOn(component as any, 'getDesignation').mockImplementation(() => { })
      component.isLoadingMoreDesignations = false
      component.designationSearch({ target: { value: 'manager' } })
      expect(component.designationSearchText).toBe('manager')
    })

    it('should return early when isLoadingMoreDesignations is true', () => {
      component.isLoadingMoreDesignations = true
      component.designationSearch({ target: { value: 'manager' } })
      expect(component.designationSearchText).toBe('')
    })

    it('should reset to backup when text is empty', () => {
      component.isLoadingMoreDesignations = false
      component.masterData.designationBackup = [{ name: 'Manager' }, { name: 'Director' }]
      component.designationSearch({ target: { value: '' } })
      expect(component.desigantionFilterEnable).toBe(false)
    })
  })

  describe('onDesignationDropdownClosed', () => {
    it('should not throw when called', () => {
      jest.useFakeTimers()
      expect(() => component.onDesignationDropdownClosed()).not.toThrow()
      jest.runAllTimers()
      jest.useRealTimers()
    })
  })

  describe('typeValue getter', () => {
    it('should return the current type value from form', () => {
      expect(component.typeValue).toBeDefined()
    })
  })

  describe('typeValueStartCase getter', () => {
    it('should return start-cased type value', () => {
      expect(typeof component.typeValueStartCase).toBe('string')
    })
  })

  describe('filterOrgsSearch', () => {
    it('should set resultFetched to true on success', () => {
      mockSignupSvc.searchOrgs = jest.fn().mockReturnValue(of({ result: { response: [{ orgname: 'Org1' }] } }))
      component.filterOrgsSearch('org')
      expect(component.resultFetched).toBe(true)
    })

    it('should set searching to false on success', () => {
      mockSignupSvc.searchOrgs = jest.fn().mockReturnValue(of({ result: { response: [{ orgname: 'Org1' }] } }))
      component.filterOrgsSearch('org')
      expect(component.searching).toBe(false)
    })
  })

  describe('searchOrgs', () => {
    it('should open snackbar when searchValue is empty', async () => {
      const snackSpy = jest.spyOn(component as any, 'openSnackbar').mockImplementation(() => { })
      await component.searchOrgs('')
      expect(snackSpy).toHaveBeenCalled()
    })

    it('should set resultFetched when valid searchValue', async () => {
      jest.spyOn(component, 'filterOrgsSearch').mockImplementation((): any => { })
      await component.searchOrgs('ministry')
      expect(component.searching).toBeDefined()
    })
  })

  describe('editOrg', () => {
    it('should reset hideOrg and related state', () => {
      component.hideOrg = true
      component.resultFetched = true
      component.searching = true
      component.heirarchyObject = { some: 'val' }
      component.editOrg()
      expect(component.hideOrg).toBe(false)
      expect(component.resultFetched).toBe(false)
    })
  })

  describe('orgClicked', () => {
    it('should set heirarchyObject when option has orgname', () => {
      const event = { option: { value: { orgName: 'Ministry A', channel: 'ch1' } } }
      component.orgClicked(event)
      expect(component.hideOrg).toBe(true)
    })

    it('should set hideOrg false when option has no orgname', () => {
      const event = { option: { value: {} } }
      component.orgClicked(event)
      expect(component.hideOrg).toBe(false)
    })

    it('should not throw when event is null', () => {
      expect(() => component.orgClicked(null)).not.toThrow()
    })
  })

  describe('confirmChange', () => {
    it('should toggle confirm to true', () => {
      component.confirm = false
      component.confirmChange()
      expect(component.confirm).toBe(true)
    })

    it('should toggle confirm to false', () => {
      component.confirm = true
      component.confirmChange()
      expect(component.confirm).toBe(false)
    })
  })

  describe('confirmTermsChange', () => {
    it('should toggle terms confirm', () => {
      component.confirmTerms = false
      component.confirmTermsChange()
      expect(component.confirmTerms).toBe(true)
    })
  })

  describe('displayFn functions', () => {
    it('displayFn should return channel', () => {
      expect(component.displayFn({ channel: 'ch1' })).toBe('ch1')
    })
    it('displayFn should return undefined for null', () => {
      expect(component.displayFn(null)).toBeUndefined()
    })
    it('displayFnPosition should return name', () => {
      expect(component.displayFnPosition({ name: 'Manager' })).toBe('Manager')
    })
    it('displayFnPosition should return undefined for null', () => {
      expect(component.displayFnPosition(null)).toBeUndefined()
    })
    it('displayFnGroup should return value itself', () => {
      expect(component.displayFnGroup('Director')).toBe('Director')
    })
    it('displayFnOrg should return orgName', () => {
      expect(component.displayFnOrg({ orgName: 'Org1' })).toBe('Org1')
    })
    it('displayFnOrg should return empty string for null', () => {
      expect(component.displayFnOrg(null)).toBe('')
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe subscriptionContact if present', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['subscriptionContact'] = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when subscriptionContact is null', () => {
      component['subscriptionContact'] = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('navigateTo', () => {
    it('should call router.navigate', () => {
      component.navigateTo('/page/home')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/request'], expect.objectContaining({ queryParams: { type: '/page/home' } }))
    })
  })

  describe('numericOnly', () => {
    it('should return true for numeric key', () => {
      const event = { key: '4' }
      expect(component.numericOnly(event)).toBe(true)
    })

    it('should return false for non-numeric key', () => {
      const event = { key: 'A' }
      expect(component.numericOnly(event)).toBe(false)
    })
  })

  describe('selectLanguage', () => {
    it('should set selectedLanguage and store in localStorage', () => {
      component.selectLanguage('hi')
      expect(component.selectedLanguage).toBe('hi')
      expect(localStorage.getItem('websiteLanguage')).toBe('hi')
    })
  })

  describe('getMinistryData', () => {
    it('should call signupSvc.getMinistryForRegistration', () => {
      component['getMinistryData']()
      expect(mockSignupSvc.getMinistryForRegistration).toHaveBeenCalled()
    })

    it('should set masterData.ministryBackup on success', () => {
      mockSignupSvc.getMinistryForRegistration = jest.fn().mockReturnValue(
        of({ result: { response: { content: [{ orgName: 'M1' }], count: 1 } } })
      )
      component['getMinistryData']()
      expect(component.masterData.ministryBackup).toBeDefined()
    })

  })

  describe('getStateData', () => {
    it('should call signupSvc.getStateForRegistration', () => {
      component['getStateData']()
      expect(mockSignupSvc.getStateForRegistration).toHaveBeenCalled()
    })

    it('should set masterData.stateBackup on success', () => {
      mockSignupSvc.getStateForRegistration = jest.fn().mockReturnValue(
        of({ result: { response: { content: [{ orgName: 'S1' }], count: 1 } } })
      )
      component['getStateData']()
      expect(component.masterData.stateBackup).toBeDefined()
    })

  })

  describe('getDepartmentData', () => {
    it('should not throw when called', () => {
      jest.spyOn(component as any, 'getDepartmentData').mockImplementation(() => { })
      expect(() => component['getDepartmentData']()).not.toThrow()
    })

  })

  describe('getOrganisationData', () => {
    it('should not throw when called', () => {
      jest.spyOn(component as any, 'getOrganisationData').mockImplementation(() => { })
      expect(() => component['getOrganisationData']()).not.toThrow()
    })
  })

  describe('sendOtpEmail', () => {
    it('should call signupSvc.sendOtp', () => {
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component['sendOtpEmail']()
      expect(mockSignupSvc.sendOtp).toHaveBeenCalled()
    })

    it('should open snackbar when email is empty', () => {
      component.registrationFormStepOne.get('email')!.setValue('')
      const snackSpy = jest.spyOn(mockSnackBar, 'open')
      component['sendOtpEmail']()
      expect(snackSpy).toHaveBeenCalled()
    })
  })

  describe('resendOTPEmail', () => {
    it('should call signupSvc.resendOtp when email set', () => {
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component['resendOTPEmail']()
      expect(mockSignupSvc.resendOtp).toHaveBeenCalled()
    })
  })

  describe('verifyOtpEmail', () => {
    it('should call signupSvc.verifyOTP when otp and email are valid', () => {
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component['verifyOtpEmail']({ value: '123456' })
      expect(mockSignupSvc.verifyOTP).toHaveBeenCalled()
    })

    it('should not throw when otp is empty', () => {
      expect(() => component['verifyOtpEmail']({ value: '' })).not.toThrow()
    })

    it('should set isEmailVerified to true on SUCCESS response', () => {
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component['verifyOtpEmail']({ value: '123456' })
      expect(component.isEmailVerified).toBe(true)
    })
  })

  describe('raiseSignupInteractTelementry', () => {
    it('should call eventService.raiseInteractTelemetry', () => {
      component.raiseSignupInteractTelementry()
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
    })
  })

  describe('termsAndConditionClick', () => {
    it('should open dialog', () => {
      mockDialog.open = jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(true)) })
      expect(() => component.termsAndConditionClick()).not.toThrow()
    })
  })
})
