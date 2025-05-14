import { EmptyRouteGuard } from './empty-route.guard';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthKeycloakService, ConfigurationsService } from '@sunbird-cb/utils-v2';

describe('EmptyRouteGuard', () => {
  let guard: EmptyRouteGuard;
  let mockRouter: jest.Mocked<Router>;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockAuthSvc: jest.Mocked<AuthKeycloakService>;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let mockRouterStateSnapshot: RouterStateSnapshot;
  let mockUrlTree: any;

  beforeEach(() => {
    mockUrlTree = { toString: jest.fn() };
    mockRouter = {
      parseUrl: jest.fn().mockReturnValue(mockUrlTree),
    } as unknown as jest.Mocked<Router>;

    mockConfigSvc = {
      userProfile: null,
      isAuthenticated: false,
    } as unknown as jest.Mocked<ConfigurationsService>;

    mockAuthSvc = {
      loginV2: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuthKeycloakService>;

    mockActivatedRouteSnapshot = {
      queryParamMap: {
        has: jest.fn(),
        get: jest.fn(),
      } as any,
    } as ActivatedRouteSnapshot;

    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          has: jest.fn(),
          get: jest.fn(),
        }
      },
    } as unknown as jest.Mocked<ActivatedRoute>;

    mockRouterStateSnapshot = {} as RouterStateSnapshot;

    guard = new EmptyRouteGuard(
      mockRouter,
      mockConfigSvc,
      mockAuthSvc,
      mockActivatedRoute
    );

    // Spy on native Promise.resolve to avoid actual Promise execution
    jest.spyOn(Promise, 'resolve').mockImplementation(value => {
      return Promise.resolve(value);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to home page when user profile exists', () => {
    // Arrange
    mockConfigSvc.userProfile = {
      userId: 'test-user-id',
    };

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/page/home');
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to home page when user is authenticated', () => {
    // Arrange
    mockConfigSvc.userProfile = null;
    mockConfigSvc.isAuthenticated = true;

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/page/home');
    expect(result).toBe(mockUrlTree);
  });

  it('should call loginV2 with redirect_uri when provided in query params', () => {
    // Arrange
    mockConfigSvc.userProfile = null;
    mockConfigSvc.isAuthenticated = false;
    
    mockActivatedRoute.snapshot.queryParamMap.has = jest.fn().mockReturnValue(true);
    mockActivatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue('/dashboard');

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockActivatedRoute.snapshot.queryParamMap.has).toHaveBeenCalledWith('redirect_uri');
    expect(mockActivatedRoute.snapshot.queryParamMap.get).toHaveBeenCalledWith('redirect_uri');
    expect(mockAuthSvc.loginV2).toHaveBeenCalledWith('S', '/dashboard');
    expect(result).toBe(false);
  });

  it('should call loginV2 without redirect_uri when not provided in query params', () => {
    // Arrange
    mockConfigSvc.userProfile = null;
    mockConfigSvc.isAuthenticated = false;
    
    mockActivatedRoute.snapshot.queryParamMap.has = jest.fn().mockReturnValue(false);

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockActivatedRoute.snapshot.queryParamMap.has).toHaveBeenCalledWith('redirect_uri');
    expect(mockAuthSvc.loginV2).toHaveBeenCalledWith('S', undefined);
    expect(result).toBe(false);
  });

  it('should return false after attempting login', () => {
    // Arrange
    mockConfigSvc.userProfile = null;
    mockConfigSvc.isAuthenticated = false;

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(result).toBe(false);
    expect(Promise.resolve).toHaveBeenCalled();
  });
});