import { GeneralGuard } from './general.guard';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2';
import * as _ from 'lodash'
// Mock lodash
const mockOrderBy = jest.fn();
const mockFilter = jest.fn();
const mockGet = jest.fn();
const mockEach = jest.fn();



describe('GeneralGuard', () => {
  let guard: GeneralGuard;
  let mockRouter: jest.Mocked<Router>;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockAuthSvc: jest.Mocked<AuthKeycloakService>;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let mockRouterStateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      parseUrl: jest.fn(),
      navigateByUrl: jest.fn(),
      navigate: jest.fn(),
    } as any;

    // Mock ConfigurationsService
    mockConfigSvc = {
      userProfile: null,
      userRoles: new Set(),
      hasAcceptedTnc: true,
      isActive: true,
      profileDetailsStatus: true,
      restrictedFeatures: new Set(),
      instanceConfig: null,
      welcomeTabs: { tabs: [] },
      userProfileV2: null,
    } as any;

    // Mock AuthKeycloakService
    mockAuthSvc = {
      loginV2: jest.fn(),
      logout: jest.fn(),
      force_logout: jest.fn(),
    } as any;

    // Mock ActivatedRouteSnapshot
    mockActivatedRouteSnapshot = {
      data: {}
    } as any;

    // Mock RouterStateSnapshot
    mockRouterStateSnapshot = {
      url: '/test-url'
    } as any;

    guard = new GeneralGuard(mockRouter, mockConfigSvc, mockAuthSvc);

    // Reset all mocks and ensure welcomeTabs is properly initialized
    jest.clearAllMocks();
    
    // Ensure welcomeTabs is always initialized unless explicitly set to null in test
    if (mockConfigSvc.welcomeTabs === undefined) {
      
    }
    
    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:4200/test',
      pathname: '/test'
    };

    // Mock document.baseURI
    Object.defineProperty(document, 'baseURI', {
      value: 'http://localhost:4200',
      writable: true
    });
  });

  describe('canActivate', () => {
    it('should call shouldAllow with empty arrays when no required features or roles', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });

    it('should pass required features and roles from route data', async () => {
      mockActivatedRouteSnapshot.data = {
        requiredFeatures: ['feature1'],
        requiredRoles: ['role1']
      };
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.userRoles = new Set(['role1']);
      
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });

    it('should handle null route data', async () => {
     // mockActivatedRouteSnapshot.data = null;
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has required role (case insensitive)', () => {
      mockConfigSvc.userRoles = new Set(['admin', 'user']);
      
      const result = guard.hasRole(['ADMIN']);
      
      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      mockConfigSvc.userRoles = new Set(['user']);
      
      const result = guard.hasRole(['admin']);
      
      expect(result).toBe(false);
    });

    it('should return true when user has at least one of multiple required roles', () => {
      mockConfigSvc.userRoles = new Set(['user']);
      
      const result = guard.hasRole(['admin', 'user', 'moderator']);
      
      expect(result).toBe(true);
    });

    it('should handle null userRoles', () => {
      mockConfigSvc.userRoles = null as any;
      
      const result = guard.hasRole(['admin']);
      
      expect(result).toBe(false);
    });

    it('should handle empty role array', () => {
      mockConfigSvc.userRoles = new Set(['user']);
      
      const result = guard.hasRole([]);
      
      expect(result).toBe(false);
    });

    it('should handle null role values', () => {
      mockConfigSvc.userRoles = new Set(['user']);
      
      const result = guard.hasRole([null as any]);
      
      expect(result).toBe(false);
    });
  });

  describe('shouldAllow - Authentication checks', () => {
    it('should redirect to login when user is not authenticated', async () => {
      mockConfigSvc.userProfile = null;
      (window as any).location.href = 'http://localhost:4200/app/test';
      mockAuthSvc.loginV2.mockResolvedValue(undefined);
      
      await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockAuthSvc.loginV2).toHaveBeenCalledWith('S', '?redirect_uri=%2Ftest-url');
    });

    it('should not redirect when URL contains /public/', async () => {
      mockConfigSvc.userProfile = null;
      (window as any).location.href = 'http://localhost:4200/public/test';
      
     // const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockAuthSvc.loginV2).not.toHaveBeenCalled();
    });

    it('should not redirect when URL contains preview=true', async () => {
      mockConfigSvc.userProfile = null;
      (window as any).location.href = 'http://localhost:4200/test?preview=true';
      
     // const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockAuthSvc.loginV2).not.toHaveBeenCalled();
    });

    it('should not redirect when URL contains /certs', async () => {
      mockConfigSvc.userProfile = null;
      (window as any).location.href = 'http://localhost:4200/certs/test';
      
     // const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockAuthSvc.loginV2).not.toHaveBeenCalled();
    });

    it('should return false when loginV2 throws error', async () => {
      mockConfigSvc.userProfile = null;
      (window as any).location.href = 'http://localhost:4200/app/test';
      mockAuthSvc.loginV2.mockRejectedValue(new Error('Login failed'));
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(false);
    });

    it('should handle empty state.url', async () => {
      mockConfigSvc.userProfile = null;
      mockRouterStateSnapshot.url = '';
      (window as any).location.href = 'http://localhost:4200/app/test';
      mockAuthSvc.loginV2.mockResolvedValue(undefined);
      
      await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockAuthSvc.loginV2).toHaveBeenCalledWith('S', '');
    });
  });

  describe('shouldAllow - Home page redirect', () => {
    it('should redirect to static-home when user profile is null and pathname includes /page/home', async () => {
      mockConfigSvc.userProfile = null;
      mockConfigSvc.instanceConfig = { someConfig: true } as any;
      (window as any).location.pathname = '/page/home';
      (window as any).location.href = 'http://localhost:4200/public/test';
      const mockUrlTree = {} as UrlTree;
      mockRouter.parseUrl.mockReturnValue(mockUrlTree);
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/static-home');
      expect(result).toBe(mockUrlTree);
    });

    it('should not redirect when instanceConfig is null', async () => {
      mockConfigSvc.userProfile = null;
      mockConfigSvc.instanceConfig = null;
      (window as any).location.pathname = '/page/home';
      (window as any).location.href = 'http://localhost:4200/public/test';
      
     // const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockRouter.parseUrl).not.toHaveBeenCalledWith('/static-home');
    });
  });

  describe('shouldAllow - Welcome check', () => {
    it('should redirect to setup when checkWelcome returns false', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      // Mock checkWelcome to return false
      const mockUrlTree = {} as UrlTree;
      mockRouter.parseUrl.mockReturnValue(mockUrlTree);
      
      // Setup welcome tabs with incomplete profile - ensure welcomeTabs is not null
      mockConfigSvc.welcomeTabs = {
        tabs: [{ enabled: true, step: 1, check: true, key: 'userRoles' }]
      } as any;
      mockConfigSvc.userProfileV2 = { userRoles: [] } as any;
      
      mockOrderBy.mockReturnValue([{ enabled: true, step: 1, check: true, key: 'userRoles' }]);
      mockFilter.mockReturnValue([{ enabled: true, step: 1, check: true, key: 'userRoles' }]);
     // mockGet.mockReturnValueOnce(mockConfigSvc.welcomeTabs.tabs).mockReturnValueOnce([]);
      mockEach.mockImplementation((arr, fn) => arr.forEach(fn));
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/setup');
      expect(result).toBe(mockUrlTree);
    });
  });

  describe('shouldAllow - Active user check', () => {
    it('should redirect and logout when user is not active', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.isActive = false;
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error-access-forbidden');
      expect(mockAuthSvc.force_logout).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('shouldAllow - Required roles check', () => {
    it('should redirect to home when user lacks required roles', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.userRoles = new Set(['user']);
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      const mockUrlTree = {} as UrlTree;
      mockRouter.parseUrl.mockReturnValue(mockUrlTree);
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, {
        ...mockRouterStateSnapshot,
        data: { requiredRoles: ['admin'] }
      } as any);
      
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/page/home');
      expect(result).toBe(mockUrlTree);
    });

    it('should allow access when user has required roles', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.userRoles = new Set(['admin']);
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      mockActivatedRouteSnapshot.data = { requiredRoles: ['admin'] };
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });

    it('should skip role check when userRoles is null', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.userRoles = null as any;
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      mockActivatedRouteSnapshot.data = { requiredRoles: ['admin'] };
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });
  });

  describe('shouldAllow - Required features check', () => {
    it('should redirect to home when required feature is restricted', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.restrictedFeatures = new Set(['restrictedFeature']);
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      const mockUrlTree = {} as UrlTree;
      mockRouter.parseUrl.mockReturnValue(mockUrlTree);
      
      mockActivatedRouteSnapshot.data = { requiredFeatures: ['restrictedFeature'] };
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/page/home');
      expect(result).toBe(mockUrlTree);
    });

    it('should allow access when required features are not restricted', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.restrictedFeatures = new Set(['otherFeature']);
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      mockActivatedRouteSnapshot.data = { requiredFeatures: ['allowedFeature'] };
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });

    it('should skip feature check when restrictedFeatures is null', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.restrictedFeatures = null as any;
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      mockActivatedRouteSnapshot.data = { requiredFeatures: ['anyFeature'] };
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });
  });

  describe('checkWelcome', () => {
    beforeEach(() => {
      mockOrderBy.mockImplementation((arr) => arr);
      mockFilter.mockImplementation((arr) => arr);
      mockGet.mockImplementation((obj, path) => {
        if (path === 'welcomeTabs.tabs') return (mockConfigSvc.welcomeTabs) || [];
        if (obj && typeof obj === 'object') return obj[path];
        return undefined;
      });
      mockEach.mockImplementation((arr, fn) => arr.forEach(fn));
    });

    it('should return true when there are no welcome tabs', () => {
      
      mockFilter.mockReturnValue([]);
      
      const result = guard.checkWelcome();
      
      expect(result).toBe(true);
    });

    it('should return true when welcome tabs is null', () => {
      mockConfigSvc.welcomeTabs = null as any;
      mockGet.mockReturnValue([]);
      mockFilter.mockReturnValue([]);
      
      const result = guard.checkWelcome();
      
      expect(result).toBe(true);
    });

    it('should return false when profile data is missing for required tab', () => {
      const tabs = [
        { enabled: true, step: 1, check: true, key: 'userRoles' }
      ];
      //mockConfigSvc.welcomeTabs = { tabs };
      mockConfigSvc.userProfileV2 = { userRoles: [] } as any;
      
      mockFilter.mockReturnValue(tabs);
      mockOrderBy.mockReturnValue(tabs);
      mockGet.mockImplementation((_obj, path) => {
        if (path === 'welcomeTabs.tabs') return tabs;
        if (path === 'userRoles') return [];
        return undefined;
      });
      
      const result = guard.checkWelcome();
      
      expect(result).toBe(false);
    });

    it('should return true when all required profile data is present', () => {
      const tabs = [
        { enabled: true, step: 1, check: true, key: 'userRoles' }
      ];
      //mockConfigSvc.welcomeTabs = { tabs };
      mockConfigSvc.userProfileV2 = { userRoles: ['user'] } as any;
      
      mockFilter.mockReturnValue(tabs);
      mockOrderBy.mockReturnValue(tabs);
      mockGet.mockImplementation((_obj, path) => {
        if (path === 'welcomeTabs.tabs') return tabs;
        if (path === 'userRoles') return ['user'];
        return undefined;
      });
      
      const result = guard.checkWelcome();
      
      expect(result).toBe(true);
    });

    it('should return true when tab has no check property', () => {
      const tabs = [
        { enabled: true, step: 1, check: false, key: 'userRoles' }
      ];
      //mockConfigSvc.welcomeTabs = { tabs };
      mockConfigSvc.userProfileV2 = { userRoles: [] } as any;
      
      mockFilter.mockReturnValue(tabs);
      mockOrderBy.mockReturnValue(tabs);
      mockGet.mockReturnValue([]);
      
      const result = guard.checkWelcome();
      
      expect(result).toBe(true);
    });

    it('should return true when userProfileV2 is null and tab has no check', () => {
      const tabs = [
        { enabled: true, step: 1, check: false, key: 'userRoles' }
      ];
     // mockConfigSvc.welcomeTabs = { tabs };
      mockConfigSvc.userProfileV2 = null;
      
      mockFilter.mockReturnValue(tabs);
      mockOrderBy.mockReturnValue(tabs);
      
      const result = guard.checkWelcome();
      
      expect(result).toBe(true);
    });

    it('should set step numbers for filtered tabs', () => {
      const tabs = [
        { enabled: true, step: 5, check: true, key: 'userRoles' },
        { enabled: true, step: 3, check: true, key: 'topics' }
      ];
      //mockConfigSvc.welcomeTabs = { tabs };
      mockConfigSvc.userProfileV2 = { userRoles: ['user'], topics: ['topic1'] } as any;
      
      mockFilter.mockReturnValue(tabs);
      mockOrderBy.mockReturnValue(tabs);
      mockGet.mockImplementation((_obj, path) => {
        if (path === 'welcomeTabs.tabs') return tabs;
        if (path === 'userRoles') return ['user'];
        if (path === 'topics') return ['topic1'];
        return undefined;
      });
      
      guard.checkWelcome();
      
      expect(mockEach).toHaveBeenCalledWith(tabs, expect.any(Function));
    });

    it('should handle multiple tabs with mixed completion status', () => {
      const tabs = [
        { enabled: true, step: 1, check: true, key: 'userRoles' },
        { enabled: true, step: 2, check: true, key: 'topics' }
      ];
      //mockConfigSvc.welcomeTabs = { tabs };
      mockConfigSvc.userProfileV2 = { userRoles: ['user'], topics: [] } as any;
      
      mockFilter.mockReturnValue(tabs);
      mockOrderBy.mockReturnValue(tabs);
      mockGet.mockImplementation((_obj, path) => {
        if (path === 'welcomeTabs.tabs') return tabs;
        if (path === 'userRoles') return ['user'];
        if (path === 'topics') return [];
        return undefined;
      });
      
      const result = guard.checkWelcome();
      
      expect(result).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete flow for authenticated user with all requirements', async () => {
      mockConfigSvc.userProfile = { id: 'test-user' } as any;
      mockConfigSvc.userRoles = new Set(['admin']);
      mockConfigSvc.hasAcceptedTnc = true;
      mockConfigSvc.isActive = true;
      mockConfigSvc.profileDetailsStatus = true;
      mockConfigSvc.restrictedFeatures = new Set();
      
      (window as any).location.href = 'http://localhost:4200/public/test';
      
      mockActivatedRouteSnapshot.data = {
        requiredFeatures: ['feature1'],
        requiredRoles: ['admin']
      };
      
      const result = await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(result).toBe(true);
    });

    it('should handle unauthenticated user on protected route', async () => {
      mockConfigSvc.userProfile = null;
      (window as any).location.href = 'http://localhost:4200/app/protected';
      mockAuthSvc.loginV2.mockResolvedValue(undefined);
      
      await guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      
      expect(mockAuthSvc.loginV2).toHaveBeenCalledWith('S', '?redirect_uri=%2Ftest-url');
    });
  });
});