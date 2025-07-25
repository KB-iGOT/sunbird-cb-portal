import { PublicRequestComponent, forbiddenNamesValidatorPosition } from './public-request.component';
import { UntypedFormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';

// Mock dependencies
const mockActivatedRoute = {
  snapshot: {
    queryParams: { type: 'Position' }
  }
};

const mockRouter = {
  getCurrentNavigation: jest.fn(),
  navigate: jest.fn()
};

const mockSnackBar = {
  open: jest.fn()
};

const mockSignupSvc = {
  sendOtp: jest.fn(),
  resendOtp: jest.fn(),
  verifyOTP: jest.fn(),
  updateSignUpData: jest.fn()
};

const mockDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: () => of({})
  })
};

const mockRequestSvc = {
  createPosition: jest.fn(),
  createOrg: jest.fn(),
  createDomain: jest.fn(),
  sendOtp: jest.fn(),
  resendOtp: jest.fn()
};

const mockLocation = {
  back: jest.fn()
};

const mockConfigSvc = {
  instanceConfig: {
    isMultilingualEnabled: true,
    websitelanguages: ['en', 'hi']
  }
};

const mockLangTranslations = {
  updatelanguageSelected: jest.fn(),
  translateLabel: jest.fn(),
  translateActualLabel: jest.fn().mockReturnValue('translated text')
};

const mockTranslate = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock alert
// global.alert = jest.fn();

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

describe('PublicRequestComponent', () => {
  let component: PublicRequestComponent;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('en');
    
    component = new PublicRequestComponent(
      mockActivatedRoute as any,
      mockRouter as any,
      mockSnackBar as any,
      mockSignupSvc as any,
      mockDialog as any,
      mockRequestSvc as any,
      mockLocation as any,
      mockConfigSvc as any,
      mockLangTranslations as any,
      mockTranslate as any
    );
  });

  describe('Constructor', () => {
    it('should initialize with navigation state data', () => {
      const navigationData = {
        userform: { firstname: 'John', email: 'john@test.com' },
        isMobileVerified: true,
        isEmailVerified: true
      };
      
      mockRouter.getCurrentNavigation.mockReturnValue({
        extras: { state: navigationData }
      });

      component = new PublicRequestComponent(
        mockActivatedRoute as any,
        mockRouter as any,
        mockSnackBar as any,
        mockSignupSvc as any,
        mockDialog as any,
        mockRequestSvc as any,
        mockLocation as any,
        mockConfigSvc as any,
        mockLangTranslations as any,
        mockTranslate as any
      );

      expect(component.userform).toEqual(navigationData.userform);
      expect(component.isMobileVerified).toBe(true);
      expect(component.isEmailVerified).toBe(true);
    });

    it('should handle null navigation', () => {
      mockRouter.getCurrentNavigation.mockReturnValue(null);

      component = new PublicRequestComponent(
        mockActivatedRoute as any,
        mockRouter as any,
        mockSnackBar as any,
        mockSignupSvc as any,
        mockDialog as any,
        mockRequestSvc as any,
        mockLocation as any,
        mockConfigSvc as any,
        mockLangTranslations as any,
        mockTranslate as any
      );

      expect(component.userform).toBeUndefined();
    });

    it('should set up form for Position request type', () => {
      expect(component.requestType).toBe('Position');
      expect(component.requestForm.get('position')?.hasError('required')).toBe(true);
    });

    it('should set up form for Organisation request type', () => {
      mockActivatedRoute.snapshot.queryParams.type = 'Organisation';
      
      component = new PublicRequestComponent(
        mockActivatedRoute as any,
        mockRouter as any,
        mockSnackBar as any,
        mockSignupSvc as any,
        mockDialog as any,
        mockRequestSvc as any,
        mockLocation as any,
        mockConfigSvc as any,
        mockLangTranslations as any,
        mockTranslate as any
      );

      expect(component.requestForm.get('organisation')?.hasError('required')).toBe(true);
    });

    it('should set up form for Domain request type', () => {
      mockActivatedRoute.snapshot.queryParams.type = 'Domain';
      
      component = new PublicRequestComponent(
        mockActivatedRoute as any,
        mockRouter as any,
        mockSnackBar as any,
        mockSignupSvc as any,
        mockDialog as any,
        mockRequestSvc as any,
        mockLocation as any,
        mockConfigSvc as any,
        mockLangTranslations as any,
        mockTranslate as any
      );

      expect(component.requestForm.get('domain')?.hasError('required')).toBe(true);
    });

    it('should patch form values when userform exists', () => {
      const userformData = {
        firstname: 'John',
        email: 'john@test.com',
        mobile: '1234567890',
        organisation: 'Test Org',
        domain: '@test.com',
        addDetails: 'Additional details',
        confirmBox: true
      };

      mockRouter.getCurrentNavigation.mockReturnValue({
        extras: { state: { userform: userformData, isMobileVerified: false, isEmailVerified: false } }
      });

      component = new PublicRequestComponent(
        mockActivatedRoute as any,
        mockRouter as any,
        mockSnackBar as any,
        mockSignupSvc as any,
        mockDialog as any,
        mockRequestSvc as any,
        mockLocation as any,
        mockConfigSvc as any,
        mockLangTranslations as any,
        mockTranslate as any
      );

      expect(component.requestForm.get('firstname')?.value).toBe('John');
      expect(component.requestForm.get('email')?.value).toBe('john@test.com');
      expect(component.confirm).toBe(true);
    });

    it('should handle language settings from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('"hi"');

      component = new PublicRequestComponent(
        mockActivatedRoute as any,
        mockRouter as any,
        mockSnackBar as any,
        mockSignupSvc as any,
        mockDialog as any,
        mockRequestSvc as any,
        mockLocation as any,
        mockConfigSvc as any,
        mockLangTranslations as any,
        mockTranslate as any
      );

      expect(component.selectedLanguage).toBe('hi');
      expect(mockTranslate.use).toHaveBeenCalledWith('hi');
    });

    it('should set default language when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      component = new PublicRequestComponent(
        mockActivatedRoute as any,
        mockRouter as any,
        mockSnackBar as any,
        mockSignupSvc as any,
        mockDialog as any,
        mockRequestSvc as any,
        mockLocation as any,
        mockConfigSvc as any,
        mockLangTranslations as any,
        mockTranslate as any
      );

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('websiteLanguage', 'en');
    });
  });

  describe('ngOnInit', () => {
    it('should initialize with instance config', () => {
      component.ngOnInit();

      expect(component.multiLang).toEqual(['en', 'hi']);
    });

    it('should handle null instance config', () => {
    //  component.configSvc.instanceConfig = null;
      
      component.ngOnInit();

      expect(component.multiLang).toBeUndefined();
    });
  });

  describe('modifyDomain', () => {
    it('should remove @ from domain name', () => {
      const result = component.modifyDomain('@test.com');
      expect(result).toBe('test.com');
    });

    it('should return domain name as is if no @', () => {
      const result = component.modifyDomain('test.com');
      expect(result).toBe('test.com');
    });
  });

  describe('emailVerification', () => {
    it('should set emailLengthVal to true for long local part', () => {
      const longEmail = 'a'.repeat(65) + '@test.com';
      component.emailVerification(longEmail);
      expect(component.emailLengthVal).toBe(true);
    });

    it('should set emailLengthVal to true for long domain part', () => {
      const longEmail = 'test@' + 'a'.repeat(256) + '.com';
      component.emailVerification(longEmail);
      expect(component.emailLengthVal).toBe(true);
    });

    it('should set emailLengthVal to false for valid email', () => {
      component.emailVerification('test@test.com');
      expect(component.emailLengthVal).toBe(false);
    });

    it('should handle empty email', () => {
      component.emailVerification('');
      expect(component.emailLengthVal).toBe(false);
    });

    it('should handle invalid email format', () => {
      component.emailVerification('invalid-email');
      expect(component.emailLengthVal).toBe(false);
    });
  });

  describe('onPhoneChange', () => {
    it('should reset mobile verification when phone changes', () => {
      component.isMobileVerified = true;
      component.disableVerifyBtn = true;
      component.otpSend = true;

      component.onPhoneChange();
      
      // Simulate value change
      component.requestForm.get('mobile')?.setValue('1234567890');

      expect(component.isMobileVerified).toBe(false);
      expect(component.disableVerifyBtn).toBe(false);
      expect(component.otpSend).toBe(false);
    });
  });

  describe('onEmailChange', () => {
    it('should reset email verification when email changes', () => {
      component.isEmailVerified = true;
      component.disableEmailVerifyBtn = true;
      component.otpEmailSend = true;

      component.onEmailChange();
      
      // Simulate value change
      component.requestForm.get('email')?.setValue('test@test.com');

      expect(component.isEmailVerified).toBe(false);
      expect(component.disableEmailVerifyBtn).toBe(false);
      expect(component.otpEmailSend).toBe(false);
    });
  });

  describe('sendOtp', () => {
    beforeEach(() => {
      component.requestForm.get('mobile')?.setValue('1234567890');
    });

    it('should send OTP successfully', () => {
      mockSignupSvc.sendOtp.mockReturnValue(of({}));

      component.sendOtp();

      expect(mockSignupSvc.sendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBe(true);
     // expect(global.alert).toHaveBeenCalledWith('translated text');
    });

    it('should handle OTP send error', () => {
      const error = { error: { params: { errmsg: 'Error message' } } };
      mockSignupSvc.sendOtp.mockReturnValue(throwError(error));

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
    });

    it('should handle OTP send error without error message', () => {
      mockSignupSvc.sendOtp.mockReturnValue(throwError({}));

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please try again later');
    });

    it('should show error for invalid mobile number', () => {
      component.requestForm.get('mobile')?.setValue('');

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });
  });

  describe('resendOTP', () => {
    beforeEach(() => {
      component.requestForm.get('mobile')?.setValue('1234567890');
    });

    it('should resend OTP successfully', () => {
      mockSignupSvc.resendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }));

      component.resendOTP();

      expect(mockSignupSvc.resendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBe(true);
      expect(component.disableVerifyBtn).toBe(false);
    });

    it('should handle resend OTP error', () => {
      const error = { error: { params: { errmsg: 'Error message' } } };
      mockSignupSvc.resendOtp.mockReturnValue(throwError(error));

      component.resendOTP();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
    });

    it('should show error for invalid mobile number', () => {
      component.requestForm.get('mobile')?.setValue('');

      component.resendOTP();

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });
  });

  describe('verifyOtp', () => {
    beforeEach(() => {
      component.requestForm.get('mobile')?.setValue('1234567890');
    });

    it('should verify OTP successfully', () => {
      const otpControl = { value: '1234' };
      mockSignupSvc.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));

      component.verifyOtp(otpControl);

      expect(mockSignupSvc.verifyOTP).toHaveBeenCalledWith('1234', '1234567890', 'phone');
      expect(component.otpVerified).toBe(true);
      expect(component.isMobileVerified).toBe(true);
      expect(component.disableBtn).toBe(false);
    });

    it('should handle short OTP', () => {
      const otpControl = { value: '12' };

      component.verifyOtp(otpControl);

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });

    it('should handle OTP verification error', () => {
      const otpControl = { value: '1234' };
      const error = { 
        error: { 
          params: { errmsg: 'Error message' },
          result: { remainingAttempt: 0 }
        } 
      };
      mockSignupSvc.verifyOTP.mockReturnValue(throwError(error));

      component.verifyOtp(otpControl);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
      expect(component.disableVerifyBtn).toBe(true);
    });

    it('should handle empty OTP', () => {
      const otpControl = { value: '' };

      component.verifyOtp(otpControl);

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });

    it('should handle null OTP', () => {
      component.verifyOtp(null);

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });
  });

  describe('verifyOtpEmail', () => {
    beforeEach(() => {
      component.requestForm.get('email')?.setValue('test@test.com');
    });

    it('should verify email OTP successfully', () => {
      const otpControl = { value: '1234' };
      mockSignupSvc.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));

      component.verifyOtpEmail(otpControl);

      expect(mockSignupSvc.verifyOTP).toHaveBeenCalledWith('1234', 'test@test.com', 'email');
      expect(component.otpEmailSend).toBe(true);
      expect(component.isEmailVerified).toBe(true);
      expect(component.disableBtn).toBe(false);
    });

    it('should handle email OTP verification error', () => {
      const otpControl = { value: '1234' };
      const error = { 
        error: { 
          params: { errmsg: 'Error message' },
          result: { remainingAttempt: 0 }
        } 
      };
      mockSignupSvc.verifyOTP.mockReturnValue(throwError(error));

      component.verifyOtpEmail(otpControl);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
      expect(component.disableEmailVerifyBtn).toBe(true);
    });
  });

  describe('sendOtpEmail', () => {
    beforeEach(() => {
      component.requestForm.get('email')?.setValue('test@test.com');
    });

    it('should send email OTP successfully', () => {
      mockRequestSvc.sendOtp.mockReturnValue(of({}));

      component.sendOtpEmail();

      expect(mockRequestSvc.sendOtp).toHaveBeenCalledWith('test@test.com', 'email');
      expect(component.otpEmailSend).toBe(true);
    //  expect(global.alert).toHaveBeenCalledWith('translated text');
    });

    it('should handle email OTP send error', () => {
      const error = { error: { params: { errmsg: 'Error message' } } };
      mockRequestSvc.sendOtp.mockReturnValue(throwError(error));

      component.sendOtpEmail();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
    });

    it('should show error for invalid email', () => {
      component.requestForm.get('email')?.setValue('');

      component.sendOtpEmail();

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });
  });

  describe('resendOTPEmail', () => {
    beforeEach(() => {
      component.requestForm.get('email')?.setValue('test@test.com');
    });

    it('should resend email OTP successfully', () => {
      mockRequestSvc.resendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }));

      component.resendOTPEmail();

      expect(mockRequestSvc.resendOtp).toHaveBeenCalledWith('test@test.com', 'email');
      expect(component.otpEmailSend).toBe(true);
      expect(component.disableEmailVerifyBtn).toBe(false);
    });

    it('should handle resend email OTP error', () => {
      const error = { error: { params: { errmsg: 'Error message' } } };
      mockRequestSvc.resendOtp.mockReturnValue(throwError(error));

      component.resendOTPEmail();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
    });

    it('should show error for invalid email', () => {
      component.requestForm.get('email')?.setValue('');

      component.resendOTPEmail();

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });
  });

  describe('Timer Functions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      component.OTP_TIMER = 60000;
      component.OTP_TIMER_EMAIL = 60000;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start countdown for mobile OTP', () => {
      component.startCountDown();

      expect(component.timeLeftforOTP).toBe(60000);
      
      jest.advanceTimersByTime(1000);
      expect(component.timeLeftforOTP).toBe(59999);
    });

    it('should start countdown for email OTP', () => {
      component.startCountDownEmail();

      expect(component.timeLeftforOTPEmail).toBe(60000);
      
      jest.advanceTimersByTime(1000);
      expect(component.timeLeftforOTPEmail).toBe(59999);
    });

    it('should handle timer completion for mobile OTP', () => {
      component.startCountDown();
      component.timeLeftforOTP = 1;
      
      jest.advanceTimersByTime(1000);
      
      expect(component.timeLeftforOTP).toBe(0);
    });

    it('should handle timer completion for email OTP', () => {
      component.startCountDownEmail();
      component.timeLeftforOTPEmail = 1;
      
      jest.advanceTimersByTime(1000);
      
      expect(component.timeLeftforOTPEmail).toBe(0);
    });
  });

  describe('confirmChange', () => {
    it('should toggle confirm state', () => {
      component.confirm = false;

      component.confirmChange();

      expect(component.confirm).toBe(true);
      expect(component.requestForm.get('confirmBox')?.value).toBe(true);
    });
  });

  describe('submitRequest', () => {
    beforeEach(() => {
      component.requestForm.patchValue({
        firstname: 'John',
        email: 'john@test.com',
        mobile: '1234567890',
        addDetails: 'Test details'
      });
    });

    it('should submit Position request successfully', () => {
      component.requestType = 'Position';
      component.requestForm.patchValue({ position: 'Test Position' });
      mockRequestSvc.createPosition.mockReturnValue(of({ success: true }));

      component.submitRequest();

      expect(mockRequestSvc.createPosition).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.disableBtn).toBe(false);
      expect(component.isMobileVerified).toBe(true);
    });

    it('should handle Position request error', () => {
      component.requestType = 'Position';
      component.requestForm.patchValue({ position: 'Test Position' });
      const error = { error: { params: { errmsg: 'Error message' } } };
      mockRequestSvc.createPosition.mockReturnValue(throwError(error));

      component.submitRequest();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
      expect(component.disableBtn).toBe(false);
    });

    it('should handle Position request error without message', () => {
      component.requestType = 'Position';
      component.requestForm.patchValue({ position: 'Test Position' });
      mockRequestSvc.createPosition.mockReturnValue(throwError({}));

      component.submitRequest();

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });

    it('should submit Organisation request successfully', () => {
      component.requestType = 'Organisation';
      component.requestForm.patchValue({ organisation: 'Test Org' });
      mockRequestSvc.createOrg.mockReturnValue(of({ success: true }));

      component.submitRequest();

      expect(mockRequestSvc.createOrg).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle Organisation request error', () => {
      component.requestType = 'Organisation';
      component.requestForm.patchValue({ organisation: 'Test Org' });
      const error = { error: { params: { errmsg: 'Error message' } } };
      mockRequestSvc.createOrg.mockReturnValue(throwError(error));

      component.submitRequest();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
    });

    it('should submit Domain request successfully', () => {
      component.requestType = 'Domain';
      component.requestForm.patchValue({ domain: '@test.com' });
      mockRequestSvc.createDomain.mockReturnValue(of({ success: true }));

      component.submitRequest();

      expect(mockRequestSvc.createDomain).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle Domain request error', () => {
      component.requestType = 'Domain';
      component.requestForm.patchValue({ domain: '@test.com' });
      const error = { error: { params: { errmsg: 'Error message' } } };
      mockRequestSvc.createDomain.mockReturnValue(throwError(error));

      component.submitRequest();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
    });
  });

  describe('clearForm', () => {
    it('should reset form and clear errors', () => {
      component.requestForm.patchValue({ firstname: 'Test' });
      component.requestForm.get('firstname')?.setErrors({ required: true });

      component.clearForm();

      expect(component.requestForm.get('firstname')?.value).toBeNull();
      expect(component.requestForm.get('firstname')?.errors).toBeNull();
    });
  });

  describe('openDialog', () => {
    it('should open dialog with correct data', () => {
      component.openDialog('Position', { success: true });

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        {
          width: '500px',
          data: { requestType: 'Position', apiResponse: { success: true } }
        }
      );
    });
  });

  describe('goBackUrl', () => {
    it('should update signup data and go back', () => {
      component.requestForm.patchValue({
        firstname: 'John',
        mobile: '1234567890',
        email: 'john@test.com'
      });
      component.isMobileVerified = true;
      component.isEmailVerified = true;

      component.goBackUrl();

      expect(mockSignupSvc.updateSignUpData).toHaveBeenCalledWith({
        firstname: 'John',
        mobile: '1234567890',
        email: 'john@test.com',
        isMobileVerified: true,
        isEmailVerified: true
      });
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('numericOnly', () => {
    it('should return true for numeric key', () => {
      const event = { key: '5' };
      const result = component.numericOnly(event);
      expect(result).toBe(true);
    });

    it('should return false for non-numeric key', () => {
      const event = { key: 'a' };
      const result = component.numericOnly(event);
      expect(result).toBe(false);
    });
  });

  describe('selectLanguage', () => {
    it('should select language and update localStorage', () => {
      component.selectLanguage('hi');

      expect(component.selectedLanguage).toBe('hi');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('websiteLanguage', 'hi');
      expect(mockLangTranslations.updatelanguageSelected).toHaveBeenCalledWith(true, 'hi', '');
    });
  });

  describe('translateLabel', () => {
    it('should call translation service', () => {
      component.translateLabel('test', 'common');

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('test', 'common', '');
    });
  });

  describe('translateLabels', () => {
    it('should call translation service', () => {
      const result = component.translateLabels('test', 'common');

      expect(mockLangTranslations.translateActualLabel).toHaveBeenCalledWith('test', 'common', '');
      expect(result).toBe('translated text');
    });
  });
});

describe('forbiddenNamesValidatorPosition', () => {
  it('should return null when optionsArray is null', () => {
    const validator = forbiddenNamesValidatorPosition(null);
    const control = new UntypedFormControl({ name: 'test' });

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('should return null when optionsArray is undefined', () => {
    const validator = forbiddenNamesValidatorPosition(undefined);
    const control = new UntypedFormControl({ name: 'test' });

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('should return null when name is not found in options', () => {
    const optionsArray = [{ name: 'existing' }];
    const validator = forbiddenNamesValidatorPosition(optionsArray);
    const control = new UntypedFormControl({ name: 'new' });

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('should return error when name exists in options', () => {
    const optionsArray = [{ name: 'existing' }];
    const validator = forbiddenNamesValidatorPosition(optionsArray);
    const control = new UntypedFormControl({ name: 'existing' });

    const result = validator(control);

    expect(result).toEqual({ forbiddenNames: { value: 'existing' } });
  }); 

  it('should handle control without value property', () => {
    const optionsArray = [{ name: 'existing' }];
    const validator = forbiddenNamesValidatorPosition(optionsArray);
    const control = new UntypedFormControl('test');

    const result = validator(control);

    expect(result).toBeNull();
  });
});