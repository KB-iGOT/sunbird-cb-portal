// general.guard.spec.ts
import { GeneralGuard } from './general.guard';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils-v2';

// Mock lodash
jest.mock('lodash', () => ({
  orderBy: jest.fn().mockImplementation((collection, _iteratees) => collection),
  filter: jest.fn().mockImplementation((collection, _predicate) => collection),
  get: jest.fn().mockImplementation((_object, path) => {
    if (path === 'welcomeTabs.tabs') {
      return [
        { enabled: true, step: 1, key: 'userRoles', check: true },
        { enabled: true, step: 2, key: 'desiredTopics', check: true }
      ];
    }
    if (path === 'userProfileV2.userRoles') return ['role1', 'role2'];
    if (path === 'userProfileV2.desiredTopics') return ['topic1', 'topic2'];
    return null;
  }),
  each: jest.fn().mockImplementation((collection, iteratee) => {
    if (collection) {
      collection.forEach(iteratee);
    }
  })
}));

describe('GeneralGuard', () => {
  let guard: GeneralGuard;
  let routerMock: jest.Mocked<Router>;
  let configSvcMock: jest.Mocked<Partial<ConfigurationsService>>;
  let authSvcMock: jest.Mocked<Partial<AuthKeycloakService>>;
  let activatedRouteSnapshotMock: Partial<ActivatedRouteSnapshot>;
  let routerStateSnapshotMock: Partial<RouterStateSnapshot>;
  let urlTreeMock: UrlTree;
  
  beforeEach(() => {
    // Create URL tree mock
    urlTreeMock = new UrlTree();
    
    // Create router mock
    routerMock = {
      parseUrl: jest.fn().mockReturnValue(urlTreeMock),
      navigateByUrl: jest.fn()
    } as unknown as jest.Mocked<Router>;
    
    // Create configurations service mock
    configSvcMock = {
      userProfile: {
        userId: ''
      },
     
      hasAcceptedTnc: true,
      isActive: true,
      profileDetailsStatus: true,
      userRoles: new Set(['user', 'content-creator']),
      restrictedFeatures: new Set(['feature3']),
      userProfileV2: {
        userRoles: ['user', 'content-creator'],
        desiredTopics: ['topic1', 'topic2'],
        userId: ''
      }
    };
    
    // Create auth service mock
    authSvcMock = {
      loginV2: jest.fn().mockResolvedValue(true),
      force_logout: jest.fn()
    };
    
    // Create activated route snapshot mock
    activatedRouteSnapshotMock = {
      data: {
        requiredFeatures: [],
        requiredRoles: []
      }
    };
    
    // Create router state snapshot mock
    routerStateSnapshotMock = {
      url: '/app/home'
    };
    
    // Create guard instance with mocks
    guard = new GeneralGuard(
      routerMock as Router,
      configSvcMock as ConfigurationsService,
      authSvcMock as AuthKeycloakService
    );
    
    // Spy on private methods
    jest.spyOn(guard as any, 'shouldAllow').mockImplementation(async () => true);
    jest.spyOn(guard, 'checkWelcome');
    jest.spyOn(guard, 'hasRole');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
  
  describe('canActivate', () => {
    it('should call shouldAllow with required features and roles', async () => {
      // Set required features and roles
      activatedRouteSnapshotMock.data = {
        requiredFeatures: ['feature1', 'feature2'],
        requiredRoles: ['role1', 'role2']
      };
      
      // Call canActivate
      await guard.canActivate(
        activatedRouteSnapshotMock as ActivatedRouteSnapshot,
        routerStateSnapshotMock as RouterStateSnapshot
      );
      
      // Verify shouldAllow was called with correct params
      expect((guard as any).shouldAllow).toHaveBeenCalledWith(
        routerStateSnapshotMock,
        ['feature1', 'feature2'],
        ['role1', 'role2']
      );
    });
    
    it('should handle undefined required features and roles', async () => {
      // Set undefined data
      activatedRouteSnapshotMock.data = {};
      
      // Call canActivate
      await guard.canActivate(
        activatedRouteSnapshotMock as ActivatedRouteSnapshot,
        routerStateSnapshotMock as RouterStateSnapshot
      );
      
      // Verify shouldAllow was called with empty arrays
      expect((guard as any).shouldAllow).toHaveBeenCalledWith(
        routerStateSnapshotMock,
        [],
        []
      );
    });
  });
  
  describe('hasRole', () => {
    it('should return true if user has any of the required roles', () => {
      // Mock user roles
      configSvcMock.userRoles = new Set(['user', 'content-creator']);
      
      // Test with roles the user has
      expect(guard.hasRole(['user', 'admin'])).toBe(true);
      expect(guard.hasRole(['content-creator'])).toBe(true);
    });
    
    it('should return false if user has none of the required roles', () => {
      // Mock user roles
      configSvcMock.userRoles = new Set(['user', 'content-creator']);
      
      // Test with roles the user does not have
      expect(guard.hasRole(['admin', 'manager'])).toBe(false);
    });
    
    it('should handle case insensitivity', () => {
      // Mock user roles (lowercase)
      configSvcMock.userRoles = new Set(['user', 'content-creator']);
      
      // Test with uppercase roles
      expect(guard.hasRole(['USER', 'ADMIN'])).toBe(true);
    });
    
    it('should handle empty user roles', () => {
      // Mock empty user roles
      configSvcMock.userRoles = new Set();
      
      // Test with any roles
      expect(guard.hasRole(['user', 'admin'])).toBe(false);
    });
    
    it('should handle null or undefined user roles', () => {
      // Mock null user roles
      configSvcMock.userRoles = null;
      
      // Test with any roles
      expect(guard.hasRole(['user', 'admin'])).toBe(false);
    });
  });
  
  describe('shouldAllow', () => {
    // Restore original implementation for testing shouldAllow
    beforeEach(() => {
      jest.spyOn(guard as any, 'shouldAllow').mockRestore();
    });
    
   
    
    it('should redirect to setup when checkWelcome returns false', async () => {
      // Mock checkWelcome to return false
      jest.spyOn(guard, 'checkWelcome').mockReturnValue(false);
      
      // Call shouldAllow directly
      await (guard as any).shouldAllow(
        routerStateSnapshotMock,
        [],
        []
      );
      
      // Verify parseUrl was called with '/app/setup'
      expect(routerMock.parseUrl).toHaveBeenCalledWith('/app/setup');
    });
    
  
    
    it('should return true when all conditions are met', async () => {
      // Set all conditions to pass
      configSvcMock.hasAcceptedTnc = true;
      configSvcMock.isActive = true;
      configSvcMock.profileDetailsStatus = true;
      configSvcMock.userRoles = new Set(['admin']);
      configSvcMock.restrictedFeatures = new Set(['feature3']);
      jest.spyOn(guard, 'checkWelcome').mockReturnValue(true);
      
      // Call shouldAllow with required roles user has and non-restricted features
      const result = await (guard as any).shouldAllow(
        routerStateSnapshotMock,
        ['feature1', 'feature2'],
        ['admin']
      );
      
      // Verify result is true
      expect(result).toBe(true);
    });
  });
  
 
});