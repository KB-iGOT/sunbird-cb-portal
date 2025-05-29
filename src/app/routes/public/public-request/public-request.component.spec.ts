import { PublicRequestComponent, forbiddenNamesValidatorPosition } from './public-request.component';
import { UntypedFormControl } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';

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

const mockSignupService = {
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

const mockRequestService = {
  sendOtp: jest.fn(),
  resendOtp: jest.fn(),
  createPosition: jest.fn(),
  createOrg: jest.fn(),
  createDomain: jest.fn()
};

const mockLocation = {
  back: jest.fn()
};

const mockConfigService = {
  instanceConfig: {
    isMultilingualEnabled: true,
    websitelanguages: ['en', 'hi']
  }
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockMultilingualTranslationsService = {
  updatelanguageSelected: jest.fn(),
  translateLabel: jest.fn(),
  translateActualLabel: jest.fn().mockReturnValue('Translated Text')
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock UUID
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123'
}));

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    resendOTPTIme: 60000
  }
}));

describe('PublicRequestComponent', () => {
  let component: PublicRequestComponent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default localStorage mock
    localStorageMock.getItem.mockReturnValue('en');
    
    // Setup router navigation mock
    mockRouter.getCurrentNavigation.mockReturnValue({
      extras: {
        state: {
          userform: {
            firstname: 'John',
            email: 'john@example.com',
            mobile: '9876543210'
          },
          isMobileVerified: false,
          isEmailVerified: false
        }
      }
    });

    component = new PublicRequestComponent(
      mockActivatedRoute as any,
      mockRouter as any,
      mockSnackBar as any,
      mockSignupService as any,
      mockDialog as any,
      mockRequestService as any,
      mockLocation as any,
      mockConfigService as any,
      mockMultilingualTranslationsService as any,
      mockTranslateService as any
    );
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeDefined();
    });

    it('should initialize form with correct validators based on request type', () => {
      expect(component.requestForm).toBeDefined();
      expect(component.requestType).toBe('Position');
      expect(component.requestForm.get('firstname')?.hasError('required')).toBeTruthy();
      expect(component.requestForm.get('position')?.hasError('required')).toBeTruthy();
    });

    it('should patch form values from userform if available', () => {
      expect(component.requestForm.get('firstname')?.value).toBe('John');
      expect(component.requestForm.get('email')?.value).toBe('john@example.com');
      expect(component.requestForm.get('mobile')?.value).toBe('9876543210');
    });

    it('should set language from localStorage', () => {
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslateService.use).toHaveBeenCalledWith('en');
    });
  });

  describe('ngOnInit', () => {
    it('should set multiLang from instanceConfig', () => {
      component.ngOnInit();
      expect(component.multiLang).toEqual(['en', 'hi']);
    });
  });

  describe('Form Validation', () => {
    it('should validate name pattern', () => {
      const nameControl = component.requestForm.get('firstname');
      nameControl?.setValue('123Invalid');
      expect(nameControl?.hasError('pattern')).toBeTruthy();
      
      nameControl?.setValue('Valid Name');
      expect(nameControl?.hasError('pattern')).toBeFalsy();
    });

    it('should validate email pattern', () => {
      const emailControl = component.requestForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('pattern')).toBeTruthy();
      
      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('pattern')).toBeFalsy();
    });

    it('should validate mobile pattern', () => {
      const mobileControl = component.requestForm.get('mobile');
      mobileControl?.setValue('123');
      expect(mobileControl?.hasError('pattern')).toBeTruthy();
      
      mobileControl?.setValue('9876543210');
      expect(mobileControl?.hasError('pattern')).toBeFalsy();
    });
  });

  describe('Email Verification', () => {
    it('should detect email length validation', () => {
      const longUsername = 'a'.repeat(65);
      component.emailVerification(`${longUsername}@example.com`);
      expect(component.emailLengthVal).toBeTruthy();
      
      component.emailVerification('valid@example.com');
      expect(component.emailLengthVal).toBeFalsy();
    });
  });

  describe('Domain Modification', () => {
    it('should remove @ from domain name', () => {
      const result = component.modifyDomain('@example.com');
      expect(result).toBe('example.com');
    });

    it('should return domain as is if no @ present', () => {
      const result = component.modifyDomain('example.com');
      expect(result).toBe('example.com');
    });
  });

  describe('OTP Functionality', () => {
    describe('Mobile OTP', () => {
      beforeEach(() => {
        component.requestForm.get('mobile')?.setValue('9876543210');
        jest.spyOn(component, 'startCountDown').mockImplementation();
      });

      it('should send OTP successfully', () => {
        mockSignupService.sendOtp.mockReturnValue(of({}));
        jest.spyOn(window, 'alert').mockImplementation();
        
        component.sendOtp();
        
        expect(mockSignupService.sendOtp).toHaveBeenCalledWith('9876543210', 'phone');
        expect(component.otpSend).toBeTruthy();
        expect(window.alert).toHaveBeenCalled();
        expect(component.startCountDown).toHaveBeenCalled();
      });

      it('should handle OTP send error', () => {
        const error = { error: { params: { errmsg: 'Error message' } } };
        mockSignupService.sendOtp.mockReturnValue(throwError(error));
        
        component.sendOtp();
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('Error message');
      });

      it('should verify OTP successfully', () => {
        const otpControl = { value: '1234' };
        mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
        
        component.verifyOtp(otpControl);
        
        expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('1234', '9876543210', 'phone');
        expect(component.otpVerified).toBeTruthy();
        expect(component.isMobileVerified).toBeTruthy();
      });

      it('should handle invalid OTP length', () => {
        const otpControl = { value: '12' };
        
        component.verifyOtp(otpControl);
        
        expect(mockSnackBar.open).toHaveBeenCalled();
      });
    });

    describe('Email OTP', () => {
      beforeEach(() => {
        component.requestForm.get('email')?.setValue('test@example.com');
        jest.spyOn(component, 'startCountDownEmail').mockImplementation();
      });

      it('should send email OTP successfully', () => {
        mockRequestService.sendOtp.mockReturnValue(of({}));
        jest.spyOn(window, 'alert').mockImplementation();
        
        component.sendOtpEmail();
        
        expect(mockRequestService.sendOtp).toHaveBeenCalledWith('test@example.com', 'email');
        expect(component.otpEmailSend).toBeTruthy();
        expect(window.alert).toHaveBeenCalled();
      });

      it('should verify email OTP successfully', () => {
        const otpControl = { value: '1234' };
        mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
        
        component.verifyOtpEmail(otpControl);
        
        expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('1234', 'test@example.com', 'email');
        expect(component.isEmailVerified).toBeTruthy();
      });
    });
  });

  describe('Form Changes Tracking', () => {
    it('should reset mobile verification on mobile change', () => {
      const mockValueChanges = new Subject();
      jest.spyOn(component.requestForm.get('mobile')!, 'valueChanges', 'get')
        .mockReturnValue(mockValueChanges.asObservable());
      
      component.isMobileVerified = true;
      component.onPhoneChange();
      
      mockValueChanges.next('new-value');
      
      expect(component.isMobileVerified).toBeFalsy();
    });

    it('should reset email verification on email change', () => {
      const mockValueChanges = new Subject();
      jest.spyOn(component.requestForm.get('email')!, 'valueChanges', 'get')
        .mockReturnValue(mockValueChanges.asObservable());
      
      component.isEmailVerified = true;
      component.onEmailChange();
      
      mockValueChanges.next('new-value');
      
      expect(component.isEmailVerified).toBeFalsy();
    });
  });

  describe('Request Submission', () => {
    beforeEach(() => {
      component.requestForm.patchValue({
        firstname: 'John',
        email: 'john@example.com',
        mobile: '9876543210',
        position: 'Developer',
        addDetails: 'Additional details'
      });
      jest.spyOn(component, 'openDialog').mockImplementation();
      jest.spyOn(component, 'clearForm').mockImplementation();
    });

    it('should submit position request successfully', () => {
      component.requestType = 'Position';
      mockRequestService.createPosition.mockReturnValue(of({ success: true }));
      
      component.submitRequest();
      
      expect(mockRequestService.createPosition).toHaveBeenCalled();
      expect(component.openDialog).toHaveBeenCalledWith('Position', { success: true });
      expect(component.clearForm).toHaveBeenCalled();
    });

    it('should submit organisation request successfully', () => {
      component.requestType = 'Organisation';
      component.requestForm.patchValue({ organisation: 'Test Org' });
      mockRequestService.createOrg.mockReturnValue(of({ success: true }));
      
      component.submitRequest();
      
      expect(mockRequestService.createOrg).toHaveBeenCalled();
      expect(component.openDialog).toHaveBeenCalledWith('Organisation', { success: true });
    });

    it('should submit domain request successfully', () => {
      component.requestType = 'Domain';
      component.requestForm.patchValue({ domain: '@example.com' });
      mockRequestService.createDomain.mockReturnValue(of({ success: true }));
      
      component.submitRequest();
      
      expect(mockRequestService.createDomain).toHaveBeenCalled();
      expect(component.openDialog).toHaveBeenCalledWith('Domain', { success: true });
    });

    // it('should handle request submission error', () => {
    //   component.requestType = 'Position';
    //   const error = { error: { params: { errmsg: 'Request failed' } } };
    //   mockRequestService.createPosition.mockReturnValue(throwError(error));
    //   jest.spyOn(component, 'openSnackbar').mockImplementation();
      
    //   component.submitRequest();
      
    //   expect(component.openSnackbar).toHaveBeenCalledWith('Request failed');
    // });
  });

  describe('Utility Methods', () => {
    it('should toggle confirm state', () => {
      component.confirm = false;
      component.confirmChange();
      expect(component.confirm).toBeTruthy();
      expect(component.requestForm.get('confirmBox')?.value).toBeTruthy();
    });

    it('should clear form', () => {
      component.requestForm.patchValue({ firstname: 'Test' });
      jest.spyOn(component.requestForm, 'reset');
      
      component.clearForm();
      
      expect(component.requestForm.reset).toHaveBeenCalled();
    });

    it('should validate numeric input', () => {
      expect(component.numericOnly({ key: '1' })).toBeTruthy();
      expect(component.numericOnly({ key: 'a' })).toBeFalsy();
    });

    it('should select language', () => {
      component.selectLanguage('hi');
      
      expect(component.selectedLanguage).toBe('hi');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('websiteLanguage', 'hi');
      expect(mockMultilingualTranslationsService.updatelanguageSelected)
        .toHaveBeenCalledWith(true, 'hi', '');
    });

    it('should go back with form data', () => {
      component.requestForm.patchValue({
        firstname: 'John',
        mobile: '9876543210',
        email: 'john@example.com'
      });
      
      component.goBackUrl();
      
      expect(mockSignupService.updateSignUpData).toHaveBeenCalledWith({
        firstname: 'John',
        mobile: '9876543210',
        email: 'john@example.com',
        isMobileVerified: component.isMobileVerified,
        isEmailVerified: component.isEmailVerified
      });
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('Translation Methods', () => {
    it('should translate label', () => {
     // const result = component.translateLabel('test', 'common');
      expect(mockMultilingualTranslationsService.translateLabel)
        .toHaveBeenCalledWith('test', 'common', '');
    });

    it('should translate labels', () => {
      const result = component.translateLabels('test', 'common');
      expect(result).toBe('Translated Text');
      expect(mockMultilingualTranslationsService.translateActualLabel)
        .toHaveBeenCalledWith('test', 'common', '');
    });
  });
});

describe('forbiddenNamesValidatorPosition', () => {
  it('should return null when optionsArray is not provided', () => {
    const validator = forbiddenNamesValidatorPosition(null);
    const control = new UntypedFormControl({ name: 'test' });
    
    const result = validator(control);
    
    expect(result).toBeNull();
  });

  it('should return validation error when name is forbidden', () => {
    const optionsArray = [{ name: 'forbidden' }];
    const validator = forbiddenNamesValidatorPosition(optionsArray);
    const control = new UntypedFormControl({ name: 'forbidden' });
    
    const result = validator(control);
    
    expect(result).toEqual({ forbiddenNames: { value: 'forbidden' } });
  });

  it('should return null when name is allowed', () => {
    const optionsArray = [{ name: 'forbidden' }];
    const validator = forbiddenNamesValidatorPosition(optionsArray);
    const control = new UntypedFormControl({ name: 'allowed' });
    
    const result = validator(control);
    
    expect(result).toBeNull();
  });
});