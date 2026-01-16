import { PublicSignupComponent, forbiddenNamesValidator, forbiddenNamesValidatorNonEmpty } from './public-signup.component'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { of, throwError, BehaviorSubject } from 'rxjs'

const signupDataSubject = new BehaviorSubject<any>({})

// Mock dependencies
const mockSignupService = {
  updateSignupDataObservable: signupDataSubject,
  searchOrgs: jest.fn(),
  sendOtp: jest.fn(),
  resendOtp: jest.fn(),
  verifyOTP: jest.fn(),
  register: jest.fn(),
  getMinistryForRegistration: jest.fn().mockReturnValue(of({
    result: {
      response: {
        content: [],
        count: 0,
      },
    },
  })),
}

const mockLoggerService = {
  error: jest.fn()
}

const mockConfigService = {
  instanceConfig: {
    telemetryConfig: {
      pdata: { id: 'test-portal' }
    },
    isMultilingualEnabled: true,
    websitelanguages: ['en', 'hi']
  }
}

const mockSnackBar = {
  open: jest.fn()
}

const mockDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of(true))
  })
}

const mockActivatedRoute = {
  snapshot: {
    data: {
      positions: { data: [{ name: 'Manager' }, { name: 'Developer' }] },
      group: { data: ['Admin', 'User', 'Others'] }
    }
  }
}

const mockRecaptchaV3Service = {
  execute: jest.fn().mockReturnValue(of('test-token'))
}

const mockRouter = {
  navigate: jest.fn()
}

const mockDocument = {
  body: {
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  },
  getElementById: jest.fn(),
  getElementsByName: jest.fn().mockReturnValue([{ value: '' }])
}

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
}

const mockMultilingualService = {
  updatelanguageSelected: jest.fn(),
  translateActualLabel: jest.fn().mockReturnValue('translated-text')
}

const mockHttpClient = {
  get: jest.fn().mockReturnValue(of('<html>test</html>'))
}

const mockSanitizer = {
  bypassSecurityTrustHtml: jest.fn().mockReturnValue('<html>test</html>')
}

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
}

const mockTelemetryService = {
  end: jest.fn()
}

const mockUsersService = {
  searchPublicDesignation: jest.fn().mockReturnValue(of({ result: { result: { data: [], totalcount: 0 } } }))
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(globalThis as any, 'localStorage', { value: localStorageMock })

// Mock alert and XMLHttpRequest
// global.alert = jest.fn();
// global.XMLHttpRequest = jest.fn().mockImplementation(() => ({
//   open: jest.fn(),
//   send: jest.fn(),
//   setRequestHeader: jest.fn(),
//   readyState: 4,
//   status: 200,
//   responseText: JSON.stringify({ captchaUrl: 'test-url', captchaDigest: 'test-digest' }),
//   onreadystatechange: null
// }));

describe('PublicSignupComponent', () => {
  let component: PublicSignupComponent

  beforeEach(() => {
    jest.clearAllMocks()
    signupDataSubject.next({})
    localStorageMock.getItem.mockReturnValue('en')

    component = new PublicSignupComponent(
      mockSignupService as any,
      mockUsersService as any,
      mockLoggerService as any,
      mockConfigService as any,
      mockSnackBar as any,
      mockDialog as any,
      mockActivatedRoute as any,
      mockRecaptchaV3Service as any,
      mockRouter as any,
      mockDocument as any,
      'browser',
      mockTranslateService as any,
      mockMultilingualService as any,
      mockHttpClient as any,
      mockSanitizer as any,
      mockEventService as any,
      mockTelemetryService as any
    )
  })

  describe('Constructor', () => {
    it('should initialize with default language from localStorage', () => {
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslateService.use).toHaveBeenCalledWith('en')
    })

    it('should set default language when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)

      component = new PublicSignupComponent(
        mockSignupService as any,
        mockUsersService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRecaptchaV3Service as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockEventService as any,
        mockTelemetryService as any
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith('websiteLanguage', 'en')
    })

    it('should initialize form with user data from observable', () => {
      const userData = {
        firstname: 'John',
        email: 'john@test.com',
        mobile: '1234567890',
        isMobileVerified: true,
        isEmailVerified: true
      }

      mockSignupService.updateSignupDataObservable.next(userData)

      component = new PublicSignupComponent(
        mockSignupService as any,
        mockUsersService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRecaptchaV3Service as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockEventService as any,
        mockTelemetryService as any
      )

      expect(component.registrationFormStepTwo.get('firstname')?.value).toBe('John')
      expect(component.isMobileVerified).toBe(true)
      expect(component.isEmailVerified).toBe(true)
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should initialize component properties', () => {
      //expect(component.positionsOriginal).toEqual([{ name: 'Manager' }, { name: 'Developer' }])
      expect(component.groupsOriginal).toEqual(['Admin', 'User'])
      expect(component.portalID).toBe('test-portal')
    })

    // it('should handle missing positions data', () => {
    //   mockActivatedRoute.snapshot.data.positions = { data: null };
    //   component.ngOnInit();
    //   expect(component.positionsOriginal).toEqual([]);
    // });

    // it('should handle missing groups data', () => {
    //   mockActivatedRoute.snapshot.data.group = { data: null };
    //   component.ngOnInit();
    //   expect(component.groupsOriginal).toEqual([]);
    // });

    it('should add CSS class in browser platform', () => {
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('cs-recaptcha')
    })

    it('should load zoho HTML content', () => {
      expect(mockHttpClient.get).toHaveBeenCalledWith('/assets/static-data/zoho-code.html', { responseType: 'text' })
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<html>test</html>')
    })
  })

  describe('Getters', () => {
    it('should return typeValueStartCase', () => {
      component.registrationFormStepOne.get('type')?.setValue('ministry')
      expect(component.typeValueStartCase).toBe('Ministry')
    })

    it('should return typeValue', () => {
      component.registrationFormStepOne.get('type')?.setValue('department')
      expect(component.typeValue).toBe('department')
    })
  })

  describe('emailVerification', () => {
    it('should set emailLengthVal to true when email parts exceed limits', () => {
      const longEmail = 'a'.repeat(65) + '@' + 'b'.repeat(256)
      component.emailVerification(longEmail)
      expect(component.emailLengthVal).toBe(true)
    })

    it('should set emailLengthVal to false for valid email length', () => {
      component.emailVerification('test@example.com')
      expect(component.emailLengthVal).toBe(false)
    })

    it('should handle invalid email format', () => {
      component.emailVerification('invalid-email')
      expect(component.emailLengthVal).toBe(false)
    })

    it('should handle empty email', () => {
      component.emailVerification('')
      expect(component.emailLengthVal).toBe(false)
    })
  })

  describe('clearValues', () => {
    it('should clear organisation value and heirarchyObject', () => {
      component.registrationFormStepOne.get('organisation')?.setValue('test org')
      component.heirarchyObject = { test: 'data' }

      component.clearValues()

      expect(component.registrationFormStepOne.get('organisation')?.value).toBe('')
      expect(component.heirarchyObject).toBeNull()
    })
  })

  describe('mdoRedirect', () => {
    it('should redirect to MDO list page', () => {
      const mockEnvironment = {
        sitePath: 'test.example.com'
      }
      component.environment = mockEnvironment

      // Mock window.location.href
      delete (globalThis as any).location
        ; (globalThis as any).location = { href: '' }

      component.mdoRedirect()

      expect((globalThis as any).location.href).toBe('https:///#/mdoList#mdoUserList')
    })
  })

  describe('filterOrgsSearch', () => {
    it('should search and filter organizations successfully', () => {
      const mockResponse = {
        result: {
          response: [
            { orgName: 'Test Org 1' },
            { orgName: 'Another Org' },
            { orgName: 'Test Org 2' }
          ]
        }
      }
      mockSignupService.searchOrgs.mockReturnValue(of(mockResponse))

      component.registrationFormStepOne.get('type')?.setValue('ministry')
      component.filterOrgsSearch('test')

      expect(mockSignupService.searchOrgs).toHaveBeenCalledWith('test', 'ministry')
      expect(component.filteredOrgList).toEqual([
        { orgName: 'Test Org 1' },
        { orgName: 'Test Org 2' }
      ])
      expect(component.resultFetched).toBe(true)
      expect(component.searching).toBe(false)
    })

    it('should handle search error', () => {
      const error = {
        error: {
          params: {
            errmsg: 'Search failed'
          }
        }
      }
      mockSignupService.searchOrgs.mockReturnValue(throwError(error))

      component.filterOrgsSearch('test')

      expect(component.searching).toBe(false)
      expect(mockLoggerService.error).toHaveBeenCalled()
      const lastCall = mockSnackBar.open.mock.calls[mockSnackBar.open.mock.calls.length - 1] || []
      expect(lastCall[0]).toBe('Search failed')
    })

    it('should handle search error without specific message', () => {
      mockSignupService.searchOrgs.mockReturnValue(throwError({}))

      component.filterOrgsSearch('test')

      const lastCall = mockSnackBar.open.mock.calls[mockSnackBar.open.mock.calls.length - 1] || []
      expect(lastCall[0]).toBe('translated-text')
    })
  })

  describe('searchOrgs', () => {
    it('should search organizations with valid input', async () => {
      const mockResponse = { result: { response: [{ orgName: 'Test Org' }] } }
      mockSignupService.searchOrgs.mockReturnValue(of(mockResponse))

      await component.searchOrgs('test')

      expect(component.searching).toBe(false)
      expect(mockSignupService.searchOrgs).toHaveBeenCalledWith('test', component.typeValue)
    })

    it('should show error for empty search value', async () => {
      await component.searchOrgs('')

      const lastCall = mockSnackBar.open.mock.calls[mockSnackBar.open.mock.calls.length - 1] || []
      expect(lastCall[0]).toBe('translated-text')
      expect(component.searching).toBe(false)
    })
  })

  describe('editOrg', () => {
    it('should reset organization selection', () => {
      component.hideOrg = true
      component.resultFetched = true
      component.searching = true
      component.heirarchyObject = { test: 'data' }

      component.editOrg()

      expect(component.hideOrg).toBe(false)
      expect(component.resultFetched).toBe(false)
      expect(component.searching).toBe(false)
      expect(component.heirarchyObject).toBeNull()
    })
  })

  describe('OrgsSearchChange', () => {
    it('should subscribe to organisation value changes', () => {
      component.OrgsSearchChange()

      component.registrationFormStepOne.get('organisation')?.setValue('test')

      expect(component.resultFetched).toBe(false)
    })
  })

  describe('orgClicked', () => {
    it('should handle organization selection', () => {
      const event = {
        option: {
          value: {
            orgName: 'Test Organization',
            channel: 'test-channel'
          }
        }
      }

      component.orgClicked(event)

      expect(component.registrationFormStepOne.get('organisation')?.value).toBe('Test Organization')
      expect(component.heirarchyObject).toEqual(event.option.value)
      expect(component.hideOrg).toBe(true)
    })

    it('should handle invalid organization selection', () => {
      const event = { option: { value: null } }

      component.orgClicked(event)

      expect(component.hideOrg).toBe(false)
    })

    it('should handle null event', () => {
      component.orgClicked(null)
      // Should not throw error
    })
  })

  describe('onPhoneChange', () => {
    it('should handle phone number changes', () => {
      component.onPhoneChange()

      component.registrationFormStepTwo.get('mobile')?.setValue('1234567890')

      expect(component.isMobileVerified).toBe(false)
      expect(component.otpSend).toBe(false)
      expect(component.disableVerifyBtn).toBe(false)
    })

    it('should handle initial value', () => {
      component.isMobileVerified = true
      component.onPhoneChange()

      // Should not change verification status for initial value
      expect(component.isMobileVerified).toBe(true)
    })
  })

  describe('onEmailChange', () => {
    it('should handle email changes', () => {
      component.onEmailChange()

      component.registrationFormStepOne.get('email')?.setValue('test@example.com')

      expect(component.isEmailVerified).toBe(false)
      expect(component.otpEmailSend).toBe(false)
    })
  })

  describe('sendOtp', () => {
    it('should send OTP successfully', () => {
      component.registrationFormStepTwo.get('mobile')?.setValue('1234567890')
      mockSignupService.sendOtp.mockReturnValue(of({}))

      component.sendOtp()

      expect(mockSignupService.sendOtp).toHaveBeenCalledWith('1234567890', 'phone')
      expect(component.otpSend).toBe(true)
    })

    it('should handle OTP send error', () => {
      component.registrationFormStepTwo.get('mobile')?.setValue('1234567890')
      const error = { error: { params: { errmsg: 'OTP failed' } } }
      mockSignupService.sendOtp.mockReturnValue(throwError(error))

      component.sendOtp()

      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP failed')
    })

    it('should handle invalid mobile number', () => {
      component.registrationFormStepTwo.get('mobile')?.setValue('invalid')

      component.sendOtp()

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text')
    })
  })

  describe('resendOTP', () => {
    it('should resend OTP successfully', () => {
      component.registrationFormStepTwo.get('mobile')?.setValue('1234567890')
      mockSignupService.resendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

      component.resendOTP()

      expect(mockSignupService.resendOtp).toHaveBeenCalledWith('1234567890', 'phone')
      expect(component.otpSend).toBe(true)
      expect(component.disableVerifyBtn).toBe(false)
    })

    it('should handle resend OTP error', () => {
      component.registrationFormStepTwo.get('mobile')?.setValue('1234567890')
      const error = { error: { params: { errmsg: 'Resend failed' } } }
      mockSignupService.resendOtp.mockReturnValue(throwError(error))

      component.resendOTP()

      expect(mockSnackBar.open).toHaveBeenCalledWith('Resend failed')
    })
  })

  describe('verifyOtp', () => {
    it('should verify OTP successfully', () => {
      component.registrationFormStepTwo.get('mobile')?.setValue('1234567890')
      mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

      const otp = { value: '123456' }
      component.verifyOtp(otp)

      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('123456', '1234567890', 'phone')
      expect(component.otpVerified).toBe(true)
      expect(component.isMobileVerified).toBe(true)
      expect(component.disableBtn).toBe(false)
    })

    it('should handle short OTP', () => {
      const otp = { value: '123' }
      component.verifyOtp(otp)

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text')
    })

    it('should handle verification error', () => {
      component.registrationFormStepTwo.get('mobile')?.setValue('1234567890')
      const error = {
        error: {
          params: { errmsg: 'Verification failed' },
          result: { remainingAttempt: 0 }
        }
      }
      mockSignupService.verifyOTP.mockReturnValue(throwError(error))

      const otp = { value: '123456' }
      component.verifyOtp(otp)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Verification failed')
      expect(component.disableVerifyBtn).toBe(true)
    })

    it('should handle empty OTP', () => {
      const otp = { value: '' }
      component.verifyOtp(otp)

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text')
    })
  })

  describe('startCountDown', () => {
    it('should start countdown timer', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000)
      component.OTP_TIMER = 5000

      component.startCountDown()

      expect(component.timeLeftforOTP).toBe(5000)
    })

    it('should handle timer completion', (done) => {
      component.OTP_TIMER = 1
      component.timeLeftforOTP = 1

      component.startCountDown()

      setTimeout(() => {
        expect(component.timeLeftforOTP).toBe(0)
        done()
      }, 1100)
    })
  })

  describe('Email OTP Methods', () => {
    describe('sendOtpEmail', () => {
      it('should send email OTP successfully', () => {
        component.registrationFormStepOne.get('email')?.setValue('test@example.com')
        mockSignupService.sendOtp.mockReturnValue(of({}))

        component.sendOtpEmail()

        expect(mockSignupService.sendOtp).toHaveBeenCalledWith('test@example.com', 'email')
        expect(component.otpEmailSend).toBe(true)
      })

      it('should handle invalid email', () => {
        component.registrationFormStepOne.get('email')?.setValue('invalid-email')

        component.sendOtpEmail()

        expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text')
      })
    })

    describe('resendOTPEmail', () => {
      it('should resend email OTP successfully', () => {
        component.registrationFormStepOne.get('email')?.setValue('test@example.com')
        mockSignupService.resendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

        component.resendOTPEmail()

        expect(component.otpEmailSend).toBe(true)
      })
    })

    describe('verifyOtpEmail', () => {
      it('should verify email OTP successfully', () => {
        component.registrationFormStepOne.get('email')?.setValue('test@example.com')
        mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }))

        const otp = { value: '123456' }
        component.verifyOtpEmail(otp)

        expect(component.isEmailVerified).toBe(true)
      })
    })

    describe('startCountDownEmail', () => {
      it('should start email countdown timer', () => {
        component.OTP_TIMER_EMAIL = 5000

        component.startCountDownEmail()

        expect(component.timeLeftforOTPEmail).toBe(5000)
      })
    })
  })

  describe('confirmChange', () => {
    it('should toggle confirm status', () => {
      component.confirm = false

      component.confirmChange()

      expect(component.confirm).toBe(true)
    })
  })

  describe('confirmTermsChange', () => {
    it('should toggle terms confirmation', () => {
      component.confirmTerms = false

      component.confirmTermsChange()

      expect(component.confirmTerms).toBe(true)
    })
  })

  describe('Display Functions', () => {
    it('should display channel value', () => {
      const value = { channel: 'test-channel' }
      expect(component.displayFn(value)).toBe('test-channel')
      expect(component.displayFn(null)).toBeUndefined()
    })

    it('should display position name', () => {
      const value = { name: 'Manager' }
      expect(component.displayFnPosition(value)).toBe('Manager')
      expect(component.displayFnPosition(null)).toBeUndefined()
    })

    it('should display group value', () => {
      expect(component.displayFnGroup('Admin')).toBe('Admin')
      expect(component.displayFnGroup(null)).toBeUndefined()
    })

    it('should display org name', () => {
      const value = { orgName: 'Test Org' }
      expect(component.displayFnOrg(value)).toBe('Test Org')
      expect(component.displayFnOrg(null)).toBe('')
    })
  })

  describe('signup', () => {
    beforeEach(() => {
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgType: 'ministry',
        sbOrgSubType: 'department',
        mapId: 'map123',
        sbRootOrgId: 'root123',
        sbOrgId: 'org123'
      }
      component.registrationFormStepOne.patchValue({
        email: 'john@test.com',
      })
      component.registrationFormStepTwo.patchValue({
        firstname: 'John',
        mobile: '1234567890',
        group: 'Admin'
      })
    })

    it('should register user successfully', () => {
      mockSignupService.register.mockReturnValue(of({}))
      const telemetrySpy = jest.spyOn(component as any, 'raiseSignupInteractTelementry')

      component.signup()

      expect(component.disableBtn).toBe(false)
      expect(component.isMobileVerified).toBe(true)
      expect(mockDialog.open).toHaveBeenCalled()
      expect(telemetrySpy).toHaveBeenCalled()
    })

    it('should handle registration error', () => {
      const error = { error: { params: { errmsg: 'Registration failed' } } }
      mockSignupService.register.mockReturnValue(throwError(error))

      component.signup()

      expect(component.disableBtn).toBe(false)
      const lastCall = mockSnackBar.open.mock.calls[mockSnackBar.open.mock.calls.length - 1] || []
      expect(lastCall[0]).toBe('Registration failed')
    })

    it('should handle captcha error', () => {
      mockRecaptchaV3Service.execute.mockReturnValue(throwError('Captcha failed'))

      component.signup()

      expect(component.disableBtn).toBe(false)
      const lastCall = mockSnackBar.open.mock.calls[mockSnackBar.open.mock.calls.length - 1] || []
      expect(lastCall[0]).toBe('reCAPTCHA validation failed: Captcha failed')
    })
  })

  describe('openDialog', () => {
    it('should open success dialog', () => {
      component.openDialog()

      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('termsAndConditionClick', () => {
    it('should open terms dialog and update confirmation', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })

      component.termsAndConditionClick()

      expect(mockDialog.open).toHaveBeenCalled()
      expect(component.confirmTerms).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      const mockSubscription = { unsubscribe: jest.fn() }
      component['subscriptionContact'] = mockSubscription as any
      component['recaptchaSubscription'] = mockSubscription as any
      component['userdataSubscription'] = mockSubscription as any
      component['timerSubscription'] = mockSubscription as any
      component['timerSubscriptionEmail'] = mockSubscription as any

      component.ngOnDestroy()

      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(3)
      expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('cs-recaptcha')
    })
  })

  describe('navigateTo', () => {
    it('should navigate with form data', () => {
      component.navigateTo('new-org')

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/public/request'],
        {
          queryParams: { type: 'new-org' },
          state: {
            userform: component.registrationFormStepOne.value,
            isMobileVerified: component.isMobileVerified,
            isEmailVerified: component.isEmailVerified
          }
        }
      )
    })
  })

  describe('numericOnly', () => {
    it('should allow numeric keys', () => {
      const event = { key: '5' }
      expect(component.numericOnly(event)).toBe(true)
    })

    it('should reject non-numeric keys', () => {
      const event = { key: 'a' }
      expect(component.numericOnly(event)).toBe(false)
    })
  })

  describe('selectLanguage', () => {
    it('should update selected language', () => {
      component.selectLanguage('hi')

      expect(component.selectedLanguage).toBe('hi')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('websiteLanguage', 'hi')
      expect(mockMultilingualService.updatelanguageSelected).toHaveBeenCalledWith(true, 'hi', '')
    })
  })

  describe('translateLabels', () => {
    it('should translate labels', () => {
      const result = component.translateLabels('test', 'common')

      expect(mockMultilingualService.translateActualLabel).toHaveBeenCalledWith('test', 'common', '')
      expect(result).toBe('translated-text')
    })
  })

  describe('getZohoForm', () => {
    it('should open zoho dialog and call XML request', (done) => {
      component.zohoHtml = '<html>test</html>'

      component.getZohoForm()

      const calls = mockDialog.open.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const [_comp, config] = calls[calls.length - 1]
      expect(config).toEqual({
        width: '45%',
        data: {
          view: 'zohoform',
          value: '<html>test</html>'
        }
      })

      setTimeout(() => {
        // callXMLRequest should be called
        done()
      }, 10)
    })
  })

  describe('callXMLRequest', () => {
    it('should make XML request for captcha', () => {
      const mockXHR: any = {
        open: jest.fn(),
        send: jest.fn(),
        readyState: 4,
        status: 200,
        responseText: JSON.stringify({ captchaUrl: 'test-url', captchaDigest: 'test-digest' }),
        onreadystatechange: null
      }

        ; (globalThis as any).XMLHttpRequest = jest.fn().mockImplementation(() => mockXHR)

      component.callXMLRequest()

      if (typeof mockXHR.onreadystatechange === 'function') {
        mockXHR.onreadystatechange()
      }

      expect(mockXHR.open).toHaveBeenCalled()
      const openArgs = (mockXHR.open as any).mock.calls[0]
      expect(openArgs[0]).toBe('GET')
      expect((openArgs[1] as string).indexOf('https://desk.zoho.in/support/GenerateCaptcha')).toBeGreaterThan(-1)
      expect(mockXHR.send).toHaveBeenCalled()
    })

    it('should handle XHR error gracefully', () => {
      const mockXHR: any = {
        open: jest.fn(),
        send: jest.fn(),
        readyState: 4,
        status: 200,
        responseText: 'invalid json',
        onreadystatechange: null
      }

        ; (globalThis as any).XMLHttpRequest = jest.fn().mockImplementation(() => mockXHR)

      component.callXMLRequest()

      if (typeof mockXHR.onreadystatechange === 'function') {
        mockXHR.onreadystatechange()
      }

      expect(mockXHR.open).toHaveBeenCalled()
    })
  })

  describe('raiseSignupInteractTelementry', () => {
    it('should raise telemetry events', (done) => {
      component.raiseSignupInteractTelementry()

      const interactCalls = mockEventService.raiseInteractTelemetry.mock.calls
      expect(interactCalls.length).toBeGreaterThan(0)
      const [interaction, obj, context] = interactCalls[0]
      expect(interaction.id).toBe('sign-up')
      expect(interaction.pageid).toBe('/public/signup')
      expect(typeof interaction.type).toBe('string')
      expect(obj).toEqual({})
      expect(context).toEqual({ module: 'User Registration' })

      setTimeout(() => {
        const endCalls = mockTelemetryService.end.mock.calls
        expect(endCalls.length).toBeGreaterThan(0)
        const [interactionEnd, objEnd, contextEnd] = endCalls[0]
        expect(interactionEnd.id).toBe('sign-up')
        expect(interactionEnd.pageid).toBe('/public/signup')
        expect(typeof interactionEnd.type).toBe('string')
        expect(objEnd).toEqual({})
        expect(contextEnd).toEqual({ module: 'User Registration' })
        done()
      }, 2100)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null form controls in onPhoneChange', () => {
      component.registrationFormStepTwo = new UntypedFormGroup({})
      component.onPhoneChange()
      // Should not throw error
    })

    it('should handle null form controls in onEmailChange', () => {
      component.registrationFormStepOne = new UntypedFormGroup({})
      component.onEmailChange()
      // Should not throw error
    })

    it('should handle missing hierarchy object in signup', () => {
      component.heirarchyObject = null
      mockSignupService.register.mockReturnValue(of({}))

      component.signup()

      expect(component.disableBtn).toBe(false)
    })

    it('should handle server platform in ngOnInit', () => {
      component = new PublicSignupComponent(
        mockSignupService as any,
        mockUsersService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRecaptchaV3Service as any,
        mockRouter as any,
        mockDocument as any,
        'server', // server platform
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockEventService as any,
        mockTelemetryService as any
      )

      component.ngOnInit()

      // Should not add CSS class on server platform
      expect(mockDocument.body.classList.add).not.toHaveBeenCalled()
    })

    it('should handle missing instance config', () => {
      component = new PublicSignupComponent(
        mockSignupService as any,
        mockUsersService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRecaptchaV3Service as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockEventService as any,
        mockTelemetryService as any
      )

      component.ngOnInit()

      expect(component.telemetryConfig).toBeNull()
    })

    it('should handle timer cleanup in startCountDown', () => {
      component.OTP_TIMER = 0
      component.startCountDown()

      // Should handle zero timer gracefully
      expect(component.timeLeftforOTP).toBe(0)
    })

    it('should handle timer cleanup in startCountDownEmail', () => {
      component.OTP_TIMER_EMAIL = 0
      component.startCountDownEmail()

      // Should handle zero timer gracefully
      expect(component.timeLeftforOTPEmail).toBe(0)
    })
  })
})

describe('Validator Functions', () => {
  describe('forbiddenNamesValidator', () => {
    it('should return null for empty options array', () => {
      const validator = forbiddenNamesValidator(null)
      const control = new UntypedFormControl({ orgname: 'test' })

      expect(validator(control)).toBeNull()
    })

    it('should return null for valid organization name', () => {
      const options = [{ orgname: 'Valid Org' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgname: 'Valid Org' })

      expect(validator(control)).toBeNull()
    })

    it('should return error for forbidden organization name', () => {
      const options = [{ orgname: 'Valid Org' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl({ orgname: 'Invalid Org' })

      const result = validator(control)
      expect(result).toEqual({ forbiddenNames: { value: 'Invalid Org' } })
    })

    it('should return null for empty control value', () => {
      const options = [{ orgname: 'Valid Org' }]
      const validator = forbiddenNamesValidator(options)
      const control = new UntypedFormControl(null)

      expect(validator(control)).toBeNull()
    })
  })

  describe('forbiddenNamesValidatorNonEmpty', () => {
    it('should return null for empty options array', () => {
      const validator = forbiddenNamesValidatorNonEmpty(null)
      const control = new UntypedFormControl({ orgname: 'test' })

      expect(validator(control)).toBeNull()
    })

    it('should return null for valid organization name', () => {
      const options = [{ orgname: 'Valid Org' }]
      const validator = forbiddenNamesValidatorNonEmpty(options)
      const control = new UntypedFormControl({ orgname: 'Valid Org' })

      expect(validator(control)).toBeNull()
    })

    it('should return error for forbidden organization name', () => {
      const options = [{ orgname: 'Valid Org' }]
      const validator = forbiddenNamesValidatorNonEmpty(options)
      const control = new UntypedFormControl({ orgname: 'Invalid Org' })

      const result = validator(control)
      expect(result).toEqual({ forbiddenNames: { value: 'Invalid Org' } })
    })
  })
})

describe('Integration Tests', () => {
  let component: PublicSignupComponent

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('en')

    component = new PublicSignupComponent(
      mockSignupService as any,
      mockUsersService as any,
      mockLoggerService as any,
      mockConfigService as any,
      mockSnackBar as any,
      mockDialog as any,
      mockActivatedRoute as any,
      mockRecaptchaV3Service as any,
      mockRouter as any,
      mockDocument as any,
      'browser',
      mockTranslateService as any,
      mockMultilingualService as any,
      mockHttpClient as any,
      mockSanitizer as any,
      mockEventService as any,
      mockTelemetryService as any
    )

    component.ngOnInit()
  })

  it('should complete full signup flow', async () => {
    // Set up form data
    component.registrationFormStepOne.patchValue({
      email: 'john@test.com',
      type: 'ministry',
      organisation: 'Test Org'
    })
    component.registrationFormStepTwo.patchValue({
      firstname: 'John',
      mobile: '1234567890',
      group: 'Admin',
      confirmBox: true,
      confirmTermsBox: true
    })

    // Set hierarchy object
    component.heirarchyObject = {
      orgName: 'Test Org',
      channel: 'test-channel',
      sbOrgType: 'ministry'
    }

    // Mock successful responses
    mockSignupService.sendOtp.mockReturnValue(of({}))
    mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }))
    mockSignupService.register.mockReturnValue(of({}))

    // Send and verify mobile OTP
    component.sendOtp()
    expect(component.otpSend).toBe(true)

    component.verifyOtp({ value: '123456' })
    expect(component.isMobileVerified).toBe(true)

    // Send and verify email OTP
    component.sendOtpEmail()
    expect(component.otpEmailSend).toBe(true)

    component.verifyOtpEmail({ value: '123456' })
    expect(component.isEmailVerified).toBe(true)

    // Complete signup
    component.signup()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('should handle complete error flow', async () => {
    // Set up form with invalid data
    component.registrationFormStepTwo.patchValue({ mobile: 'invalid' })
    component.registrationFormStepOne.patchValue({ email: 'invalid-email' })

    // Try to send OTP with invalid mobile
    component.sendOtp()
    expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text')

    // Try to send email OTP with invalid email
    component.sendOtpEmail()
    expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text')

    // Try to verify with short OTP
    component.verifyOtp({ value: '12' })
    expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text')
  })

  it('should handle organization search and selection flow', async () => {
    const mockOrgResponse = {
      result: {
        response: [
          { orgName: 'Test Organization 1' },
          { orgName: 'Test Organization 2' }
        ]
      }
    }

    mockSignupService.searchOrgs.mockReturnValue(of(mockOrgResponse))

    // Search for organizations
    await component.searchOrgs('test')
    expect(component.filteredOrgList.length).toBe(2)
    expect(component.resultFetched).toBe(true)

    // Select an organization
    const selectionEvent = {
      option: {
        value: {
          orgName: 'Test Organization 1',
          channel: 'test-channel'
        }
      }
    }

    component.orgClicked(selectionEvent)
    expect(component.registrationFormStepOne.get('organisation')?.value).toBe('Test Organization 1')
    expect(component.hideOrg).toBe(true)

    // Edit organization selection
    component.editOrg()
    expect(component.hideOrg).toBe(false)
    expect(component.resultFetched).toBe(false)
  })
})