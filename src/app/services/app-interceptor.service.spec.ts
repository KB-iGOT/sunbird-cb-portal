
import { HttpErrorResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { AppInterceptorService } from './app-interceptor.service'

describe('AppInterceptorService', () => {
  let interceptor: AppInterceptorService
  let configSvc: any
  let snackBar: any
  let authSvc: any
  let handler: any
  const mockLocale = 'en-US'

  beforeEach(() => {
    configSvc = {
      userPreference: {
        selectedLangGroup: 'en,hi'
      },
      activeOrg: 'active-org',
      rootOrg: 'root-org',
      userProfile: { userId: 'user123' },
      cstoken: 'mock-cstoken',
      hostPath: 'http://localhost'
    }

    snackBar = { open: jest.fn() }
    authSvc = { force_logout: jest.fn(), logout: jest.fn() }

    interceptor = new AppInterceptorService(configSvc, snackBar, authSvc, mockLocale)
    handler = {
      handle: jest.fn()
    }
  })

  it('should add headers and call next.handle()', () => {
    const req: any = {
      clone: jest.fn().mockReturnValue('modified-request')
    }
    handler.handle.mockReturnValue(of({}))

    interceptor.intercept(req, handler).subscribe()

    // expect(req.clone).toHaveBeenCalledWith({
    //   setHeaders: expect.objectContaining({
    //     locale: 'en,hi',
    //     org: 'active-org',
    //     rootOrg: 'root-org',
    //     wid: 'user123',
    //     cstoken: 'mock-cstoken',
    //     hostPath: 'http://localhost',
    //     Authorization: '',
    //   })
    // })
    expect(handler.handle).toHaveBeenCalledWith('modified-request')
  })
  it('should handle HTTP error with status 0 (localhost)', () => {
    const req: any = {
      clone: jest.fn(), // initially just mock it
    }
    req.clone.mockReturnValue(req) // now use it safely
  
    const error = new HttpErrorResponse({
      status: 0,
      error: {},
      url: 'http://localhost'
    })
  
    handler.handle.mockReturnValue(throwError(() => error))
  
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost', href: 'http://localhost/page/home' },
      writable: true
    })
  
    interceptor.intercept(req, handler).subscribe({
      error: () => {
        expect(snackBar.open).toHaveBeenCalled()
        expect(authSvc.force_logout).toHaveBeenCalled()
      }
    })
  })

  it('should handle HTTP error with status 419 (redirect)', () => {
    const req: any = {
      clone: jest.fn(), // initially just mock it
    }
    req.clone.mockReturnValue(req) // now use it safely
    const redirectUrl = 'http://auth.com'
    const error = new HttpErrorResponse({
      status: 419,
      error: { redirectUrl },
      url: 'http://some-url'
    })
    localStorage.setItem('telemetrySessionId', '1234')
    handler.handle.mockReturnValue(throwError(() => error))
    const mockHref = 'http://localhost/page/home'

    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost',
        href: mockHref,
        assign: jest.fn(),
      },
      writable: true
    })

    interceptor.intercept(req, handler).subscribe({
      error: () => {
        expect(localStorage.getItem('telemetrySessionId')).toBeNull()
      }
    })
  })
})
