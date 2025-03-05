import { GeneralGuard } from './general.guard';
import { Router } from '@angular/router';
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Mock dependencies
jest.mock('@angular/router', () => ({
  Router: jest.fn().mockImplementation(() => ({
    navigateByUrl: jest.fn(),
    parseUrl: jest.fn(),
  })),
  ActivatedRouteSnapshot: jest.fn(),
  RouterStateSnapshot: jest.fn(),
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
    welcomeTabs: { tabs: [] },
  })),
  AuthKeycloakService: jest.fn().mockImplementation(() => ({
    loginV2: jest.fn(),
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
    authSvc = new AuthKeycloakService(null as any, null as any, null as any);
    guard = new GeneralGuard(router, configSvc, authSvc);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create the guard', () => {
    expect(guard).toBeTruthy();
  });

  it('should call canActivate and return true when everything is valid', async () => {
    const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    configSvc.userProfile = { userId: '' }; // mock user profile

    const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(result).toBe(true);
  });

  it('should redirect to login when user profile is null', async () => {
    const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {
      url: '/some-url',
    } as RouterStateSnapshot;
    configSvc.userProfile = null;

    await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    expect(authSvc.loginV2).toHaveBeenCalledWith('S', '?redirect_uri=%2Fsome-url');
  });

  it('should return false if user has no required roles', async () => {
    const mockActivatedRouteSnapshot = { data: { requiredRoles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    configSvc.userRoles = new Set(['user']); // mock user roles

    const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(result).toEqual(router.parseUrl('/page/home'));
  });

  it('should return true if user has the required role', async () => {
    const mockActivatedRouteSnapshot = { data: { requiredRoles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    configSvc.userRoles = new Set(['admin']); // mock user roles

    const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(result).toBe(true);
  });

  it('should return false if user is not authenticated and try to access a restricted route', async () => {
    // const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    // const mockRouterStateSnapshot = { url: '/restricted' } as RouterStateSnapshot;
    configSvc.userProfile = null;

    //const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

    expect(router.parseUrl).toHaveBeenCalledWith('/login?redirect_uri=%2Frestricted');
  });

  it('should return true if user has no restricted features', async () => {
    const mockActivatedRouteSnapshot = { data: { requiredFeatures: ['feature1'] } } as unknown as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    configSvc.restrictedFeatures = new Set(); // mock no restricted features

    const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(result).toBe(true);
  });

  it('should return false if user has restricted features', async () => {
    // const mockActivatedRouteSnapshot = { data: { requiredFeatures: ['feature1'] } } as unknown as ActivatedRouteSnapshot;
    // const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    configSvc.restrictedFeatures = new Set(['feature1']); // mock restricted feature

    // const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
    expect(router.parseUrl).toHaveBeenCalledWith('/page/home');
  });

  it('should check for welcome tabs and return true if all required fields are set', () => {
    configSvc.welcomeTabs = { name: '', key: '', badges:{
      enabled: false
    }, enabled:true,check : true, routerLink:'', step:1, description:''

  };
    configSvc.userProfileV2 = { userId:''};

    const result = guard.checkWelcome();
    expect(result).toBe(true);
  });

  it('should return false in checkWelcome if a required profile field is missing', () => {
    configSvc.welcomeTabs = { name: '', key: '', badges:{
      enabled: false
    }, enabled:true,check : true, routerLink:'', step:1, description:''

  };
    configSvc.userProfileV2 = { userId:''};

    const result = guard.checkWelcome();
    expect(result).toBe(false);
  });
});
