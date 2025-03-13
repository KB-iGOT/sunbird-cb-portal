import { AppHomePageResolverService } from './app-home-page-resolver.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationsService, IResolveResponse } from '@sunbird-cb/utils-v2';
import { FormExtService } from './form-ext.service';
import { of, throwError } from 'rxjs';

describe('AppHomePageResolverService', () => {
  let resolverService: AppHomePageResolverService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockFormService: jest.Mocked<FormExtService>;

  beforeEach(() => {
    // Create mock implementations for dependencies
    mockHttpClient = {
      get: jest.fn(),
    } as any;

    mockConfigService = {
      sitePath: 'http://mocksite.com',
    } as any;

    mockFormService = {
      formReadData: jest.fn(),
    } as any;

    resolverService = new AppHomePageResolverService(mockHttpClient, mockConfigService, mockFormService);
  });

  it('should resolve successfully when form data is returned', () => {
    // Mock successful response from form service
    const mockFormResponse = {
      result: {
        form: {
          data: { key: 'value' },
        },
      },
    };
    mockFormService.formReadData.mockReturnValue(of(mockFormResponse));

    const route = {} as any;  // Mock the ActivatedRouteSnapshot
    const state = {} as any;  // Mock the RouterStateSnapshot

    resolverService.resolve(route, state).subscribe((response: IResolveResponse<any>) => {
      expect(response.data).toEqual(mockFormResponse.result.form.data);
      expect(response.error).toBeNull();
    });
  });

  it('should return default home page data when form service fails', () => {
    // Mock error response from form service
    mockFormService.formReadData.mockReturnValue(throwError(() => new Error('Form service failed')));

    const mockHomePageData = { key: 'homeData' };
    mockHttpClient.get.mockReturnValue(of(mockHomePageData));

    const route = {} as any;  // Mock the ActivatedRouteSnapshot
    const state = {} as any;  // Mock the RouterStateSnapshot

    resolverService.resolve(route, state).subscribe((response: IResolveResponse<any>) => {
      expect(response.data).toEqual(mockHomePageData);
      expect(response.error).toBeNull();
    });
  });

  it('should return error response if both form service and http client fail', () => {
    // Mock error response from form service
    mockFormService.formReadData.mockReturnValue(throwError(() => new Error('Form service failed')));

    // Mock error response from HTTP client
    mockHttpClient.get.mockReturnValue(throwError(() => new Error('HTTP request failed')));

    const route = {} as any;  // Mock the ActivatedRouteSnapshot
    const state = {} as any;  // Mock the RouterStateSnapshot

    resolverService.resolve(route, state).subscribe((response: IResolveResponse<any>) => {
      expect(response.data).toBeNull();
      expect(response.error).toBeDefined();
    });
  });
});
