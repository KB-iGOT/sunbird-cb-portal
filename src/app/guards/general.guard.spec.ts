import { GeneralGuard } from './general.guard';
import { Router } from '@angular/router';
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Mock lodash
jest.mock('lodash', () => ({
  orderBy: jest.fn().mockImplementation(() => []),
  filter: jest.fn().mockImplementation(() => []),
  get: jest.fn().mockImplementation((obj, path) => {
    // Handle different paths for the get function
    if (path === 'welcomeTabs.tabs') return [{ enabled: true, step: 1 }];
    if (path.includes('key')) return ['someValue']; // Return a non-empty array for key checks
    return obj;
  }),
  each: jest.fn().mockImplementation((arr, callback) => {
    if (Array.isArray(arr)) {
      arr.forEach(callback);
    }
  }),
}));

// Mock dependencies
jest.mock('@angular/router', () => ({
  Router: jest.fn().mockImplementation(() => ({
    navigateByUrl: jest.fn(),
    parseUrl: jest.fn().mockImplementation(url => url),
  })),
}));

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn().mockImplementation(() => ({
    userProfile: null,
    userRoles: new Set(),
    restrictedFeatures: new Set(),
    hasAcceptedTnc: false,
    isActive: false,
    profileDetailsStatus: false,
    instanceConfig: {},
    welcomeTabs: { 
      tabs: [
        { 
          enabled: true, 
          key: 'testKey', 
          check: true, 
          step: 1 
        }
      ] 
    },
    userProfileV2: {
      userId: 'test-user',
      testKey: ['value'] // Add this to match the key in welcomeTabs
    }
  })),
  AuthKeycloakService: jest.fn().mockImplementation(() => ({
    loginV2: jest.fn().mockResolvedValue(true),
    force_logout: jest.fn(),
  })),
}));

describe('GeneralGuard', () => {
  let guard: GeneralGuard;
  let router: Router;
  let configSvc: ConfigurationsService;
  let authSvc: AuthKeycloakService;

  beforeEach(() => {
    router = new Router();
    configSvc = new ConfigurationsService();
    authSvc = new AuthKeycloakService(null as any, null as any, null as any, null as any);
    
    // Set up spies
    jest.spyOn(router, 'parseUrl');
    jest.spyOn(authSvc, 'loginV2');
    jest.spyOn(authSvc, 'force_logout');
    
    guard = new GeneralGuard(router, configSvc, authSvc);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the guard', () => {
    expect(guard).toBeTruthy();
  });

  it('should call canActivate and return true when everything is valid', async () => {
    const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    configSvc.userProfile = { userId: 'test-user' };
    configSvc.hasAcceptedTnc = true;
    configSvc.isActive = true;
    
    // Mock checkWelcome to return true
    jest.spyOn(guard, 'checkWelcome').mockReturnValue(true);
    
    const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(result).toBe(true);
  });


  it('should return false if user has no required roles', async () => {
    const mockActivatedRouteSnapshot = { 
      data: { requiredRoles: ['admin'] } 
    } as unknown as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = { url: '/test' } as RouterStateSnapshot;
    
    configSvc.userProfile = { userId: 'test-user' };
    configSvc.hasAcceptedTnc = true;
    configSvc.isActive = true;
    configSvc.userRoles = new Set(['user']); // user doesn't have admin role
    
    // Mock checkWelcome to return true
    jest.spyOn(guard, 'checkWelcome').mockReturnValue(true);
    
    await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(router.parseUrl).toHaveBeenCalledWith('/page/home');
  });

  it('should return true if user has the required role', async () => {
    const mockActivatedRouteSnapshot = { 
      data: { requiredRoles: ['admin'] } 
    } as unknown as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    
    configSvc.userProfile = { userId: 'test-user' };
    configSvc.userRoles = new Set(['admin']); // user has admin role
    configSvc.hasAcceptedTnc = true;
    configSvc.isActive = true;
    
    // Mock checkWelcome to return true
    jest.spyOn(guard, 'checkWelcome').mockReturnValue(true);
    
    const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(result).toBe(true);
  });


  it('should return true if user has no restricted features', async () => {
    const mockActivatedRouteSnapshot = { 
      data: { requiredFeatures: ['feature1'] } 
    } as unknown as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    
    configSvc.userProfile = { userId: 'test-user' };
    configSvc.restrictedFeatures = new Set(); // No restricted features
    configSvc.hasAcceptedTnc = true;
    configSvc.isActive = true;
    
    // Mock checkWelcome to return true
    jest.spyOn(guard, 'checkWelcome').mockReturnValue(true);
    
    const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(result).toBe(true);
  });

  it('should return false if user has restricted features', async () => {
    const mockActivatedRouteSnapshot = { 
      data: { requiredFeatures: ['feature1'] } 
    } as unknown as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    
    configSvc.userProfile = { userId: 'test-user' };
    configSvc.restrictedFeatures = new Set(['feature1']); // Has restricted feature
    configSvc.hasAcceptedTnc = true;
    configSvc.isActive = true;
    
    // Mock checkWelcome to return true
    jest.spyOn(guard, 'checkWelcome').mockReturnValue(true);
    
    await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(router.parseUrl).toHaveBeenCalledWith('/page/home');
  });

});