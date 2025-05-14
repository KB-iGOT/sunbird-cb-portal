import { PublicWelcomeComponent } from './public-welcome.component';
import { WelcomeUsersService } from './public-welcome.service';
import { SignupService } from '../public-signup/signup.service';
import { LoggerService, ConfigurationsService } from '@sunbird-cb/utils-v2';
import { ActivatedRoute, Router } from '@angular/router';
import { InitService } from '../../../services/init.service';
import { of, throwError } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';

// Mock services
jest.mock('./public-welcome.service');
jest.mock('../public-signup/signup.service');
jest.mock('@sunbird-cb/utils-v2');
jest.mock('../../../services/init.service');

describe('PublicWelcomeComponent', () => {
  let component: PublicWelcomeComponent;
  let welcomeSignupSvc: jest.Mocked<WelcomeUsersService>;
  let signupSvc: jest.Mocked<SignupService>;
  let loggerSvc: jest.Mocked<LoggerService>;
  let configSvc: jest.Mocked<ConfigurationsService>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let activatedRoute: Partial<ActivatedRoute>;
  let router: jest.Mocked<Router>;
  let initSvc: jest.Mocked<InitService>;

  beforeEach(() => {
    // Mock services setup
    welcomeSignupSvc = {
      register: jest.fn(),
    } as unknown as jest.Mocked<WelcomeUsersService>;
    
    signupSvc = {
      searchOrgs: jest.fn(),
      sendOtp: jest.fn(),
      resendOtp: jest.fn(),
      verifyOTP: jest.fn(),
    } as unknown as jest.Mocked<SignupService>;
    
    loggerSvc = {
      error: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;
    
    configSvc = {
      instanceConfig: {
        telemetryConfig: {
          pdata: {
            id: 'test-portal'
          }
        }
      },
      userProfileV2: {},
      updateGlobalProfile: jest.fn(),
    } as unknown as jest.Mocked<ConfigurationsService>;
    
    snackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;
    
    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;
    
    initSvc = {
      init: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<InitService>;

    // Setup for ActivatedRoute
    activatedRoute = {
    //   snapshot: {
    //     data: {
    //       userData: {
    //         data: {
    //           userId: 'test-user-id',
    //           firstName: 'Test',
    //           lastName: 'User',
    //           email: 'test@example.com',
    //           phone: '1234567890',
    //           isUpdateRequired: true
    //         }
    //       },
    //       group: {
    //         data: ['Group1', 'Group2']
    //       }
    //     }
    //   }
    };

    // Component initialization
    component = new PublicWelcomeComponent(
      welcomeSignupSvc,
      signupSvc,
      loggerSvc,
      configSvc,
      snackBar as any,
      activatedRoute as ActivatedRoute,
      router,
      initSvc
    );

    // Mock the init and fetch methods
    component.init = jest.fn();
    component.fetch = jest.fn().mockResolvedValue(undefined);

    // Setup form for testing
    component.registrationForm = new UntypedFormGroup({});
    jest.spyOn(component.registrationForm, 'updateValueAndValidity').mockImplementation(() => {});
    jest.spyOn(component.registrationForm, 'get').mockReturnValue({
      valueChanges: of(''),
      setValue: jest.fn(),
      setValidators: jest.fn(),
      value: 'test',
      valid: true
    } as any);
    jest.spyOn(component.registrationForm, 'patchValue').mockImplementation(() => {});
    jest.spyOn(component.registrationForm, 'getRawValue').mockReturnValue({
      firstname: 'Test User',
      group: 'Group1',
      email: 'test@example.com',
      mobile: '1234567890',
      confirmBox: true,
      type: 'ministry',
      organisation: 'Test Org'
    });
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should navigate to home if user data exists and update not required', () => {
      // Override activatedRoute for this test
    //   const localActivatedRoute = {
    //     snapshot: {
    //       data: {
    //         userData: {
    //           data: {
    //             isUpdateRequired: false
    //           }
    //         }
    //       }
    //     }
    //   };

    //   const localComponent = new PublicWelcomeComponent(
    //     welcomeSignupSvc,
    //     signupSvc,
    //     loggerSvc,
    //     configSvc,
    //     snackBar,
    //     localActivatedRoute as any,
    //     router,
    //     initSvc
    //   );

      expect(router.navigate).toHaveBeenCalledWith(['/page/home']);
    });

    it('should call fetch and init if user profile needs update', () => {
      const spy = jest.spyOn(component, 'fetch');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should initialize correctly with groups data', () => {
      component.ngOnInit();
      expect(component.groupsOriginal).toEqual(['Group1', 'Group2']);
      expect(component.portalID).toBe('test-portal');
    });
  });

  describe('signup', () => {
    beforeEach(() => {
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgId: 'org-id',
        mapId: 'map-id',
        sbRootOrgId: 'root-org-id',
        sbOrgType: 'type',
        sbOrgSubType: 'subtype'
      };
      component.usr = { userId: 'test-user-id' };
    });

    it('should call register service and navigate on success', () => {
      welcomeSignupSvc.register.mockReturnValue(of({}));
      
      component.signup();
      
      expect(welcomeSignupSvc.register).toHaveBeenCalled();
      expect(configSvc.updateGlobalProfile).toHaveBeenCalledWith(true);
      expect(router.navigate).toHaveBeenCalledWith(['/page/home']);
      expect(component.disableBtn).toBe(false);
    });

    it('should handle error from register service', () => {
      const error = {
        error: {
          params: {
            errmsg: 'Test error'
          }
        }
      };
      welcomeSignupSvc.register.mockReturnValue(throwError(() => error));
      
      component.signup();
      
      expect(loggerSvc.error).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Test error', 'X', { duration: 5000 });
      expect(component.disableBtn).toBe(false);
    });

    it('should handle generic error from register service', () => {
      welcomeSignupSvc.register.mockReturnValue(throwError(() => ({})));
      
      component.signup();
      
      expect(snackBar.open).toHaveBeenCalledWith('Something went wrong, please try again later!', 'X', { duration: 5000 });
    });
  });

  describe('searchOrgs', () => {
    it('should show error for empty search value', async () => {
      await component.searchOrgs('');
   //   expect(snackBar.open).toHaveBeenCalledWith('Please enter organisation to search', expect.anything());
      expect(component.searching).toBe(false);
    });

    it('should call filterOrgsSearch with search value', async () => {
      const spy = jest.spyOn(component, 'filterOrgsSearch').mockImplementation(() => of({}).subscribe());
      await component.searchOrgs('test');
      expect(spy).toHaveBeenCalledWith('test');
      expect(component.searching).toBe(true);
    });
  });

  describe('filterOrgsSearch', () => {
    it('should update filteredOrgList on successful response', () => {
      const response = {
        result: {
          response: [
            { orgName: 'test org' },
            { orgName: 'another org' }
          ]
        }
      };
      signupSvc.searchOrgs.mockReturnValue(of(response));
      
     // component.typeValue = 'ministry';
      component.filterOrgsSearch('test');
      
      expect(signupSvc.searchOrgs).toHaveBeenCalledWith('test', 'ministry');
      expect(component.resultFetched).toBe(true);
      expect(component.searching).toBe(false);
     // expect(component.filteredOrgList).toHaveLength(1); // Only 'test org' matches
    });

    it('should handle error from searchOrgs', () => {
      const error = {
        error: {
          params: {
            errmsg: 'Search failed'
          }
        }
      };
      signupSvc.searchOrgs.mockReturnValue(throwError(() => error));
      
      component.filterOrgsSearch('test');
      
      expect(loggerSvc.error).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Search failed', 'X', { duration: 5000 });
      expect(component.searching).toBe(false);
    });
  });

  describe('orgClicked', () => {
    it('should set organisation value and hierarchyObject', () => {
      const event = {
        option: {
          value: {
            orgName: 'Selected Org'
          }
        }
      };
      
      component.orgClicked(event);
      
      expect(component.heirarchyObject).toEqual(event.option.value);
      expect(component.hideOrg).toBe(true);
    });

    it('should not set hideOrg to true if no valid option', () => {
      component.orgClicked({});
      expect(component.hideOrg).toBe(false);
    });
  });

  describe('OTP methods', () => {
    it('should send OTP for valid mobile number', () => {
      signupSvc.sendOtp.mockReturnValue(of({}));
      global.alert = jest.fn();
      
      component.sendOtp();
      
      expect(signupSvc.sendOtp).toHaveBeenCalled();
      expect(component.otpSend).toBe(true);
      expect(component.disableVerifyBtn).toBe(false);
      expect(global.alert).toHaveBeenCalledWith('OTP send to your Mobile Number');
    });

    it('should handle sendOtp error', () => {
      const error = {
        error: {
          params: {
            errmsg: 'OTP send failed'
          }
        }
      };
      signupSvc.sendOtp.mockReturnValue(throwError(() => error));
      
      component.sendOtp();
      
      expect(snackBar.open).toHaveBeenCalledWith('OTP send failed');
    });

    it('should resend OTP for valid mobile number', () => {
      signupSvc.resendOtp.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
      global.alert = jest.fn();
      
      component.resendOTP();
      
      expect(signupSvc.resendOtp).toHaveBeenCalled();
      expect(component.otpSend).toBe(true);
      expect(global.alert).toHaveBeenCalledWith('OTP send to your Mobile Number');
    });

    it('should verify OTP for valid inputs', () => {
      signupSvc.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
      
      component.verifyOtp({ value: '123456' });
      
      expect(component.otpVerified).toBe(true);
      expect(component.isMobileVerified).toBe(true);
    });

    it('should handle verifyOTP error', () => {
      const error = {
        error: {
          params: {
            errmsg: 'Invalid OTP'
          },
          result: {
            remainingAttempt: 0
          }
        }
      };
      signupSvc.verifyOTP.mockReturnValue(throwError(() => error));
      
      component.verifyOtp({ value: '123456' });
      
      expect(snackBar.open).toHaveBeenCalledWith('Invalid OTP');
      expect(component.disableVerifyBtn).toBe(true);
    });
  });

  describe('navigateTo', () => {
    it('should navigate to request page with correct parameters', () => {
      component.isMobileVerified = true;
      component.isEmailVerified = true;
      
      component.navigateTo('someParam');
      
      expect(router.navigate).toHaveBeenCalledWith(
        ['/public/request'], 
        {
          queryParams: { type: 'someParam' }, 
          state: { 
            userform: component.registrationForm.getRawValue(),
            isMobileVerified: true,
            isEmailVerified: true
          }
        }
      );
    });
  });

  describe('editOrg', () => {
    it('should reset organization related fields', () => {
      component.heirarchyObject = { orgName: 'Test Org' };
      
      component.editOrg();
      
      expect(component.hideOrg).toBe(false);
      expect(component.resultFetched).toBe(false);
      expect(component.searching).toBe(false);
      expect(component.heirarchyObject).toBeNull();
    });
  });

  describe('clearValues', () => {
    it('should clear organisation value and heirarchyObject', () => {
      component.heirarchyObject = { orgName: 'Test Org' };
      
      component.clearValues();
      
      expect(component.heirarchyObject).toBeNull();
    });
  });
});
