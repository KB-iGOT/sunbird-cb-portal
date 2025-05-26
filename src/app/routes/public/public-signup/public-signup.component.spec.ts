import { PublicSignupComponent, forbiddenNamesValidator, forbiddenNamesValidatorNonEmpty } from './public-signup.component';
import { UntypedFormControl} from '@angular/forms';
import { of, throwError } from 'rxjs';

// Mock dependencies
const mockSignupService = {
  updateSignupDataObservable: of({}),
  searchOrgs: jest.fn(),
  sendOtp: jest.fn(),
  resendOtp: jest.fn(),
  verifyOTP: jest.fn(),
  register: jest.fn()
};

const mockLoggerService = {
  error: jest.fn()
};

const mockConfigService = {
  instanceConfig: {
    telemetryConfig: {
      pdata: { id: 'test-portal' }
    },
    isMultilingualEnabled: true,
    websitelanguages: ['en', 'hi']
  }
};

const mockSnackBar = {
  open: jest.fn()
};

const mockDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: () => of(true)
  })
};

const mockActivatedRoute = {
  snapshot: {
    data: {
      positions: { data: [{ name: 'Manager' }, { name: 'Developer' }] },
      group: { data: ['Group1', 'Group2', 'Others'] }
    }
  }
};

const mockRecaptchaV3Service = {
  execute: jest.fn().mockReturnValue(of('test-token'))
};

const mockRouter = {
  navigate: jest.fn()
};

const mockDocument = {
  body: {
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  },
  getElementById: jest.fn(),
  getElementsByName: jest.fn()
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockLangTranslationsService = {
  updatelanguageSelected: jest.fn(),
  translateActualLabel: jest.fn().mockReturnValue('translated-text')
};

const mockHttpClient = {
  get: jest.fn().mockReturnValue(of('<html>test</html>'))
};

const mockSanitizer = {
  bypassSecurityTrustHtml: jest.fn().mockReturnValue('sanitized-html')
};

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
};

const mockTelemetryService = {
  end: jest.fn()
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock XMLHttpRequest
const mockXMLHttpRequest = {
  open: jest.fn(),
  send: jest.fn(),
  onreadystatechange: null,
  readyState: 4,
  status: 200,
  responseText: '{"captchaUrl": "test-url", "captchaDigest": "test-digest"}'
};
(global as any).XMLHttpRequest = jest.fn(() => mockXMLHttpRequest);

describe('PublicSignupComponent', () => {
  let component: PublicSignupComponent;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('en');
    
    component = new PublicSignupComponent(
      mockSignupService as any,
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
      mockLangTranslationsService as any,
      mockHttpClient as any,
      mockSanitizer as any,
      mockEventService as any,
      mockTelemetryService as any
    );
  });

  describe('Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeDefined();
    });

    it('should initialize form with correct structure', () => {
    //  expect(component.registrationForm).toBeInstanceOf(UntypedFormGroup);
      expect(component.registrationForm.get('firstname')).toBeDefined();
      expect(component.registrationForm.get('email')).toBeDefined();
      expect(component.registrationForm.get('mobile')).toBeDefined();
      expect(component.registrationForm.get('organisation')).toBeDefined();
    });

    it('should set default language', () => {
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    });

    it('should initialize with saved language from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('hi');
      component = new PublicSignupComponent(
        mockSignupService as any,
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
        mockLangTranslationsService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockEventService as any,
        mockTelemetryService as any
      );
      expect(component.selectedLanguage).toBe('hi');
    });
  });

  describe('ngOnInit', () => {
    it('should initialize component properties', () => {
      component.ngOnInit();
      
      expect(component.positionsOriginal).toEqual([]);
      expect(component.groupsOriginal).toEqual(['Group1', 'Group2']);
      expect(component.portalID).toBe('test-portal');
    });

    it('should fetch HTML content for Zoho form', () => {
      component.ngOnInit();
      
      expect(mockHttpClient.get).toHaveBeenCalledWith(component.zohoUrl, { responseType: 'text' });
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<html>test</html>');
    });
  });

  describe('Form Validation', () => {
    it('should validate firstname with correct pattern', () => {
      const control = component.registrationForm.get('firstname');
      
      control?.setValue('John Doe');
      expect(control?.valid).toBe(true);
      
      control?.setValue('John123');
      expect(control?.valid).toBe(false);
    });

    it('should validate email format', () => {
      const control = component.registrationForm.get('email');
      
      control?.setValue('test@example.com');
      expect(control?.valid).toBe(true);
      
      control?.setValue('invalid-email');
      expect(control?.valid).toBe(false);
    });

    it('should validate mobile number format', () => {
      const control = component.registrationForm.get('mobile');
      
      control?.setValue('9876543210');
      expect(control?.valid).toBe(true);
      
      control?.setValue('123');
      expect(control?.valid).toBe(false);
    });
  });

  describe('Email Verification', () => {
    it('should detect email length validation error', () => {
      const longEmail = 'a'.repeat(65) + '@' + 'b'.repeat(256) + '.com';
      component.emailVerification(longEmail);
      
      expect(component.emailLengthVal).toBe(true);
    });

    it('should pass email length validation for valid email', () => {
      component.emailVerification('test@example.com');
      
      expect(component.emailLengthVal).toBe(false);
    });
  });

  describe('OTP Functionality', () => {
    beforeEach(() => {
      component.registrationForm.patchValue({
        mobile: '9876543210',
        email: 'test@example.com'
      });
    });

    it('should send OTP for mobile', () => {
      mockSignupService.sendOtp.mockReturnValue(of({ result: 'success' }));
      global.alert = jest.fn();
      
      component.sendOtp();
      
      expect(mockSignupService.sendOtp).toHaveBeenCalledWith('9876543210', 'phone');
      expect(component.otpSend).toBe(true);
      expect(global.alert).toHaveBeenCalled();
    });

    it('should handle OTP send error', () => {
      mockSignupService.sendOtp.mockReturnValue(throwError({ error: { params: { errmsg: 'Error' } } }));
      
      component.sendOtp();
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error');
    });

    it('should verify OTP successfully', () => {
      mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
      const otpInput = { value: '1234' };
      
      component.verifyOtp(otpInput);
      
      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('1234', '9876543210', 'phone');
      expect(component.isMobileVerified).toBe(true);
      expect(component.otpVerified).toBe(true);
    });

    it('should handle invalid OTP', () => {
      const otpInput = { value: '12' };
      
      component.verifyOtp(otpInput);
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text');
    });

    it('should send email OTP', () => {
      mockSignupService.sendOtp.mockReturnValue(of({ result: 'success' }));
      global.alert = jest.fn();
      
      component.sendOtpEmail();
      
      expect(mockSignupService.sendOtp).toHaveBeenCalledWith('test@example.com', 'email');
      expect(component.otpEmailSend).toBe(true);
    });

    it('should verify email OTP', () => {
      mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
      const otpInput = { value: '1234' };
      
      component.verifyOtpEmail(otpInput);
      
      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('1234', 'test@example.com', 'email');
      expect(component.isEmailVerified).toBe(true);
    });
  });

  describe('Organization Search', () => {
    it('should search organizations', async () => {
      const mockOrgs = {
        result: {
          response: [
            { orgName: 'Test Organization', channel: 'test-channel' }
          ]
        }
      };
      mockSignupService.searchOrgs.mockReturnValue(of(mockOrgs));
      
      await component.searchOrgs('test');
      
      expect(mockSignupService.searchOrgs).toHaveBeenCalledWith('test', 'ministry');
      expect(component.filteredOrgList).toEqual(mockOrgs.result.response);
      expect(component.resultFetched).toBe(true);
    });

    it('should handle organization search error', async () => {
      mockSignupService.searchOrgs.mockReturnValue(throwError({ error: { params: { errmsg: 'Search error' } } }));
      
      await component.searchOrgs('test');
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('Search error');
    });

    it('should handle empty search value', async () => {
      await component.searchOrgs('');
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('translated-text');
      expect(component.searching).toBe(false);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.registrationForm.patchValue({
        firstname: 'John',
        email: 'john@example.com',
        mobile: '9876543210',
        group: 'Group1',
        type: 'ministry',
        organisation: 'Test Org',
        confirmBox: true,
        confirmTermsBox: true
      });
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgType: 'ministry',
        sbOrgSubType: 'department',
        mapId: 'map123',
        sbRootOrgId: 'root123',
        sbOrgId: 'org123'
      };
    });

    it('should register user successfully', () => {
      mockSignupService.register.mockReturnValue(of({ result: 'success' }));
      
      component.signup();
      
      expect(mockRecaptchaV3Service.execute).toHaveBeenCalledWith('importantAction');
      expect(component.disableBtn).toBe(true);
    });

    it('should handle registration error', () => {
      mockRecaptchaV3Service.execute.mockReturnValue(of('token'));
      mockSignupService.register.mockReturnValue(throwError({ error: { params: { errmsg: 'Registration error' } } }));
      
      component.signup();
      
      // Simulate the subscription callback
      const tokenSubscription = mockRecaptchaV3Service.execute('importantAction');
      tokenSubscription.subscribe(() => {
        expect(mockSnackBar.open).toHaveBeenCalledWith('Registration error');
        expect(component.disableBtn).toBe(false);
      });
    });
  });

  describe('Utility Methods', () => {
    it('should toggle confirm checkbox', () => {
      component.confirm = false;
      component.confirmChange();
      
      expect(component.confirm).toBe(true);
      expect(component.registrationForm.get('confirmBox')?.value).toBe(true);
    });

    it('should toggle terms confirmation', () => {
      component.confirmTerms = false;
      component.confirmTermsChange();
      
      expect(component.confirmTerms).toBe(true);
      expect(component.registrationForm.get('confirmTermsBox')?.value).toBe(true);
    });

    it('should validate numeric input', () => {
      const numericEvent = { key: '5' };
      const alphaEvent = { key: 'a' };
      
      expect(component.numericOnly(numericEvent)).toBe(true);
      expect(component.numericOnly(alphaEvent)).toBe(false);
    });

    it('should select language', () => {
      component.selectLanguage('hi');
      
      expect(component.selectedLanguage).toBe('hi');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('websiteLanguage', 'hi');
      expect(mockLangTranslationsService.updatelanguageSelected).toHaveBeenCalledWith(true, 'hi', '');
    });

    it('should navigate with parameters', () => {
      const formData = { firstname: 'John' };
      component.registrationForm.patchValue(formData);
      component.isMobileVerified = true;
      component.isEmailVerified = true;
      
      component.navigateTo('test');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/public/request'],
        {
          queryParams: { type: 'test' },
          state: {
            userform: true,
            isMobileVerified: true,
            isEmailVerified: true
          }
        }
      );
    });
  });

  describe('Dialog Methods', () => {
    it('should open terms and conditions dialog', () => {
      component.termsAndConditionClick();
      
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should open success dialog', () => {
      component.openDialog();
      
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should open Zoho form dialog', () => {
      component.getZohoForm();
      
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      const mockSubscription = {
        unsubscribe: jest.fn(),
        closed: false,
        add: jest.fn(),
        remove: jest.fn()
      } as any;
      
      component['subscriptionContact'] = mockSubscription;
      component['recaptchaSubscription'] = mockSubscription;
      component['userdataSubscription'] = mockSubscription;
      
      component.ngOnDestroy();
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(3);
    });
  });

  describe('Telemetry', () => {
    it('should raise signup telemetry', () => {
      jest.useFakeTimers();
      
      component.raiseSignupInteractTelementry();
      
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
      
      jest.advanceTimersByTime(2000);
      
      expect(mockTelemetryService.end).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Timer Functions', () => {
    it('should start countdown timer', () => {
      jest.useFakeTimers();
      
      component.startCountDown();
      
      expect(component.timeLeftforOTP).toBe(component.OTP_TIMER);
      
      jest.advanceTimersByTime(1000);
      
      expect(component.timeLeftforOTP).toBeLessThan(component.OTP_TIMER);
      
      jest.useRealTimers();
    });

    it('should start email countdown timer', () => {
      jest.useFakeTimers();
      
      component.startCountDownEmail();
      
      expect(component.timeLeftforOTPEmail).toBe(component.OTP_TIMER_EMAIL);
      
      jest.advanceTimersByTime(1000);
      
      expect(component.timeLeftforOTPEmail).toBeLessThan(component.OTP_TIMER_EMAIL);
      
      jest.useRealTimers();
    });
  });
});

// Test custom validators
describe('Custom Validators', () => {
  describe('forbiddenNamesValidator', () => {
    it('should return null for valid organization name', () => {
      const optionsArray = [{ orgname: 'Existing Org' }];
      const validator = forbiddenNamesValidator(optionsArray);
      const control = new UntypedFormControl({ orgname: 'New Org' });
      
      expect(validator(control)).toBeNull();
    });

    it('should return error for forbidden organization name', () => {
      const optionsArray = [{ orgname: 'Existing Org' }];
      const validator = forbiddenNamesValidator(optionsArray);
      const control = new UntypedFormControl({ orgname: 'Existing Org' });
      
      const result = validator(control);
      expect(result).toEqual({ forbiddenNames: { value: 'Existing Org' } });
    });

    it('should return null when no options array provided', () => {
      const validator = forbiddenNamesValidator(null);
      const control = new UntypedFormControl({ orgname: 'Any Org' });
      
      expect(validator(control)).toBeNull();
    });

    it('should return null when control value is null', () => {
      const optionsArray = [{ orgname: 'Existing Org' }];
      const validator = forbiddenNamesValidator(optionsArray);
      const control = new UntypedFormControl(null);
      
      expect(validator(control)).toBeNull();
    });
  });

  describe('forbiddenNamesValidatorNonEmpty', () => {
    it('should return null for valid organization name', () => {
      const optionsArray = [{ orgname: 'Existing Org' }];
      const validator = forbiddenNamesValidatorNonEmpty(optionsArray);
      const control = new UntypedFormControl({ orgname: 'New Org' });
      
      expect(validator(control)).toBeNull();
    });

    it('should return error for forbidden organization name', () => {
      const optionsArray = [{ orgname: 'Existing Org' }];
      const validator = forbiddenNamesValidatorNonEmpty(optionsArray);
      const control = new UntypedFormControl({ orgname: 'Existing Org' });
      
      const result = validator(control);
      expect(result).toEqual({ forbiddenNames: { value: 'Existing Org' } });
    });
  });
});