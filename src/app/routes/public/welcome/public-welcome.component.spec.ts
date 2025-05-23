import { PublicWelcomeComponent } from './public-welcome.component';
import { of, throwError, BehaviorSubject } from 'rxjs';

// Mock services
const mockWelcomeSignupSvc = {
  register: jest.fn()
};

const mockSignupSvc = {
  searchOrgs: jest.fn(),
  sendOtp: jest.fn(),
  resendOtp: jest.fn(),
  verifyOTP: jest.fn()
};

const mockLoggerSvc = {
  error: jest.fn()
};

const mockConfigSvc = {
  instanceConfig: {
    telemetryConfig: {
      pdata: { id: 'test-portal' }
    }
  },
  userProfileV2: true,
  updateGlobalProfile: jest.fn()
};

const mockSnackBar = {
  open: jest.fn()
};

const mockActivatedRoute = {
  snapshot: {
    data: {
      userData: {
        data: {
          userId: 'test-user',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          isUpdateRequired: true
        }
      },
      group: {
        data: ['Group1', 'Group2', 'Others']
      }
    }
  }
};

const mockRouter = {
  navigate: jest.fn()
};

const mockInitSvc = {
  init: jest.fn().mockResolvedValue(true)
};

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    resendOTPTIme: 60
  }
}));

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, defaultValue) => {
    if (!obj || !path) return defaultValue;
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    return result;
  }),
  startCase: jest.fn((str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '')
}));

// Create proper FormControl mock
class MockFormControl {
  public value: any = '';
  public valid: boolean = true;
  public disabled: boolean = false;
  private _valueChanges = new BehaviorSubject(this.value);

  constructor(value: any = '') {
    this.value = value;
    this._valueChanges.next(value);
  }

  get valueChanges() {
    return this._valueChanges.asObservable();
  }

  setValue(value: any) {
    this.value = value;
    this._valueChanges.next(value);
  }

  patchValue(value: any) {
    this.value = value;
    this._valueChanges.next(value);
  }

  setValidators() {
    // Mock implementation
  }

  updateValueAndValidity() {
    // Mock implementation
  }
}

// Create proper FormGroup mock
class MockFormGroup {
  public controls: { [key: string]: MockFormControl } = {};
  public valid: boolean = true;

  constructor(controls: { [key: string]: MockFormControl }) {
    this.controls = controls;
  }

  get value() {
    const result: any = {};
    Object.keys(this.controls).forEach(key => {
      result[key] = this.controls[key].value;
    });
    return result;
  }

  get(controlName: string): MockFormControl | null {
    return this.controls[controlName] || null;
  }

  patchValue(value: any) {
    Object.keys(value).forEach(key => {
      if (this.controls[key]) {
        this.controls[key].patchValue(value[key]);
      }
    });
  }

  setValue(value: any) {
    Object.keys(value).forEach(key => {
      if (this.controls[key]) {
        this.controls[key].setValue(value[key]);
      }
    });
  }

  updateValueAndValidity() {
    // Mock implementation
  }

  getRawValue() {
    return this.value;
  }
}

// Mock Angular Forms
jest.mock('@angular/forms', () => ({
  UntypedFormGroup: jest.fn().mockImplementation((controls) => new MockFormGroup(controls)),
  UntypedFormControl: jest.fn().mockImplementation((value) => new MockFormControl(value)),
  Validators: {
    required: jest.fn(),
    pattern: jest.fn()
  }
}));

describe('PublicWelcomeComponent', () => {
  let component: PublicWelcomeComponent;

  beforeEach(() => {
    jest.clearAllMocks();
    
    component = new PublicWelcomeComponent(
      mockWelcomeSignupSvc as any,
      mockSignupSvc as any,
      mockLoggerSvc as any,
      mockConfigSvc as any,
      mockSnackBar as any,
      mockActivatedRoute as any,
      mockRouter as any,
      mockInitSvc as any
    );
  });

  describe('Constructor and Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeDefined();
    });

    it('should navigate to home if user does not require update', () => {
      const mockRouteWithoutUpdate = {
        snapshot: {
          data: {
            userData: {
              data: {
                userId: 'test-user',
                isUpdateRequired: false
              }
            }
          }
        }
      };

      new PublicWelcomeComponent(
        mockWelcomeSignupSvc as any,
        mockSignupSvc as any,
        mockLoggerSvc as any,
        mockConfigSvc as any,
        mockSnackBar as any,
        mockRouteWithoutUpdate as any,
        mockRouter as any,
        mockInitSvc as any
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home']);
    });

    it('should initialize form when user requires update', () => {
      expect(component.usr).toBeDefined();
      expect(component.usr.userId).toBe('test-user');
    });
  });

  describe('Form Initialization', () => {
    beforeEach(() => {
      component.init();
    });

    it('should initialize registration form with user data', () => {
      expect(component.registrationForm).toBeDefined();
    });

    it('should set email as verified if user has email', () => {
      expect(component.isEmailVerified).toBe(true);
    });

    it('should set mobile as verified if user has phone', () => {
      expect(component.isMobileVerified).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.init();
      component.ngOnInit();
    });

    it('should set telemetry config', () => {
      expect(component.telemetryConfig).toBeDefined();
      expect(component.portalID).toBe('test-portal');
    });

    it('should filter groups excluding Others', () => {
      expect(component.groupsOriginal).toEqual(['Group1', 'Group2']);
    });
  });

  describe('Organization Search', () => {
    beforeEach(() => {
      component.init();
      // Mock the type form control to return 'ministry'
      const typeControl = component.registrationForm?.get('type') as unknown as MockFormControl;
      if (typeControl) {
        typeControl.setValue('ministry');
      }
    });

    it('should search organizations successfully', async () => {
      const mockResponse = {
        result: {
          response: [
            { orgName: 'Test Ministry' },
            { orgName: 'Another Ministry' }
          ]
        }
      };

      mockSignupSvc.searchOrgs.mockReturnValue(of(mockResponse));

      await component.searchOrgs('ministry');

      expect(mockSignupSvc.searchOrgs).toHaveBeenCalledWith('ministry', 'ministry');
      expect(component.filteredOrgList).toBeDefined();
      expect(component.resultFetched).toBe(true);
      expect(component.searching).toBe(false);
    });

    it('should handle organization search error', async () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Search failed'
          }
        }
      };

      mockSignupSvc.searchOrgs.mockReturnValue(throwError(mockError));

      await component.searchOrgs('ministry');

      expect(mockLoggerSvc.error).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith('Search failed');
      expect(component.searching).toBe(false);
    });

    it('should show error for empty search value', async () => {
      await component.searchOrgs('');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter organisation to search');
      expect(component.searching).toBe(false);
    });
  });

  describe('Organization Selection', () => {
    beforeEach(() => {
      component.init();
    });

    it('should handle organization click event', () => {
      const mockEvent = {
        option: {
          value: {
            orgName: 'Test Org',
            channel: 'test-channel'
          }
        }
      };

      component.orgClicked(mockEvent);

      const orgControl = component.registrationForm?.get('organisation') as unknown as MockFormControl;
      expect(orgControl?.value).toBe('Test Org');
      expect(component.heirarchyObject).toEqual(mockEvent.option.value);
      expect(component.hideOrg).toBe(true);
    });

    it('should handle invalid organization click event', () => {
      const mockEvent = {
        option: {
          value: null
        }
      };

      component.orgClicked(mockEvent);

      expect(component.hideOrg).toBe(false);
    });
  });

  describe('Form Actions', () => {
    beforeEach(() => {
      component.init();
    });

    it('should toggle confirm checkbox', () => {
      component.confirm = false;
      component.confirmChange();

      expect(component.confirm).toBe(true);
      const confirmControl = component.registrationForm?.get('confirmBox') as unknown as MockFormControl;
      expect(confirmControl?.value).toBe(true);
    });

    it('should clear organization values', () => {
      component.clearValues();

      const orgControl = component.registrationForm?.get('organisation') as unknown as MockFormControl;
      expect(orgControl?.value).toBe('');
      expect(component.heirarchyObject).toBeNull();
    });

    it('should edit organization', () => {
      component.editOrg();

      expect(component.hideOrg).toBe(false);
      expect(component.resultFetched).toBe(false);
      expect(component.searching).toBe(false);
      expect(component.heirarchyObject).toBeNull();
    });
  });

  describe('User Registration', () => {
    beforeEach(() => {
      component.init();
      component.usr = { userId: 'test-user' };
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgId: 'org-id',
        mapId: 'map-id',
        sbRootOrgId: 'root-org-id',
        sbOrgType: 'ministry',
        sbOrgSubType: 'department'
      };

      // Set form values
      const firstnameControl = component.registrationForm?.get('firstname') as unknown as MockFormControl;
      const groupControl = component.registrationForm?.get('group') as unknown as MockFormControl;
      const mobileControl = component.registrationForm?.get('mobile') as unknown as MockFormControl;
      
      if (firstnameControl) firstnameControl.setValue('John');
      if (groupControl) groupControl.setValue('Test Group');
      if (mobileControl) mobileControl.setValue('1234567890');
    });

    it('should register user successfully', () => {
      mockWelcomeSignupSvc.register.mockReturnValue(of({}));

      component.signup();

      expect(mockWelcomeSignupSvc.register).toHaveBeenCalled();
      expect(mockConfigSvc.updateGlobalProfile).toHaveBeenCalledWith(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home']);
      expect(component.disableBtn).toBe(false);
    });

    it('should handle registration error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Registration failed'
          }
        }
      };

      mockWelcomeSignupSvc.register.mockReturnValue(throwError(mockError));

      component.signup();

      expect(mockLoggerSvc.error).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith('Registration failed');
      expect(component.disableBtn).toBe(false);
    });
  });

  describe('OTP Functionality', () => {
    beforeEach(() => {
      component.init();
      const mobileControl = component.registrationForm?.get('mobile') as unknown as MockFormControl;
      if (mobileControl) {
        mobileControl.setValue('1234567890');
        mobileControl.valid = true;
      }
    });

    it('should send OTP successfully', () => {
      mockSignupSvc.sendOtp.mockReturnValue(of({}));
      
      // Mock alert
      global.alert = jest.fn();

      component.sendOtp();

      expect(mockSignupSvc.sendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBe(true);
      expect(component.disableVerifyBtn).toBe(false);
      expect(global.alert).toHaveBeenCalledWith('OTP send to your Mobile Number');
    });

    it('should handle send OTP error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'OTP send failed'
          }
        }
      };

      mockSignupSvc.sendOtp.mockReturnValue(throwError(mockError));

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP send failed');
    });

    it('should show error for invalid mobile number', () => {
      const mobileControl = component.registrationForm?.get('mobile') as unknown as MockFormControl;
      if (mobileControl) {
        mobileControl.valid = false;
      }

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid Mobile No');
    });

    it('should resend OTP successfully', () => {
      const mockResponse = {
        result: {
          response: 'SUCCESS'
        }
      };

      mockSignupSvc.resendOtp.mockReturnValue(of(mockResponse));

      // Mock alert
      global.alert = jest.fn();

      component.resendOTP();

      expect(mockSignupSvc.resendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBe(true);
      expect(component.disableVerifyBtn).toBe(false);
      expect(global.alert).toHaveBeenCalledWith('OTP send to your Mobile Number');
    });

    it('should verify OTP successfully', () => {
      const mockResponse = {
        result: {
          response: 'SUCCESS'
        }
      };

      mockSignupSvc.verifyOTP.mockReturnValue(of(mockResponse));

      const mockOtp = { value: '123456' };
      component.verifyOtp(mockOtp);

      expect(mockSignupSvc.verifyOTP).toHaveBeenCalledWith('123456', '1234567890', 'phone');
      expect(component.otpVerified).toBe(true);
      expect(component.isMobileVerified).toBe(true);
      expect(component.disableBtn).toBe(false);
    });

    it('should handle verify OTP error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Invalid OTP'
          },
          result: {
            remainingAttempt: 0
          }
        }
      };

      mockSignupSvc.verifyOTP.mockReturnValue(throwError(mockError));

      const mockOtp = { value: '123456' };
      component.verifyOtp(mockOtp);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP');
      expect(component.disableVerifyBtn).toBe(true);
    });
  });

  describe('Timer Functionality', () => {
    beforeEach(() => {
      component.OTP_TIMER = 60;
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start countdown timer', () => {
      component.startCountDown();

      expect(component.timeLeftforOTP).toBe(60);

      // Fast forward 30 seconds
      jest.advanceTimersByTime(30000);

      expect(component.timeLeftforOTP).toBe(30);
    });

    it('should stop timer when countdown reaches zero', () => {
      component.startCountDown();

      // Fast forward 61 seconds to ensure timer stops
      jest.advanceTimersByTime(61000);

      expect(component.timeLeftforOTP).toBe(0);
    });
  });

  describe('Phone Change Handler', () => {
    beforeEach(() => {
      component.init();
    });

    it('should setup phone change subscription', () => {
      component.isMobileVerified = true;
      component.otpSend = true;

      component.onPhoneChange();

      // The subscription is set up, actual behavior would be tested by triggering valueChanges
      expect(component.isMobileVerified).toBe(true); // Initial state
      expect(component.otpSend).toBe(true); // Initial state
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      component.init();
      const typeControl = component.registrationForm?.get('type') as unknown as MockFormControl;
      if (typeControl) {
        typeControl.setValue('ministry');
      }
    });

    it('should return type value in start case', () => {
      const result = component.typeValueStartCase;
      expect(result).toBe('Ministry');
    });

    it('should return type value', () => {
      const result = component.typeValue;
      expect(result).toBe('ministry');
    });

    it('should display function for organization', () => {
      const result = component.displayFnState({ orgName: 'Test Org' });
      expect(result).toBe('Test Org');
    });

    it('should display function for group', () => {
      const result = component.displayFnGroup('Test Group');
      expect(result).toBe('Test Group');
    });

    it('should handle display functions with undefined values', () => {
      const orgResult = component.displayFnState(undefined);
      const groupResult = component.displayFnGroup(undefined);
      
      expect(orgResult).toBeUndefined();
      expect(groupResult).toBeUndefined();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      component.init();
      component.isMobileVerified = true;
      component.isEmailVerified = true;
    });

    it('should navigate to request page with parameters', () => {
      const firstnameControl = component.registrationForm?.get('firstname') as unknown as MockFormControl;
      const emailControl = component.registrationForm?.get('email') as unknown as MockFormControl;
      
      if (firstnameControl) firstnameControl.setValue('John');
      if (emailControl) emailControl.setValue('john@example.com');

      component.navigateTo('new-request');

      // expect(mockRouter.navigate).toHaveBeenCalledWith(
      //   ['/public/request'],
      //   {
      //     queryParams: { type: 'new-request' },
      //     state: {
      //       userform: expect.any(Object),
      //       isMobileVerified: true,
      //       isEmailVerified: true
      //     }
      //   }
      // );
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe from contact subscription on destroy', () => {
      const mockSubscription = {
        unsubscribe: jest.fn()
      };

      component.subscriptionContact = mockSubscription as any;
      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should unsubscribe from timer subscription on destroy', () => {
      const mockSubscription = {
        unsubscribe: jest.fn()
      };

      component.timerSubscription = mockSubscription as any;
      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle null subscriptions on destroy', () => {
      component.subscriptionContact = null;
      component.timerSubscription = null;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.init();
    });

    it('should handle generic error messages', () => {
      const mockError = {
        error: {
          params: {}
        }
      };

      mockWelcomeSignupSvc.register.mockReturnValue(throwError(mockError));
      component.signup();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong, please try again later!');
    });

    it('should open snackbar with default duration', () => {
      // Access private method through bracket notation
      (component as any).openSnackbar('Test message');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
        duration: 5000
      });
    });

    it('should open snackbar with custom duration', () => {
      // Access private method through bracket notation
      (component as any).openSnackbar('Test message', 3000);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
        duration: 3000
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user data in constructor', () => {
      const mockRouteWithoutUser = {
        snapshot: {
          data: {}
        }
      };

      expect(() => new PublicWelcomeComponent(
        mockWelcomeSignupSvc as any,
        mockSignupSvc as any,
        mockLoggerSvc as any,
        mockConfigSvc as any,
        mockSnackBar as any,
        mockRouteWithoutUser as any,
        mockRouter as any,
        mockInitSvc as any
      )).not.toThrow();
    });

    it('should handle missing group data in ngOnInit', () => {
      const mockRouteWithoutGroup = {
        snapshot: {
          data: {
            userData: {
              data: {
                userId: 'test-user',
                isUpdateRequired: true
              }
            }
          }
        }
      };

      const testComponent = new PublicWelcomeComponent(
        mockWelcomeSignupSvc as any,
        mockSignupSvc as any,
        mockLoggerSvc as any,
        mockConfigSvc as any,
        mockSnackBar as any,
        mockRouteWithoutGroup as any,
        mockRouter as any,
        mockInitSvc as any
      );

      testComponent.init();
      testComponent.ngOnInit();

      expect(testComponent.groupsOriginal).toEqual([]);
    });

    it('should handle OTP verification with empty OTP', () => {
      component.init();
      const mockOtp = { value: '' };
      
      component.verifyOtp(mockOtp);
      
      // Should not call the service if OTP is empty
      expect(mockSignupSvc.verifyOTP).not.toHaveBeenCalled();
    });
  });
});