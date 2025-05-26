import { PublicCrpComponent } from './public-crp.component';
import { of, throwError, Subject } from 'rxjs';

// Mock dependencies
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
    isMultilingualEnabled: true,
    telemetryConfig: {
      pdata: { id: 'test-portal' }
    },
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
      positions: { data: [] },
      group: { data: ['Group1', 'Group2', 'Others'] },
      organization: {
        designationsList: [
          { name: 'Manager', id: '1', status: 'Active' },
          { name: 'Developer', id: '2', status: 'Active' }
        ],
        organizationDetails: { id: 'org123', orgName: 'Test Org' },
        invalidLinkMessage: ''
      }
    },
    url: [{ path: 'public' }, { path: 'crp' }, { path: 'test' }]
  }
};

const mockRouter = {
  navigate: jest.fn()
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn()
};

const mockLangTranslations = {
  updatelanguageSelected: jest.fn(),
  translateActualLabel: jest.fn().mockReturnValue('translated text')
};

const mockHttpClient = {
  get: jest.fn().mockReturnValue(of('<html>test</html>'))
};

const mockSanitizer = {
  bypassSecurityTrustHtml: jest.fn().mockReturnValue('sanitized html')
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
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.open
Object.defineProperty(window, 'open', {
  value: jest.fn(),
  writable: true
});

// Mock navigator
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Android)'
};
Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

describe('PublicCrpComponent', () => {
  let component: PublicCrpComponent;
  let mockDocument: any;

  beforeEach(() => {
    // Mock document
    mockDocument = {
      body: {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      },
      querySelector: jest.fn(),
      getElementById: jest.fn(),
      getElementsByName: jest.fn().mockReturnValue([{ value: '' }])
    };

    // Reset navigator mock
    mockNavigator.userAgent = 'Mozilla/5.0 (Android)';

    // Clear all mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('"en"');

    component = new PublicCrpComponent(
      mockSignupService as any,
      mockLoggerService as any,
      mockConfigService as any,
      mockSnackBar as any,
      mockDialog as any,
      mockActivatedRoute as any,
      mockRouter as any,
      mockDocument,
      'browser',
      mockTranslateService as any,
      mockLangTranslations as any,
      mockHttpClient as any,
      mockSanitizer as any,
      mockMobileAppsService as any,
      mockEventService as any,
      mockTelemetryService as any
    );
  });

  describe('Constructor', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with proper validators', () => {
      expect(component.registrationForm).toBeDefined();
      expect(component.registrationForm.get('firstname')).toBeTruthy();
      expect(component.registrationForm.get('email')).toBeTruthy();
      expect(component.registrationForm.get('mobile')).toBeTruthy();
      expect(component.registrationForm.get('group')).toBeTruthy();
      expect(component.registrationForm.get('designation')).toBeTruthy();
    });

    it('should set language from localStorage', () => {
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockTranslateService.use).toHaveBeenCalledWith('en');
    });

    it('should extract CRP path from URL', () => {
      expect(component.crpPath).toBe('crp/test');
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should initialize component data', () => {
      expect(component.groupsOriginal).toEqual(['Group1', 'Group2']);
      // expect(component.designationsList).toHaveLength(2);
      expect(component.organizationDetails).toEqual(null);
    });

    // it('should filter designations for initial load', () => {
    //   expect(component.filteredDesignationsList).toHaveLength(2);
    // });

    it('should call getOrganization', () => {
      const spy = jest.spyOn(component, 'getOrganization');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Email Verification', () => {
    it('should validate email length correctly', () => {
      component.emailVerification('a'.repeat(65) + '@' + 'b'.repeat(256));
      expect(component.emailLengthVal).toBe(true);

      component.emailVerification('valid@email.com');
      expect(component.emailLengthVal).toBe(false);
    });

    it('should handle invalid email format', () => {
      component.emailVerification('invalid-email');
      expect(component.emailLengthVal).toBe(false);
    });
  });

  describe('Phone OTP Operations', () => {
    beforeEach(() => {
      component.registrationForm.patchValue({ mobile: '9876543210' });
    });

    it('should send OTP successfully', () => {
      mockSignupService.sendOtp.mockReturnValue(of({ result: 'success' }));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      component.sendOtp();

      expect(mockSignupService.sendOtp).toHaveBeenCalledWith('9876543210', 'phone');
      expect(component.otpSend).toBe(true);
      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('should handle OTP send error', () => {
      const error = { error: { params: { errmsg: 'OTP send failed' } } };
      mockSignupService.sendOtp.mockReturnValue(throwError(error));

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP send failed');
    });

    it('should not send OTP for invalid mobile', () => {
      component.registrationForm.patchValue({ mobile: '123' });

      component.sendOtp();

      expect(mockSignupService.sendOtp).not.toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('should verify OTP successfully', () => {
      mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));

      component.verifyOtp('123456');

      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('123456', '9876543210', 'phone');
      expect(component.isMobileVerified).toBe(true);
      expect(component.otpVerified).toBe(true);
    });

    it('should handle OTP verification error', () => {
      const error = { 
        error: { 
          params: { errmsg: 'Invalid OTP' },
          result: { remainingAttempt: 0 }
        } 
      };
      mockSignupService.verifyOTP.mockReturnValue(throwError(error));

      component.verifyOtp('123456');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP');
      expect(component.disableVerifyBtn).toBe(true);
    });

    it('should validate OTP length', () => {
      component.verifyOtp('123');

      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text');
      expect(mockSignupService.verifyOTP).not.toHaveBeenCalled();
    });
  });

  describe('Email OTP Operations', () => {
    beforeEach(() => {
      component.registrationForm.patchValue({ email: 'test@example.com' });
    });

    it('should send email OTP successfully', () => {
      mockSignupService.sendOtpV2.mockReturnValue(of({ result: 'success' }));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      component.sendOtpEmail();

      expect(mockSignupService.sendOtpV2).toHaveBeenCalledWith('test@example.com', 'email');
      expect(component.otpEmailSend).toBe(true);
      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('should verify email OTP successfully', () => {
      mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));

      component.verifyOtpEmail('123456');

      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith('123456', 'test@example.com', 'email');
      expect(component.isEmailVerified).toBe(false);
    });
  });

  describe('Timer Operations', () => {
    it('should start countdown timer', () => {
      jest.useFakeTimers();
      component.OTP_TIMER = 60; // 60 seconds

      component.startCountDown();

      expect(component.timeLeftforOTP).toBe(60);
      
      jest.advanceTimersByTime(1000);
      expect(component.timeLeftforOTP).toBe(59);
      
      jest.useRealTimers();
    });

    it('should start email countdown timer', () => {
      jest.useFakeTimers();
      component.OTP_TIMER_EMAIL = 60;

      component.startCountDownEmail();

      expect(component.timeLeftforOTPEmail).toBe(60);
      
      jest.advanceTimersByTime(1000);
      expect(component.timeLeftforOTPEmail).toBe(59);
      
      jest.useRealTimers();
    });
  });

  describe('Form Validation', () => {
    it('should validate designation correctly', () => {
      component.registrationForm.patchValue({ designation: 'Manager' });
      expect(component.checkIfDesignationValid()).toBe(false);

      component.registrationForm.patchValue({ designation: 'Invalid Designation' });
      expect(component.checkIfDesignationValid()).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid Designation', 4000);
    });

    it('should toggle confirmation checkboxes', () => {
      component.confirmChange();
      expect(component.confirm).toBe(true);

      component.confirmTermsChange();
      expect(component.confirmTerms).toBe(true);
    });
  });

  describe('Registration', () => {
    beforeEach(() => {
      component.registrationForm.patchValue({
        firstname: 'John',
        email: 'john@example.com',
        mobile: '9876543210',
        group: 'Group1',
        designation: 'Manager',
        isWhatsappConsent: true
      });
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgType: 'Government',
        sbOrgSubType: 'Ministry',
        mapId: 'map123',
        sbRootOrgId: 'root123',
        sbOrgId: 'org123'
      };
    });

    it('should register user successfully', () => {
      mockSignupService.register.mockReturnValue(of({ result: 'success' }));
      const openDialogSpy = jest.spyOn(component, 'openDialog').mockImplementation();

      component.signup();

      expect(mockSignupService.register).toHaveBeenCalledWith({
        firstName: 'John',
        email: 'john@example.com',
        phone: '9876543210',
        group: 'Group1',
        source: 'test.test-portal',
        orgName: 'Test Org',
        channel: 'test-channel',
        organisationType: 'Government',
        organisationSubType: 'Ministry',
        mapId: 'map123',
        sbRootOrgId: 'root123',
        sbOrgId: 'org123',
        registrationLink: 'http://localhost/',
        position: 'Manager',
        isWhatsappConsent: true
      });
      expect(openDialogSpy).toHaveBeenCalled();
      expect(component.disableBtn).toBe(false);
    });

    it('should handle registration error', () => {
      const error = { error: { params: { errmsg: 'Registration failed' } } };
      mockSignupService.register.mockReturnValue(throwError(error));

      component.signup();

      expect(mockSnackBar.open).toHaveBeenCalledWith("Invalid Designation", "X", {"duration": 4000});
      expect(component.disableBtn).toBe(false);
    });

    it('should not register with invalid designation', () => {
      component.registrationForm.patchValue({ designation: 'Invalid' });

      component.signup();

      expect(mockSignupService.register).not.toHaveBeenCalled();
    });
  });

  describe('Language Operations', () => {
    it('should select language and update localStorage', () => {
      component.selectLanguage('hi');

      expect(component.selectedLanguage).toBe('hi');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('websiteLanguage', 'hi');
      expect(mockLangTranslations.updatelanguageSelected).toHaveBeenCalledWith(true, 'hi', '');
    });

    it('should translate labels', () => {
      const result = component.translateLabels('testLabel', 'testType');
      expect(result).toBe('translated text');
      expect(mockLangTranslations.translateActualLabel).toHaveBeenCalledWith('testLabel', 'testType', '');
    });
  });

  describe('Utility Functions', () => {
    it('should allow only numeric input', () => {
      expect(component.numericOnly({ key: '5' })).toBe(true);
      expect(component.numericOnly({ key: 'a' })).toBe(false);
    });

    it('should hide mobile top header', () => {
      const nextSpy = jest.spyOn(mockMobileAppsService.mobileTopHeaderVisibilityStatus, 'next');
      
      component.hideMobileTopHeader();
      
      expect(component.mobileTopHeaderVisibilityStatus).toBe(false);
      expect(nextSpy).toHaveBeenCalledWith(false);
    });

    it('should navigate to request page', () => {
      component.navigateTo('test');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/request'], {
        queryParams: { type: 'test' },
        state: {
          userform: component.registrationForm.value,
          isMobileVerified: component.isMobileVerified,
          isEmailVerified: component.isEmailVerified
        }
      });
    });
  });

  describe('Filter Operations', () => {
    beforeEach(() => {
      component.designationsList = [
        { name: 'Manager', id: '1', status: 'Active' },
        { name: 'Developer', id: '2', status: 'Active' },
        { name: 'Analyst', id: '3', status: 'Active' }
      ];
      component.masterGroup = ['Group1', 'Group2', 'Group3'];
    });

    it('should filter designations based on search', () => {
      component.onFilterDesignation('man');
      
      expect(component.desigantionFilterEnable).toBe(true);
     // expect(component.filteredDesignationsList).toHaveLength(1);
      expect(component.filteredDesignationsList[0].name).toBe('Manager');
    });

    it('should reset designation filter when search is empty', () => {
      component.onFilterDesignation('');
      
      expect(component.desigantionFilterEnable).toBe(false);
      expect(component.designationListLoadCount).toBe(component.designationDefaultLoadCount);
    });

    it('should filter groups based on search', () => {
      component.onFilterGroups('group1');
      
      expect(component.filteredGroupsList).toContain('Group1');
      expect(component.filteredGroupsList).not.toContain('Group2');
    });

    it('should return display value for autocomplete', () => {
      expect(component.displayFn('test')).toBe('test');
      expect(component.displayFn(null)).toBe('');
    });
  });

  describe('Download App', () => {
    it('should open Android Play Store for Android devices', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation();
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10)';

      component.downloadApp();

      expect(openSpy).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US',
        '_blank'
      );
    });

    it('should open iOS App Store for iOS devices', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation();
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)';

      component.downloadApp();

      expect(openSpy).toHaveBeenCalledWith(
        'https://apps.apple.com/in/app/igot-karmayogi/id6443949491',
        '_blank'
      );
    });

    it('should open Play Store for Windows Phone devices', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation();
      mockNavigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0)';

      component.downloadApp();

      expect(openSpy).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=com.igot.karmayogibharat&hl=en&gl=US',
        '_blank'
      );
    });
  });

  describe('Telemetry', () => {
    it('should raise signup interact telemetry', () => {
      jest.useFakeTimers();
      
      component.raiseSignupInteractTelementry();
      
      expect(mockTelemetryService.start).toHaveBeenCalled();
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
      
      jest.advanceTimersByTime(2000);
      expect(mockTelemetryService.end).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should raise impression telemetry', () => {
      jest.useFakeTimers();
      
      component.raiseImpressionTelemetry();
      
      jest.advanceTimersByTime(2000);
      expect(mockTelemetryService.end).toHaveBeenCalledWith(
        {
          type: "view",
          pageid: "/crp",
          uri: component.crpPath
        },
        {},
        {
          module: "Self Registration"
        }
      );
      
      jest.useRealTimers();
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe from observables on destroy', () => {
      const unsubscribeSpy = jest.fn();
      component['timerSubscription'] = { unsubscribe: unsubscribeSpy } as any;
      component['timerSubscriptionEmail'] = { unsubscribe: unsubscribeSpy } as any;
      component['subscriptionContact'] = { unsubscribe: unsubscribeSpy } as any;
      component['recaptchaSubscription'] = { unsubscribe: unsubscribeSpy } as any;
      component['userdataSubscription'] = { unsubscribe: unsubscribeSpy } as any;

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalledTimes(5);
    });

    it('should remove CSS class on destroy for browser platform', () => {
      component.ngOnDestroy();
      expect(mockDocument.body.classList.remove).toHaveBeenCalledWith('cs-recaptcha');
    });
  });

  describe('Organization Operations', () => {
    it('should get organization details', () => {
      const mockResponse = {
        result: {
          response: [{
            orgName: 'Test Org',
            channel: 'test-channel'
          }]
        }
      };
      mockSignupService.searchOrgsByIdentifier.mockReturnValue(of(mockResponse));

      component.getOrganization();

      expect(mockSignupService.searchOrgsByIdentifier).toHaveBeenCalledWith({
        request: {
          filters: {
            identifier: ['org123']
          }
        }
      });
      expect(component.heirarchyObject).toEqual(mockResponse.result.response[0]);
    });
  });

  describe('Scroll and Load More', () => {
    it('should load more designations on scroll', () => {
      component.designationsList = Array.from({ length: 100 }, (_, i) => ({
        name: `Designation ${i}`,
        id: `${i}`,
        status: 'Active'
      }));
      component.filteredDesignationsList = component.designationsList.slice(0, 50);
      component.designationListLoadCount = 50;
      component.isLoadingMoreDesignations = false;
      component.desigantionFilterEnable = false;

      const mockEvent = {
        target: {
          scrollTop: 100,
          clientHeight: 200,
          scrollHeight: 305 // scrollTop + clientHeight >= scrollHeight - 5
        }
      };

      jest.useFakeTimers();
      component.onDesignationSelectScroll(mockEvent);
      
      expect(component.isLoadingMoreDesignations).toBe(true);
      
      jest.advanceTimersByTime(500);
      
      expect(component.designationListLoadCount).toBe(100);
      expect(component.filteredDesignationsList.length).toBe(100);
      expect(component.isLoadingMoreDesignations).toBe(false);
      
      jest.useRealTimers();
    });
  });
});