import { AppConfigurationsService } from './app-configurations.service'; // adjust the import path as needed
import { ConfigurationsService, IResolveResponse } from '@sunbird-cb/utils-v2';
//import { of } from 'rxjs';

// Mock the ConfigurationsService
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn().mockImplementation(() => ({
    // Add any necessary mock behavior for ConfigurationsService
  })),
}));

describe('AppConfigurationsService', () => {
  let service: AppConfigurationsService;
  let mockConfigSvc: ConfigurationsService;

  beforeEach(() => {
    // Create a mock instance of ConfigurationsService
    mockConfigSvc = new ConfigurationsService(); // pass appropriate arguments if needed
    
    // Instantiate the AppConfigurationsService with the mocked ConfigurationsService
    service = new AppConfigurationsService(mockConfigSvc);
  });

  it('should resolve with the correct structure', (done) => {
    // Arrange: mock the data returned from ConfigurationsService
    const mockResponse: IResolveResponse<any> = {
      data: mockConfigSvc,
      error: null,
    };

    // Stub the configSvc to return an observable with the mock response
   // jest.spyOn(mockConfigSvc, 'someMethod').mockReturnValue(of(mockResponse)); // if any method is called on mockConfigSvc
    
    // Act: Call the resolve method
    service.resolve(null as any, null as any).subscribe((result) => {
      // Assert: Check if the result matches the expected structure
      expect(result).toEqual(mockResponse);
      done();
    });
  });
});
