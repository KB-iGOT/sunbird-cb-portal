import { FormExtService } from './form-ext.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { of, throwError } from 'rxjs';

describe('FormExtService', () => {
  let service: FormExtService;
  let httpClient: jest.Mocked<HttpClient>;
  let configSvc: jest.Mocked<ConfigurationsService>;

  beforeEach(() => {
    // Create proper mocks
    httpClient = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;

    configSvc = {
      sitePath: '/test-site-path'
    } as any;
    
    // Create service instance with mocked dependencies
    service = new FormExtService(httpClient, configSvc);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with injected dependencies', () => {
      expect(service).toBeDefined();
      expect(service['http']).toBe(httpClient);
      expect(service.configSvc).toBe(configSvc);
    });
  });

  describe('formReadData', () => {
    it('should make POST request to form read API endpoint', () => {
      const mockRequest = { formType: 'test', action: 'read' };
      const mockResponse = { result: { form: { data: 'test data' } } };
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.formReadData(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/apis/v1/form/read', mockRequest);
      expect(httpClient.post).toHaveBeenCalledTimes(1);
    });

    it('should handle POST request with null request', () => {
      const mockResponse = { result: { form: { data: null } } };
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.formReadData(null).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/apis/v1/form/read', null);
    });
  });

  describe('homeFormReadData', () => {
    it('should return form data when formReadData succeeds', () => {
      const mockRequest = { formType: 'home', action: 'read' };
      const mockFormResponse = {
        result: {
          form: {
            data: { sections: ['section1', 'section2'] }
          }
        }
      };
      const expectedData = { sections: ['section1', 'section2'] };

      httpClient.post.mockReturnValue(of(mockFormResponse));

      service.homeFormReadData(mockRequest).subscribe(response => {
        expect(response).toEqual(expectedData);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/apis/v1/form/read', mockRequest);
    });

    it('should handle form data extraction when result exists', () => {
      const mockRequest = { formType: 'home' };
      const mockFormResponse = {
        result: {
          form: {
            data: 'extracted form data'
          }
        }
      };

      httpClient.post.mockReturnValue(of(mockFormResponse));

      service.homeFormReadData(mockRequest).subscribe(response => {
        expect(response).toBe('extracted form data');
      });
    });

    it('should handle null form response and extract undefined data', () => {
      const mockRequest = { formType: 'home' };
      const mockFormResponse = {
        result: {
          form: {
            data: null
          }
        }
      };

      httpClient.post.mockReturnValue(of(mockFormResponse));

      service.homeFormReadData(mockRequest).subscribe(response => {
        expect(response).toBeNull();
      });
    });

    it('should fallback to home.json when formReadData fails', () => {
      const mockRequest = { formType: 'home' };
      const mockError = new Error('Form API failed');
      const mockFallbackData = { fallback: 'home data' };

      httpClient.post.mockReturnValue(throwError(mockError));
      httpClient.get.mockReturnValue(of(mockFallbackData));

      service.homeFormReadData(mockRequest).subscribe(response => {
        expect(response).toEqual(mockFallbackData);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/apis/v1/form/read', mockRequest);
      expect(httpClient.get).toHaveBeenCalledWith('/test-site-path/page/home.json');
    });

    it('should handle fallback GET request failure', () => {
      const mockRequest = { formType: 'home' };
      const mockFormError = new Error('Form API failed');
      const mockGetError = new Error('GET request failed');

      httpClient.post.mockReturnValue(throwError(mockFormError));
      httpClient.get.mockReturnValue(throwError(mockGetError));

      service.homeFormReadData(mockRequest).subscribe(response => {
        expect(response).toEqual({ data: null, error: mockGetError });
      });

      expect(httpClient.post).toHaveBeenCalledWith('/apis/v1/form/read', mockRequest);
      expect(httpClient.get).toHaveBeenCalledWith('/test-site-path/page/home.json');
    });

    it('should use configSvc.sitePath for fallback URL construction', () => {
      const mockRequest = { formType: 'home' };
      const mockError = new Error('Form API failed');
      
      // Create new service with different sitePath
      const newConfigSvc = { sitePath: '/different-path' } as any;
      const newService = new FormExtService(httpClient, newConfigSvc);

      httpClient.post.mockReturnValue(throwError(mockError));
      httpClient.get.mockReturnValue(of({ fallback: true }));

      newService.homeFormReadData(mockRequest).subscribe();

      expect(httpClient.get).toHaveBeenCalledWith('/different-path/page/home.json');
    });

    it('should handle empty sitePath in configSvc', () => {
      const mockRequest = { formType: 'home' };
      const mockError = new Error('Form API failed');
      
      // Create new service with empty sitePath
      const newConfigSvc = { sitePath: '' } as any;
      const newService = new FormExtService(httpClient, newConfigSvc);

      httpClient.post.mockReturnValue(throwError(mockError));
      httpClient.get.mockReturnValue(of({ fallback: true }));

      newService.homeFormReadData(mockRequest).subscribe();

      expect(httpClient.get).toHaveBeenCalledWith('/page/home.json');
    });

    it('should handle successful fallback with null data', () => {
      const mockRequest = { formType: 'home' };
      const mockError = new Error('Form API failed');

      httpClient.post.mockReturnValue(throwError(mockError));
      httpClient.get.mockReturnValue(of(null));

      service.homeFormReadData(mockRequest).subscribe(response => {
        expect(response).toBeNull();
      });
    });

    it('should handle form response with missing nested properties', () => {
      const mockRequest = { formType: 'home' };
      const mockFormResponse = {}; // Missing result property

      httpClient.post.mockReturnValue(of(mockFormResponse));

      service.homeFormReadData(mockRequest).subscribe(response => {
        expect(response).toBeUndefined();
      });
    });
  });
});