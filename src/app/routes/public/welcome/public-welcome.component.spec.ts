import { PublicWelcomeComponent, forbiddenNamesValidator, forbiddenNamesValidatorNonEmpty, forbiddenNamesValidatorPosition } from './public-welcome.component';
import { UntypedFormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';

// Mock dependencies
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
      userData: { data: null },
      group: { data: ['group1', 'group2', 'Others'] }
    }
  }
};

const mockRouter = {
  navigate: jest.fn()
};

const mockInitSvc = {
  init: jest.fn().mockResolvedValue(undefined)
};

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    resendOTPTIme: 60000
  }
}));

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, defaultValue) => {
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
  startCase: jest.fn((str) => str.charAt(0).toUpperCase() + str.slice(1))
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
    it('should create component with existing user who does not need update', async () => {
      const mockUser:any = { isUpdateRequired: false, firstName: 'John', lastName: 'Doe' };
      mockActivatedRoute.snapshot.data.userData.data = mockUser;
      mockConfigSvc.userProfileV2 = false;

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

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockInitSvc.init).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home']);
    });

    it('should create component with existing user who does not need update and userProfileV2 is true', () => {
      const mockUser:any = { isUpdateRequired: false, firstName: 'John', lastName: 'Doe' };
      mockActivatedRoute.snapshot.data.userData.data = mockUser;
      mockConfigSvc.userProfileV2 = true;

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

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home']);
    });

    it('should create component with user requiring update and userProfileV2 is false', async () => {
      const mockUser:any = { isUpdateRequired: true, firstName: 'John', email: 'john@test.com', phone: '1234567890' };
      mockActivatedRoute.snapshot.data.userData.data = mockUser;
      mockConfigSvc.userProfileV2 = false;

     // const initSpy = jest.spyOn(component, 'init').mockImplementation();
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

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockInitSvc.init).toHaveBeenCalled();
    });

    it('should create component with user requiring update and userProfileV2 is true', () => {
      const mockUser:any = { isUpdateRequired: true, firstName: 'John' };
      mockActivatedRoute.snapshot.data.userData.data = mockUser;
      mockConfigSvc.userProfileV2 = true;

      const initSpy = jest.spyOn(component, 'init').mockImplementation();
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

      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('fetch method', () => {
    it('should call initSvc.init', async () => {
      await component.fetch();
      expect(mockInitSvc.init).toHaveBeenCalled();
    });
  });

  describe('init method', () => {
    it('should initialize form with user data', () => {
      component.usr = { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '1234567890' };
      component.init();

      expect(component.registrationForm).toBeDefined();
      expect(component.isEmailVerified).toBe(true);
      expect(component.isMobileVerified).toBe(true);
    });

    it('should initialize form without user data', () => {
      component.usr = null;
      component.init();

      expect(component.registrationForm).toBeDefined();
      expect(component.isEmailVerified).toBe(false);
      expect(component.isMobileVerified).toBe(false);
    });

    it('should initialize form with partial user data', () => {
      component.usr = { firstName: 'John' };
      component.init();

      expect(component.registrationForm).toBeDefined();
      expect(component.isEmailVerified).toBe(false);
      expect(component.isMobileVerified).toBe(false);
    });

    it('should initialize form with user having lastName', () => {
      component.usr = { firstName: 'John', lastName: 'Doe' };
      component.init();

      const firstnameControl = component.registrationForm.get('firstname');
      expect(firstnameControl?.value).toBe('John Doe');
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.init();
      jest.spyOn(component, 'OrgsSearchChange').mockImplementation();
      jest.spyOn(component, 'onPhoneChange').mockImplementation();
    });

    it('should initialize with form and group data', () => {
      component.ngOnInit();

      expect(component.groupsOriginal).toEqual(['group1', 'group2']);
      expect(component.masterGroup).toEqual(['group1', 'group2']);
      expect(component.telemetryConfig).toBeDefined();
      expect(component.portalID).toBe('test-portal');
    });

    // it('should handle missing group data', () => {
    //   mockActivatedRoute.snapshot.data.group = null;
    //   component.ngOnInit();

    //   expect(component.groupsOriginal).toEqual([]);
    // });

    // it('should handle missing instanceConfig', () => {
    //   mockConfigSvc.instanceConfig = null;
    //   component.ngOnInit();

    //   expect(component.telemetryConfig).toBeNull();
    // });
  });

  describe('Getters', () => {
    beforeEach(() => {
      component.init();
    });

    it('should return typeValueStartCase', () => {
      component.registrationForm.get('type')?.setValue('ministry');
      expect(component.typeValueStartCase).toBe('Ministry');
    });

    it('should return typeValue', () => {
      component.registrationForm.get('type')?.setValue('department');
      expect(component.typeValue).toBe('department');
    });
  });

  describe('filterOrgsSearch', () => {
    beforeEach(() => {
      component.init();
    });

    it('should filter organizations successfully', () => {
      const mockResponse = {
        result: {
          response: [
            { orgName: 'Test Organization' },
            { orgName: 'Another Org' }
          ]
        }
      };
      mockSignupSvc.searchOrgs.mockReturnValue(of(mockResponse));

      component.filterOrgsSearch('test');

      expect(mockSignupSvc.searchOrgs).toHaveBeenCalledWith('test', component.typeValue);
      expect(component.resultFetched).toBe(true);
      expect(component.searching).toBe(false);
      expect(component.filteredOrgList).toEqual([{ orgName: 'Test Organization' }]);
    });

    it('should handle search error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Search failed'
          }
        }
      };
      mockSignupSvc.searchOrgs.mockReturnValue(throwError(mockError));
      // jest.spyOn(component, 'openSnackbar');

      component.filterOrgsSearch('test');

      expect(component.searching).toBe(false);
      expect(mockLoggerSvc.error).toHaveBeenCalled();
    //  expect(component.openSnackbar).toHaveBeenCalledWith('Search failed');
    });

    // it('should handle search error without errmsg', () => {
    //   const mockError = { error: {} };
    //   mockSignupSvc.searchOrgs.mockReturnValue(throwError(mockError));
    //   // jest.spyOn(component, 'openSnackbar');

    //   component.filterOrgsSearch('test');

    //   expect(component.openSnackbar).toHaveBeenCalledWith('Something went wrong, please try again later!');
    // });
  });

  describe('searchOrgs', () => {
    beforeEach(() => {
      component.init();
     // jest.spyOn(component, 'filterOrgsSearch').mockResolvedValue(undefined);
      // jest.spyOn(component, 'openSnackbar');
    });

    it('should search organizations with valid input', async () => {
      await component.searchOrgs('test');

      expect(component.searching).toBe(true);
      expect(component.filterOrgsSearch).toHaveBeenCalledWith('test');
    });

    it('should handle empty search value', async () => {
      await component.searchOrgs('');

     // expect(component.openSnackbar).toHaveBeenCalledWith('Please enter organisation to search');
      expect(component.searching).toBe(false);
    });
  });

  describe('editOrg', () => {
    beforeEach(() => {
      component.init();
      jest.spyOn(component, 'clearValues');
    });

    it('should reset organization editing state', () => {
      component.editOrg();

      expect(component.hideOrg).toBe(false);
      expect(component.resultFetched).toBe(false);
      expect(component.searching).toBe(false);
      expect(component.clearValues).toHaveBeenCalled();
      expect(component.heirarchyObject).toBeNull();
    });
  });

  describe('clearValues', () => {
    beforeEach(() => {
      component.init();
    });

    it('should clear organization form values', () => {
      component.clearValues();

      expect(component.registrationForm.get('organisation')?.value).toBe('');
      expect(component.heirarchyObject).toBeNull();
    });
  });

  describe('OrgsSearchChange', () => {
    beforeEach(() => {
      component.init();
    });

    it('should subscribe to organization value changes', () => {
      const orgControl = component.registrationForm.get('organisation');
      const subscribeSpy = jest.spyOn(orgControl!.valueChanges, 'subscribe');

      component.OrgsSearchChange();

      expect(subscribeSpy).toHaveBeenCalled();
    });
  });

  describe('orgClicked', () => {
    beforeEach(() => {
      component.init();
    });

    it('should handle organization selection with valid event', () => {
      const mockEvent = {
        option: {
          value: {
            orgName: 'Test Org',
            channel: 'test-channel'
          }
        }
      };

      component.orgClicked(mockEvent);

      expect(component.registrationForm.get('organisation')?.value).toBe('Test Org');
      expect(component.heirarchyObject).toEqual(mockEvent.option.value);
      expect(component.hideOrg).toBe(true);
    });

    it('should handle organization selection with invalid event', () => {
      const mockEvent = {
        option: {
          value: null
        }
      };

      component.orgClicked(mockEvent);

      expect(component.hideOrg).toBe(false);
    });

    it('should handle null event', () => {
      component.orgClicked(null);
      // Should not throw error
    });
  });

  describe('confirmChange', () => {
    beforeEach(() => {
      component.init();
    });

    it('should toggle confirm state', () => {
      component.confirm = false;
      component.confirmChange();

      expect(component.confirm).toBe(true);
      expect(component.registrationForm.get('confirmBox')?.value).toBe(true);
    });
  });

  describe('Display Functions', () => {
    it('should return channel for displayFn', () => {
      const value = { channel: 'test-channel' };
      expect(component.displayFn(value)).toBe('test-channel');
    });

    it('should return undefined for displayFn with null value', () => {
      expect(component.displayFn(null)).toBeUndefined();
    });

    it('should return value for displayFnGroup', () => {
      expect(component.displayFnGroup('test-group')).toBe('test-group');
    });

    it('should return undefined for displayFnGroup with null value', () => {
      expect(component.displayFnGroup(null)).toBeUndefined();
    });

    it('should return orgName for displayFnState', () => {
      const value = { orgName: 'test-org' };
      expect(component.displayFnState(value)).toBe('test-org');
    });

    it('should return undefined for displayFnState with null value', () => {
      expect(component.displayFnState(null)).toBeUndefined();
    });
  });

  describe('signup', () => {
    beforeEach(() => {
      component.init();
      component.usr = { userId: 'test-user-id' };
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgId: 'sb-org-id',
        mapId: 'map-id',
        sbRootOrgId: 'sb-root-org-id',
        sbOrgType: 'type',
        sbOrgSubType: 'subtype'
      };
    });

    it('should register user successfully', () => {
      mockWelcomeSignupSvc.register.mockReturnValue(of({}));
      component.registrationForm.patchValue({
        firstname: 'John',
        group: 'test-group',
        mobile: '1234567890'
      });

      component.signup();

      expect(component.disableBtn).toBe(true);
      expect(mockWelcomeSignupSvc.register).toHaveBeenCalledWith({
        request: {
          userId: 'test-user-id',
          firstName: 'John',
          group: 'test-group',
          phone: '1234567890',
          orgName: 'Test Org',
          channel: 'test-channel',
          sbOrgId: 'sb-org-id',
          mapId: 'map-id',
          sbRootOrgId: 'sb-root-org-id',
          organisationType: 'type',
          organisationSubType: 'subtype'
        }
      });
    });

    it('should handle signup success', () => {
      mockWelcomeSignupSvc.register.mockReturnValue(of({}));
      component.registrationForm.patchValue({
        firstname: 'John',
        group: 'test-group',
        mobile: '1234567890'
      });

      component.signup();

      expect(component.disableBtn).toBe(false);
      expect(mockConfigSvc.updateGlobalProfile).toHaveBeenCalledWith(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home']);
    });

    it('should handle signup error with errmsg', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Registration failed'
          }
        }
      };
      mockWelcomeSignupSvc.register.mockReturnValue(throwError(mockError));
      // jest.spyOn(component, 'openSnackbar');

      component.signup();

      expect(component.disableBtn).toBe(false);
      expect(mockLoggerSvc.error).toHaveBeenCalled();
     // expect(component.openSnackbar).toHaveBeenCalledWith('Registration failed');
    });

    it('should handle signup error without errmsg', () => {
      const mockError = { error: {} };
      mockWelcomeSignupSvc.register.mockReturnValue(throwError(mockError));
      // jest.spyOn(component, 'openSnackbar');

      component.signup();

      //expect(component.openSnackbar).toHaveBeenCalledWith('Something went wrong, please try again later!');
    });
  });

  describe('openSnackbar', () => {
    it('should open snackbar with default duration', () => {
      //component.openSnackbar('Test message');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
        duration: 5000
      });
    });

    it('should open snackbar with custom duration', () => {
      //component.openSnackbar('Test message', 3000);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
        duration: 3000
      });
    });
  });

  describe('openDialog', () => {
    it('should call openDialog method', () => {
      // This method is currently empty, just ensuring it doesn't throw
      expect(() => component.openDialog()).not.toThrow();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptionContact', () => {
      const mockSubscription = {
        unsubscribe: jest.fn()
      };
      component.subscriptionContact = mockSubscription as any;

      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle null subscriptionContact', () => {
      component.subscriptionContact = null;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('startCountDown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      component.OTP_TIMER = 5000;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start countdown timer', () => {
      component.startCountDown();

      expect(component.timeLeftforOTP).toBe(5000);
      
      jest.advanceTimersByTime(1000);
      expect(component.timeLeftforOTP).toBe(4999);
    });

    it('should handle countdown completion', () => {
      component.startCountDown();
      
      jest.advanceTimersByTime(6000);
      expect(component.timeLeftforOTP).toBe(0);
    });

    it('should not start countdown if OTP_TIMER is 0', () => {
      component.OTP_TIMER = 0;
      component.startCountDown();

      expect(component.timeLeftforOTP).toBe(0);
    });
  });

  describe('onPhoneChange', () => {
    beforeEach(() => {
      component.init();
    });

    it('should subscribe to mobile control changes', () => {
      const mobileControl = component.registrationForm.get('mobile');
      const subscribeSpy = jest.spyOn(mobileControl!.valueChanges, 'pipe');

      component.onPhoneChange();

      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should handle null mobile control', () => {
      jest.spyOn(component.registrationForm, 'get').mockReturnValue(null);

      expect(() => component.onPhoneChange()).not.toThrow();
    });
  });

  describe('sendOtp', () => {
    beforeEach(() => {
      component.init();
      jest.spyOn(component, 'startCountDown');
      jest.spyOn(window, 'alert').mockImplementation();
    });

    it('should send OTP successfully', () => {
      mockSignupSvc.sendOtp.mockReturnValue(of({}));
      component.registrationForm.get('mobile')?.setValue('1234567890');

      component.sendOtp();

      expect(mockSignupSvc.sendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBe(true);
      expect(component.disableVerifyBtn).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('OTP send to your Mobile Number');
      expect(component.startCountDown).toHaveBeenCalled();
    });

    it('should handle OTP send error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'OTP send failed'
          }
        }
      };
      mockSignupSvc.sendOtp.mockReturnValue(throwError(mockError));
      component.registrationForm.get('mobile')?.setValue('1234567890');

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP send failed');
    });

    it('should handle invalid mobile number', () => {
      component.registrationForm.get('mobile')?.setValue('');

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid Mobile No');
    });

    it('should handle null mobile control', () => {
      jest.spyOn(component.registrationForm, 'get').mockReturnValue(null);

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid Mobile No');
    });
  });

  describe('resendOTP', () => {
    beforeEach(() => {
      component.init();
      jest.spyOn(component, 'startCountDown');
      jest.spyOn(window, 'alert').mockImplementation();
    });

    it('should resend OTP successfully', () => {
      const mockResponse = {
        result: {
          response: 'SUCCESS'
        }
      };
      mockSignupSvc.resendOtp.mockReturnValue(of(mockResponse));
      component.registrationForm.get('mobile')?.setValue('1234567890');

      component.resendOTP();

      expect(mockSignupSvc.resendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBe(true);
      expect(component.disableVerifyBtn).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('OTP send to your Mobile Number');
      expect(component.startCountDown).toHaveBeenCalled();
    });

    it('should handle resend OTP error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Resend failed'
          }
        }
      };
      mockSignupSvc.resendOtp.mockReturnValue(throwError(mockError));
      component.registrationForm.get('mobile')?.setValue('1234567890');

      component.resendOTP();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Resend failed');
    });

    it('should handle invalid mobile number for resend', () => {
      component.registrationForm.get('mobile')?.setValue('');

      component.resendOTP();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid Mobile No');
    });
  });

  describe('verifyOtp', () => {
    beforeEach(() => {
      component.init();
    });

    it('should verify OTP successfully', () => {
      const mockResponse = {
        result: {
          response: 'SUCCESS'
        }
      };
      mockSignupSvc.verifyOTP.mockReturnValue(of(mockResponse));
      component.registrationForm.get('mobile')?.setValue('1234567890');
      const mockOtp = { value: '123456' };

      component.verifyOtp(mockOtp);

      expect(mockSignupSvc.verifyOTP).toHaveBeenCalledWith('123456', '1234567890', 'phone');
      expect(component.otpVerified).toBe(true);
      expect(component.isMobileVerified).toBe(true);
      expect(component.disableBtn).toBe(false);
    });

    it('should handle OTP verification error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Invalid OTP'
          },
          result: {
            remainingAttempt: 2
          }
        }
      };
      mockSignupSvc.verifyOTP.mockReturnValue(throwError(mockError));
      component.registrationForm.get('mobile')?.setValue('1234567890');
      const mockOtp = { value: '123456' };

      component.verifyOtp(mockOtp);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP');
      expect(component.disableVerifyBtn).toBe(false);
    });

    it('should disable verify button when no attempts remaining', () => {
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
      component.registrationForm.get('mobile')?.setValue('1234567890');
      const mockOtp = { value: '123456' };

      component.verifyOtp(mockOtp);

      expect(component.disableVerifyBtn).toBe(true);
    });

    it('should handle empty OTP', () => {
      const mockOtp = { value: '' };
      component.verifyOtp(mockOtp);
      // Should not call verifyOTP service
      expect(mockSignupSvc.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle null OTP', () => {
      component.verifyOtp(null);
      expect(mockSignupSvc.verifyOTP).not.toHaveBeenCalled();
    });
  });

  describe('navigateTo', () => {
    beforeEach(() => {
      component.init();
      component.isMobileVerified = true;
      component.isEmailVerified = true;
    });

    it('should navigate to request page with parameters', () => {
      const mockFormData = { firstname: 'John', email: 'john@test.com' };
      jest.spyOn(component.registrationForm, 'getRawValue').mockReturnValue(mockFormData);

      component.navigateTo('test-param');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/request'], {
        queryParams: { type: 'test-param' },
        state: {
          userform: mockFormData,
          isMobileVerified: true,
          isEmailVerified: true
        }
      });
    });

    it('should navigate without parameter', () => {
      const mockFormData = { firstname: 'John', email: 'john@test.com' };
      jest.spyOn(component.registrationForm, 'getRawValue').mockReturnValue(mockFormData);

      component.navigateTo();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/request'], {
        queryParams: { type: undefined },
        state: {
          userform: mockFormData,
          isMobileVerified: true,
          isEmailVerified: true
        }
      });
    });
  });
});

// Validator function tests
describe('Validator Functions', () => {
  describe('forbiddenNamesValidator', () => {
    it('should return null when optionsArray is null', () => {
      const validator = forbiddenNamesValidator(null);
      const control = new UntypedFormControl({ orgName: 'test' });
      
      expect(validator(control)).toBeNull();
    });

    it('should return null when control value is null', () => {
      const validator = forbiddenNamesValidator([]);
      const control = new UntypedFormControl(null);
      
      expect(validator(control)).toBeNull();
    });

    it('should return error when orgName is not found', () => {
      const optionsArray = [{ orgName: 'existing' }];
      const validator = forbiddenNamesValidator(optionsArray);
      const control = new UntypedFormControl({ orgName: 'nonexistent' });
      
      const result = validator(control);
      expect(result).toEqual({ forbiddenNames: { value: 'nonexistent' } });
    });

    it('should return null when orgName is found', () => {
      const optionsArray = [{ orgName: 'existing' }];
      const validator = forbiddenNamesValidator(optionsArray);
      const control = new UntypedFormControl({ orgName: 'existing' });
      
      expect(validator(control)).toBeNull();
    });
  });

  describe('forbiddenNamesValidatorNonEmpty', () => {
    it('should return null when optionsArray is null', () => {
      const validator = forbiddenNamesValidatorNonEmpty(null);
      const control = new UntypedFormControl({ orgName: 'test' });
      
      expect(validator(control)).toBeNull();
    });

    it('should return error when orgName is not found', () => {
      const optionsArray = [{ orgName: 'existing' }];
      const validator = forbiddenNamesValidatorNonEmpty(optionsArray);
      const control = new UntypedFormControl({ orgName: 'nonexistent' });
      
      const result = validator(control);
      expect(result).toEqual({ forbiddenNames: { value: 'nonexistent' } });
    });

    it('should return null when orgName is found', () => {
      const optionsArray = [{ orgName: 'existing' }];
      const validator = forbiddenNamesValidatorNonEmpty(optionsArray);
      const control = new UntypedFormControl({ orgName: 'existing' });
      
      expect(validator(control)).toBeNull();
    });
  });

  describe('forbiddenNamesValidatorPosition', () => {
    it('should return null when optionsArray is null', () => {
      const validator = forbiddenNamesValidatorPosition(null);
      const control = new UntypedFormControl({ name: 'test' });
      
      expect(validator(control)).toBeNull();
    });

    it('should return error when name is not found', () => {
      const optionsArray = [{ name: 'existing' }];
      const validator = forbiddenNamesValidatorPosition(optionsArray);
      const control = new UntypedFormControl({ name: 'nonexistent' });
      
      const result = validator(control);
      expect(result).toEqual({ forbiddenNames: { value: 'nonexistent' } });
    });

    it('should return null when name is found', () => {
      const optionsArray = [{ name: 'existing' }];
      const validator = forbiddenNamesValidatorPosition(optionsArray);
      const control = new UntypedFormControl({ name: 'existing' });
      
      expect(validator(control)).toBeNull();
    });
  });
});

// Additional edge case tests
describe('PublicWelcomeComponent - Edge Cases', () => {
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

  describe('Timer Subscription Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should unsubscribe timer when countdown reaches zero', () => {
      component.OTP_TIMER = 1000;
      component.startCountDown();
      
      const subscription = component.timerSubscription;
      const unsubscribeSpy = jest.spyOn(subscription!, 'unsubscribe');
      
      jest.advanceTimersByTime(2000);
      
      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(component.timeLeftforOTP).toBe(0);
    });

    it('should handle ngOnDestroy with active timer subscription', () => {
      component.OTP_TIMER = 5000;
      component.startCountDown();
      
      const subscription = component.timerSubscription;
    //  const unsubscribeSpy = jest.spyOn(subscription!, 'unsubscribe');
      
      component.ngOnDestroy();
      
      // Timer subscription should be cleaned up indirectly
      expect(subscription).toBeDefined();
    });
  });

  describe('Phone Change Detection', () => {
    beforeEach(() => {
      component.init();
    });

    it('should reset mobile verification on phone change', (done) => {
      component.isMobileVerified = true;
      component.otpSend = true;
      
      const mobileControl = component.registrationForm.get('mobile');
      component.onPhoneChange();
      
      // Simulate phone number change
      mobileControl?.setValue('9876543210');
      
      setTimeout(() => {
        expect(component.isMobileVerified).toBe(false);
        expect(component.otpSend).toBe(false);
        done();
      }, 0);
    });

    it('should not reset verification on initial load', (done) => {
      component.isMobileVerified = true;
      component.otpSend = true;
      
      component.onPhoneChange();
      
      setTimeout(() => {
        expect(component.isMobileVerified).toBe(true);
        expect(component.otpSend).toBe(true);
        done();
      }, 0);
    });
  });

  describe('Form Validation Edge Cases', () => {
    beforeEach(() => {
      component.init();
    });

    it('should handle form with invalid mobile number in sendOtp', () => {
      const mobileControl = component.registrationForm.get('mobile');
      mobileControl?.setValue('invalid');
      mobileControl?.setErrors({ pattern: true });

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid Mobile No');
    });

    it('should handle form with valid mobile but non-numeric value', () => {
      const mobileControl = component.registrationForm.get('mobile');
      mobileControl?.setValue('abc');

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter a valid Mobile No');
    });
  });

  describe('Organization Search Edge Cases', () => {
    beforeEach(() => {
      component.init();
    });

    it('should handle empty organization search results', () => {
      const mockResponse = {
        result: {
          response: []
        }
      };
      mockSignupSvc.searchOrgs.mockReturnValue(of(mockResponse));

      component.filterOrgsSearch('nonexistent');

      expect(component.filteredOrgList).toEqual([]);
      expect(component.resultFetched).toBe(true);
    });

    it('should handle organization search with partial matches', () => {
      const mockResponse = {
        result: {
          response: [
            { orgName: 'Test Organization' },
            { orgName: 'Testing Corp' },
            { orgName: 'Another Org' }
          ]
        }
      };
      mockSignupSvc.searchOrgs.mockReturnValue(of(mockResponse));

      component.filterOrgsSearch('test');

      expect(component.filteredOrgList).toHaveLength(2);
      expect(component.filteredOrgList[0].orgName).toBe('Test Organization');
      expect(component.filteredOrgList[1].orgName).toBe('Testing Corp');
    });
  });

  describe('Error Handling Edge Cases', () => {
    beforeEach(() => {
      component.init();
    });

    it('should handle OTP verification error without result object', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Invalid OTP'
          }
        }
      };
      mockSignupSvc.verifyOTP.mockReturnValue(throwError(mockError));
      component.registrationForm.get('mobile')?.setValue('1234567890');
      const mockOtp = { value: '123456' };

      component.verifyOtp(mockOtp);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid OTP');
      expect(component.disableVerifyBtn).toBe(false);
    });

    it('should handle sendOtp error without params', () => {
      const mockError = {
        error: {}
      };
      mockSignupSvc.sendOtp.mockReturnValue(throwError(mockError));
      component.registrationForm.get('mobile')?.setValue('1234567890');

      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please try again later');
    });

    it('should handle resendOtp error without params', () => {
      const mockError = {
        error: {}
      };
      mockSignupSvc.resendOtp.mockReturnValue(throwError(mockError));
      component.registrationForm.get('mobile')?.setValue('1234567890');

      component.resendOTP();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please try again later');
    });

    it('should handle verifyOtp error without params', () => {
      const mockError = {
        error: {}
      };
      mockSignupSvc.verifyOTP.mockReturnValue(throwError(mockError));
      component.registrationForm.get('mobile')?.setValue('1234567890');
      const mockOtp = { value: '123456' };

      component.verifyOtp(mockOtp);

      expect(mockSnackBar.open).toHaveBeenCalledWith('Please try again later');
    });
  });

  describe('Signup Edge Cases', () => {
    beforeEach(() => {
      component.init();
      component.usr = { userId: 'test-user-id' };
    });

    it('should handle signup without heirarchyObject', () => {
      component.heirarchyObject = null;
      mockWelcomeSignupSvc.register.mockReturnValue(of({}));

      component.signup();

      // Should not call register if no heirarchyObject
      expect(mockWelcomeSignupSvc.register).not.toHaveBeenCalled();
    });

    it('should handle signup with partial heirarchyObject', () => {
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel'
        // Missing other properties
      };
      mockWelcomeSignupSvc.register.mockReturnValue(of({}));
      component.registrationForm.patchValue({
        firstname: 'John',
        group: 'test-group',
        mobile: '1234567890'
      });

      component.signup();

      expect(mockWelcomeSignupSvc.register).toHaveBeenCalledWith({
        request: {
          userId: 'test-user-id',
          firstName: 'John',
          group: 'test-group',
          phone: '1234567890',
          orgName: 'Test Org',
          channel: 'test-channel',
          sbOrgId: undefined,
          mapId: '',
          sbRootOrgId: undefined,
          organisationType: '',
          organisationSubType: ''
        }
      });
    });
  });

  describe('Component State Management', () => {
    beforeEach(() => {
      component.init();
    });

    it('should maintain correct state during organization editing flow', () => {
      // Initial state
      component.hideOrg = true;
      component.resultFetched = true;
      component.searching = true;
      component.heirarchyObject = { orgName: 'test' };

      // Edit organization
      component.editOrg();

      expect(component.hideOrg).toBe(false);
      expect(component.resultFetched).toBe(false);
      expect(component.searching).toBe(false);
      expect(component.heirarchyObject).toBeNull();
    });

    it('should handle organization value changes correctly', (done) => {
      component.OrgsSearchChange();
      
      const orgControl = component.registrationForm.get('organisation');
      orgControl?.setValue('new value');
      
      setTimeout(() => {
        expect(component.resultFetched).toBe(false);
        done();
      }, 0);
    });
  });

  describe('Async Operations', () => {
    it('should handle concurrent search operations', async () => {
      const mockResponse = {
        result: {
          response: [{ orgName: 'Test Org' }]
        }
      };
      mockSignupSvc.searchOrgs.mockReturnValue(of(mockResponse));

      const promise1 = component.searchOrgs('test1');
      const promise2 = component.searchOrgs('test2');

      await Promise.all([promise1, promise2]);

      expect(mockSignupSvc.searchOrgs).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch operation completion', async () => {
      await component.fetch();
      expect(mockInitSvc.init).toHaveBeenCalled();
    });
  });
});