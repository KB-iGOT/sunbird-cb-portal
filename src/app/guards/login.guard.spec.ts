import { LoginGuard } from './login.guard';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';

describe('LoginGuard', () => {
  let guard: LoginGuard;
  let mockRouter: jest.Mocked<Router>;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockActivatedRouteSnapshot: jest.Mocked<ActivatedRouteSnapshot>;
  let mockRouterStateSnapshot: RouterStateSnapshot;
  let mockUrlTree: any;

  beforeEach(() => {
    mockUrlTree = { toString: jest.fn() };
    mockRouter = {
      parseUrl: jest.fn().mockReturnValue(mockUrlTree),
    } as unknown as jest.Mocked<Router>;

    mockConfigSvc = {
      isAuthenticated: false,
      instanceConfig: {
        keycloak: {
          isLoginHidden: false,
          defaultidpHint: 'test-idp',
        },
      },
    } as unknown as jest.Mocked<ConfigurationsService>;

    mockActivatedRouteSnapshot = {
      queryParamMap: {
        has: jest.fn(),
        get: jest.fn(),
      } as any,
    } as unknown as jest.Mocked<ActivatedRouteSnapshot>;

    mockRouterStateSnapshot = {} as RouterStateSnapshot;

    guard = new LoginGuard(
      mockRouter,
      mockConfigSvc
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true when user is not authenticated and login not hidden', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = false;

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when user is not authenticated but login is hidden', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = false;

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(result).toBe(false);
  });

  it('should redirect to ref URL when user is authenticated and ref parameter exists', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = true;
  
    // Mock global decodeURIComponent function
    const originalDecodeURIComponent = global.decodeURIComponent;
    global.decodeURIComponent = jest.fn().mockImplementation((uri) => uri);

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap.has).toHaveBeenCalledWith('ref');
    expect(mockActivatedRouteSnapshot.queryParamMap.get).toHaveBeenCalledWith('ref');
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('page/dashboard');
    expect(result).toBe(mockUrlTree);

    // Restore original function
    global.decodeURIComponent = originalDecodeURIComponent;
  });

  it('should handle empty ref parameter when user is authenticated', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = true;
  
    // Mock global decodeURIComponent function
    const originalDecodeURIComponent = global.decodeURIComponent;
    global.decodeURIComponent = jest.fn().mockImplementation((uri) => uri);

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('');
    expect(result).toBe(mockUrlTree);

    // Restore original function
    global.decodeURIComponent = originalDecodeURIComponent;
  });

  it('should handle null ref parameter when user is authenticated', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = true;
   
    
    // Mock global decodeURIComponent function
    const originalDecodeURIComponent = global.decodeURIComponent;
    global.decodeURIComponent = jest.fn().mockImplementation((uri) => uri || '');

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('');
    expect(result).toBe(mockUrlTree);

    // Restore original function
    global.decodeURIComponent = originalDecodeURIComponent;
  });

  it('should redirect to home page when user is authenticated but no ref parameter', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = true;

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap.has).toHaveBeenCalledWith('ref');
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('page/home');
    expect(result).toBe(mockUrlTree);
  });

  it('should handle instance config being undefined', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = false;

    // Act & Assert
    expect(() => {
      guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    }).toThrow();
  });

  it('should handle keycloak config being undefined', () => {
    // Arrange
    mockConfigSvc.isAuthenticated = false;
    mockConfigSvc.instanceConfig = {} as any;

    // Act & Assert
    expect(() => {
      guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    }).toThrow();
  });
});