import { PublicCrpComponent } from './public-crp.component';
import { of, throwError } from 'rxjs';

// Mock dependencies
jest.mock('@ngx-translate/core');
jest.mock('@sunbird-cb/utils-v2');

describe('PublicCrpComponent', () => {
  let component: PublicCrpComponent;
  let mockSignupSvc: any;
  let mockLoggerSvc: any;
  let mockConfigSvc: any;
  let mockSnackBar: any;
  let mockDialog: any;
  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockDocument: any;
  let mockPlatformId: any;
  let mockTranslate: any;
  let mockLangTranslations: any;
  let mockHttp: any;
  let mockSanitizer: any;
  let mockMobileAppsService: any;
  let mockEventService: any;
  let mockTelemetrySvc: any;

  beforeEach(() => {
    // Initialize mocks
    mockSignupSvc = {
      updateSignupDataObservable: of({}),
      sendOtp: jest.fn().mockReturnValue(of({})),
      resendOtp: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
      verifyOTP: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
      register: jest.fn().mockReturnValue(of({})),
      searchOrgsByIdentifier: jest.fn().mockReturnValue(of({ result: { response: [] } })),
    };
    
    mockLoggerSvc = {
      error: jest.fn(),
    };
    
    mockConfigSvc = {
      instanceConfig: {
        telemetryConfig: {
          pdata: {
            id: 'test-portal'
          }
        },
        isMultilingualEnabled: true,
        websitelanguages: ['en', 'hi']
      }
    };
    
    mockSnackBar = {
      open: jest.fn().mockReturnValue({ afterDismissed: () => of({}) }),
    };
    
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    };
    
    mockActivatedRoute = {
      snapshot: {
        url: [{ path: 'public' }, { path: 'crp' }, { path: 'someOrg' }],
        data: {
          positions: { data: [] },
          group: { data: ['Group1', 'Group2', 'Others'] },
          organization: {
            designationsList: [{ name: 'Developer' }, { name: 'Manager' }],
            organizationDetails: { id: 'org123', orgName: 'Test Org' },
            invalidLinkMessage: ''
          }
        }
      }
    };
    
    mockRouter = {
      navigate: jest.fn(),
    };
    
    mockDocument = {
      body: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        }
      }
    };
    
    mockPlatformId = 'browser';
    
    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    };
    
    mockLangTranslations = {
      updatelanguageSelected: jest.fn(),
      translateActualLabel: jest.fn().mockImplementation((label) => `translated_${label}`),
    };
    
    mockHttp = {
      get: jest.fn().mockReturnValue(of('<html></html>')),
    };
    
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation(html => html),
    };
    
    mockMobileAppsService = {
      mobileTopHeaderVisibilityStatus: {
        next: jest.fn(),
      }
    };
    
    mockEventService = {
      raiseInteractTelemetry: jest.fn(),
    };
    
    mockTelemetrySvc = {
      start: jest.fn(),
      end: jest.fn(),
    };

    // Create localStorage mock
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        }
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    // Call constructor
    component = new PublicCrpComponent(
      mockSignupSvc,
      mockLoggerSvc,
      mockConfigSvc,
      mockSnackBar,
      mockDialog,
      mockActivatedRoute,
      mockRouter,
      mockDocument,
      mockPlatformId,
      mockTranslate,
      mockLangTranslations,
      mockHttp,
      mockSanitizer,
      mockMobileAppsService,
      mockEventService,
      mockTelemetrySvc
    );

    // Call lifecycle methods manually
    component.ngOnInit();

    // Spy on component methods
    jest.spyOn(component, 'sendOtp');
    jest.spyOn(component, 'verifyOtp');
    jest.spyOn(component, 'signup');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('should initialize form with required validators', () => {
    expect(component.registrationForm).toBeTruthy();
    expect(component.registrationForm.get('firstname')).toBeTruthy();
    expect(component.registrationForm.get('email')).toBeTruthy();
    expect(component.registrationForm.get('mobile')).toBeTruthy();
    expect(component.registrationForm.get('confirmTermsBox')).toBeTruthy();
    expect(component.registrationForm.get('designation')).toBeTruthy();
    expect(component.registrationForm.get('group')).toBeTruthy();
  });

  test('should set the selected language from localStorage', () => {
    localStorage.setItem('websiteLanguage', 'hi');
    component = new PublicCrpComponent(
      mockSignupSvc,
      mockLoggerSvc,
      mockConfigSvc,
      mockSnackBar,
      mockDialog,
      mockActivatedRoute,
      mockRouter,
      mockDocument,
      mockPlatformId,
      mockTranslate,
      mockLangTranslations,
      mockHttp,
      mockSanitizer,
      mockMobileAppsService,
      mockEventService,
      mockTelemetrySvc
    );
    expect(component.selectedLanguage).toBe('hi');
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslate.use).toHaveBeenCalledWith('hi');
  });

  test('should fetch organization details on init', () => {
    expect(mockSignupSvc.searchOrgsByIdentifier).toHaveBeenCalled();
  });

  test('should send OTP for valid mobile number', () => {
    component.registrationForm.get('mobile')?.setValue('9876543210');
    component.sendOtp();
    expect(mockSignupSvc.sendOtp).toHaveBeenCalledWith('9876543210', 'phone');
    expect(component.otpSend).toBe(true);
  });

  test('should show error for invalid mobile number', () => {
    component.registrationForm.get('mobile')?.setValue('abc');
    component.sendOtp();
    expect(mockSnackBar.open).toHaveBeenCalledWith('translated_pleaseEnterValidMobileNumber');
  });

  test('should resend OTP for valid mobile number', () => {
    component.registrationForm.get('mobile')?.setValue('9876543210');
    component.resendOTP();
    expect(mockSignupSvc.resendOtp).toHaveBeenCalledWith('9876543210', 'phone');
    expect(component.otpSend).toBe(true);
  });

  test('should verify OTP successfully', () => {
    component.registrationForm.get('mobile')?.setValue('9876543210');
    component.verifyOtp('1234');
    expect(mockSignupSvc.verifyOTP).toHaveBeenCalledWith('1234', '9876543210', 'phone');
    expect(component.isMobileVerified).toBe(true);
  });

  test('should show error for invalid OTP verification', () => {
    const errorResponse = {
      error: {
        params: {
          errmsg: 'Invalid OTP'
        },
        result: {
          remainingAttempt: 2
        }
      }
    };
    mockSignupSvc.verifyOTP.mockReturnValueOnce(throwError(errorResponse));
    component.registrationForm.get('mobile')?.setValue('9876543210');
    component.verifyOtp('1234');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP');
    expect(component.disableVerifyBtn).toBe(false);
  });

  test('should disable verify button when no more attempts left', () => {
    const errorResponse = {
      error: {
        params: {
          errmsg: 'Invalid OTP'
        },
        result: {
          remainingAttempt: 0
        }
      }
    };
    mockSignupSvc.verifyOTP.mockReturnValueOnce(throwError(errorResponse));
    component.registrationForm.get('mobile')?.setValue('9876543210');
    component.verifyOtp('1234');
    expect(component.disableVerifyBtn).toBe(true);
  });

  test('should send email OTP for valid email', () => {
    component.registrationForm.get('email')?.setValue('test@example.com');
    component.sendOtpEmail();
    expect(mockSignupSvc.sendOtp).toHaveBeenCalledWith('test@example.com', 'email');
    expect(component.otpEmailSend).toBe(true);
  });

  test('should show error for invalid email', () => {
    component.registrationForm.get('email')?.setValue('invalid-email');
    component.sendOtpEmail();
    expect(mockSnackBar.open).toHaveBeenCalledWith('translated_validEmail');
  });

  test('should verify email OTP successfully', () => {
    component.registrationForm.get('email')?.setValue('test@example.com');
    component.verifyOtpEmail('1234');
    expect(mockSignupSvc.verifyOTP).toHaveBeenCalledWith('1234', 'test@example.com', 'email');
    expect(component.isEmailVerified).toBe(true);
  });

  test('should handle registration form submission', () => {
    // Mock the checkIfDesignationValid method to return true
    jest.spyOn(component, 'checkIfDesignationValid').mockReturnValue(true);
    
    // Set up the required form values and component state
    component.registrationForm.patchValue({
      firstname: 'Test User',
      email: 'test@example.com',
      mobile: '9876543210',
      designation: 'Developer',
      group: 'Group1',
      confirmTermsBox: true,
      isWhatsappConsent: false
    });
    
    component.heirarchyObject = {
      orgName: 'Test Org',
      channel: 'test-channel',
      sbOrgType: 'org-type',
      sbOrgSubType: 'org-subtype',
      mapId: 'map123',
      sbRootOrgId: 'root123',
      sbOrgId: 'org123'
    };
    
    component.isMobileVerified = true;
    component.isEmailVerified = true;
    
    // Call the signup method
    component.signup();
    
    // Verify the registration API was called with correct parameters
    expect(mockSignupSvc.register).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      group: 'Group1',
      position: 'Developer',
      orgName: 'Test Org',
      isWhatsappConsent: false
    }));
    
    // Verify success dialog was opened
    expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), expect.any(Object));
  });

  test('should handle registration error', () => {
    // Mock the checkIfDesignationValid method to return true
    jest.spyOn(component, 'checkIfDesignationValid').mockReturnValue(true);
    
    // Mock registration to fail
    const errorResponse = {
      error: {
        params: {
          errmsg: 'Registration failed'
        }
      }
    };
    mockSignupSvc.register.mockReturnValueOnce(throwError(errorResponse));
    
    // Set up form values
    component.registrationForm.patchValue({
      firstname: 'Test User',
      email: 'test@example.com',
      mobile: '9876543210',
      designation: 'Developer',
      group: 'Group1',
      confirmTermsBox: true
    });
    
    component.heirarchyObject = {
      orgName: 'Test Org',
      channel: 'test-channel',
      sbOrgType: 'org-type',
      sbOrgSubType: 'org-subtype',
      mapId: 'map123',
      sbRootOrgId: 'root123',
      sbOrgId: 'org123'
    };
    
    // Call signup
    component.signup();
    
    // Verify error was logged and shown
    expect(mockLoggerSvc.error).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Registration failed');
  });

  test('should toggle the confirmation box state', () => {
    component.confirm = false;
    component.confirmChange();
    expect(component.confirm).toBe(true);
    expect(component.registrationForm.value.confirmBox).toBe(true);
    
    component.confirmChange();
    expect(component.confirm).toBe(false);
    expect(component.registrationForm.value.confirmBox).toBe(false);
  });

  test('should toggle terms and conditions box state', () => {
    component.confirmTerms = false;
    component.confirmTermsChange();
    expect(component.confirmTerms).toBe(true);
    expect(component.registrationForm.value.confirmTermsBox).toBe(true);
    
    component.confirmTermsChange();
    expect(component.confirmTerms).toBe(false);
    expect(component.registrationForm.value.confirmTermsBox).toBe(false);
  });

  test('should open terms and conditions dialog', () => {
    component.termsAndConditionClick();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  test('should filter designations based on input', () => {
    component.designationsList = [
      { name: 'Software Developer' },
      { name: 'Project Manager' },
      { name: 'System Administrator' }
    ];
    component.filteredDesignationsList = [...component.designationsList];
    
    component.onFilterDesignation('developer');
    expect(component.filteredDesignationsList.length).toBe(1);
    expect(component.filteredDesignationsList[0].name).toBe('Software Developer');
    
    component.onFilterDesignation('manager');
    expect(component.filteredDesignationsList.length).toBe(1);
    expect(component.filteredDesignationsList[0].name).toBe('Project Manager');
    
    component.onFilterDesignation('');
    expect(component.filteredDesignationsList.length).toBe(3);
  });

  test('should filter groups based on input', () => {
    component.masterGroup = ['Engineering', 'Management', 'Operations'];
    component.filteredGroupsList = [...component.masterGroup];
    
    component.onFilterGroups('eng');
    expect(component.filteredGroupsList.length).toBe(1);
    expect(component.filteredGroupsList[0]).toBe('Engineering');
    
    component.onFilterGroups('man');
    expect(component.filteredGroupsList.length).toBe(1);
    expect(component.filteredGroupsList[0]).toBe('Management');
    
    component.onFilterGroups('');
    expect(component.filteredGroupsList.length).toBe(3);
  });

  test('should navigate to request page', () => {
    const formValues = {
      firstname: 'Test',
      email: 'test@example.com',
      mobile: '9876543210',
      designation: 'Developer',
      group: 'Group1',
      confirmTermsBox: true,
      isWhatsappConsent: false
    };
    
    component.registrationForm.patchValue(formValues);
    component.isMobileVerified = true;
    component.isEmailVerified = true;
    
    component.navigateTo('someType');
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/public/request'], 
      {
        queryParams: { type: 'someType' },
        state: {
          userform: formValues,
          isMobileVerified: true,
          isEmailVerified: true
        }
      }
    );
  });

  test('should check if designation is valid', () => {
    component.filteredDesignationsList = [
      { name: 'Developer' },
      { name: 'Manager' }
    ];
    
    component.registrationForm.get('designation')?.setValue('Developer');
    expect(component.checkIfDesignationValid()).toBe(true);
    
    component.registrationForm.get('designation')?.setValue('Invalid Role');
    expect(component.checkIfDesignationValid()).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid Designation', 4000);
  });

  test('should update mobile top header visibility', () => {
    component.mobileTopHeaderVisibilityStatus = true;
    component.hideMobileTopHeader();
    expect(component.mobileTopHeaderVisibilityStatus).toBe(false);
    expect(mockMobileAppsService.mobileTopHeaderVisibilityStatus.next).toHaveBeenCalledWith(false);
  });

  test('should raise telemetry events on signup', () => {
    component.raiseSignupInteractTelementry();
    expect(mockTelemetrySvc.start).toHaveBeenCalledWith(
      {
        type: 'CLICK',
        id: 'sign-up',
        pageid: '/crp',
      },
      {},
      {
        module: 'Self Registration',
      }
    );
    expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled();
    
    // Testing setTimeout is tricky, but we can verify the end method will be called
    jest.advanceTimersByTime(2000);
    expect(mockTelemetrySvc.end).toHaveBeenCalled();
  });

  test('should close dialog and redirect to static home', () => {
    component.dialogRef = { close: jest.fn() };
    component.closedDialogandRedirect();
    expect(component.dialogRef.close).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/static-home']);
  });

  test('should handle autocomplete states', () => {
    component.isMatcompleteOpened = false;
    component.onAutoCompleteOpened();
    expect(component.isMatcompleteOpened).toBe(true);
    
    component.onAutoCompleteClosed();
    expect(component.isMatcompleteOpened).toBe(false);
    
    // onkeyDown should return the current state of isMatcompleteOpened
    expect(component.onkeyDown({})).toBe(false);
    
    component.isMatcompleteOpened = true;
    expect(component.onkeyDown({})).toBe(true);
  });
});
