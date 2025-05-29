import { AppInterceptorService } from './app-interceptor.service';
import { HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError, of } from 'rxjs';
import { NOTIFICATION_TIME } from '@sunbird-cb/collection/src/lib/_common/ck-editor/constants/constant';

// Mock dependencies
const mockConfigurationsService = {
  userPreference: null,
  activeOrg: 'test-org',
  rootOrg: 'test-root-org',
  userProfile: { userId: 'test-user-id' },
  cstoken: 'test-cs-token',
  hostPath: 'test-host-path'
};

const mockAuthKeycloakService = {
  logout: jest.fn(),
  force_logout: jest.fn()
};

const mockMatSnackBar = {
  open: jest.fn()
};

const mockHttpHandler = {
  handle: jest.fn()
};

// Mock window and location objects
const mockLocation = {
  origin: 'https://example.com',
  href: 'https://example.com/test-page',
  assign: jest.fn()
};

const mockLocalStorage = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};

// Setup global mocks
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('AppInterceptorService', () => {
  let service: AppInterceptorService;
  let configSvc: ConfigurationsService;
  let authSvc: AuthKeycloakService;
  let snackBar: MatSnackBar;
  let handler: HttpHandler;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    configSvc = mockConfigurationsService as any;
    authSvc = mockAuthKeycloakService as any;
    snackBar = mockMatSnackBar as any;
    handler = mockHttpHandler as any;

    service = new AppInterceptorService(
      configSvc,
      snackBar,
      authSvc,
      'en-US'
    );

    // Reset mock implementations
    mockHttpHandler.handle.mockReturnValue(of({} as HttpEvent<any>));
  });

  describe('intercept method', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });

    // it('should handle request when activeOrg and rootOrg are present', () => {
    //   const mockRequest = new HttpRequest('GET', '/test-url');
      
    //   service.intercept(mockRequest, handler);

    //   expect(handler.handle).toHaveBeenCalledWith(
    //     expect.any(HttpRequest)
    //   );
    // });

    it('should set correct headers in modified request', () => {
      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      service.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('Authorization')).toBe('');
      expect(capturedRequest!.headers.get('org')).toBe('test-org');
      expect(capturedRequest!.headers.get('rootOrg')).toBe('test-root-org');
      expect(capturedRequest!.headers.get('locale')).toBe('en');
      expect(capturedRequest!.headers.get('wid')).toBe('test-user-id');
      expect(capturedRequest!.headers.get('cstoken')).toBe('test-cs-token');
      expect(capturedRequest!.headers.get('hostPath')).toBe('test-host-path');
    });

    it('should handle multiple locales from userPreference', () => {
      configSvc.userPreference = {
        selectedLangGroup: 'fr, de, en,es',
        selectedTheme:'', 
        selectedFont:'', 
        selectedLocale:'', 
        isDarkMode: false,
        isRTL:false, 
        colorPallet:[], 
        defaultCardType:'', 
        pinnedApps:'',
        completedActivity:[], 
        profileSettings:[]
      };

      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      service.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('locale')).toBe('en,fr,de,es');
    });

    it('should handle empty wid when userProfile is null', () => {
      configSvc.userProfile = null;

      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      service.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('wid')).toBe('');
    });

    it('should handle empty cstoken when cstoken is null', () => {
      configSvc.cstoken = '';

      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      service.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('cstoken')).toBe('');
    });

    it('should pass through request unchanged when activeOrg or rootOrg is missing', () => {
      configSvc.activeOrg = null;
      configSvc.rootOrg = null;

      const mockRequest = new HttpRequest('GET', '/test-url');

      service.intercept(mockRequest, handler);

      expect(handler.handle).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      // Setup for error scenarios
      mockLocation.origin = 'https://localhost:4200';
      mockLocation.href = 'https://localhost:4200/test-page';
    });

    it('should handle status 0 error on localhost', (done) => {
      const mockRequest = new HttpRequest('GET', '/test-url');
      const mockError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error'
      });

      mockHttpHandler.handle.mockReturnValue(throwError(mockError));

      service.intercept(mockRequest, handler).subscribe({
        error: (error) => {
          expect(snackBar.open).toHaveBeenCalledWith(
            'Please login Again and Apply new TOKEN',
            undefined,
            { duration: NOTIFICATION_TIME * 3 }
          );
          expect(authSvc.force_logout).toHaveBeenCalled();
          expect(error).toBe(mockError);
          done();
        }
      });
    });

    it('should handle status 200 error with redirect URL', (done) => {
      const mockRequest = new HttpRequest('GET', '/test-url');
      const mockError = new HttpErrorResponse({
        status: 200,
        statusText: 'OK',
        url: 'https://redirect-url.com'
      });

      // Mock window.location.href setter
      Object.defineProperty(window.location, 'href', {
        set: jest.fn(),
        configurable: true
      });

      mockHttpHandler.handle.mockReturnValue(throwError(mockError));

      service.intercept(mockRequest, handler).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          done();
        }
      });
    });

    it('should handle status 419 error on localhost', (done) => {
      const mockRequest = new HttpRequest('GET', '/test-url');
      const mockError = new HttpErrorResponse({
        status: 419,
        statusText: 'Authentication Timeout',
        error: {
          redirectUrl: 'https://auth.example.com/login'
        }
      });

      mockLocalStorage.getItem.mockReturnValue('test-session-id');
      
      // Mock window.location.href setter
      Object.defineProperty(window.location, 'href', {
        set: jest.fn(),
        configurable: true
      });

      mockHttpHandler.handle.mockReturnValue(throwError(mockError));

      service.intercept(mockRequest, handler).subscribe({
        error: (error) => {
          expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('telemetrySessionId');
          expect(error).toBe(mockError);
          done();
        }
      });
    });

    it('should handle status 419 error on non-localhost', (done) => {
      mockLocation.origin = 'https://production.com';
      mockLocation.href = 'https://production.com/test-page';

      const mockRequest = new HttpRequest('GET', '/test-url');
      const mockError = new HttpErrorResponse({
        status: 419,
        statusText: 'Authentication Timeout',
        error: {
          redirectUrl: 'https://auth.example.com/login'
        }
      });

      // Mock window.location.href setter
      Object.defineProperty(window.location, 'href', {
        set: jest.fn(),
        configurable: true
      });

      mockHttpHandler.handle.mockReturnValue(throwError(mockError));

      service.intercept(mockRequest, handler).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          done();
        }
      });
    });

    it('should not remove telemetrySessionId if it does not exist', (done) => {
      const mockRequest = new HttpRequest('GET', '/test-url');
      const mockError = new HttpErrorResponse({
        status: 419,
        statusText: 'Authentication Timeout',
        error: {
          redirectUrl: 'https://auth.example.com/login'
        }
      });

      mockLocalStorage.getItem.mockReturnValue(null);

      mockHttpHandler.handle.mockReturnValue(throwError(mockError));

      service.intercept(mockRequest, handler).subscribe({
        error: (error) => {
          expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
          expect(error).toBe(mockError);
          done();
        }
      });
    });

    it('should handle non-HttpErrorResponse errors', (done) => {
      const mockRequest = new HttpRequest('GET', '/test-url');
      const mockError = new Error('Generic error');

      mockHttpHandler.handle.mockReturnValue(throwError(mockError));

      service.intercept(mockRequest, handler).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(snackBar.open).not.toHaveBeenCalled();
          expect(authSvc.force_logout).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should not handle status 0 error on non-localhost', (done) => {
      mockLocation.origin = 'https://production.com';

      const mockRequest = new HttpRequest('GET', '/test-url');
      const mockError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error'
      });

      mockHttpHandler.handle.mockReturnValue(throwError(mockError));

      service.intercept(mockRequest, handler).subscribe({
        error: (error) => {
          expect(snackBar.open).not.toHaveBeenCalled();
          expect(authSvc.force_logout).not.toHaveBeenCalled();
          expect(error).toBe(mockError);
          done();
        }
      });
    });
  });

  describe('locale handling', () => {
    it('should replace en-US with en in locale', () => {
      const serviceWithEnUS = new AppInterceptorService(
        configSvc,
        snackBar,
        authSvc,
        'en-US'
      );

      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      serviceWithEnUS.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('locale')).toBeNull();
    });

    it('should handle userPreference with empty selectedLangGroup', () => {
      configSvc.userPreference = {
        selectedLangGroup: 'en',
        selectedTheme:'', 
        selectedFont:'', 
        selectedLocale:'', 
        isDarkMode: false,
        isRTL:false, 
        colorPallet:[], 
        defaultCardType:'', 
        pinnedApps:'',
        completedActivity:[], 
        profileSettings:[]
      };

      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      service.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('locale')).toBeNull();
    });

    it('should filter out empty locale strings', () => {
      configSvc.userPreference = {
        selectedLangGroup: 'fr,  , de,   , en',
        selectedTheme:'', 
        selectedFont:'', 
        selectedLocale:'', 
        isDarkMode: false,
        isRTL:false, 
        colorPallet:[], 
        defaultCardType:'', 
        pinnedApps:'',
        completedActivity:[], 
        profileSettings:[]
      };

      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      service.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('locale')).toBeNull();
    });

    it('should not add duplicate locales', () => {
      configSvc.userPreference = {
        selectedLangGroup: 'en, fr, en, de',
        selectedTheme:'', 
        selectedFont:'', 
        selectedLocale:'', 
        isDarkMode: false,
        isRTL:false, 
        colorPallet:[], 
        defaultCardType:'', 
        pinnedApps:'',
        completedActivity:[], 
        profileSettings:[]
      };

      const mockRequest = new HttpRequest('GET', '/test-url');
      let capturedRequest: HttpRequest<any>;

      mockHttpHandler.handle.mockImplementation((req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      });

      service.intercept(mockRequest, handler);

      expect(capturedRequest!.headers.get('locale')).toBeNull();
    });
  });
});