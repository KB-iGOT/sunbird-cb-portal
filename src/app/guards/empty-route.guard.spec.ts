import { EmptyRouteGuard } from './empty-route.guard'
import { Router, ActivatedRoute, UrlTree } from '@angular/router'
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2'

// Create a mock UrlTree class
class MockUrlTree implements UrlTree {
  fragment: string | null = null;
  queryParams = {};
  queryParamMap = {} as any;
  root = {} as any;
  toString(): string {
    return ''
  }
}

// Mock dependencies
jest.mock('@angular/router', () => ({
  Router: jest.fn().mockImplementation(() => ({
    parseUrl: jest.fn().mockImplementation(_url => {
      // Return a mock UrlTree instance
      return new MockUrlTree()
    }),
  })),
  ActivatedRoute: jest.fn().mockImplementation(() => ({
    snapshot: {
      queryParamMap: {
        has: jest.fn(),
        get: jest.fn(),
      },
    },
  })),
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn().mockImplementation(() => ({
    userProfile: null,
    isAuthenticated: false,
  })),
  AuthKeycloakService: jest.fn().mockImplementation(() => ({
    loginV2: jest.fn().mockResolvedValue(true),
  })),
}))

describe('EmptyRouteGuard', () => {
  let guard: EmptyRouteGuard
  let router: Router
  let configSvc: ConfigurationsService
  let authSvc: AuthKeycloakService
  let activatedRoute: ActivatedRoute

  beforeEach(() => {
    router = new Router()
    configSvc = new ConfigurationsService()
    authSvc = new AuthKeycloakService(null as any, null as any, null as any, null as any, null as any)
    activatedRoute = new ActivatedRoute()

    // Set up spies
    jest.spyOn(router, 'parseUrl')
    jest.spyOn(authSvc, 'loginV2')
    jest.spyOn(activatedRoute.snapshot.queryParamMap, 'has')
    jest.spyOn(activatedRoute.snapshot.queryParamMap, 'get')

    guard = new EmptyRouteGuard(router, configSvc, authSvc, activatedRoute)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the guard', () => {
    expect(guard).toBeTruthy()
  })

  it('should redirect to home page if user profile exists with userId', () => {
    // Arrange
    configSvc.userProfile = { userId: 'test-user' }

    // Act
    const result = guard.canActivate(null as any, null as any)

    // Assert
    expect(router.parseUrl).toHaveBeenCalledWith('/page/home')
    expect(authSvc.loginV2).not.toHaveBeenCalled()
    // Check that the result is an object (UrlTree)
    expect(typeof result).toBe('object')
    expect(result).toBeTruthy()
  })

  it('should redirect to home page if user is authenticated', () => {
    // Arrange
    configSvc.userProfile = null
    configSvc.isAuthenticated = true

    // Act
    const result = guard.canActivate(null as any, null as any)

    // Assert
    expect(router.parseUrl).toHaveBeenCalledWith('/page/home')
    expect(authSvc.loginV2).not.toHaveBeenCalled()
    expect(typeof result).toBe('object')
    expect(result).toBeTruthy()
  })

  it('should call loginV2 with redirect_uri if available in query params', () => {
    // Arrange
    configSvc.userProfile = null
    configSvc.isAuthenticated = false;

    (activatedRoute.snapshot.queryParamMap.has as jest.Mock).mockReturnValue(true);
    (activatedRoute.snapshot.queryParamMap.get as jest.Mock).mockReturnValue('/some-page')

    // Act
    const result = guard.canActivate(null as any, null as any)

    // Assert
    expect(activatedRoute.snapshot.queryParamMap.has).toHaveBeenCalledWith('redirect_uri')
    expect(activatedRoute.snapshot.queryParamMap.get).toHaveBeenCalledWith('redirect_uri')
    expect(authSvc.loginV2).toHaveBeenCalledWith('S', '/some-page')
    expect(result).toBe(false)
  })

  it('should call loginV2 with undefined redirect_uri if not available in query params', () => {
    // Arrange
    configSvc.userProfile = null
    configSvc.isAuthenticated = false;

    (activatedRoute.snapshot.queryParamMap.has as jest.Mock).mockReturnValue(false)

    // Act
    const result = guard.canActivate(null as any, null as any)

    // Assert
    expect(activatedRoute.snapshot.queryParamMap.has).toHaveBeenCalledWith('redirect_uri')
    expect(activatedRoute.snapshot.queryParamMap.get).not.toHaveBeenCalled()
    expect(authSvc.loginV2).toHaveBeenCalledWith('S', undefined)
    expect(result).toBe(false)
  })
})