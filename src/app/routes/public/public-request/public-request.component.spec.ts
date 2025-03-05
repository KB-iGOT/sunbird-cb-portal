import { PublicRequestComponent } from './public-request.component';
import { SignupService } from '../public-signup/signup.service';
import { RequestService } from './request.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigurationsService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'

describe('PublicRequestComponent', () => {
  let component: PublicRequestComponent;
  let mockSignupService: jest.Mocked<SignupService>;
  let mockRequestService: jest.Mocked<RequestService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>;
  let mockTranslateService: jest.Mocked<TranslateService>;

  beforeEach(() => {
    mockSignupService = {
      sendOtp: jest.fn(),
      resendOtp: jest.fn(),
      verifyOTP: jest.fn(),
      updateSignUpData: jest.fn()
    } as any;

    mockRequestService = {
      sendOtp: jest.fn(),
      resendOtp: jest.fn(),
      createPosition: jest.fn(),
      createOrg: jest.fn(),
      createDomain: jest.fn()
    } as any;

    mockRouter = {
      getCurrentNavigation: jest.fn().mockReturnValue({
        extras: {
          state: {
            userform: { firstname: 'Test', mobile: '1234567890' },
            isMobileVerified: false,
            isEmailVerified: false
          }
        }
      })
    } as any;

    mockActivatedRoute = {
      snapshot: {
        queryParams: { type: 'Position' }
      }
    } as any;

    mockSnackBar = {
      open: jest.fn()
    } as any;

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({}))
      })
    } as any;

    mockConfigService = {
      instanceConfig: {
        isMultilingualEnabled: true,
        websitelanguages: ['en', 'hi']
      }
    } as any;

    mockLangTranslations = {
      translateLabel: jest.fn(),
      translateActualLabel: jest.fn().mockReturnValue('Translated Label'),
      updatelanguageSelected: jest.fn()
    } as any;

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any;

    component = new PublicRequestComponent(
      mockActivatedRoute,
      mockRouter as any,
      mockSnackBar,
      mockSignupService,
      mockDialog,
      mockRequestService,
      {} as any,
      mockConfigService,
      mockLangTranslations,
      mockTranslateService
    );

    // Manually call ngOnInit as it won't be called automatically in unit tests
    component.ngOnInit();
  });

  describe('Form Initialization', () => {
    it('should initialize form with correct validators', () => {
      expect(component.requestForm).toBeDefined();
      expect(component.requestForm.get('firstname')).toBeTruthy();
      expect(component.requestForm.get('email')).toBeTruthy();
      expect(component.requestForm.get('mobile')).toBeTruthy();
      expect(component.requestType).toBe('Position');
    });
  });

  describe('Mobile OTP Verification', () => {
    it('should send OTP for mobile', () => {
      mockSignupService.sendOtp.mockReturnValue(of({}));
      
      component.requestForm.patchValue({ mobile: '1234567890' });
      component.sendOtp();

      expect(mockSignupService.sendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBeTruthy();
    });

    it('should verify mobile OTP successfully', () => {
      mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
      
      component.requestForm.patchValue({ mobile: '1234567890' });
      component.verifyOtp({ value: '1234' });

      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith(1234, '1234567890', 'phone');
      expect(component.isMobileVerified).toBeTruthy();
    });
  });

  describe('Email OTP Verification', () => {
    it('should send OTP for email', () => {
      mockRequestService.sendOtp.mockReturnValue(of({}));
      
      component.requestForm.patchValue({ email: 'test@example.com' });
      component.sendOtpEmail();

      expect(mockRequestService.sendOtp).toHaveBeenCalledWith('test@example.com', 'email');
      expect(component.otpEmailSend).toBeTruthy();
    });

    it('should verify email OTP successfully', () => {
      mockSignupService.verifyOTP.mockReturnValue(of({ result: { response: 'SUCCESS' } }));
      
      component.requestForm.patchValue({ email: 'test@example.com' });
      component.verifyOtpEmail({ value: '1234' });

      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith(1234, 'test@example.com', 'email');
      expect(component.isEmailVerified).toBeTruthy();
    });
  });

  describe('Request Submission', () => {
    it('should submit position request successfully', () => {
      mockRequestService.createPosition.mockReturnValue(of({}));
      
      component.requestForm.patchValue({
        firstname: 'John',
        email: 'john@example.com',
        mobile: '1234567890',
        position: 'Developer',
        addDetails: 'Test details'
      });
      component.submitRequest();

      expect(mockRequestService.createPosition).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle request submission error', () => {
      const mockError = {
        error: {
          params: {
            errmsg: 'Submission failed'
          }
        }
      };
      mockRequestService.createPosition.mockReturnValue(throwError(mockError));
      
      component.requestForm.patchValue({
        firstname: 'John',
        email: 'john@example.com',
        mobile: '1234567890',
        position: 'Developer'
      });
      component.submitRequest();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Submission failed');
    });
  });

  describe('Utility Methods', () => {
    it('should modify domain correctly', () => {
      expect(component.modifyDomain('test@example.com')).toBe('example.com');
      expect(component.modifyDomain('example.com')).toBe('example.com');
    });

    it('should numeric only validation work', () => {
      const numericEvent = { key: '5' };
      const nonNumericEvent = { key: 'a' };

      expect(component.numericOnly(numericEvent)).toBeTruthy();
      expect(component.numericOnly(nonNumericEvent)).toBeFalsy();
    });
  });
});