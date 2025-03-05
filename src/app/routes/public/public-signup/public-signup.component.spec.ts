import { PublicSignupComponent } from './public-signup.component';
import { SignupService } from './signup.service';
import { LoggerService, ConfigurationsService, MultilingualTranslationsService, EventService, TelemetryService } from '@sunbird-cb/utils-v2';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'

describe('PublicSignupComponent', () => {
  let component: PublicSignupComponent;
  let mockSignupService: jest.Mocked<SignupService>;
  let mockLoggerService: jest.Mocked<LoggerService>;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;
  let mockRecaptchaService: jest.Mocked<ReCaptchaV3Service>;
  let mockRouter: jest.Mocked<Router>;
  let mockTranslate: jest.Mocked<TranslateService>;
  let mockLangTranslations: jest.Mocked<MultilingualTranslationsService>;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockSanitizer: jest.Mocked<DomSanitizer>;
  let mockEventService: jest.Mocked<EventService>;
  let mockTelemetryService: jest.Mocked<TelemetryService>;

  beforeEach(() => {
    mockSignupService = {
      updateSignupDataObservable: of({}),
      sendOtp: jest.fn(),
      resendOtp: jest.fn(),
      verifyOTP: jest.fn(),
      register: jest.fn(),
      searchOrgs: jest.fn()
    } as any;

    mockLoggerService = {
      error: jest.fn()
    } as any;

    mockConfigService = {
      instanceConfig: {
        telemetryConfig: { pdata: { id: 'testPortal' } },
        websitelanguages: [],
        isMultilingualEnabled: false
      },
      unMappedUser: { id: 'testUser' }
    } as any;

    mockSnackBar = {
      open: jest.fn()
    } as any;

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) })
    } as any;

    mockActivatedRoute = {
      snapshot: {
        data: {
          positions: { data: [] },
          group: { data: ['Group1', 'Group2'] }
        }
      }
    } as any;

    mockRecaptchaService = {
      execute: jest.fn().mockReturnValue(of('captchaToken'))
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any;

    mockLangTranslations = {
      translateActualLabel: jest.fn().mockReturnValue('Translated Label'),
      updatelanguageSelected: jest.fn()
    } as any;

    mockHttpClient = {
      get: jest.fn().mockReturnValue(of(''))
    } as any;

    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn()
    } as any;

    mockEventService = {
      raiseInteractTelemetry: jest.fn()
    } as any;

    mockTelemetryService = {
      end: jest.fn()
    } as any;

    component = new PublicSignupComponent(
      mockSignupService,
      mockLoggerService,
      mockConfigService,
      mockSnackBar,
      mockDialog,
      mockActivatedRoute,
      mockRecaptchaService,
      mockRouter,
      document,
      'browser',
      mockTranslate,
      mockLangTranslations,
      mockHttpClient,
      mockSanitizer,
      mockEventService,
      mockTelemetryService
    );

    // Initialize the form
    component.ngOnInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('Form Initialization', () => {
    it('should initialize the registration form', () => {
      expect(component.registrationForm).toBeDefined();
      expect(component.registrationForm.get('firstname')).toBeTruthy();
      expect(component.registrationForm.get('email')).toBeTruthy();
      expect(component.registrationForm.get('mobile')).toBeTruthy();
    });

    it('should set groups from route data', () => {
      expect(component.groupsOriginal).toEqual(['Group1', 'Group2']);
    });
  });

  describe('OTP Verification', () => {
    it('should send mobile OTP successfully', () => {
      const mockOtpResponse = { result: { response: 'SUCCESS' } };
      mockSignupService.sendOtp.mockReturnValue(of(mockOtpResponse));
      
      component.registrationForm.get('mobile')?.setValue('1234567890');
      component.sendOtp();

      expect(mockSignupService.sendOtp).toHaveBeenCalledWith('1234567890', 'phone');
      expect(component.otpSend).toBeTruthy();
    });

    it('should handle mobile OTP send error', () => {
      const mockError = { error: { params: { errmsg: 'OTP Send Failed' } } };
      mockSignupService.sendOtp.mockReturnValue(throwError(mockError));
      
      component.registrationForm.get('mobile')?.setValue('1234567890');
      component.sendOtp();

      expect(mockSnackBar.open).toHaveBeenCalledWith('OTP Send Failed');
    });

    it('should verify mobile OTP successfully', () => {
      const mockVerifyResponse = { result: { response: 'SUCCESS' } };
      mockSignupService.verifyOTP.mockReturnValue(of(mockVerifyResponse));
      
      component.registrationForm.get('mobile')?.setValue('1234567890');
      component.verifyOtp({ value: '1234' });

      expect(mockSignupService.verifyOTP).toHaveBeenCalledWith(1234, '1234567890', 'phone');
      expect(component.isMobileVerified).toBeTruthy();
    });
  });

  describe('Organization Search', () => {
    it('should search organizations', async () => {
      const mockOrgResponse = {
        result: {
          response: [
            { orgName: 'Test Org 1' },
            { orgName: 'Test Org 2' }
          ]
        }
      };
      mockSignupService.searchOrgs.mockReturnValue(of(mockOrgResponse));
      
      await component.searchOrgs('Test');

      expect(mockSignupService.searchOrgs).toHaveBeenCalledWith('test', 'ministry');
      expect(component.filteredOrgList).toBeDefined();
    });

    it('should handle organization search error', async () => {
      const mockError = { error: { params: { errmsg: 'Search Failed' } } };
      mockSignupService.searchOrgs.mockReturnValue(throwError(mockError));
      
      await component.searchOrgs('Test');

      expect(mockSnackBar.open).toHaveBeenCalledWith('Search Failed');
    });
  });

  describe('Signup Process', () => {
    it('should signup successfully', () => {
      const mockRegisterResponse = { result: {} };
      mockSignupService.register.mockReturnValue(of(mockRegisterResponse));
      
      // Mock form values
      component.registrationForm.patchValue({
        firstname: 'John',
        email: 'john@example.com',
        mobile: '1234567890',
        group: 'TestGroup'
      });

      // Mock hierarchy object
      component.heirarchyObject = {
        orgName: 'Test Org',
        channel: 'test-channel',
        sbOrgType: 'Ministry',
        sbOrgSubType: 'Government',
        mapId: '123',
        sbRootOrgId: 'root123',
        sbOrgId: 'org123'
      };

      component.signup();

      expect(mockRecaptchaService.execute).toHaveBeenCalledWith('importantAction');
      expect(mockSignupService.register).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle signup error', () => {
      const mockError = { error: { params: { errmsg: 'Signup Failed' } } };
      mockSignupService.register.mockReturnValue(throwError(mockError));
      
      component.signup();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Signup Failed');
    });
  });

  describe('Language Selection', () => {
    it('should select language', () => {
      component.selectLanguage('fr');

      expect(component.selectedLanguage).toBe('fr');
      expect(localStorage.getItem('websiteLanguage')).toBe('fr');
      expect(mockLangTranslations.updatelanguageSelected).toHaveBeenCalledWith(true, 'fr', '');
    });
  });

  describe('Utility Methods', () => {
    it('should validate email length', () => {
      component.emailVerification('shortemail@example.com');
      expect(component.emailLengthVal).toBeFalsy();

      component.emailVerification('verylongemailaddresswithoveronesixtyfourcharsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss@example.com');
      expect(component.emailLengthVal).toBeTruthy();
    });

    it('should allow only numeric input', () => {
      const numericEvent = { key: '5' };
      const nonNumericEvent = { key: 'a' };

      expect(component.numericOnly(numericEvent)).toBeTruthy();
      expect(component.numericOnly(nonNumericEvent)).toBeFalsy();
    });
  });
});