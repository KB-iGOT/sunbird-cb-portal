import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ConfigurationsService, IResolveResponse } from '@sunbird-cb/utils-v2';
import { AppConfigurationsResolverService } from './app-configurations-resolver.service';

// Mock ConfigurationsService
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn().mockImplementation(() => ({
    // Add any properties/methods that your service uses
  }))
}));

describe('AppConfigurationsResolverService', () => {
  let service: AppConfigurationsResolverService;
  let configService: ConfigurationsService;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let mockRouterStateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    configService = new ConfigurationsService() as jest.Mocked<ConfigurationsService>;
    service = new AppConfigurationsResolverService(configService);

    // Setup mock route and state objects
    mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    mockRouterStateSnapshot = {} as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resolve', () => {
    it('should return an Observable with IResolveResponse containing configService', (done) => {
      // Act
      const result = service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      // Assert
      result.subscribe(response => {
        expect(response).toBeDefined();
        expect(response.data).toBe(configService);
        expect(response.error).toBeNull();
        done();
      });
    });

    it('should return the response in the correct format', (done) => {
      // Act
      const result = service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      // Assert
      result.subscribe(response => {
        const expectedResponse: IResolveResponse<any> = {
          data: configService,
          error: null
        };
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should always return an Observable', () => {
      // Act
      const result = service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      // Assert
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined(); // Check if it's an Observable
    });
  });
});