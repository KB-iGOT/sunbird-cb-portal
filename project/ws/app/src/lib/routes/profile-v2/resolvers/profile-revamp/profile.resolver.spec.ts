import { of, throwError } from 'rxjs';
import { profileResolver } from './profile.resolver';

// Mock implementations
const mockProfileV2RevampService = {
  fetchProfile: jest.fn()
} as any;

const mockConfigurationsService = {
  userProfile: {
    userId: 'default-user-id'
  }
} as any;

const mockActivatedRouteSnapshot = {
  routeConfig: { path: '' },
  params: {},
  queryParams: {}
} as any;

const mockRouterStateSnapshot = {} as any;

describe('profileResolver', () => {
  let resolver: profileResolver;
  let profileService: any;
  let configService: any;
  let route: any;
  let state: any;

  beforeEach(() => {
    // Reset mocks
    profileService = { ...mockProfileV2RevampService };
    configService = { ...mockConfigurationsService };
    route = { ...mockActivatedRouteSnapshot };
    state = { ...mockRouterStateSnapshot };
    
    // Clear all mock calls
    jest.clearAllMocks();
    
    resolver = new profileResolver(profileService, configService);
  });

  describe('resolve method', () => {
    it('should resolve profile entries for "me" path using config service userId', (done) => {
      const mockProfileData = {
        userId: 'default-user-id',
        firstName: 'John',
        lastName: 'Doe'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = { path: 'me' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'default-user-id', false);
        done();
      });
    });

    it('should resolve profile entries for non-"me" path using route params userId', (done) => {
      const mockProfileData = {
        userId: 'route-param-user-id',
        firstName: 'Jane',
        lastName: 'Smith'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = { path: 'profile/:userId' };
      route.params = { userId: 'route-param-user-id' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'route-param-user-id', true);
        done();
      });
    });

    it('should resolve profile entries using query params userId when route params userId is not available', (done) => {
      const mockProfileData = {
        userId: 'query-param-user-id',
        firstName: 'Bob',
        lastName: 'Johnson'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = { path: 'profile' };
      route.params = {};
      route.queryParams = { userId: 'query-param-user-id' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'query-param-user-id', true);
        done();
      });
    });

    it('should fallback to config service userId when route and query params are not available', (done) => {
      const mockProfileData = {
        userId: 'default-user-id',
        firstName: 'Alice',
        lastName: 'Wilson'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = { path: 'profile' };
      route.params = {};
      route.queryParams = {};
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'default-user-id', false);
        done();
      });
    });

    it('should handle empty string userId gracefully', (done) => {
      const mockProfileData = {
        userId: '',
        firstName: 'Test',
        lastName: 'User'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = { path: 'profile' };
      route.params = {};
      route.queryParams = {};
      configService.userProfile = null;
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), '', true);
        done();
      });
    });

    it('should handle null routeConfig gracefully', (done) => {
      const mockProfileData = {
        userId: 'param-user-id',
        firstName: 'Test',
        lastName: 'User'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = null;
      route.params = { userId: 'param-user-id' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'param-user-id', true);
        done();
      });
    });

    it('should handle error from profile service', (done) => {
      const mockError = new Error('Profile service error');

      route.routeConfig = { path: 'me' };
      profileService.fetchProfile = jest.fn().mockReturnValue(throwError(mockError));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toBeNull();
        expect(result.error).toEqual(mockError);
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'default-user-id', false);
        done();
      });
    });

    it('should handle response with no result.response data', (done) => {
      const mockResponse = {
        result: {}
      };

      route.routeConfig = { path: 'me' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual({});
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'default-user-id', false);
        done();
      });
    });

    it('should handle response with null result', (done) => {
      const mockResponse = {
        result: null
      };

      route.routeConfig = { path: 'me' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual({});
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'default-user-id', false);
        done();
      });
    });

    it('should handle completely empty response', (done) => {
      const mockResponse = {};

      route.routeConfig = { path: 'me' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual({});
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'default-user-id', false);
        done();
      });
    });

    it('should prioritize route params over query params', (done) => {
      const mockProfileData = {
        userId: 'route-param-user-id',
        firstName: 'Priority',
        lastName: 'Test'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = { path: 'profile/:userId' };
      route.params = { userId: 'route-param-user-id' };
      route.queryParams = { userId: 'query-param-user-id' };
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), 'route-param-user-id', true);
        done();
      });
    });

    it('should handle undefined config service userProfile', (done) => {
      const mockProfileData = {
        userId: '',
        firstName: 'Empty',
        lastName: 'User'
      };
      const mockResponse = {
        result: {
          response: mockProfileData
        }
      };

      route.routeConfig = { path: 'profile' };
      route.params = {};
      route.queryParams = {};
      configService.userProfile = undefined;
      profileService.fetchProfile = jest.fn().mockReturnValue(of(mockResponse));

      resolver.resolve(route, state).subscribe((result: any) => {
        expect(result.data).toEqual(mockProfileData);
        expect(result.error).toBeNull();
        expect(profileService.fetchProfile).toHaveBeenCalledWith(expect.any(Object), '', true);
        done();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});