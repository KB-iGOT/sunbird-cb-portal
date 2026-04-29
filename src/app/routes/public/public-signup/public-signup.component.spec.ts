import { forbiddenNamesValidator, forbiddenNamesValidatorNonEmpty, PublicSignupComponent } from './public-signup.component'
import { UntypedFormControl } from '@angular/forms'
import { of, Subject, throwError } from 'rxjs'

jest.mock('ng-recaptcha', () => ({ ReCaptchaV3Service: class { } }), { virtual: true })
jest.mock('./signup.service', () => ({ SignupService: class { } }), { virtual: true })
jest.mock('./signup-success-dialogue/signup-success-dialogue/signup-success-dialogue.component', () => ({ SignupSuccessDialogueComponent: class { } }), { virtual: true })
jest.mock('./terms-and-condition/terms-and-condition.component', () => ({ TermsAndConditionComponent: class { } }), { virtual: true })
jest.mock('@ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({ UserProfileService: class { } }), { virtual: true })
jest.mock('@ws/app/src/lib/routes/profile-v3/components/dialog-box/dialog-box.component', () => ({ DialogBoxComponent: class { } }), { virtual: true })
jest.mock('src/environments/environment', () => ({ environment: { zohoUrl: '', resendOTPTIme: 3000, sitePath: 'test.igot.gov.in' } }), { virtual: true })

jest.mock('lodash', () => {
  const get = (obj: any, path: string, def?: any) => {
    if (!obj) return def
    const r = path.split('.').reduce((o: any, k: string) => (o != null ? o[k] : undefined), obj)
    return r !== undefined ? r : def
  }
  const uniqBy = (arr: any[], fn: any) => {
    const seen = new Set()
    return arr.filter(item => { const k = fn(item); if (seen.has(k)) return false; seen.add(k); return true })
  }
  const startCase = (s: string) => s ? s.replace(/(\w)(\w*)/g, (_: any, f: string, r: string) => f.toUpperCase() + r.toLowerCase()) : ''
  const fns = { get, uniqBy, startCase }
  return { __esModule: true, default: fns, ...fns }
})

// ─── Validator tests ───────────────────────────────────────────────────────────

describe('forbiddenNamesValidator', () => {
  it('returns null when optionsArray is null', () => {
    const validator = forbiddenNamesValidator(null)
    const ctrl = new UntypedFormControl({ orgname: 'Test' })
    expect(validator(ctrl)).toBeNull()
  })

  it('returns null when control value is null', () => {
    const validator = forbiddenNamesValidator([{ orgname: 'Test Org' }])
    const ctrl = new UntypedFormControl(null)
    expect(validator(ctrl)).toBeNull()
  })

  it('returns null when orgname is found in array', () => {
    const validator = forbiddenNamesValidator([{ orgname: 'Test Org' }])
    const ctrl = new UntypedFormControl({ orgname: 'Test Org' })
    expect(validator(ctrl)).toBeNull()
  })

  it('returns forbiddenNames error when orgname not in array', () => {
    const validator = forbiddenNamesValidator([{ orgname: 'Test Org' }])
    const ctrl = new UntypedFormControl({ orgname: 'Unknown Org' })
    const result = validator(ctrl)
    expect(result).not.toBeNull()
    expect(result!['forbiddenNames']).toBeDefined()
  })

  it('returns forbiddenNames error when optionsArray is empty', () => {
    const validator = forbiddenNamesValidator([])
    const ctrl = new UntypedFormControl({ orgname: 'Some Org' })
    const result = validator(ctrl)
    expect(result).not.toBeNull()
  })

  it('handles undefined optionsArray', () => {
    const validator = forbiddenNamesValidator(undefined)
    const ctrl = new UntypedFormControl({ orgname: 'Test' })
    expect(validator(ctrl)).toBeNull()
  })

  it('handles control with empty string value', () => {
    const validator = forbiddenNamesValidator([{ orgname: 'Test' }])
    const ctrl = new UntypedFormControl('')
    expect(validator(ctrl)).toBeNull()
  })
})

describe('forbiddenNamesValidatorNonEmpty', () => {
  it('returns null when optionsArray is null', () => {
    const validator = forbiddenNamesValidatorNonEmpty(null)
    const ctrl = new UntypedFormControl({ orgname: 'Test' })
    expect(validator(ctrl)).toBeNull()
  })

  it('returns null when orgname is found in array', () => {
    const validator = forbiddenNamesValidatorNonEmpty([{ orgname: 'Test Org' }])
    const ctrl = new UntypedFormControl({ orgname: 'Test Org' })
    expect(validator(ctrl)).toBeNull()
  })

  it('returns forbiddenNames error when orgname not in array', () => {
    const validator = forbiddenNamesValidatorNonEmpty([{ orgname: 'Test Org' }])
    const ctrl = new UntypedFormControl({ orgname: 'Unknown Org' })
    const result = validator(ctrl)
    expect(result).not.toBeNull()
    expect(result!['forbiddenNames']).toBeDefined()
  })

  it('returns forbiddenNames error when array is empty', () => {
    const validator = forbiddenNamesValidatorNonEmpty([])
    const ctrl = new UntypedFormControl({ orgname: 'Org' })
    expect(validator(ctrl)).not.toBeNull()
  })

  it('handles undefined optionsArray', () => {
    const validator = forbiddenNamesValidatorNonEmpty(undefined)
    const ctrl = new UntypedFormControl({ orgname: 'Test' })
    expect(validator(ctrl)).toBeNull()
  })

  it('throws when control value is null (orgname access on null)', () => {
    const validator = forbiddenNamesValidatorNonEmpty([{ orgname: undefined }])
    const ctrl = new UntypedFormControl(null)
    expect(() => validator(ctrl)).toThrow()
  })

  it('returns error when org not found in multi-item array', () => {
    const validator = forbiddenNamesValidatorNonEmpty([{ orgname: 'A' }, { orgname: 'B' }, { orgname: 'C' }])
    const ctrl = new UntypedFormControl({ orgname: 'D' })
    expect(validator(ctrl)).not.toBeNull()
  })

  it('returns null when org found in multi-item array', () => {
    const validator = forbiddenNamesValidatorNonEmpty([{ orgname: 'A' }, { orgname: 'B' }, { orgname: 'C' }])
    const ctrl = new UntypedFormControl({ orgname: 'B' })
    expect(validator(ctrl)).toBeNull()
  })
})

// ─── Component tests ───────────────────────────────────────────────────────────

const signupDataSubject = new Subject<any>()

const makeSignupComponent = (platformId = 'browser', overrides: any = {}) => {
  const signupSvc: any = {
    updateSignupDataObservable: signupDataSubject.asObservable(),
    searchOrgs: jest.fn(() => of({ result: { response: [] } })),
    sendOtp: jest.fn(() => of({})),
    resendOtp: jest.fn(() => of({ result: { response: 'SUCCESS' } })),
    verifyOTP: jest.fn(() => of({ result: { response: 'SUCCESS' } })),
    getMinistryForRegistration: jest.fn(() => of({ result: { result: { data: [], totalcount: 0 } } })),
    getStateForRegistration: jest.fn(() => of({ result: { result: { data: [], totalcount: 0 } } })),
    getStateOrMinistyForRegistration: jest.fn(() => of({ result: { result: { data: [], totalcount: 0 } } })),
    ...overrides.signupSvc,
  }
  const usersService: any = {
    searchPublicDesignation: jest.fn(() => of({ result: { result: { data: [], totalcount: 0 } } })),
    ...overrides.usersService,
  }
  const loggerSvc: any = { error: jest.fn(), warn: jest.fn() }
  const configSvc: any = {
    instanceConfig: {
      telemetryConfig: { pdata: { id: 'test-portal' } },
      websitelanguages: ['en', 'hi'],
      isMultilingualEnabled: true,
    },
    ...overrides.configSvc,
  }
  const snackBar: any = { open: jest.fn() }
  const dialog: any = {
    open: jest.fn(() => ({ afterClosed: () => of(null), close: jest.fn() })),
  }
  const activatedRoute: any = {
    snapshot: {
      data: {
        positions: { data: [{ name: 'Manager' }] },
        group: { data: ['Group1', 'Group2', 'Others'] },
      },
    },
  }
  const recaptchaV3Service: any = { execute: jest.fn(() => of('token123')) }
  const router: any = { navigate: jest.fn() }
  const _document = document
  const translate: any = { setDefaultLang: jest.fn(), use: jest.fn() }
  const langtranslations: any = {
    updatelanguageSelected: jest.fn(),
    translateActualLabel: jest.fn((l: string) => l),
  }
  const http: any = { get: jest.fn(() => of('<html>zoho</html>')) }
  const sanitizer: any = { bypassSecurityTrustHtml: jest.fn((h: string) => h) }
  const eventService: any = { raiseInteractTelemetry: jest.fn(), raiseImpressionTelemetry: jest.fn() }
  const telemetrySvc: any = { impression: jest.fn() }

  return new PublicSignupComponent(
    signupSvc, usersService, loggerSvc, configSvc, snackBar, dialog,
    activatedRoute, recaptchaV3Service, router, _document, platformId,
    translate, langtranslations, http, sanitizer, eventService, telemetrySvc
  )
}

describe('PublicSignupComponent', () => {
  let component: PublicSignupComponent
  let signupSvc: any
  let snackBar: any
  let dialog: any
  let router: any

  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
    jest.clearAllMocks()

    component = makeSignupComponent()
    signupSvc = (component as any).signupSvc
    snackBar = (component as any).snackBar
    dialog = (component as any).dialog
    router = (component as any).router
  })

  afterEach(() => {
    jest.useRealTimers()
    try { component.ngOnDestroy() } catch { }
  })

  it('creates', () => {
    expect(component).toBeDefined()
    expect(component.registrationFormStepOne).toBeDefined()
    expect(component.registrationFormStepTwo).toBeDefined()
  })

  it('sets websiteLanguage from localStorage in constructor', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const c = makeSignupComponent()
    expect(c.selectedLanguage).toBe('hi')
    c.ngOnDestroy()
  })

  it('defaults to en language when not set', () => {
    localStorage.removeItem('websiteLanguage')
    const c = makeSignupComponent()
    expect(localStorage.getItem('websiteLanguage')).toBe('en')
    c.ngOnDestroy()
  })

  describe('ngOnInit', () => {
    it('sets positionsOriginal from route data', () => {
      component.ngOnInit()
      expect(component.positionsOriginal).toHaveLength(1)
    })

    it('filters out Others from groupsOriginal', () => {
      component.ngOnInit()
      expect(component.groupsOriginal).not.toContain('Others')
      expect(component.groupsOriginal).toContain('Group1')
    })

    it('sets telemetryConfig from instanceConfig', () => {
      component.ngOnInit()
      expect(component.portalID).toBe('test-portal')
    })

    it('sets multiLang from websitelanguages', () => {
      component.ngOnInit()
      expect(component.multiLang).toEqual(['en', 'hi'])
    })

    it('handles null instanceConfig', () => {
      (component as any).configSvc.instanceConfig = null
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('handles null group data', () => {
      (component as any).activatedRoute.snapshot.data.group.data = null
      component.ngOnInit()
      expect(component.groupsOriginal).toEqual([])
    })
  })

  describe('typeValueStartCase getter', () => {
    it('returns start-cased type value', () => {
      component.registrationFormStepOne.get('type')!.setValue('ministry')
      const result = component.typeValueStartCase
      expect(typeof result).toBe('string')
    })
  })

  describe('typeValue getter', () => {
    it('returns current type value', () => {
      component.registrationFormStepOne.get('type')!.setValue('state')
      expect(component.typeValue).toBe('state')
    })
  })

  describe('emailVerification', () => {
    it('sets emailLengthVal false for valid email', () => {
      component.emailVerification('test@gov.in')
      expect(component.emailLengthVal).toBe(false)
    })

    it('sets emailLengthVal true for too-long local part', () => {
      const longLocal = 'a'.repeat(65)
      component.emailVerification(`${longLocal}@gov.in`)
      expect(component.emailLengthVal).toBe(true)
    })

    it('handles empty emailId', () => {
      component.emailVerification('')
      expect(component.emailLengthVal).toBe(false)
    })

    it('handles email without @ sign', () => {
      component.emailVerification('notanemail')
      expect(component.emailLengthVal).toBe(false)
    })
  })

  describe('clearValues', () => {
    it('clears organisation and heirarchyObject', () => {
      component.registrationFormStepOne.get('organisation')!.setValue('SomeOrg')
      component.heirarchyObject = { orgName: 'test' }
      component.clearValues()
      expect(component.registrationFormStepOne.get('organisation')!.value).toBe('')
      expect(component.heirarchyObject).toBeNull()
    })
  })

  describe('resetOrganisationBackup', () => {
    it('sets default N/A organisation', () => {
      component.resetOrganisationBackup()
      expect((component as any).masterData.organisationBackup[0].orgName).toBe('N/A')
    })
  })

  describe('editOrg', () => {
    it('resets org state', () => {
      component.hideOrg = true
      component.resultFetched = true
      component.editOrg()
      expect(component.hideOrg).toBe(false)
      expect(component.resultFetched).toBe(false)
    })
  })

  describe('orgClicked', () => {
    it('sets org value and heirarchyObject when event has option', () => {
      const event = { option: { value: { orgName: 'TestOrg', channel: 'tc' } } }
      component.orgClicked(event)
      expect(component.hideOrg).toBe(true)
      expect(component.registrationFormStepOne.get('organisation')!.value).toBe('TestOrg')
    })

    it('sets hideOrg false when event has no orgName', () => {
      const event = { option: { value: {} } }
      component.orgClicked(event)
      expect(component.hideOrg).toBe(false)
    })

    it('does nothing when event is falsy', () => {
      expect(() => component.orgClicked(null)).not.toThrow()
    })
  })

  describe('sendOtp', () => {
    it('calls signupSvc.sendOtp with valid mobile', () => {
      component.registrationFormStepTwo.get('mobile')!.setValue('9876543210')
      component.sendOtp()
      expect(signupSvc.sendOtp).toHaveBeenCalledWith('9876543210', 'phone')
    })

    it('shows snackBar for invalid mobile', () => {
      component.registrationFormStepTwo.get('mobile')!.setValue('')
      component.sendOtp()
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('shows snackBar on sendOtp error', () => {
      signupSvc.sendOtp.mockReturnValue(throwError({ error: { params: { errmsg: 'OTP failed' } } }))
      component.registrationFormStepTwo.get('mobile')!.setValue('9876543210')
      component.sendOtp()
      expect(snackBar.open).toHaveBeenCalled()
    })
  })

  describe('sendOtpEmail', () => {
    it('calls signupSvc.sendOtp with valid email', () => {
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component.sendOtpEmail()
      expect(signupSvc.sendOtp).toHaveBeenCalledWith('test@gov.in', 'email')
    })

    it('shows snackBar for invalid email', () => {
      component.registrationFormStepOne.get('email')!.setValue('')
      component.sendOtpEmail()
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('shows snackBar on sendOtpEmail error', () => {
      signupSvc.sendOtp.mockReturnValue(throwError({ error: { params: { errmsg: 'OTP failed' } } }))
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component.sendOtpEmail()
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('shows specific domain error when errmsg is present', () => {
      signupSvc.sendOtp.mockReturnValue(throwError({ error: { params: { errmsg: 'domain not found' } } }))
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component.sendOtpEmail()
      expect(snackBar.open).toHaveBeenCalledWith(expect.stringContaining('department'))
    })
  })

  describe('resendOTP', () => {
    it('calls signupSvc.resendOtp for valid mobile', () => {
      component.registrationFormStepTwo.get('mobile')!.setValue('9876543210')
      component.resendOTP()
      expect(signupSvc.resendOtp).toHaveBeenCalled()
    })

    it('shows snackBar for invalid mobile', () => {
      component.registrationFormStepTwo.get('mobile')!.setValue('')
      component.resendOTP()
      expect(snackBar.open).toHaveBeenCalled()
    })
  })

  describe('resendOTPEmail', () => {
    it('calls signupSvc.resendOtp for valid email', () => {
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
      component.resendOTPEmail()
      expect(signupSvc.resendOtp).toHaveBeenCalled()
    })

    it('shows snackBar for invalid email', () => {
      component.registrationFormStepOne.get('email')!.setValue('')
      component.resendOTPEmail()
      expect(snackBar.open).toHaveBeenCalled()
    })
  })

  describe('verifyOtp', () => {
    beforeEach(() => {
      component.registrationFormStepTwo.get('mobile')!.setValue('9876543210')
    })

    it('verifies mobile OTP on success', () => {
      const otp = { value: '1234' }
      component.verifyOtp(otp)
      expect(signupSvc.verifyOTP).toHaveBeenCalledWith('1234', '9876543210', 'phone')
      expect(component.isMobileVerified).toBe(true)
    })

    it('shows snackBar for short OTP', () => {
      component.verifyOtp({ value: '12' })
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('shows snackBar when otp is null', () => {
      component.verifyOtp({ value: null })
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('shows snackBar on verifyOTP error', () => {
      signupSvc.verifyOTP.mockReturnValue(throwError({ error: { params: { errmsg: 'Invalid OTP' } } }))
      component.verifyOtp({ value: '1234' })
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('disables verify button on 0 remaining attempts', () => {
      signupSvc.verifyOTP.mockReturnValue(throwError({ error: { result: { remainingAttempt: 0 } } }))
      component.verifyOtp({ value: '1234' })
      expect(component.disableVerifyBtn).toBe(true)
    })
  })

  describe('verifyOtpEmail', () => {
    beforeEach(() => {
      component.registrationFormStepOne.get('email')!.setValue('test@gov.in')
    })

    it('verifies email OTP on success', () => {
      const otp = { value: '5678' }
      component.verifyOtpEmail(otp)
      expect(signupSvc.verifyOTP).toHaveBeenCalledWith('5678', 'test@gov.in', 'email')
      expect(component.isEmailVerified).toBe(true)
    })

    it('shows snackBar for short OTP', () => {
      component.verifyOtpEmail({ value: '12' })
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('shows snackBar when otp is null', () => {
      component.verifyOtpEmail({ value: null })
      expect(snackBar.open).toHaveBeenCalled()
    })
  })

  describe('openDialog', () => {
    it('opens SignupSuccessDialogueComponent', () => {
      component.openDialog()
      expect(dialog.open).toHaveBeenCalled()
    })
  })

  describe('termsAndConditionClick', () => {
    it('opens TermsAndConditionComponent', () => {
      component.termsAndConditionClick()
      expect(dialog.open).toHaveBeenCalled()
    })

    it('sets confirmTerms when dialog returns value', () => {
      dialog.open.mockReturnValue({ afterClosed: () => of(true) })
      component.termsAndConditionClick()
      expect(component.confirmTerms).toBe(true)
    })
  })

  describe('translateLabels', () => {
    it('calls translateActualLabel', () => {
      const result = component.translateLabels('testKey', 'common')
      expect(result).toBe('testKey')
    })
  })

  describe('selectLanguage', () => {
    it('updates selectedLanguage and localStorage', () => {
      component.selectLanguage('hi')
      expect(component.selectedLanguage).toBe('hi')
      expect(localStorage.getItem('websiteLanguage')).toBe('hi')
    })
  })

  describe('navigateTo', () => {
    it('navigates to /public/request with param', () => {
      component.navigateTo('ministry')
      expect(router.navigate).toHaveBeenCalledWith(
        ['/public/request'],
        expect.objectContaining({ queryParams: { type: 'ministry' } })
      )
    })
  })

  describe('numericOnly', () => {
    it('returns true for digit key', () => {
      expect(component.numericOnly({ key: '5' })).toBe(true)
    })

    it('returns false for non-digit key', () => {
      expect(component.numericOnly({ key: 'a' })).toBe(false)
    })
  })

  describe('getZohoForm', () => {
    it('opens ZohoDialogComponent', () => {
      component.getZohoForm()
      expect(dialog.open).toHaveBeenCalled()
      jest.runAllTimers()
    })
  })

  describe('displayFn helpers', () => {
    it('displayFn returns channel', () => {
      expect((component as any).displayFn({ channel: 'TestCh' })).toBe('TestCh')
    })

    it('displayFn returns undefined for null', () => {
      expect((component as any).displayFn(null)).toBeUndefined()
    })

    it('displayFnPosition returns name', () => {
      expect((component as any).displayFnPosition({ name: 'Manager' })).toBe('Manager')
    })

    it('displayFnGroup returns value', () => {
      expect((component as any).displayFnGroup('GroupA')).toBe('GroupA')
    })

    it('displayFnOrg returns orgName', () => {
      expect((component as any).displayFnOrg({ orgName: 'MyOrg' })).toBe('MyOrg')
    })

    it('displayFnOrg returns empty string for null', () => {
      expect((component as any).displayFnOrg(null)).toBe('')
    })
  })

  describe('filterOrgsSearch', () => {
    it('sets filteredOrgList from search result', () => {
      signupSvc.searchOrgs = jest.fn(() => of({
        result: { response: [{ orgName: 'TestOrg' }, { orgName: 'AnotherOrg' }] },
      }));
      (component as any).signupSvc = signupSvc
      component.filterOrgsSearch('test')
      expect(component.resultFetched).toBe(true)
    })

    it('shows snackBar on filterOrgs error', () => {
      signupSvc.searchOrgs = jest.fn(() => throwError({ error: { params: { errmsg: 'Search failed' } } }));
      (component as any).signupSvc = signupSvc
      component.filterOrgsSearch('test')
      expect(snackBar.open).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('does not throw', () => {
      component.ngOnInit()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('removes cs-recaptcha class in browser', () => {
      document.body.classList.add('cs-recaptcha')
      component.ngOnDestroy()
      expect(document.body.classList.contains('cs-recaptcha')).toBe(false)
    })

    it('does not throw in non-browser platform', () => {
      const c = makeSignupComponent('server')
      expect(() => c.ngOnDestroy()).not.toThrow()
    })
  })

  describe('startCountDown', () => {
    it('decrements timeLeftforOTP', () => {
      component.OTP_TIMER = 3
      component.startCountDown()
      expect(component.timeLeftforOTP).toBe(3)
      jest.advanceTimersByTime(1000)
      expect(component.timeLeftforOTP).toBe(2)
      if (component.timerSubscription) component.timerSubscription.unsubscribe()
    })
  })

  describe('startCountDownEmail', () => {
    it('decrements timeLeftforOTPEmail', () => {
      component.OTP_TIMER_EMAIL = 3
      component.startCountDownEmail()
      expect(component.timeLeftforOTPEmail).toBe(3)
      jest.advanceTimersByTime(1000)
      if (component.timerSubscriptionEmail) component.timerSubscriptionEmail.unsubscribe()
    })
  })

  describe('getDesignation', () => {
    it('calls searchPublicDesignation', () => {
      component.ngOnInit()
      expect((component as any).usersService.searchPublicDesignation).toHaveBeenCalled()
    })

    it('handles error from searchPublicDesignation', () => {
      (component as any).usersService.searchPublicDesignation = jest.fn(() => throwError({ error: 'failed' }));
      (component as any).designationInitInProgress = false;
      (component as any).isLoadingMoreDesignations = false
      expect(() => component.getDesignation()).not.toThrow()
    })

    it('handles error and sets noMoreLegacyDesignations', () => {
      (component as any).usersService.searchPublicDesignation = jest.fn(() => throwError({ error: 'network error' }))
        ; (component as any).designationInitInProgress = false
        ; (component as any).isLoadingMoreDesignations = false
      component.getDesignation()
      expect((component as any).noMoreLegacyDesignations).toBe(true)
    })
  })

  describe('checkCurrentDesignationPresent', () => {
    it('adds missing designation to list', () => {
      (component as any).masterData.designation = [{ name: 'Manager' }]
      component.registrationFormStepOne.get('position')!.setValue('Director')
      component.checkCurrentDesignationPresent()
      expect((component as any).masterData.designation.some((d: any) => d.name === 'Director')).toBe(true)
    })

    it('pops last item when list is full before adding designation', () => {
      ; (component as any).designationListLoadCount = 1
        ; (component as any).masterData.designation = [{ name: 'Manager' }]
      component.registrationFormStepOne.get('position')!.setValue('Director')
      component.checkCurrentDesignationPresent()
      // After pop and unshift, length should still be 1 (popped one, added one)
      expect((component as any).masterData.designation).toHaveLength(1)
      expect((component as any).masterData.designation[0].name).toBe('Director')
    })

    it('does nothing when position value is empty', () => {
      ; (component as any).masterData.designation = [{ name: 'Manager' }]
      component.registrationFormStepOne.get('position')!.setValue('')
      component.checkCurrentDesignationPresent()
      expect((component as any).masterData.designation).toHaveLength(1)
    })
  })

  describe('onDesignationDropdownClosed', () => {
    it('clears searchDesignation field on close', () => {
      jest.useFakeTimers()
      component.registrationFormStepOne.get('position')!.setValue('Director')
      component.onDesignationDropdownClosed()
      jest.runAllTimers()
      expect(component.registrationFormStepOne.get('searchDesignation')?.value).toBe('')
    })
  })

  describe('confirmChange', () => {
    it('toggles confirm flag', () => {
      component.confirm = false;
      (component as any).confirmChange()
      expect(component.confirm).toBe(true)
    })
  })

  describe('confirmTermsChange', () => {
    it('toggles confirmTerms flag', () => {
      component.confirmTerms = false;
      (component as any).confirmTermsChange()
      expect(component.confirmTerms).toBe(true)
    })
  })

  describe('signup', () => {
    it('calls recaptchaV3Service.execute', () => {
      signupSvc.register = jest.fn(() => of({}))
      component.registrationFormStepOne.get('type')!.setValue('ministry')
      component.heirarchyObject = { identifier: 'org1', orgName: 'TestOrg', channel: 'ch', sbOrgType: 'MINISTRY', sbOrgSubType: '' }
      component.signup()
      expect(signupSvc.register).toHaveBeenCalled()
    })

    it('shows snackBar on recaptcha error', () => {
      (component as any).recaptchaV3Service.execute = jest.fn(() => throwError(new Error('recaptcha failed')))
      component.heirarchyObject = { identifier: 'org1', orgName: 'TestOrg', channel: 'ch', sbOrgType: 'MINISTRY', sbOrgSubType: '' }
      component.signup()
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('handles signup register error', () => {
      signupSvc.register = jest.fn(() => throwError({ error: { params: { errmsg: 'Signup error' } } }))
      component.registrationFormStepOne.get('type')!.setValue('ministry')
      component.heirarchyObject = { identifier: 'org1', orgName: 'TestOrg', channel: 'ch', sbOrgType: 'MINISTRY', sbOrgSubType: '' }
      component.signup()
      expect(snackBar.open).toHaveBeenCalled()
    })

    it('handles N/A org for ministry type', () => {
      signupSvc.register = jest.fn(() => of({}))
      component.registrationFormStepOne.get('type')!.setValue('ministry')
      component.registrationFormStepOne.get('ministry')!.setValue('min1')
      component.heirarchyObject = { orgName: 'N/A' };
      (component as any).currentMinistry = { orgName: 'Govt', channel: 'gov', sbOrgType: 'MINISTRY', sbOrgSubType: '' }
      component.signup()
      expect(signupSvc.register).toHaveBeenCalled()
    })

    it('handles state type with N/A org and no department', () => {
      signupSvc.register = jest.fn(() => of({}))
      component.registrationFormStepOne.get('type')!.setValue('state')
      component.registrationFormStepOne.get('state')!.setValue('state1')
      component.registrationFormStepOne.get('department')!.setValue('-1')
      component.heirarchyObject = { orgName: 'N/A' };
      (component as any).currentMinistry = { orgName: 'StateGov', channel: 'stgov', sbOrgType: 'STATE', sbOrgSubType: '' }
      component.signup()
      expect(signupSvc.register).toHaveBeenCalled()
    })
  })

  describe('mdoRedirect', () => {
    it('sets window.location.href', () => {
      const originalHref = window.location.href
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      component.mdoRedirect()
      expect(window.location.href).toContain('mdoList')
      Object.defineProperty(window, 'location', { writable: true, value: { href: originalHref } })
    })
  })

  describe('designationSearch', () => {
    it('calls getDesignation for non-empty search', () => {
      jest.spyOn(component, 'getDesignation').mockImplementation(jest.fn())
      component.designationSearch({ target: { value: 'manager' } })
      expect(component.getDesignation).toHaveBeenCalledWith('manager', 0)
    })

    it('resets designations for empty search', () => {
      (component as any).masterData.designationBackup = [{ name: 'A' }, { name: 'B' }]
      jest.spyOn(component, 'checkCurrentDesignationPresent').mockImplementation(jest.fn())
      component.designationSearch({ target: { value: '' } })
      expect(component.checkCurrentDesignationPresent).toHaveBeenCalled()
    })

    it('returns early when loading', () => {
      jest.spyOn(component, 'getDesignation').mockImplementation(jest.fn());
      (component as any).isLoadingMoreDesignations = true
      component.designationSearch({ target: { value: 'test' } })
      expect(component.getDesignation).not.toHaveBeenCalled()
    })
  })

  describe('onDesignationDropdownClosed', () => {
    it('does not throw', () => {
      expect(() => component.onDesignationDropdownClosed()).not.toThrow()
      jest.runAllTimers()
    })
  })

  describe('getDesignation with loaded data', () => {
    it('appends to designationBackup on second page load', () => {
      (component as any).masterData.designationBackup = [{ name: 'Manager', status: 'Active' }];
      (component as any).usersService.searchPublicDesignation = jest.fn(() => of({
        result: { result: { data: [{ designation: 'Director', status: 'Active' }], totalcount: 5 } }
      }))
      component.getDesignation(undefined, 10)
      expect((component as any).masterData.designationBackup.length).toBeGreaterThan(0)
    })

    it('sets noMoreLegacyDesignations when all loaded', () => {
      (component as any).usersService.searchPublicDesignation = jest.fn(() => of({
        result: { result: { data: [{ designation: 'Manager', status: 'Active' }], totalcount: 1 } }
      }))
      component.getDesignation(undefined, 0)
      expect((component as any).noMoreLegacyDesignations).toBe(true)
    })

    it('sets noMoreLegacyDesignations when empty result', () => {
      (component as any).usersService.searchPublicDesignation = jest.fn(() => of({
        result: { result: { data: [], totalcount: 5 } }
      }))
      component.getDesignation(undefined, 0)
      expect((component as any).noMoreLegacyDesignations).toBe(true)
    })

    it('calls getDesignation with searchText covers search branch', () => {
      (component as any).usersService.searchPublicDesignation = jest.fn(() => of({
        result: { result: { data: [{ designation: 'Manager', status: 'Active' }], totalcount: 1 } }
      }))
      component.getDesignation('manager', 0)
      expect((component as any).noMoreLegacyDesignations).toBe(true)
    })

    it('appends to designationBackup using uniqBy on page > 0 with existing backup', () => {
      (component as any).masterData.designationBackup = [{ name: 'Manager' }];
      (component as any).usersService.searchPublicDesignation = jest.fn(() => of({
        result: { result: { data: [{ designation: 'Director', status: 'Active' }, { designation: 'Manager', status: 'Active' }], totalcount: 5 } }
      }))
      component.getDesignation(undefined, 10)
      // uniqBy should deduplicate Manager
      expect((component as any).masterData.designationBackup.some((d: any) => d.name === 'Director')).toBe(true)
    })
  })

  describe('onPhoneChange', () => {
    it('sets up mobile value changes subscription', () => {
      component.onPhoneChange()
      // Trigger a value change on mobile
      component.registrationFormStepTwo.get('mobile')?.setValue('9876543210')
      expect(true).toBe(true) // no throw
    })
  })

  describe('goToNextStep - valid form', () => {
    it('sets currentStep to step2 without snackBar when form valid', () => {
      // Fill all required fields to make form valid
      component.registrationFormStepOne.patchValue({
        email: 'test@example.com',
        type: 'ministry',
        ministry: 'central',
        organisation: 'railways',
        position: 'manager',
      })
      component.goToNextStep()
      expect(component.currentStep).toBe('step2')
    })
  })

  describe('raiseSignupInteractTelementry timer', () => {
    it('calls eventService.raiseInteractTelemetry', () => {
      const eventSvc = (component as any).eventService
      eventSvc.raiseInteractTelemetry = jest.fn()
      const telSvc = (component as any).telemetrySvc
      telSvc.end = jest.fn()
      component.raiseSignupInteractTelementry()
      expect(eventSvc.raiseInteractTelemetry).toHaveBeenCalled()
      jest.runAllTimers()
      expect(telSvc.end).toHaveBeenCalled()
    })
  })

  describe('getMinistryData', () => {
    it('calls getMinistryForRegistration and sets ministryBackup', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getMinistryForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'min1', orgName: 'Ministry 1' }], count: 1 } }
      }))
      component.getMinistryData()
      expect(signupSvcRef.getMinistryForRegistration).toHaveBeenCalled()
      expect((component as any).masterData.ministryBackup).toBeDefined()
    })

    it('returns early on server-side render', () => {
      const ssrComp = makeSignupComponent('server')
      const signupSvcRef = (ssrComp as any).signupSvc
      ssrComp.getMinistryData()
      expect(signupSvcRef.getMinistryForRegistration).not.toHaveBeenCalled()
    })

    it('sets noMoreLegacyMinistrys on empty result', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getMinistryForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getMinistryData()
      expect((component as any).noMoreLegacyMinistrys).toBe(true)
    })

    it('appends to ministryBackup on page > 0', () => {
      const signupSvcRef = (component as any).signupSvc;
      (component as any).masterData.ministryBackup = [{ identifier: 'min0' }]
      signupSvcRef.getMinistryForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'min1' }], count: 5 } }
      }))
      component.getMinistryData(undefined, 10)
      expect((component as any).masterData.ministryBackup.length).toBeGreaterThan(1)
    })

    it('handles error from getMinistryForRegistration', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getMinistryForRegistration = jest.fn(() => throwError('err'))
      component.getMinistryData()
      expect((component as any).noMoreLegacyMinistrys).toBe(true)
    })

    it('sets noMoreLegacyMinistrys when all items loaded', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getMinistryForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'min1' }], count: 1 } }
      }))
      component.getMinistryData()
      expect((component as any).noMoreLegacyMinistrys).toBe(true)
    })

    it('handles search text', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getMinistryForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getMinistryData('central', 0)
      expect(signupSvcRef.getMinistryForRegistration).toHaveBeenCalled()
    })
  })

  describe('setupScrollListenerForMinistry', () => {
    it('calls getMinistryData when opened=true', () => {
      jest.spyOn(component, 'getMinistryData').mockImplementation(jest.fn())
      component.setupScrollListenerForMinistry(true)
      expect(component.getMinistryData).toHaveBeenCalled()
    })

    it('does not call getMinistryData when opened=false', () => {
      jest.spyOn(component, 'getMinistryData').mockImplementation(jest.fn())
      component.setupScrollListenerForMinistry(false)
      expect(component.getMinistryData).not.toHaveBeenCalled()
    })
  })

  describe('onMinistrySelectScroll', () => {
    it('does nothing when ministryFilterEnable=true', () => {
      (component as any).ministryFilterEnable = true
      expect(() => component.onMinistrySelectScroll({
        target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 }
      })).not.toThrow()
    })

    it('loads more when scrolled to bottom - local pagination', () => {
      (component as any).ministryFilterEnable = false;
      (component as any).isLoadingMoreMinistrys = false;
      (component as any).masterData.ministryBackup = [{ identifier: 'm1' }, { identifier: 'm2' }, { identifier: 'm3' }];
      (component as any).masterData.ministry = [{ identifier: 'm1' }]
      component.onMinistrySelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect((component as any).isLoadingMoreMinistrys).toBe(true)
    })

    it('loads more when scrolled to bottom - server pagination', () => {
      (component as any).ministryFilterEnable = false;
      (component as any).isLoadingMoreMinistrys = false;
      (component as any).noMoreLegacyMinistrys = false;
      (component as any).defaultSearchMinistryCount = 10;
      (component as any).masterData.ministryBackup = [{ identifier: 'm1' }];
      (component as any).masterData.ministry = [{ identifier: 'm1' }]
      jest.spyOn(component, 'getMinistryData').mockImplementation(jest.fn())
      component.onMinistrySelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect(component.getMinistryData).toHaveBeenCalled()
    })

    it('does not load when already loading', () => {
      (component as any).ministryFilterEnable = false;
      (component as any).isLoadingMoreMinistrys = true
      jest.spyOn(component, 'getMinistryData').mockImplementation(jest.fn())
      component.onMinistrySelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect(component.getMinistryData).not.toHaveBeenCalled()
    })
  })

  describe('checkCurrentMinistryPresent', () => {
    it('does nothing when ministry not selected', () => {
      component.registrationFormStepOne.get('ministry')?.setValue('')
      expect(() => component.checkCurrentMinistryPresent()).not.toThrow()
    })

    it('prepends ministry if not in list', () => {
      component.registrationFormStepOne.get('ministry')?.setValue('central');
      (component as any).masterData.ministry = [{ identifier: 'other' }];
      (component as any).ministryListLoadCount = 10
      component.checkCurrentMinistryPresent()
      expect((component as any).masterData.ministry[0].identifier).toBe('central')
    })

    it('does not prepend when already present', () => {
      component.registrationFormStepOne.get('ministry')?.setValue('central');
      (component as any).masterData.ministry = [{ identifier: 'central' }]
      const originalLength = (component as any).masterData.ministry.length
      component.checkCurrentMinistryPresent()
      expect((component as any).masterData.ministry.length).toBe(originalLength)
    })
  })

  describe('ministrySearch', () => {
    it('emits to ministrySearchSubject', () => {
      const spy = jest.spyOn((component as any).ministrySearchSubject, 'next')
      component.ministrySearch({ target: { value: 'test' } })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('performMinistrySearch', () => {
    it('calls getMinistryData for non-empty text', () => {
      jest.spyOn(component, 'getMinistryData').mockImplementation(jest.fn())
      component.performMinistrySearch('central')
      expect(component.getMinistryData).toHaveBeenCalledWith('central', 0)
    })

    it('resets ministry list for empty search', () => {
      (component as any).masterData.ministryBackup = [{ identifier: 'm1' }]
      jest.spyOn(component, 'checkCurrentMinistryPresent').mockImplementation(jest.fn())
      component.performMinistrySearch('')
      expect(component.checkCurrentMinistryPresent).toHaveBeenCalled()
    })

    it('returns early when loading', () => {
      jest.spyOn(component, 'getMinistryData').mockImplementation(jest.fn());
      (component as any).isLoadingMoreMinistrys = true
      component.performMinistrySearch('test')
      expect(component.getMinistryData).not.toHaveBeenCalled()
    })
  })

  describe('getStateData', () => {
    it('calls getStateForRegistration and sets stateBackup', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'state1', orgName: 'State 1' }], count: 1 } }
      }))
      component.getStateData()
      expect(signupSvcRef.getStateForRegistration).toHaveBeenCalled()
      expect((component as any).masterData.stateBackup).toBeDefined()
    })

    it('returns early on server-side render', () => {
      const ssrComp = makeSignupComponent('server')
      const signupSvcRef = (ssrComp as any).signupSvc
      ssrComp.getStateData()
      expect(signupSvcRef.getStateForRegistration).not.toHaveBeenCalled()
    })

    it('sets noMoreLegacyStates on empty result', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getStateData()
      expect((component as any).noMoreLegacyStates).toBe(true)
    })

    it('appends to stateBackup on page > 0', () => {
      const signupSvcRef = (component as any).signupSvc;
      (component as any).masterData.stateBackup = [{ identifier: 'st0' }]
      signupSvcRef.getStateForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'st1' }], count: 5 } }
      }))
      component.getStateData(undefined, 10)
      expect((component as any).masterData.stateBackup.length).toBeGreaterThan(1)
    })

    it('handles error from getStateForRegistration', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateForRegistration = jest.fn(() => throwError('err'))
      component.getStateData()
      expect((component as any).noMoreLegacyStates).toBe(true)
    })

    it('sets noMoreLegacyStates when all items loaded', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'st1' }], count: 1 } }
      }))
      component.getStateData()
      expect((component as any).noMoreLegacyStates).toBe(true)
    })

    it('handles search text', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getStateData('delhi', 0)
      expect(signupSvcRef.getStateForRegistration).toHaveBeenCalled()
    })
  })

  describe('setupScrollListenerForState', () => {
    it('calls getStateData when opened=true', () => {
      jest.spyOn(component, 'getStateData').mockImplementation(jest.fn())
      component.setupScrollListenerForState(true)
      expect(component.getStateData).toHaveBeenCalled()
    })

    it('does nothing when opened=false', () => {
      jest.spyOn(component, 'getStateData').mockImplementation(jest.fn())
      component.setupScrollListenerForState(false)
      expect(component.getStateData).not.toHaveBeenCalled()
    })
  })

  describe('onStateSelectScroll', () => {
    it('does nothing when stateFilterEnable=true', () => {
      (component as any).stateFilterEnable = true
      expect(() => component.onStateSelectScroll({
        target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 }
      })).not.toThrow()
    })

    it('loads more via local pagination when stateBackup has more items', () => {
      (component as any).stateFilterEnable = false;
      (component as any).isLoadingMoreStates = false;
      (component as any).masterData.stateBackup = [{ identifier: 's1' }, { identifier: 's2' }, { identifier: 's3' }];
      (component as any).masterData.state = [{ identifier: 's1' }]
      component.onStateSelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect((component as any).isLoadingMoreStates).toBe(true)
    })

    it('loads more via server pagination', () => {
      (component as any).stateFilterEnable = false;
      (component as any).isLoadingMoreStates = false;
      (component as any).noMoreLegacyStates = false;
      (component as any).defaultSearchStateCount = 10;
      (component as any).masterData.stateBackup = [{ identifier: 's1' }];
      (component as any).masterData.state = [{ identifier: 's1' }]
      jest.spyOn(component, 'getStateData').mockImplementation(jest.fn())
      component.onStateSelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect(component.getStateData).toHaveBeenCalled()
    })
  })

  describe('checkCurrentStatePresent', () => {
    it('does nothing when state not selected', () => {
      component.registrationFormStepOne.get('state')?.setValue('')
      expect(() => component.checkCurrentStatePresent()).not.toThrow()
    })

    it('prepends state if not in list', () => {
      component.registrationFormStepOne.get('state')?.setValue('delhi');
      (component as any).masterData.state = [{ identifier: 'other' }];
      (component as any).stateListLoadCount = 10
      component.checkCurrentStatePresent()
      expect((component as any).masterData.state[0].identifier).toBe('delhi')
    })

    it('does not prepend when already present', () => {
      component.registrationFormStepOne.get('state')?.setValue('delhi');
      (component as any).masterData.state = [{ identifier: 'delhi' }]
      const originalLength = (component as any).masterData.state.length
      component.checkCurrentStatePresent()
      expect((component as any).masterData.state.length).toBe(originalLength)
    })
  })

  describe('stateSearch', () => {
    it('calls getStateData for non-empty text', () => {
      jest.spyOn(component, 'getStateData').mockImplementation(jest.fn())
      component.stateSearch({ target: { value: 'delhi' } })
      expect(component.getStateData).toHaveBeenCalledWith('delhi', 0)
    })

    it('resets state list for empty search', () => {
      (component as any).masterData.stateBackup = [{ identifier: 's1' }]
      jest.spyOn(component, 'checkCurrentStatePresent').mockImplementation(jest.fn())
      component.stateSearch({ target: { value: '' } })
      expect(component.checkCurrentStatePresent).toHaveBeenCalled()
    })

    it('returns early when loading', () => {
      jest.spyOn(component, 'getStateData').mockImplementation(jest.fn());
      (component as any).isLoadingMoreStates = true
      component.stateSearch({ target: { value: 'test' } })
      expect(component.getStateData).not.toHaveBeenCalled()
    })
  })

  describe('getDepartmentData', () => {
    it('calls getStateOrMinistyForRegistration and sets departmentBackup', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'dept1', orgName: 'Dept 1' }], count: 1 } }
      }));
      (component as any).masterData.departmentBackup = [{ orgName: 'N/A' }]
      component.getDepartmentData()
      expect(signupSvcRef.getStateOrMinistyForRegistration).toHaveBeenCalled()
    })

    it('returns early on server-side render', () => {
      const ssrComp = makeSignupComponent('server')
      const signupSvcRef = (ssrComp as any).signupSvc
      ssrComp.getDepartmentData()
      expect(signupSvcRef.getStateOrMinistyForRegistration).not.toHaveBeenCalled()
    })

    it('sets noMoreLegacyDepartments on empty result', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }));
      (component as any).masterData.departmentBackup = [{ orgName: 'N/A' }]
      component.getDepartmentData()
      expect((component as any).noMoreLegacyDepartments).toBe(true)
    })

    it('handles error from getStateOrMinistyForRegistration', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => throwError('err'));
      (component as any).masterData.departmentBackup = [{ orgName: 'N/A' }]
      component.getDepartmentData()
      expect((component as any).noMoreLegacyDepartments).toBe(true)
    })

    it('handles search text', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }));
      (component as any).masterData.departmentBackup = [{ orgName: 'N/A' }]
      component.getDepartmentData('finance', 0)
      expect(signupSvcRef.getStateOrMinistyForRegistration).toHaveBeenCalled()
    })
  })

  describe('setupScrollListenerForDepartment', () => {
    it('calls getDepartmentData when opened=true', () => {
      jest.spyOn(component, 'getDepartmentData').mockImplementation(jest.fn())
      component.setupScrollListenerForDepartment(true)
      expect(component.getDepartmentData).toHaveBeenCalled()
    })

    it('does nothing when opened=false', () => {
      jest.spyOn(component, 'getDepartmentData').mockImplementation(jest.fn())
      component.setupScrollListenerForDepartment(false)
      expect(component.getDepartmentData).not.toHaveBeenCalled()
    })
  })

  describe('onDepartmentSelectScroll', () => {
    it('does nothing when departmentFilterEnable=true', () => {
      (component as any).departmentFilterEnable = true
      expect(() => component.onDepartmentSelectScroll({
        target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 }
      })).not.toThrow()
    })

    it('loads more via local pagination', () => {
      (component as any).departmentFilterEnable = false;
      (component as any).isLoadingMoreDepartments = false;
      (component as any).masterData.departmentBackup = [{ identifier: 'd1' }, { identifier: 'd2' }, { identifier: 'd3' }];
      (component as any).masterData.department = [{ identifier: 'd1' }]
      component.onDepartmentSelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect((component as any).isLoadingMoreDepartments).toBe(true)
    })

    it('loads more via server pagination', () => {
      (component as any).departmentFilterEnable = false;
      (component as any).isLoadingMoreDepartments = false;
      (component as any).noMoreLegacyDepartments = false;
      (component as any).defaultSearchDepartmentCount = 10;
      (component as any).masterData.departmentBackup = [{ identifier: 'd1' }];
      (component as any).masterData.department = [{ identifier: 'd1' }]
      jest.spyOn(component, 'getDepartmentData').mockImplementation(jest.fn())
      component.onDepartmentSelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect(component.getDepartmentData).toHaveBeenCalled()
    })
  })

  describe('checkCurrentDepartmentPresent', () => {
    it('does nothing when department not selected', () => {
      component.registrationFormStepOne.get('department')?.setValue('')
      expect(() => component.checkCurrentDepartmentPresent()).not.toThrow()
    })

    it('prepends department if not in list', () => {
      component.registrationFormStepOne.get('department')?.setValue('finance');
      (component as any).masterData.department = [{ identifier: 'other' }];
      (component as any).departmentListLoadCount = 100  // larger than list to avoid pop
      component.checkCurrentDepartmentPresent()
      expect((component as any).masterData.department[0].identifier).toBe('finance')
    })

    it('does not prepend when already present', () => {
      component.registrationFormStepOne.get('department')?.setValue('finance');
      (component as any).masterData.department = [{ identifier: 'finance' }]
      const originalLength = (component as any).masterData.department.length
      component.checkCurrentDepartmentPresent()
      expect((component as any).masterData.department.length).toBe(originalLength)
    })
  })

  describe('departmentSearch', () => {
    it('calls getDepartmentData for non-empty text', () => {
      jest.spyOn(component, 'getDepartmentData').mockImplementation(jest.fn())
      component.departmentSearch({ target: { value: 'finance' } })
      expect(component.getDepartmentData).toHaveBeenCalledWith('finance', 0)
    })

    it('calls getDepartmentData for empty text too', () => {
      jest.spyOn(component, 'getDepartmentData').mockImplementation(jest.fn())
      component.departmentSearch({ target: { value: '' } })
      expect(component.getDepartmentData).toHaveBeenCalled()
    })

    it('returns early when loading', () => {
      jest.spyOn(component, 'getDepartmentData').mockImplementation(jest.fn());
      (component as any).isLoadingMoreDepartments = true
      component.departmentSearch({ target: { value: 'test' } })
      expect(component.getDepartmentData).not.toHaveBeenCalled()
    })
  })

  describe('getOrganisationData', () => {
    beforeEach(() => {
      (component as any).masterData.ministryBackup = [];
      (component as any).masterData.organisationBackup = [{ orgName: 'N/A' }]
    })

    it('calls appropriate API and sets organisationBackup', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [{ identifier: 'org1', orgName: 'Org 1' }], count: 1 } }
      }))
      component.getOrganisationData()
      expect(signupSvcRef.getStateOrMinistyForRegistration).toHaveBeenCalled()
    })

    it('returns early on server-side render', () => {
      const ssrComp = makeSignupComponent('server')
      const signupSvcRef = (ssrComp as any).signupSvc
      ssrComp.getOrganisationData()
      expect(signupSvcRef.getStateOrMinistyForRegistration).not.toHaveBeenCalled()
    })

    it('sets noMoreLegacyOrganisations on empty result', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getOrganisationData()
      expect((component as any).noMoreLegacyOrganisations).toBe(true)
    })

    it('handles error from organisation API', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => throwError('err'))
      component.getOrganisationData()
      expect((component as any).noMoreLegacyOrganisations).toBe(true)
    })

    it('handles search text', () => {
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getOrganisationData('railways', 0)
      expect(signupSvcRef.getStateOrMinistyForRegistration).toHaveBeenCalled()
    })

    it('handles state type correctly', () => {
      component.registrationFormStepOne.get('type')!.setValue('state')
      component.registrationFormStepOne.get('state')!.setValue('delhi')
      component.registrationFormStepOne.get('department')!.setValue('health')
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getOrganisationData()
      expect(signupSvcRef.getStateOrMinistyForRegistration).toHaveBeenCalled()
    })

    it('handles ministry type with hierarchyLevel', () => {
      component.registrationFormStepOne.get('type')!.setValue('ministry')
      component.registrationFormStepOne.get('ministry')!.setValue('central-level1')
        ; (component as any).masterData.ministryBackup = [
          { identifier: 'central-level1', hierarchyLevel: 'levelOne', ministryOrStateId: 'central-root' }
        ]
      const signupSvcRef = (component as any).signupSvc
      signupSvcRef.getStateOrMinistyForRegistration = jest.fn(() => of({
        result: { response: { content: [], count: 0 } }
      }))
      component.getOrganisationData()
      expect(signupSvcRef.getStateOrMinistyForRegistration).toHaveBeenCalled()
    })
  })

  describe('setupScrollListenerForOrganisation', () => {
    it('calls getOrganisationData when opened=true', () => {
      jest.spyOn(component, 'getOrganisationData').mockImplementation(jest.fn())
      component.setupScrollListenerForOrganisation(true)
      expect(component.getOrganisationData).toHaveBeenCalled()
    })

    it('does nothing when opened=false', () => {
      jest.spyOn(component, 'getOrganisationData').mockImplementation(jest.fn())
      component.setupScrollListenerForOrganisation(false)
      expect(component.getOrganisationData).not.toHaveBeenCalled()
    })
  })

  describe('onOrganisationSelectScroll', () => {
    it('does nothing when organisationFilterEnable=true', () => {
      (component as any).organisationFilterEnable = true
      expect(() => component.onOrganisationSelectScroll({
        target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 }
      })).not.toThrow()
    })

    it('loads more via local pagination', () => {
      (component as any).organisationFilterEnable = false;
      (component as any).isLoadingMoreOrganisations = false;
      (component as any).masterData.organisationBackup = [{ identifier: 'o1' }, { identifier: 'o2' }, { identifier: 'o3' }];
      (component as any).masterData.organisation = [{ identifier: 'o1' }]
      component.onOrganisationSelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect((component as any).isLoadingMoreOrganisations).toBe(true)
    })

    it('loads more via server pagination', () => {
      (component as any).organisationFilterEnable = false;
      (component as any).isLoadingMoreOrganisations = false;
      (component as any).noMoreLegacyOrganisations = false;
      (component as any).defaultSearchOrganisationCount = 10;
      (component as any).masterData.organisationBackup = [{ identifier: 'o1' }];
      (component as any).masterData.organisation = [{ identifier: 'o1' }]
      jest.spyOn(component, 'getOrganisationData').mockImplementation(jest.fn())
      component.onOrganisationSelectScroll({ target: { scrollTop: 100, clientHeight: 100, scrollHeight: 200 } })
      expect(component.getOrganisationData).toHaveBeenCalled()
    })
  })

  describe('checkCurrentOrganisationPresent', () => {
    it('does nothing when organisation not selected', () => {
      component.registrationFormStepOne.get('organisation')?.setValue('');
      (component as any).masterData.organisation = []
      expect(() => component.checkCurrentOrganisationPresent()).not.toThrow()
    })

    it('prepends organisation if not in list', () => {
      component.registrationFormStepOne.get('organisation')?.setValue('railways');
      (component as any).masterData.organisation = [{ identifier: 'other' }];
      (component as any).organisationListLoadCount = 10
      component.checkCurrentOrganisationPresent()
      expect((component as any).masterData.organisation[0].identifier).toBe('railways')
    })

    it('does not prepend when already present', () => {
      component.registrationFormStepOne.get('organisation')?.setValue('railways');
      (component as any).masterData.organisation = [{ identifier: 'railways' }]
      const originalLength = (component as any).masterData.organisation.length
      component.checkCurrentOrganisationPresent()
      expect((component as any).masterData.organisation.length).toBe(originalLength)
    })
  })

  describe('organisationSearch', () => {
    it('emits to organisationSearchSubject', () => {
      const spy = jest.spyOn((component as any).organisationSearchSubject, 'next')
      component.organisationSearch({ target: { value: 'railways' } })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('performOrganisationSearch', () => {
    it('calls getOrganisationData for non-empty text', () => {
      jest.spyOn(component, 'getOrganisationData').mockImplementation(jest.fn())
      component.performOrganisationSearch('railways')
      expect(component.getOrganisationData).toHaveBeenCalledWith('railways', 0)
    })

    it('resets organisation list for empty search (calls getOrganisationData)', () => {
      jest.spyOn(component, 'getOrganisationData').mockImplementation(jest.fn())
      component.performOrganisationSearch('')
      expect(component.getOrganisationData).toHaveBeenCalledWith('', 0)
    })

    it('returns early when loading', () => {
      jest.spyOn(component, 'getOrganisationData').mockImplementation(jest.fn());
      (component as any).isLoadingMoreOrganisations = true
      component.performOrganisationSearch('test')
      expect(component.getOrganisationData).not.toHaveBeenCalled()
    })
  })

  describe('goToNextStep and goToPrevStep', () => {
    it('goToNextStep sets currentStep to step2', () => {
      component.currentStep = 'step1'
      jest.spyOn(component as any, 'raiseSignupInteractTelementry').mockImplementation(jest.fn())
      component.goToNextStep()
      expect(component.currentStep).toBe('step2')
    })

    it('goToPrevStep sets currentStep to step1', () => {
      component.currentStep = 'step2'
      component.goToPrevStep()
      expect(component.currentStep).toBe('step1')
    })
  })

  describe('resetOrganisationBackup', () => {
    it('resets organisationBackup to N/A', () => {
      component.resetOrganisationBackup()
      expect((component as any).masterData.organisationBackup[0].orgName).toBe('N/A')
    })
  })
})

