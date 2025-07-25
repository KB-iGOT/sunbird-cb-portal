import { AppInterceptorService } from './app-interceptor.service';
import { HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NOTIFICATION_TIME } from '@sunbird-cb/collection/src/lib/_common/ck-editor/constants/constant';
import { of, throwError } from 'rxjs';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
    href: 'https://example.com/page/home',
    assign: jest.fn(),
  },
  writable: true,
});

describe('AppInterceptorService', () => {
  let service: AppInterceptorService;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockAuthSvc: jest.Mocked<AuthKeycloakService>;
  let mockHttpHandler: jest.Mocked<HttpHandler>;
  let mockHttpRequest: HttpRequest<any>;

  beforeEach(() => {
    // Mock ConfigurationsService
    mockConfigSvc = {
      userPreference: null,
      activeOrg: 'testOrg',
      rootOrg: 'testRootOrg',
      userProfile: { userId: 'testUser' },
      cstoken: 'testToken',
      hostPath: '/test/path',
    } as any;

    // Mock MatSnackBar
    mockSnackBar = {
      open: jest.fn(),
    } as any;

    // Mock AuthKeycloakService
    mockAuthSvc = {
      logout: jest.fn(),
      force_logout: jest.fn(),
    } as any;

    // Mock HttpHandler
    mockHttpHandler = {
      handle: jest.fn(),
    } as any;

    // Create service instance
    service = new AppInterceptorService(
      mockConfigSvc,
      mockSnackBar,
      mockAuthSvc,
      'en-US'
    );

    // Create mock HTTP request
    mockHttpRequest = new HttpRequest('GET', '/test-url');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    describe('when activeOrg and rootOrg are available', () => {
      beforeEach(() => {
        mockConfigSvc.activeOrg = 'testOrg';
        mockConfigSvc.rootOrg = 'testRootOrg';
      });

      it('should add default headers with en locale when userPreference is null', (done) => {
        mockConfigSvc.userPreference = null;
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          const modifiedRequest = mockHttpHandler.handle.mock.calls[0][0] as HttpRequest<any>;
          
          expect(modifiedRequest.headers.get('Authorization')).toBe('');
          expect(modifiedRequest.headers.get('org')).toBe('testOrg');
          expect(modifiedRequest.headers.get('rootOrg')).toBe('testRootOrg');
          expect(modifiedRequest.headers.get('locale')).toBe('en');
          expect(modifiedRequest.headers.get('wid')).toBe('testUser');
          expect(modifiedRequest.headers.get('cstoken')).toBe('testToken');
          expect(modifiedRequest.headers.get('hostPath')).toBe('/test/path');
          done();
        });
      });

      it('should handle multiple locales from userPreference.selectedLangGroup', (done) => {
        mockConfigSvc.userPreference = {
          selectedLangGroup: 'hi, ta, mr',
        } as any;
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          const modifiedRequest = mockHttpHandler.handle.mock.calls[0][0] as HttpRequest<any>;
          expect(modifiedRequest.headers.get('locale')).toBe('en,hi,ta,mr');
          done();
        });
      });

      it('should filter out empty locales and avoid duplicates', (done) => {
        mockConfigSvc.userPreference = {
          selectedLangGroup: 'en, , hi, en, ta, ',
        } as any;
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          const modifiedRequest = mockHttpHandler.handle.mock.calls[0][0] as HttpRequest<any>;
          expect(modifiedRequest.headers.get('locale')).toBe('en,hi,ta');
          done();
        });
      });

      it('should use empty wid when userProfile is null', (done) => {
        mockConfigSvc.userProfile = null;
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          const modifiedRequest = mockHttpHandler.handle.mock.calls[0][0] as HttpRequest<any>;
          expect(modifiedRequest.headers.get('wid')).toBe('');
          done();
        });
      });

      it('should use empty cstoken when cstoken is null', (done) => {
     //   mockConfigSvc.cstoken = null;
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          const modifiedRequest = mockHttpHandler.handle.mock.calls[0][0] as HttpRequest<any>;
          expect(modifiedRequest.headers.get('cstoken')).toBe('');
          done();
        });
      });

      describe('error handling', () => {
        it('should handle error status 0 on localhost', (done) => {
          // Mock localhost
          Object.defineProperty(window, 'location', {
            value: {
              origin: 'http://localhost:4200',
              href: 'http://localhost:4200/page/home',
            },
            writable: true,
          });

          const error = new HttpErrorResponse({
            status: 0,
            statusText: 'Unknown Error',
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Please login Again and Apply new TOKEN',
                undefined,
                { duration: NOTIFICATION_TIME * 3 }
              );
              expect(mockAuthSvc.force_logout).toHaveBeenCalled();
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should not handle error status 0 on non-localhost', (done) => {
          const error = new HttpErrorResponse({
            status: 0,
            statusText: 'Unknown Error',
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(mockSnackBar.open).not.toHaveBeenCalled();
              expect(mockAuthSvc.force_logout).not.toHaveBeenCalled();
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should handle error status 200 with redirect URL', (done) => {
          const error = new HttpErrorResponse({
            status: 200,
            statusText: 'OK',           
            url: 'https://redirect.example.com',
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(window.location.href).toBe('https://redirect.example.com');
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should not redirect for error status 200 when ok is true', (done) => {
          const error = new HttpErrorResponse({
            status: 200,
            statusText: 'OK',
            url: 'https://redirect.example.com',
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should not redirect for error status 200 when url is not provided', (done) => {
          const error = new HttpErrorResponse({
            status: 200,
            statusText: 'OK',
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should handle error status 419 on localhost', (done) => {
          // Mock localhost
          Object.defineProperty(window, 'location', {
            value: {
              origin: 'http://localhost:4200',
              href: 'http://localhost:4200/page/home',
            },
            writable: true,
          });

          // Mock localStorage
          const mockLocalStorage = {
            getItem: jest.fn(),
            removeItem: jest.fn(),
          };
          Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
          });

          mockLocalStorage.getItem.mockReturnValue('sessionId123');

          const error = new HttpErrorResponse({
            status: 419,
            statusText: 'Authentication Timeout',
            error: {
              redirectUrl: 'https://auth.example.com/login',
            },
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('telemetrySessionId');
              expect(window.location.href).toBe(
                'https://auth.example.com/login?redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fpage%2Fhome'
              );
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should handle error status 419 on non-localhost', (done) => {
          // Mock localStorage
          const mockLocalStorage = {
            getItem: jest.fn(),
            removeItem: jest.fn(),
          };
          Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
          });

          mockLocalStorage.getItem.mockReturnValue('sessionId123');

          const error = new HttpErrorResponse({
            status: 419,
            statusText: 'Authentication Timeout',
            error: {
              redirectUrl: 'https://auth.example.com/login',
            },
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('telemetrySessionId');
              expect(window.location.href).toBe(
                'https://auth.example.com/login?redirect_uri=%2Fpage%2Fhome'
              );
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should handle error status 419 when telemetrySessionId is not in localStorage', (done) => {
          // Mock localStorage
          const mockLocalStorage = {
            getItem: jest.fn(),
            removeItem: jest.fn(),
          };
          Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
          });

          mockLocalStorage.getItem.mockReturnValue(null);

          const error = new HttpErrorResponse({
            status: 419,
            statusText: 'Authentication Timeout',
            error: {
              redirectUrl: 'https://auth.example.com/login',
            },
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should handle other error statuses without special handling', (done) => {
          const error = new HttpErrorResponse({
            status: 500,
            statusText: 'Internal Server Error',
          });

          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(err).toBe(error);
              done();
            }
          );
        });

        it('should handle non-HttpErrorResponse errors', (done) => {
          const error = new Error('Generic error');
          mockHttpHandler.handle.mockReturnValue(throwError(error));

          service.intercept(mockHttpRequest, mockHttpHandler).subscribe(
            () => {},
            (err) => {
              expect(err).toBe(error);
              done();
            }
          );
        });
      });
    });

    describe('when activeOrg or rootOrg are not available', () => {
      it('should pass request without modification when activeOrg is null', (done) => {
        mockConfigSvc.activeOrg = null;
        mockConfigSvc.rootOrg = 'testRootOrg';
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockHttpRequest);
          done();
        });
      });

      it('should pass request without modification when rootOrg is null', (done) => {
        mockConfigSvc.activeOrg = 'testOrg';
        mockConfigSvc.rootOrg = null;
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockHttpRequest);
          done();
        });
      });

      it('should pass request without modification when both activeOrg and rootOrg are null', (done) => {
        mockConfigSvc.activeOrg = null;
        mockConfigSvc.rootOrg = null;
        const mockResponse = of({} as HttpEvent<any>);
        mockHttpHandler.handle.mockReturnValue(mockResponse);

        service.intercept(mockHttpRequest, mockHttpHandler).subscribe(() => {
          expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockHttpRequest);
          done();
        });
      });
    });
  });
});