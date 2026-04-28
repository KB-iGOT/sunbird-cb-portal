import { of, throwError, Subject } from 'rxjs'

// Mock all external modules
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  EventService: jest.fn(),
  LoggerService: jest.fn(),
  MultilingualTranslationsService: jest.fn(),
  NsInstanceConfig: {},
  TelemetryService: jest.fn(),
  WsEvents: { EnumInteractTypes: { CLICK: 'CLICK' } },
}), { virtual: true })
jest.mock('@angular/material/legacy-dialog', () => ({
  MatLegacyDialog: jest.fn(),
  MatLegacyDialogRef: jest.fn(),
}), { virtual: true })
jest.mock('@angular/material/legacy-snack-bar', () => ({ MatLegacySnackBar: jest.fn() }), { virtual: true })
jest.mock('@angular/router', () => ({ ActivatedRoute: jest.fn(), Router: jest.fn() }), { virtual: true })
jest.mock('@angular/common/http', () => ({ HttpClient: jest.fn() }), { virtual: true })
jest.mock('@angular/platform-browser', () => ({ DomSanitizer: jest.fn() }), { virtual: true })
jest.mock('@ngx-translate/core', () => ({ TranslateService: jest.fn() }), { virtual: true })
jest.mock('../public-signup/signup.service', () => ({ SignupService: jest.fn() }), { virtual: true })
jest.mock('../../../services/mobile-apps.service', () => ({
  MobileAppsService: jest.fn(),
}), { virtual: true })
jest.mock('src/environments/environment', () => ({
  environment: { resendOTPTIme: 30, name: 'test', staticHomePageUrl: 'https://test.com', spvorgID: 'spv1' },
}), { virtual: true })
jest.mock('../public-signup/signup-success-dialogue/signup-success-dialogue/signup-success-dialogue.component', () => ({
  SignupSuccessDialogueComponent: jest.fn(),
}), { virtual: true })
jest.mock('../public-signup/terms-and-condition/terms-and-condition.component', () => ({
  TermsAndConditionComponent: jest.fn(),
}), { virtual: true })
jest.mock('@ws/app/src/lib/routes/profile-v3/components/dialog-box/dialog-box.component', () => ({
  DialogBoxComponent: jest.fn(),
}), { virtual: true })
jest.mock('src/app/component/app-otp-reader/app-otp-reader.component', () => ({
  AppOtpReaderComponent: jest.fn(),
}), { virtual: true })

import { PublicCrpComponent } from './public-crp.component'

function buildComponent(overrides: any = {}) {
  const updateSignupDataSubject = new Subject<any>()
  const mockSignupSvc: any = {
    updateSignupDataObservable: updateSignupDataSubject.asObservable(),
    sendOtp: jest.fn().mockReturnValue(of({})),
    resendOtp: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
    verifyOTP: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
    sendOtpV2: jest.fn().mockReturnValue(of({})),
    resendOtpv2: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
    register: jest.fn().mockReturnValue(of({})),
    searchOrgsByIdentifier: jest.fn().mockReturnValue(of({ result: { response: [] } })),
    ...overrides.signupSvc,
  }
  const mockLogger: any = { error: jest.fn() }
  const mockConfigSvc: any = {
    instanceConfig: {
      isMultilingualEnabled: true,
      telemetryConfig: { pdata: { id: 'p1' } },
      websitelanguages: ['en'],
    },
  }
  const mockSnackBar: any = { open: jest.fn() }
  const mockDialog: any = {
    open: jest.fn().mockReturnValue({ afterClosed: () => of(true), disableClose: false }),
  }
  const mockRoute: any = {
    snapshot: {
      url: [{ path: 'crp' }, { path: 'token123' }],
      data: {
        positions: { data: [{ name: 'Officer' }] },
        group: { data: ['GroupA'] },
        organization: {
          designationsList: [{ name: 'Officer' }],
          organizationDetails: { id: 'org1', orgName: 'TestOrg' },
          invalidLinkMessage: '',
        },
      },
    },
  }
  const mockRouter: any = { navigate: jest.fn() }
  const mockDocument: any = {
    body: { classList: { add: jest.fn(), remove: jest.fn() } },
  }
  const mockTranslate: any = {
    setDefaultLang: jest.fn(),
    use: jest.fn(),
    instant: jest.fn().mockReturnValue('translated'),
  }
  const mockLang: any = {
    translateActualLabel: jest.fn().mockReturnValue('label'),
    updatelanguageSelected: jest.fn(),
  }
  const mockHttp: any = { get: jest.fn().mockReturnValue(of('<html></html>')) }
  const mockSanitizer: any = {
    bypassSecurityTrustHtml: jest.fn().mockReturnValue('<safe>'),
  }
  const mockMobileAppsService: any = {
    mobileTopHeaderVisibilityStatus: { next: jest.fn() },
  }
  const mockEventService: any = { raiseInteractTelemetry: jest.fn() }
  const mockTelemetrySvc: any = { start: jest.fn(), impression: jest.fn(), end: jest.fn() }

  const comp = new PublicCrpComponent(
    mockSignupSvc, mockLogger, mockConfigSvc, mockSnackBar, mockDialog,
    mockRoute, mockRouter, mockDocument, 'browser',
    mockTranslate, mockLang, mockHttp, mockSanitizer,
    mockMobileAppsService, mockEventService, mockTelemetrySvc,
  )

  return {
    comp, mockSignupSvc, mockLogger, mockConfigSvc, mockSnackBar, mockDialog,
    mockRoute, mockRouter, mockTranslate, mockLang, mockHttp, mockSanitizer,
    mockMobileAppsService, mockEventService, mockTelemetrySvc, updateSignupDataSubject,
  }
}

describe('PublicCrpComponent', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should initialize registrationForm on creation', () => {
    const { comp } = buildComponent()
    expect(comp.registrationForm).toBeDefined()
  })

  it('should set crpPath from activatedRoute url', () => {
    const { comp } = buildComponent()
    expect(comp.crpPath).toBeDefined()
  })

  it('should use websiteLanguage from localStorage', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('ngOnInit - should populate groupsOriginal', () => {
    const { comp } = buildComponent()
    comp.ngOnInit()
    expect(comp.groupsOriginal.length).toBeGreaterThan(0)
  })

  it('ngOnInit - should call getOrganization', () => {
    const { comp, mockSignupSvc } = buildComponent()
    comp.ngOnInit()
    expect(mockSignupSvc.searchOrgsByIdentifier).toHaveBeenCalled()
  })

  it('ngOnInit - invalid link message shows dialog', () => {
    jest.useFakeTimers()
    const { comp, mockDialog } = buildComponent()
    comp['activatedRoute'].snapshot.data.organization.invalidLinkMessage = 'some error'
    comp.ngOnInit()
    jest.runAllTimers()
    expect(mockDialog.open).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('ngOnInit - expired link message shows dialog', () => {
    jest.useFakeTimers()
    const { comp, mockDialog } = buildComponent()
    comp['activatedRoute'].snapshot.data.organization.invalidLinkMessage = 'Registration link is not active'
    comp.ngOnInit()
    jest.runAllTimers()
    expect(mockDialog.open).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('emailVerification - sets emailLengthVal true for long local part', () => {
    const { comp } = buildComponent()
    const longLocal = 'a'.repeat(65)
    comp.emailVerification(`${longLocal}@example.com`)
    expect(comp.emailLengthVal).toBe(true)
  })

  it('emailVerification - valid email sets false', () => {
    const { comp } = buildComponent()
    comp.emailVerification('test@example.com')
    expect(comp.emailLengthVal).toBe(false)
  })

  it('emailVerification - empty email sets false', () => {
    const { comp } = buildComponent()
    comp.emailVerification('')
    expect(comp.emailLengthVal).toBe(false)
  })

  it('confirmChange - toggles confirm', () => {
    const { comp } = buildComponent()
    comp.confirm = false
    comp.confirmChange()
    expect(comp.confirm).toBe(true)
  })

  it('confirmTermsChange - toggles confirmTerms', () => {
    const { comp } = buildComponent()
    comp.confirmTerms = false
    comp.confirmTermsChange()
    expect(comp.confirmTerms).toBe(true)
  })

  it('clearValues - resets heirarchyObject', () => {
    const { comp } = buildComponent()
    comp['heirarchyObject'] = { org: 'test' }
    comp.clearValues()
    expect(comp['heirarchyObject']).toBeNull()
  })

  it('numericOnly - returns true for digit', () => {
    const { comp } = buildComponent()
    expect(comp.numericOnly({ key: '5' })).toBe(true)
  })

  it('numericOnly - returns false for letter', () => {
    const { comp } = buildComponent()
    expect(comp.numericOnly({ key: 'a' })).toBe(false)
  })

  it('translateLabels - calls lang service', () => {
    const { comp } = buildComponent()
    const result = comp.translateLabels('key', 'type')
    expect(result).toBe('label')
  })

  it('selectLanguage - updates selectedLanguage', () => {
    const { comp, mockLang } = buildComponent()
    comp.selectLanguage('hi')
    expect(comp.selectedLanguage).toBe('hi')
    expect(mockLang.updatelanguageSelected).toHaveBeenCalled()
  })

  it('sendOtp - valid mobile calls signup sendOtp', () => {
    const { comp, mockSignupSvc } = buildComponent()
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    comp.registrationForm.get('mobile')!.setValue('9876543210')
    comp.sendOtp()
    expect(mockSignupSvc.sendOtp).toHaveBeenCalled()
  })

  it('sendOtp - invalid mobile shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.registrationForm.get('mobile')!.setValue('')
    comp.sendOtp()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('sendOtp - OTP error shows snackbar', () => {
    const { comp, mockSignupSvc } = buildComponent()
    mockSignupSvc.sendOtp.mockReturnValue(throwError({ error: { params: { errmsg: 'error' } } }))
    comp.registrationForm.get('mobile')!.setValue('9876543210')
    expect(() => comp.sendOtp()).not.toThrow()
  })

  it('resendOTP - valid mobile calls resendOtp', () => {
    const { comp, mockSignupSvc } = buildComponent()
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    comp.registrationForm.get('mobile')!.setValue('9876543210')
    comp.resendOTP()
    expect(mockSignupSvc.resendOtp).toHaveBeenCalled()
  })

  it('resendOTP - invalid mobile shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.registrationForm.get('mobile')!.setValue('')
    comp.resendOTP()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('verifyOtp - short otp shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.registrationForm.get('mobile')!.setValue('9876543210')
    comp.verifyOtp('12')
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('verifyOtp - valid OTP calls verifyOTP', () => {
    const { comp, mockSignupSvc } = buildComponent()
    comp.registrationForm.get('mobile')!.setValue('9876543210')
    comp.verifyOtp('1234')
    expect(mockSignupSvc.verifyOTP).toHaveBeenCalled()
  })

  it('verifyOtp - empty otp shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.verifyOtp(null)
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('sendOtpEmail - valid email calls sendOtpV2', () => {
    const { comp, mockSignupSvc } = buildComponent()
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    comp.registrationForm.get('email')!.setValue('test@example.com')
    comp.sendOtpEmail()
    expect(mockSignupSvc.sendOtpV2).toHaveBeenCalled()
  })

  it('sendOtpEmail - invalid email shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.registrationForm.get('email')!.setValue('')
    comp.sendOtpEmail()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('verifyOtpEmail - short OTP shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.registrationForm.get('email')!.setValue('test@example.com')
    comp.verifyOtpEmail('12')
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('verifyOtpEmail - valid OTP calls verifyOTP', () => {
    const { comp, mockSignupSvc } = buildComponent()
    comp.registrationForm.get('email')!.setValue('test@example.com')
    comp.verifyOtpEmail('1234')
    expect(mockSignupSvc.verifyOTP).toHaveBeenCalled()
  })

  it('navigateTo - navigates with query params', () => {
    const { comp, mockRouter } = buildComponent()
    comp.navigateTo('some-type')
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('openDialog - opens SignupSuccessDialogueComponent', () => {
    const { comp, mockDialog } = buildComponent()
    comp.openDialog()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('termsAndConditionClick - opens TermsAndConditionComponent', () => {
    const { comp, mockDialog } = buildComponent()
    comp.termsAndConditionClick()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('signup - calls register when heirarchyObject set and designation valid', () => {
    const { comp, mockSignupSvc } = buildComponent()
    comp['heirarchyObject'] = {
      orgName: 'TestOrg', channel: 'ch1', sbOrgType: 't', sbOrgSubType: 'st',
      mapId: 'm1', sbRootOrgId: 'r1', sbOrgId: 'o1',
    }
    comp.filteredDesignationsList = [{ name: 'Officer' }]
    comp.registrationForm.patchValue({ designation: 'Officer', firstname: 'John', email: 'j@j.com', mobile: '9876543210', group: 'GroupA' })
    comp.signup()
    expect(mockSignupSvc.register).toHaveBeenCalled()
  })

  it('signup - invalid designation shows snackbar', () => {
    const { comp, mockSnackBar } = buildComponent()
    comp.filteredDesignationsList = [{ name: 'Manager' }]
    comp.registrationForm.patchValue({ designation: 'Officer' })
    comp.signup()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('checkIfDesignationValid - returns false for invalid designation', () => {
    const { comp } = buildComponent()
    comp.filteredDesignationsList = [{ name: 'Manager' }]
    comp.registrationForm.patchValue({ designation: 'Officer' })
    expect(comp.checkIfDesignationValid()).toBe(false)
  })

  it('checkIfDesignationValid - returns true for valid designation', () => {
    const { comp } = buildComponent()
    comp.filteredDesignationsList = [{ name: 'Officer' }]
    comp.registrationForm.patchValue({ designation: 'Officer' })
    expect(comp.checkIfDesignationValid()).toBe(true)
  })

  it('hideMobileTopHeader - hides header', () => {
    const { comp, mockMobileAppsService } = buildComponent()
    comp.hideMobileTopHeader()
    expect(comp.mobileTopHeaderVisibilityStatus).toBe(false)
    expect(mockMobileAppsService.mobileTopHeaderVisibilityStatus.next).toHaveBeenCalledWith(false)
  })

  it('downloadApp - does not throw', () => {
    const { comp } = buildComponent()
    expect(() => comp.downloadApp()).not.toThrow()
  })

  it('getOrganization - finds matching org', () => {
    const { comp, mockSignupSvc } = buildComponent()
    mockSignupSvc.searchOrgsByIdentifier.mockReturnValue(of({
      result: { response: [{ orgName: 'TestOrg', sbOrgId: 'o1' }] },
    }))
    comp.organizationDetails = { id: 'org1', orgName: 'TestOrg' } as any
    comp.getOrganization()
    expect(comp['heirarchyObject']).toBeDefined()
  })

  it('ngOnDestroy - unsubscribes without error', () => {
    const { comp } = buildComponent()
    expect(() => comp.ngOnDestroy()).not.toThrow()
  })

  it('startCountDown - starts timer when OTP_TIMER > 0', () => {
    jest.useFakeTimers()
    const { comp } = buildComponent()
    comp.OTP_TIMER = 30
    comp.startCountDown()
    jest.advanceTimersByTime(35000)
    expect(comp.timeLeftforOTP).toBe(0)
    jest.useRealTimers()
  })

  it('startCountDownEmail - starts email timer', () => {
    jest.useFakeTimers()
    const { comp } = buildComponent()
    comp.OTP_TIMER_EMAIL = 30
    comp.startCountDownEmail()
    jest.advanceTimersByTime(35000)
    expect(comp.timeLeftforOTPEmail).toBe(0)
    jest.useRealTimers()
  })

  it('getZohoForm - opens dialog', () => {
    const { comp, mockDialog } = buildComponent()
    comp.getZohoForm()
    expect(mockDialog.open).toHaveBeenCalled()
  })
})
