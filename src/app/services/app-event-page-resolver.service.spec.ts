import { of, throwError } from 'rxjs';
import { AppEventPageResolverService } from './app-event-page-resolver.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { FormExtService } from './form-ext.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AppEventPageResolverService', () => {
  let service: AppEventPageResolverService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockConfigService: jest.Mocked<ConfigurationsService>;
  let mockFormExtService: jest.Mocked<FormExtService>;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let mockRouterStateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    // Create mock objects
    mockHttpClient = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;
    
    mockConfigService = {
      sitePath: 'http://example.com',
    } as unknown as jest.Mocked<ConfigurationsService>;
    
    mockFormExtService = {
      formReadData: jest.fn(),
    } as unknown as jest.Mocked<FormExtService>;
    
    mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    mockRouterStateSnapshot = {} as RouterStateSnapshot;

    // Initialize service with mocks
    service = new AppEventPageResolverService(
      mockHttpClient,
      mockConfigService,
      mockFormExtService
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve successfully when formReadData returns data', (done) => {
    // Mock response from formExtService
    const mockFormResponse = {
      result: {
        form: {
          data: { someKey: 'someValue' }
        }
      }
    };
    
    mockFormExtService.formReadData.mockReturnValue(of(mockFormResponse));

    // Call resolve method
    service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe((response) => {
        expect(response.data).toEqual(mockFormResponse.result.form.data);
        expect(response.error).toBeNull();
        expect(mockFormExtService.formReadData).toHaveBeenCalledWith({
          'request': {
            'type': 'page',
            'subType': 'events',
            'action': 'page-configuration',
            'component': 'portal',
            'rootOrgId': '*',
          }
        });
        done();
      });
  });

  it('should fall back to HTTP get when formReadData fails', (done) => {
    // Mock formExtService to throw error
    mockFormExtService.formReadData.mockReturnValue(throwError('Form service error'));
    
    // Mock HTTP response for fallback
    const mockHttpResponse = { someKey: 'fallbackValue' };
    mockHttpClient.get.mockReturnValue(of(mockHttpResponse));

    // Call resolve method
    service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe((response) => {
        expect(response.data).toEqual(mockHttpResponse);
        expect(response.error).toBeNull();
        expect(mockHttpClient.get).toHaveBeenCalledWith('http://example.com/feature/event.json');
        done();
      });
  });

  it('should handle both formReadData and HTTP fallback failures', (done) => {
    // Mock formExtService to throw error
    mockFormExtService.formReadData.mockReturnValue(throwError('Form service error'));
    
    // Mock HTTP to also throw error
    const mockError = new Error('HTTP error');
    mockHttpClient.get.mockReturnValue(throwError(mockError));

    // Call resolve method
    service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      .subscribe((response) => {
        expect(response.data).toBeNull();
        expect(response.error).toEqual(mockError);
        done();
      });
  });

  it('should use correct request payload when calling formReadData', () => {
    // Setup mock to return some data
    mockFormExtService.formReadData.mockReturnValue(of({ result: { form: { data: {} } } }));
    
    // Call the method
    service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe();
    
    // Verify the request payload
    expect(mockFormExtService.formReadData).toHaveBeenCalledWith({
      'request': {
        'type': 'page',
        'subType': 'events',
        'action': 'page-configuration',
        'component': 'portal',
        'rootOrgId': '*',
      }
    });
  });

  it('should use configSvc.sitePath for fallback URL', () => {
    // Change the sitePath to verify it's used
    mockConfigService.sitePath = 'http://different-site.com';
    
    // Setup mocks to trigger the fallback path
    mockFormExtService.formReadData.mockReturnValue(throwError('Form service error'));
    mockHttpClient.get.mockReturnValue(of({}));
    
    // Call the method
    service.resolve(mockActivatedRouteSnapshot, mockRouterStateSnapshot).subscribe();
    
    // Verify the fallback URL uses the correct sitePath
    expect(mockHttpClient.get).toHaveBeenCalledWith('http://different-site.com/feature/event.json');
  });
});