import { HomeResolverService } from './home-resolver.service';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { Router } from '@angular/router';

// Mock the ConfigurationsService and Router
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
}));

jest.mock('@angular/router', () => ({
  Router: jest.fn(),
}));

describe('HomeResolverService', () => {
  let service: HomeResolverService;
  let configSvcMock: ConfigurationsService;
  let routerMock: Router;

  beforeEach(() => {
    // Create mock instances of dependencies
    configSvcMock = new ConfigurationsService();
    routerMock = new Router();

    // Instantiate the service with mocks
    service = new HomeResolverService(configSvcMock, routerMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to person profile if the profileStatus is "not-my-user" and departmentName is "igot"', () => {
    // Arrange: set up mock behavior for ConfigurationsService
    configSvcMock.unMappedUser = {
      profileDetails: {
        profileStatus: 'not-my-user',
        employmentDetails: {
          departmentName: 'igot',
        },
      },
    };

    // Mock router.navigateByUrl method
    routerMock.navigateByUrl = jest.fn();

    // Act: call the resolve method
    const result = service.resolve();

    // Assert: verify that the navigateByUrl was called
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
    expect(result).toBe(true);
  });

  it('should not navigate if profileStatus is not "not-my-user" but departmentName is "igot"', () => {
    // Arrange: set up mock behavior for ConfigurationsService
    configSvcMock.unMappedUser = {
      profileDetails: {
        profileStatus: 'other-status',
        employmentDetails: {
          departmentName: 'igot',
        },
      },
    };

    // Mock router.navigateByUrl method
    routerMock.navigateByUrl = jest.fn();

    // Act: call the resolve method
    const result = service.resolve();

    // Assert: verify that the navigateByUrl was not called
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not navigate if profileStatus is "not-my-user" but departmentName is not "igot"', () => {
    // Arrange: set up mock behavior for ConfigurationsService
    configSvcMock.unMappedUser = {
      profileDetails: {
        profileStatus: 'not-my-user',
        employmentDetails: {
          departmentName: 'other-department',
        },
      },
    };

    // Mock router.navigateByUrl method
    routerMock.navigateByUrl = jest.fn();

    // Act: call the resolve method
    const result = service.resolve();

    // Assert: verify that the navigateByUrl was not called
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not navigate if profileStatus is not "not-my-user" and departmentName is not "igot"', () => {
    // Arrange: set up mock behavior for ConfigurationsService
    configSvcMock.unMappedUser = {
      profileDetails: {
        profileStatus: 'other-status',
        employmentDetails: {
          departmentName: 'other-department',
        },
      },
    };

    // Mock router.navigateByUrl method
    routerMock.navigateByUrl = jest.fn();

    // Act: call the resolve method
    const result = service.resolve();

    // Assert: verify that the navigateByUrl was not called
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should handle undefined or missing properties gracefully', () => {
    // Arrange: set up mock behavior for ConfigurationsService with missing properties
    configSvcMock.unMappedUser = {
      profileDetails: {},
    };

    // Mock router.navigateByUrl method
    routerMock.navigateByUrl = jest.fn();

    // Act: call the resolve method
    const result = service.resolve();

    // Assert: verify that the navigateByUrl was not called
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
