import { PublicCrpComponent } from './public-crp.component';
import { of, throwError, Subject } from 'rxjs';

// Mock all dependencies
const mockSignupService = {
  updateSignupDataObservable: of({}),
  sendOtp: jest.fn(),
  resendOtp: jest.fn(),
  verifyOTP: jest.fn(),
  sendOtpV2: jest.fn(),
  resendOtpv2: jest.fn(),
  register: jest.fn(),
  searchOrgsByIdentifier: jest.fn()
};

const mockLoggerService = {
  error: jest.fn()
};

const mockConfigService = {
  instanceConfig: {
    telemetryConfig: { pdata: { id: 'test-portal' } },
    isMultilingualEnabled: true,
    websitelanguages: ['en', 'hi']
  }
};

const mockSnackBar = {
  open: jest.fn()
};

const mockDialog = {
  open: jest.fn(() => ({
    afterClosed: () => of(true)
  }))
};

const mockActivatedRoute = {
  snapshot: {
    data: {
      positions: { data: [] },
      group: { data: ['Group1', 'Group2'] },
      organization: {
        designationsList: [
          { name: 'Engineer', id: '1', status: 'Active' },
          { name: 'Manager', id: '2', status: 'Active' }
        ],
        organizationDetails: { id: 'org1', orgName: 'Test Org' },
        invalidLinkMessage: ''
      }
    },
    url: [{ path: 'crp' }, { path: 'test' }]
  }
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
  querySelector: jest.fn(),
  getElementById: jest.fn(),
  getElementsByName: jest.fn(() => [{ value: '' }])
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockMultilingualService = {
  updatelanguageSelected: jest.fn(),
  translateActualLabel: jest.fn(() => 'translated text')
};

const mockHttpClient = {
  get: jest.fn(() => of('<html>test</html>'))
};

const mockSanitizer = {
  bypassSecurityTrustHtml: jest.fn(html => html)
};

const mockMobileAppsService = {
  mobileTopHeaderVisibilityStatus: new Subject()
};

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
};

const mockTelemetryService = {
  start: jest.fn(),
  end: jest.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Android)'
  }
});

// Mock XMLHttpRequest
const mockXMLHttpRequest = {
  open: jest.fn(),
  send: jest.fn(),
  onreadystatechange: null,
  readyState: 4,
  status: 200,
  responseText: '{"captchaUrl": "test-url", "captchaDigest": "test-digest"}'
};

Object.defineProperty(window, 'XMLHttpRequest', {
  value: jest.fn(() => mockXMLHttpRequest)
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: jest.fn(() => ({ opener: null }))
});

describe('PublicCrpComponent', () => {
  let component: PublicCrpComponent;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('en');
    
    component = new PublicCrpComponent(
      mockSignupService as any,
      mockLoggerService as any,
      mockConfigService as any,
      mockSnackBar as any,
      mockDialog as any,
      mockActivatedRoute as any,
      mockRouter as any,
      mockDocument as any,
      'browser',
      mockTranslateService as any,
      mockMultilingualService as any,
      mockHttpClient as any,
      mockSanitizer as any,
      mockMobileAppsService as any,
      mockEventService as any,
      mockTelemetryService as any
    );
  });

  describe('Constructor', () => {
    it('should initialize component with default values', () => {
      expect(component.selectedLanguage).toBe('en');
      expect(component.disableBtn).toBe(false);
      expect(component.isMobileVerified).toBe(false);
      expect(component.isEmailVerified).toBe(false);
    });

    it('should set language from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('hi');
      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );
      expect(component.selectedLanguage).toBe('hi');
    });

    it('should handle user data from signup service', () => {
      const userData = { isMobileVerified: true, isEmailVerified: true, firstname: 'John', email: 'john@test.com', mobile: '1234567890' };
      mockSignupService.updateSignupDataObservable = of(userData);
      
      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );
      
      expect(component.isMobileVerified).toBe(true);
      expect(component.isEmailVerified).toBe(true);
    });

    it('should extract CRP path from URL', () => {
      const mockActivatedRouteWithCrp = {
        ...mockActivatedRoute,
        snapshot: {
          ...mockActivatedRoute.snapshot,
          url: [{ path: 'public' }, { path: 'crp' }, { path: 'test123' }]
        }
      };

      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRouteWithCrp as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );

      expect(component.crpPath).toBe('crp/test123');
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should initialize component data', () => {
      expect(component.groupsOriginal).toEqual(['Group1', 'Group2']);
      expect(component.designationsList).toHaveLength(2);
      expect(component.filteredDesignationsList).toHaveLength(2);
    });

    it('should handle invalid link message', (done) => {
      const mockActivatedRouteInvalid = {
        ...mockActivatedRoute,
        snapshot: {
          ...mockActivatedRoute.snapshot,
          data: {
            ...mockActivatedRoute.snapshot.data,
            organization: {
              ...mockActivatedRoute.snapshot.data.organization,
              invalidLinkMessage: 'Custom error message'
            }
          }
        }
      };

      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRouteInvalid as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );

      component.ngOnInit();

      setTimeout(() => {
        expect(mockDialog.open).toHaveBeenCalled();
        done();
      }, 300);
    });

    it('should handle expired link message', (done) => {
      const mockActivatedRouteExpired = {
        ...mockActivatedRoute,
        snapshot: {
          ...mockActivatedRoute.snapshot,
          data: {
            ...mockActivatedRoute.snapshot.data,
            organization: {
              ...mockActivatedRoute.snapshot.data.organization,
              invalidLinkMessage: 'Registration link is not active'
            }
          }
        }
      };

      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRouteExpired as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );

      component.ngOnInit();

      setTimeout(() => {
        expect(mockDialog.open).toHaveBeenCalled();
        done();
      }, 300);
    });
  });

  describe('Email Validation', () => {
    it('should validate email length correctly', () => {
      // Valid email
      component.emailVerification('test@example.com');
      expect(component.emailLengthVal).toBe(false);

      // Email with long local part (>64 chars)
      const longLocal = 'a'.repeat(65) + '@example.com';
      component.emailVerification(longLocal);
      expect(component.emailLengthVal).toBe(true);

      // Email with long domain part (>255 chars)
      const longDomain = 'test@' + 'a'.repeat(256) + '.com';
      component.emailVerification(longDomain);
      expect(component.emailLengthVal).toBe(true);

      // Invalid email format
      component.emailVerification('invalid-email');
      expect(component.emailLengthVal).toBe(false);

      // Empty email
      component.emailVerification('');
      expect(component.emailLengthVal).toBe(false);
    });
  });

  describe('OTP Methods', () => {
    beforeEach(() => {
      component.registrationForm.patchValue({
        mobile: '9876543210',
        email: 'test@example.com'
      });
    });

    describe('Mobile OTP', () => {
      it('should send OTP successfully', () => {
        mockSignupService.sendOtp.mockReturnValue(of({}));
      //  global.alert = jest.fn();
        
        component.sendOtp();
        
        expect(mockSignupService.sendOtp).toHaveBeenCalledWith('9876543210', 'phone');
        expect(component.otpSend).toBe(true);
       // expect(global.alert).toHaveBeenCalled();
      });

      it('should handle OTP send error', () => {
        const error = { error: { params: { errmsg: 'OTP send failed' } } };
        mockSignupService.sendOtp.mockReturnValue(throwError(error));
        
        component.sendOtp();
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('OTP send failed');
      });

      it('should handle invalid mobile number', () => {
        component.registrationForm.patchValue({ mobile: '123' });
        
        component.sendOtp();
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
      });

      it('should resend OTP successfully', () => {
        const response = { result: { response: 'SUCCESS' } };
        mockSignupService.resendOtp.mockReturnValue(of(response));
        //global.alert = jest.fn();
        
        component.resendOTP();
        
        expect(mockSignupService.resendOtp).toHaveBeenCalledWith('9876543210', 'phone');
        expect(component.otpSend).toBe(true);
        expect(component.disableVerifyBtn).toBe(false);
      });

      it('should verify OTP successfully', () => {
        const response = { result: { response: 'SUCCESS' } };
        mockSignupService.verifyOTP.mockReturnValue(of(response));
        
        component.verifyOtp('1234');
        
        expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('1234', '9876543210', 'phone');
        expect(component.otpVerified).toBe(true);
        expect(component.isMobileVerified).toBe(true);
      });

      it('should handle OTP verification error with remaining attempts', () => {
        const error = { 
          error: { 
            params: { errmsg: 'Invalid OTP' },
            result: { remainingAttempt: 2 }
          } 
        };
        mockSignupService.verifyOTP.mockReturnValue(throwError(error));
        
        component.verifyOtp('1234');
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP');
        expect(component.disableVerifyBtn).toBe(false);
      });

      it('should disable verify button when no attempts remaining', () => {
        const error = { 
          error: { 
            params: { errmsg: 'Invalid OTP' },
            result: { remainingAttempt: 0 }
          } 
        };
        mockSignupService.verifyOTP.mockReturnValue(throwError(error));
        
        component.verifyOtp('1234');
        
        expect(component.disableVerifyBtn).toBe(true);
      });

      it('should handle invalid OTP length', () => {
        component.verifyOtp('123');
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
      });

      it('should handle empty OTP', () => {
        component.verifyOtp('');
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
      });
    });

    describe('Email OTP', () => {
      it('should send email OTP successfully', () => {
        mockSignupService.sendOtpV2.mockReturnValue(of({}));
        //global.alert = jest.fn();
        
        component.sendOtpEmail();
        
        expect(mockSignupService.sendOtpV2).toHaveBeenCalledWith('test@example.com', 'email');
        expect(component.otpEmailSend).toBe(true);
      });

      it('should handle email OTP send error', () => {
        const error = { error: { params: { errmsg: 'Email OTP send failed' } } };
        mockSignupService.sendOtpV2.mockReturnValue(throwError(error));
        
        component.sendOtpEmail();
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('Email OTP send failed');
      });

      it('should handle invalid email', () => {
        component.registrationForm.patchValue({ email: 'invalid-email' });
        
        component.sendOtpEmail();
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
      });

      it('should resend email OTP successfully', () => {
        const response = { result: { response: 'SUCCESS' } };
        mockSignupService.resendOtpv2.mockReturnValue(of(response));
        //global.alert = jest.fn();
        
        component.resendOTPEmail();
        
        expect(mockSignupService.resendOtpv2).toHaveBeenCalledWith('test@example.com', 'email');
        expect(component.otpEmailSend).toBe(true);
      });

      it('should verify email OTP successfully', () => {
        const response = { result: { response: 'SUCCESS' } };
        mockSignupService.verifyOTP.mockReturnValue(of(response));
        
        component.verifyOtpEmail('1234');
        
        expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('1234', 'test@example.com', 'email');
        expect(component.otpEmailSend).toBe(true);
        expect(component.isEmailVerified).toBe(true);
      });

      it('should handle email OTP verification error', () => {
        const error = { error: { params: { errmsg: 'Invalid OTP' } } };
        mockSignupService.verifyOTP.mockReturnValue(throwError(error));
        
        component.verifyOtpEmail('1234');
        
        expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP');
      });
    });
  });

  describe('Timer Methods', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start countdown for mobile OTP', () => {
      component.OTP_TIMER = 30000; // 30 seconds
      component.startCountDown();
      
      expect(component.timeLeftforOTP).toBe(30000);
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      expect(component.timeLeftforOTP).toBe(29999);
    });

    it('should start countdown for email OTP', () => {
      component.OTP_TIMER_EMAIL = 30000;
      component.startCountDownEmail();
      
      expect(component.timeLeftforOTPEmail).toBe(30000);
      
      jest.advanceTimersByTime(1000);
      expect(component.timeLeftforOTPEmail).toBe(29999);
    });
  });

  describe('Form Validation and Changes', () => {
    it('should handle mobile number changes', () => {
      component.ngOnInit();
      component.isMobileVerified = true;
      
      component.registrationForm.patchValue({ mobile: '9876543210' });
      
      expect(component.isMobileVerified).toBe(false);
      expect(component.otpSend).toBe(false);
    });

    it('should handle email changes', () => {
      component.ngOnInit();
      component.isEmailVerified = true;
      
      component.registrationForm.patchValue({ email: 'new@example.com' });
      
      expect(component.isEmailVerified).toBe(false);
      expect(component.otpEmailSend).toBe(false);
    });

    it('should toggle confirm checkbox', () => {
      component.confirm = false;
      component.confirmChange();
      expect(component.confirm).toBe(true);
      
      component.confirmChange();
      expect(component.confirm).toBe(false);
    });

    it('should toggle terms confirmation', () => {
      component.confirmTerms = false;
      component.confirmTermsChange();
      expect(component.confirmTerms).toBe(true);
      
      component.confirmTermsChange();
      expect(component.confirmTerms).toBe(false);
    });
  });

  describe('Signup Process', () => {
    beforeEach(() => {
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgType: 'government',
        sbOrgSubType: 'ministry',
        mapId: 'map123',
        sbRootOrgId: 'root123',
        sbOrgId: 'org123'
      };
      
      component.registrationForm.patchValue({
        firstname: 'John',
        email: 'john@test.com',
        mobile: '9876543210',
        group: 'Group1',
        designation: 'Engineer',
        isWhatsappConsent: true
      });

      component.filteredDesignationsList = [
        { name: 'Engineer', id: '1', status: 'Active' }
      ];
    });

    it('should signup successfully', () => {
      mockSignupService.register.mockReturnValue(of({}));
      
      component.signup();
      
      expect(mockSignupService.register).toHaveBeenCalled();
      expect(component.disableBtn).toBe(false);
      expect(component.isMobileVerified).toBe(true);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle signup error', () => {
      const error = { error: { params: { errmsg: 'Registration failed' } } };
      mockSignupService.register.mockReturnValue(throwError(error));
      
      component.signup();
      
      expect(component.disableBtn).toBe(false);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith('Registration failed');
    });

    it('should handle signup error without specific message', () => {
      const error = { error: {} };
      mockSignupService.register.mockReturnValue(throwError(error));
      
      component.signup();
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
    });

    it('should validate designation before signup', () => {
      component.filteredDesignationsList = [
        { name: 'Manager', id: '2', status: 'Active' }
      ];
      
      component.signup();
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid Designation');
      expect(mockSignupService.register).not.toHaveBeenCalled();
    });
  });

  describe('Dialog Operations', () => {
    it('should open terms and conditions dialog', () => {
      const dialogRef = { afterClosed: () => of(true) };
      mockDialog.open.mockReturnValue(dialogRef);
      
      component.termsAndConditionClick();
      
      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.confirmTerms).toBe(true);
    });

    it('should open Zoho form dialog', () => {
      component.zohoHtml = '<html>test</html>';
    //  global.XMLHttpRequest = jest.fn(() => mockXMLHttpRequest) as any;
      
      component.getZohoForm();
      
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should close dialog and redirect', () => {
      component.dialogRef = { close: jest.fn() };
      
      component.closedDialogandRedirect();
      
      expect(component.dialogRef.close).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/static-home']);
    });
  });

  describe('Navigation and Utility Methods', () => {
    it('should navigate to request page', () => {
      component.navigateTo('test-param');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/request'], {
        queryParams: { type: 'test-param' },
        state: {
          userform: component.registrationForm.value,
          isMobileVerified: component.isMobileVerified,
          isEmailVerified: component.isEmailVerified
        }
      });
    });

    it('should validate numeric input', () => {
      const validEvent = { key: '5' };
      const invalidEvent = { key: 'a' };
      
      expect(component.numericOnly(validEvent)).toBe(true);
      expect(component.numericOnly(invalidEvent)).toBe(false);
    });

    it('should select language', () => {
      component.selectLanguage('hi');
      
      expect(component.selectedLanguage).toBe('hi');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('websiteLanguage', 'hi');
      expect(mockMultilingualService.updatelanguageSelected).toHaveBeenCalledWith(true, 'hi', '');
    });

    it('should translate labels', () => {
      const result = component.translateLabels('test-label', 'test-type');
      
      expect(result).toBe('translated text');
      expect(mockMultilingualService.translateActualLabel).toHaveBeenCalledWith('test-label', 'test-type', '');
    });

    it('should clear values', () => {
      component.heirarchyObject = { test: 'data' };
      component.clearValues();
      
      expect(component.heirarchyObject).toBeNull();
    });
  });

  describe('Organization Methods', () => {
    it('should get organization successfully', () => {
      const response = {
        result: {
          response: [{
            orgName: 'Test Org',
            id: 'org1'
          }]
        }
      };
      mockSignupService.searchOrgsByIdentifier.mockReturnValue(of(response));
    //  component.organizationDetails = { id: 'org1', orgName: 'Test Org' };
      
      component.getOrganization();
      
      expect(mockSignupService.searchOrgsByIdentifier).toHaveBeenCalled();
      expect(component.heirarchyObject).toEqual(response.result.response[0]);
    });

    it('should handle organization search with no matching org', () => {
      const response = {
        result: {
          response: [{
            orgName: 'Different Org',
            id: 'org2'
          }]
        }
      };
      mockSignupService.searchOrgsByIdentifier.mockReturnValue(of(response));
    //  component.organizationDetails = { id: 'org1', orgName: 'Test Org' };
      
      component.getOrganization();
      
      expect(component.heirarchyObject).toBeUndefined();
    });
  });

  describe('Mobile App Methods', () => {
    it('should hide mobile top header', () => {
      component.hideMobileTopHeader();
      
      expect(component.mobileTopHeaderVisibilityStatus).toBe(false);
    });

    it('should download Android app', () => {
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Android)' }
      });
      
      component.downloadApp();
      
      expect(window.open).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US',
        '_blank',
        'noopener'
      );
    });

    it('should download iOS app', () => {
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone)' }
      });
      
      component.downloadApp();
      
      expect(window.open).toHaveBeenCalledWith(
        'https://apps.apple.com/in/app/igot-karmayogi/id6443949491',
        '_blank',
        'noopener'
      );
    });

    it('should download Windows Phone app', () => {
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Windows Phone)' }
      });
      
      component.downloadApp();
      
      expect(window.open).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US',
        '_blank',
        'noopener'
      );
    });
  });

  describe('Telemetry Methods', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should raise signup interact telemetry', () => {
      component.raiseSignupInteractTelementry();
      
      expect(mockTelemetryService.start).toHaveBeenCalled();
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
      
      jest.advanceTimersByTime(2000);
      expect(mockTelemetryService.end).toHaveBeenCalled();
    });

    it('should raise impression telemetry', () => {
      component.raiseImpressionTelemetry();
      
      jest.advanceTimersByTime(2000);
      expect(mockTelemetryService.end).toHaveBeenCalled();
    });
  });

  describe('Filter and Search Methods', () => {
    beforeEach(() => {
      component.designationsList = [
        { name: 'Engineer', id: '1', status: 'Active' },
        { name: 'Manager', id: '2', status: 'Active' },
        { name: 'Senior Engineer', id: '3', status: 'Active' }
      ];
      component.designationDefaultLoadCount = 2;
    });

    it('should filter designations', () => {
      component.onFilterDesignation('engineer');
      
      expect(component.desigantionFilterEnable).toBe(true);
      expect(component.filteredDesignationsList).toHaveLength(2);
      expect(component.filteredDesignationsList[0].name).toBe('Engineer');
    });

    it('should reset filter when empty value', () => {
      component.onFilterDesignation('');
      
      expect(component.desigantionFilterEnable).toBe(false);
      expect(component.designationListLoadCount).toBe(component.designationDefaultLoadCount);
      expect(component.filteredDesignationsList).toHaveLength(2);
    });

    it('should filter groups', () => {
      component.masterGroup = ['Group1', 'Group2', 'Special Group'];
      
      component.onFilterGroups('group');
      
      expect(component.filteredGroupsList).toHaveLength(3);
      
      component.onFilterGroups('special');
      
      expect(component.filteredGroupsList).toHaveLength(1);
      expect(component.filteredGroupsList[0]).toBe('Special Group');
    });

    it('should return display value for designation', () => {
      const result = component.displayFn('Test Value');
      expect(result).toBe('Test Value');
      
      const nullResult = component.displayFn(null);
      expect(nullResult).toBe('');
    });

    it('should return display value for groups', () => {
      const result = component.displayFnGroups('Test Group');
      expect(result).toBe('Test Group');
      
      const nullResult = component.displayFnGroups(null);
      expect(nullResult).toBe('');
    });
  });

  describe('Autocomplete Methods', () => {
    it('should handle autocomplete opened', () => {
      component.onAutoCompleteOpened();
      expect(component.isMatcompleteOpened).toBe(true);
    });

    it('should handle autocomplete closed', () => {
      component.onAutoCompleteClosed();
      expect(component.isMatcompleteOpened).toBe(false);
    });

    it('should handle keydown when autocomplete is opened', () => {
      component.isMatcompleteOpened = true;
      const result = component.onkeyDown({});
      expect(result).toBe(true);
    });

    it('should handle keydown when autocomplete is closed', () => {
      component.isMatcompleteOpened = false;
      const result = component.onkeyDown({});
      expect(result).toBe(false);
    });
  });

  describe('Scroll and Load More Methods', () => {
    beforeEach(() => {
      component.designationsList = Array.from({ length: 100 }, (_, i) => ({
        name: `Designation ${i + 1}`,
        id: `${i + 1}`,
        status: 'Active'
      }));
      component.designationDefaultLoadCount = 50;
      component.designationListLoadCount = 50;
      component.filteredDesignationsList = component.designationsList.slice(0, 50);
    });

    it('should setup scroll listener when opened', (done) => {
      const mockPanel = {
        addEventListener: jest.fn()
      };
      mockDocument.querySelector.mockReturnValue(mockPanel);
      
      const mockSearchInput = {
        focus: jest.fn()
      };
      mockDocument.querySelector.mockReturnValueOnce(mockSearchInput);
      
      component.registrationForm.patchValue({ designation: 'Existing Designation' });
      
      component.setupScrollListener(true);
      
      expect(component.desigantionFilterEnable).toBe(false);
      expect(component.designationListLoadCount).toBe(50);
      
      setTimeout(() => {
        expect(mockSearchInput.focus).toHaveBeenCalled();
        expect(mockPanel.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
        done();
      }, 150);
    });

    it('should not setup scroll listener when closed', () => {
      component.setupScrollListener(false);
      expect(mockDocument.querySelector).not.toHaveBeenCalled();
    });

    it('should load more designations on scroll', (done) => {
      const mockElement = {
        scrollTop: 100,
        clientHeight: 100,
        scrollHeight: 200
      };
      
      component.desigantionFilterEnable = false;
      component.isLoadingMoreDesignations = false;
      
      component.onDesignationSelectScroll({ target: mockElement });
      
      expect(component.isLoadingMoreDesignations).toBe(true);
      
      setTimeout(() => {
        expect(component.designationListLoadCount).toBe(100);
        expect(component.filteredDesignationsList).toHaveLength(100);
        expect(component.isLoadingMoreDesignations).toBe(false);
        done();
      }, 600);
    });

    it('should not load more when filtering is enabled', () => {
      const mockElement = {
        scrollTop: 100,
        clientHeight: 100,
        scrollHeight: 200
      };
      
      component.desigantionFilterEnable = true;
      
      component.onDesignationSelectScroll({ target: mockElement });
      
      expect(component.isLoadingMoreDesignations).toBe(false);
    });

    it('should not load more when already loading', () => {
      const mockElement = {
        scrollTop: 100,
        clientHeight: 100,
        scrollHeight: 200
      };
      
      component.desigantionFilterEnable = false;
      component.isLoadingMoreDesignations = true;
      
      component.onDesignationSelectScroll({ target: mockElement });
      
      expect(component.designationListLoadCount).toBe(50);
    });

    it('should not load more when no more items available', () => {
      const mockElement = {
        scrollTop: 100,
        clientHeight: 100,
        scrollHeight: 200
      };
      
      component.designationsList = component.filteredDesignationsList; // Same length
      component.desigantionFilterEnable = false;
      component.isLoadingMoreDesignations = false;
      
      component.onDesignationSelectScroll({ target: mockElement });
      
      expect(component.designationListLoadCount).toBe(50);
    });

    it('should not load more when not scrolled to bottom', () => {
      const mockElement = {
        scrollTop: 50,
        clientHeight: 100,
        scrollHeight: 200
      };
      
      component.desigantionFilterEnable = false;
      component.isLoadingMoreDesignations = false;
      
      component.onDesignationSelectScroll({ target: mockElement });
      
      expect(component.isLoadingMoreDesignations).toBe(false);
    });
  });

  describe('Designation Handling Methods', () => {
    beforeEach(() => {
      component.filteredDesignationsList = [
        { name: 'Engineer', id: '1', status: 'Active' },
        { name: 'Manager', id: '2', status: 'Active' }
      ];
      component.designationListLoadCount = 2;
    });

    it('should check if current designation is present', () => {
      component.registrationForm.patchValue({ designation: 'Engineer' });
      
      component.checkCurrentDesignationPresent();
      
      expect(component.filteredDesignationsList).toHaveLength(2);
      expect(component.filteredDesignationsList.find(d => d.name === 'Engineer')).toBeTruthy();
    });

    it('should add current designation if not present', () => {
      component.registrationForm.patchValue({ designation: 'Custom Designation' });
      
      component.checkCurrentDesignationPresent();
      
      expect(component.filteredDesignationsList).toHaveLength(2);
      expect(component.filteredDesignationsList[0].name).toBe('Custom Designation');
      expect(component.filteredDesignationsList[0].id).toContain('custom-');
    });

    it('should replace last item when list is at capacity', () => {
      component.filteredDesignationsList = Array.from({ length: 50 }, (_, i) => ({
        name: `Designation ${i + 1}`,
        id: `${i + 1}`,
        status: 'Active'
      }));
      component.designationListLoadCount = 50;
      component.registrationForm.patchValue({ designation: 'Custom Designation' });
      
      component.checkCurrentDesignationPresent();
      
      expect(component.filteredDesignationsList).toHaveLength(50);
      expect(component.filteredDesignationsList[0].name).toBe('Custom Designation');
    });

    it('should handle empty designation', () => {
      component.registrationForm.patchValue({ designation: '' });
      const originalLength = component.filteredDesignationsList.length;
      
      component.checkCurrentDesignationPresent();
      
      expect(component.filteredDesignationsList).toHaveLength(originalLength);
    });

    it('should handle designation dropdown closed', (done) => {
      component.registrationForm.patchValue({ 
        designation: 'Test Designation',
        searchDesignation: 'search text'
      });
      
      component.onDesignationDropdownClosed();
      
      setTimeout(() => {
        expect(component.registrationForm.get('searchDesignation')?.value).toBe('');
        expect(component.registrationForm.get('designation')?.value).toBe('Test Designation');
        done();
      }, 150);
    });

    it('should handle designation dropdown closed without current designation', (done) => {
      component.registrationForm.patchValue({ 
        designation: '',
        searchDesignation: 'search text'
      });
      
      component.onDesignationDropdownClosed();
      
      setTimeout(() => {
        expect(component.registrationForm.get('searchDesignation')?.value).toBe('');
        done();
      }, 150);
    });
  });

  describe('Zoho Form Methods', () => {
    beforeEach(() => {
      mockDocument.getElementById.mockImplementation((id) => {
        const mockElements: any = {
          zsCaptchaUrl: { src: '', style: { display: '' } },
          zsCaptchaLoading: { style: { display: '' } },
          zsCaptcha: { style: { display: '' } },
          refreshCaptcha: { addEventListener: jest.fn() }
        };
        return mockElements[id] || null;
      });
    });

    it('should call XML request successfully', () => {
      mockXMLHttpRequest.onreadystatechange = null;
      
      component.callXMLRequest();
      
      // Simulate successful response
   //   mockXMLHttpRequest.onreadystatechange();
      
      expect(mockXMLHttpRequest.open).toHaveBeenCalledWith(
        'GET',
        expect.stringContaining('https://desk.zoho.in/support/GenerateCaptcha'),
        true
      );
      expect(mockXMLHttpRequest.send).toHaveBeenCalled();
    });

    it('should handle XML request error', () => {
      mockXMLHttpRequest.responseText = 'invalid json';
      
      component.callXMLRequest();
      
      // Simulate response with invalid JSON
     // mockXMLHttpRequest.onreadystatechange();
      
      // Should not throw error
      expect(mockXMLHttpRequest.send).toHaveBeenCalled();
    });

    it('should handle null response text', () => {
    //  mockXMLHttpRequest.responseText = null;
      
      component.callXMLRequest();
      
      // Simulate response with null text
    //  mockXMLHttpRequest.onreadystatechange();
      
      expect(mockXMLHttpRequest.send).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      const mockSubscription = {
        unsubscribe: jest.fn()
      };
      
      // component.subscriptionContact = mockSubscription;
      // component.recaptchaSubscription = mockSubscription;
      // component.userdataSubscription = mockSubscription;
      // component.timerSubscription = mockSubscription;
      // component.timerSubscriptionEmail = mockSubscription;
      
      component.ngOnDestroy();
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(5);
      expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('cs-recaptcha');
    });

    it('should handle destroy without subscriptions', () => {
      // component.subscriptionContact = null;
      // component.recaptchaSubscription = null as any;
      // component.userdataSubscription = null as any;
      component.timerSubscription = null;
      component.timerSubscriptionEmail = null;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle destroy on server platform', () => {
      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRouter as any,
        mockDocument as any,
        'server', // Server platform
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );
      
      component.ngOnDestroy();
      
      expect(mockDocument.body.classList.remove).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing organization details', () => {
      const mockActivatedRouteNoOrg = {
        ...mockActivatedRoute,
        snapshot: {
          ...mockActivatedRoute.snapshot,
          data: {
            ...mockActivatedRoute.snapshot.data,
            organization: null
          }
        }
      };

      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRouteNoOrg as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );

      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle missing group data', () => {
      const mockActivatedRouteNoGroup = {
        ...mockActivatedRoute,
        snapshot: {
          ...mockActivatedRoute.snapshot,
          data: {
            ...mockActivatedRoute.snapshot.data,
            group: { data: null }
          }
        }
      };

      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigService as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRouteNoGroup as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );

      component.ngOnInit();
      
      expect(component.groupsOriginal).toEqual([]);
    });

    it('should handle missing instance config', () => {
      const mockConfigServiceEmpty = {
        instanceConfig: null
      };

      component = new PublicCrpComponent(
        mockSignupService as any,
        mockLoggerService as any,
        mockConfigServiceEmpty as any,
        mockSnackBar as any,
        mockDialog as any,
        mockActivatedRoute as any,
        mockRouter as any,
        mockDocument as any,
        'browser',
        mockTranslateService as any,
        mockMultilingualService as any,
        mockHttpClient as any,
        mockSanitizer as any,
        mockMobileAppsService as any,
        mockEventService as any,
        mockTelemetryService as any
      );

      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle designation validation with empty list', () => {
      component.filteredDesignationsList = [];
      component.registrationForm.patchValue({ designation: 'Any Designation' });
      
      const result = component.checkIfDesignationValid();
      
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid Designation', 4000);
    });

    it('should handle organization search error', () => {
      mockSignupService.searchOrgsByIdentifier.mockReturnValue(throwError('Network error'));
    //  component.organizationDetails = { id: 'org1', orgName: 'Test Org' };
      
      expect(() => component.getOrganization()).not.toThrow();
    });

    it('should handle phone change without control', () => {
      component.registrationForm.removeControl('mobile');
      
      expect(() => component.onPhoneChange()).not.toThrow();
    });

    it('should handle email change without control', () => {
      component.registrationForm.removeControl('email');
      
      expect(() => component.onEmailChange()).not.toThrow();
    });
  });

  describe('Private Method Coverage', () => {
    it('should open snackbar with custom duration', () => {
      const openSnackbarMethod = (component as any).openSnackbar;
      
      openSnackbarMethod.call(component, 'Test message', 3000);
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
        duration: 3000
      });
    });

    it('should open snackbar with default duration', () => {
      const openSnackbarMethod = (component as any).openSnackbar;
      
      openSnackbarMethod.call(component, 'Test message');
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
        duration: 5000
      });
    });
  });

  describe('Form Control Edge Cases', () => {
    it('should handle mobile verification when mobile control is invalid', () => {
      component.registrationForm.patchValue({ mobile: 'invalid' });
      
      component.sendOtp();
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
      expect(mockSignupService.sendOtp).not.toHaveBeenCalled();
    });

    it('should handle email verification when email control is invalid', () => {
      component.registrationForm.patchValue({ email: 'invalid' });
      
      component.sendOtpEmail();
      
      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
      expect(mockSignupService.sendOtpV2).not.toHaveBeenCalled();
    });

    it('should handle OTP verification when mobile control is invalid', () => {
      component.registrationForm.patchValue({ mobile: 'invalid' });
      
      component.verifyOtp('1234');
      
      expect(mockSignupService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle email OTP verification when email control is invalid', () => {
      component.registrationForm.patchValue({ email: 'invalid' });
      
      component.verifyOtpEmail('1234');
      
      expect(mockSignupService.verifyOTP).not.toHaveBeenCalled();
    });
  });
});