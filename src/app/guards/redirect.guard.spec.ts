import { RedirectGuard } from './redirect.guard'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { DomainConfService } from '@sunbird-cb/utils-v2'

describe('RedirectGuard', () => {
  let guard: RedirectGuard
  let mockDomainSvc: any
  let mockRouter: any
  let originalLocation: Location

  beforeEach(() => {
    mockDomainSvc = {
      isKbPortal: jest.fn(),
      getNonLoggedInPageUrl: jest.fn(),
      getDomainRedirectPath: jest.fn(),
    }

    mockRouter = {
      navigateByUrl: jest.fn(),
    }

    // Save and mock global location
    originalLocation = globalThis.location
    Object.defineProperty(globalThis, 'location', {
      value: { href: '' },
      writable: true,
    })

    guard = new RedirectGuard(
      mockDomainSvc as DomainConfService,
      mockRouter as Router,
    )
  })

  afterEach(() => {
    // Restore original location object
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
    })
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  it('should redirect to externalUrl when provided and running on KB portal', () => {
    const route = {
      data: {
        externalUrl: 'https://example.com',
      },
    } as unknown as ActivatedRouteSnapshot

    mockDomainSvc.isKbPortal.mockReturnValue(true)

    const result = guard.canActivate(route)

    expect(mockDomainSvc.isKbPortal).toHaveBeenCalled()
    expect((globalThis as any).location.href).toBe('https://example.com')
    expect(result).toBe(false)
  })

  it('should redirect to non-logged-in page URL when externalUrl provided but not KB portal', () => {
    const route = {
      data: {
        externalUrl: 'https://example.com',
      },
    } as unknown as ActivatedRouteSnapshot

    mockDomainSvc.isKbPortal.mockReturnValue(false)
    mockDomainSvc.getNonLoggedInPageUrl.mockReturnValue('https://public.example.com')

    const result = guard.canActivate(route)

    expect(mockDomainSvc.isKbPortal).toHaveBeenCalled()
    expect(mockDomainSvc.getNonLoggedInPageUrl).toHaveBeenCalled()
    expect((globalThis as any).location.href).toBe('https://public.example.com')
    expect(result).toBe(false)
  })

  it('should navigate to KB home page when no externalUrl and running on KB portal', () => {
    const route = {
      data: {},
    } as unknown as ActivatedRouteSnapshot

    mockDomainSvc.isKbPortal.mockReturnValue(true)

    const result = guard.canActivate(route)

    expect(mockDomainSvc.isKbPortal).toHaveBeenCalled()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('page/home')
    expect(result).toBe(false)
  })

  it('should navigate to domain redirect path when no externalUrl and not KB portal', () => {
    const route = {
      data: {},
    } as unknown as ActivatedRouteSnapshot

    mockDomainSvc.isKbPortal.mockReturnValue(false)
    mockDomainSvc.getDomainRedirectPath.mockReturnValue('/some-redirect')

    const result = guard.canActivate(route)

    expect(mockDomainSvc.isKbPortal).toHaveBeenCalled()
    expect(mockDomainSvc.getDomainRedirectPath).toHaveBeenCalled()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/some-redirect')
    expect(result).toBe(false)
  })
})