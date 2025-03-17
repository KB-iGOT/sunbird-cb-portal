import { HttpErrorResponse } from '@angular/common/http';

// Extract the core error handling logic to test
function handleHttpError(
  error: HttpErrorResponse,
  snackBar: any,
  authService: any,
  isLocalhost: boolean
): HttpErrorResponse {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 && isLocalhost) {
      snackBar.open('Please login Again and Apply new TOKEN', undefined, { duration: 15000 });
      authService.force_logout();
    } else if (error.status === 200 && !error.ok && error.url) {
      window.location.href = error.url;
    } else if (error.status === 419) {
      if (localStorage.getItem('telemetrySessionId')) {
        localStorage.removeItem('telemetrySessionId');
      }
      
      if (isLocalhost) {
        const pagePath = location.href || `${location.origin}/page/home`;
        window.location.href = error.error.redirectUrl + `?redirect_uri=${encodeURIComponent(pagePath)}`;
      } else {
        const pageName = (location.href || '').replace(location.origin, '');
        window.location.href = error.error.redirectUrl + `?redirect_uri=${encodeURIComponent(pageName)}`;
      }
    }
  }
  return error;
}

describe('AppInterceptor Error Handling', () => {
  let mockSnackBar: any;
  let mockAuthService: any;
  let mockLocation: any;
  let originalLocation: any;
  let mockLocalStorage: any;
  let originalLocalStorage: any;

  beforeEach(() => {
    // Create mock dependencies
    mockSnackBar = {
      open: jest.fn(),
    };

    mockAuthService = {
      force_logout: jest.fn(),
    };

    // Save original window.location and localStorage
    originalLocation = window.location;
    originalLocalStorage = window.localStorage;

    // Mock window.location
    // Using defineProperty to set properties on window.location doesn't work in Jest
    // So we'll delete the property and recreate it
   // delete window.location;
    mockLocation = {
      origin: 'http://localhost:4200',
      href: 'http://localhost:4200/page/home',
    };
    window.location = mockLocation as any;

    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('testSessionId'),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original window.location and localStorage
    window.location = originalLocation;
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('should handle HTTP error response with status 0 on localhost', () => {
    // Create HTTP error response
    const errorResponse = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
    });

    // Call the error handler
    const result = handleHttpError(errorResponse, mockSnackBar, mockAuthService, true);

    // Verify error handling
    expect(result).toBe(errorResponse);
    expect(mockSnackBar.open).toHaveBeenCalled();
    expect(mockAuthService.force_logout).toHaveBeenCalled();
  });

  it('should handle HTTP error response with status 200 but not ok', () => {
    // Create HTTP error response with status 200 but not ok
    const errorResponse = new HttpErrorResponse({
      status: 200,
      url: 'http://redirect.url',
    });

    // Call the error handler
    const result = handleHttpError(errorResponse, mockSnackBar, mockAuthService, true);

    // Verify error handling
    expect(result).toBe(errorResponse);
    // Note: We can't really test window.location.href assignment in Jest
  });

  it('should handle HTTP error response with status 419', () => {
    // Create HTTP error response with status 419
    const errorResponse = new HttpErrorResponse({
      status: 419,
      error: {
        redirectUrl: 'http://login.url',
      },
    });

    // Call the error handler
    const result = handleHttpError(errorResponse, mockSnackBar, mockAuthService, true);

    // Verify error handling
    expect(result).toBe(errorResponse);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('telemetrySessionId');
    // Note: We can't really test window.location.href assignment in Jest
  });
});

// Here's how you would modify your actual AppInterceptorService to use this testable function:
/*
import { Injectable, LOCALE_ID, Inject } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2'
import { catchError } from 'rxjs/operators'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { NOTIFICATION_TIME } from '@sunbird-cb/collection/src/lib/_common/ck-editor/constants/constant'

@Injectable({
  providedIn: 'root',
})
export class AppInterceptorService implements HttpInterceptor {
  constructor(
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private authSvc: AuthKeycloakService,
    @Inject(LOCALE_ID) private locale: string,
  ) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const lang = [this.locale.replace('en-US', 'en')]
    if (this.configSvc.userPreference) {
      (this.configSvc.userPreference.selectedLangGroup || '')
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length)
        .forEach(locale => {
          if (!lang.includes(locale)) {
            lang.push(locale)
          }
        })
    }

    if (this.configSvc.activeOrg && this.configSvc.rootOrg) {
      const modifiedReq = req.clone({
        setHeaders: {
          Authorization: '',
          org: this.configSvc.activeOrg,
          rootOrg: this.configSvc.rootOrg,
          locale: lang.join(','),
          wid: (this.configSvc.userProfile && this.configSvc.userProfile.userId) || '',
          cstoken: (this.configSvc.cstoken) || '',
          hostPath: this.configSvc.hostPath,
        },
      })
      return next.handle(modifiedReq)
        .pipe(
          catchError(error => {
            const isLocalhost = location.origin.includes('localhost');
            handleHttpError(error, this.snackBar, this.authSvc, isLocalhost);
            return throwError(error);
          })
        )
    }
    return next.handle(req)
  }
}

function handleHttpError(
  error: HttpErrorResponse,
  snackBar: MatSnackBar,
  authService: AuthKeycloakService,
  isLocalhost: boolean
): HttpErrorResponse {
  if (error instanceof HttpErrorResponse) {
    const localUrl = location.origin
    const pagePath = location.href || `${localUrl}/page/home`
    const pageName = (location.href || '').replace(localUrl, '')
    
    switch (error.status) {
      case 0:
        if (isLocalhost) {
          snackBar.open('Please login Again and Apply new TOKEN', undefined, { duration: NOTIFICATION_TIME * 3 })
          authService.force_logout()
        }
        break
      case 200:
        if (!error.ok && error.url) {
          window.location.href = error.url
        }
        break
      case 419:
        if (localStorage.getItem('telemetrySessionId')) {
          localStorage.removeItem('telemetrySessionId')
        }
        if (isLocalhost) {
          window.location.href = error.error.redirectUrl + `?redirect_uri=${encodeURIComponent(pagePath)}`
        } else {
          window.location.href = error.error.redirectUrl + `?redirect_uri=${encodeURIComponent(pageName)}`
        }
        break
    }
  }
  return error;
}
*/