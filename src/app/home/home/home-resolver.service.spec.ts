import { HomeResolverService } from './home-resolver.service'; // Adjust the path based on your project structure
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { Router } from '@angular/router';

describe('HomeResolverService', () => {
  let homeResolverService: HomeResolverService;
  let mockConfigSvc: jest.Mocked<ConfigurationsService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(() => {
    // Mock ConfigurationsService
    mockConfigSvc = {
      unMappedUser: {
        profileDetails: {
          profileStatus: 'not-my-user',
          employmentDetails: {
            departmentName: 'igot',
          },
        },
      },
    } as any; // Using 'as any' to bypass TypeScript checks for the mock object

    // Mock Router
    mockRouter = {
      navigateByUrl: jest.fn(),
    } as any;

    // Instantiate HomeResolverService with mocked dependencies
    homeResolverService = new HomeResolverService(mockConfigSvc, mockRouter);
  });

  it('should be created', () => {
    expect(homeResolverService).toBeTruthy();
  });

  it('should navigate when profileStatus is "not-my-user" and departmentName is "igot"', () => {
    homeResolverService.resolve();

    // Assert that router.navigateByUrl was called with the expected URL
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me#profileInfo');
  });

  it('should not navigate when profileStatus is not "not-my-user"', () => {
    // Modify the mock to return a different profileStatus
    mockConfigSvc.unMappedUser.profileDetails.profileStatus = 'my-user';

    homeResolverService.resolve();

    // Assert that router.navigateByUrl was NOT called
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should not navigate when departmentName is not "igot"', () => {
    // Modify the mock to return a different departmentName
    mockConfigSvc.unMappedUser.profileDetails.employmentDetails.departmentName = 'other-department';

    homeResolverService.resolve();

    // Assert that router.navigateByUrl was NOT called
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should not navigate when unMappedUser is undefined', () => {
    // Modify the mock to return an undefined unMappedUser
    mockConfigSvc.unMappedUser = undefined;

    homeResolverService.resolve();

    // Assert that router.navigateByUrl was NOT called
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should return true from resolve method', () => {
    const result = homeResolverService.resolve();

    // Assert that the resolve method returns true
    expect(result).toBe(true);
  });
});
