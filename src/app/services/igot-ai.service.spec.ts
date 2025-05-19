// igot-ai.service.spec.ts
import { iGOTAIService } from './igot-ai.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { of, throwError } from 'rxjs';

describe('iGOTAIService', () => {
  let service: iGOTAIService;
  let httpClientMock: jest.Mocked<HttpClient>;
  let configSvcMock: jest.Mocked<Partial<ConfigurationsService>>;

  beforeEach(() => {
    // Create mocks
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>;

    configSvcMock = {
      sitePath: 'http://test-site.com'
    } as jest.Mocked<Partial<ConfigurationsService>>;

    // Create service instance with mocks
    service = new iGOTAIService(
      httpClientMock,
      configSvcMock as ConfigurationsService
    );

    // Mock global smartech
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrgReadData', () => {
    it('should make a POST request to the correct endpoint with the organisation ID', () => {
      const organisationId = 'test-org-id';
      const expectedRequest = {
        request: {
          organisationId
        }
      };
      const mockResponse = {
        result: {
          response: {
            id: organisationId,
            name: 'Test Organisation'
          }
        }
      };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getOrgReadData(organisationId).subscribe(response => {
        expect(response).toEqual(mockResponse.result.response);
      });

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/api/org/v1/read',
        expectedRequest
      );
    });

    it('should map the response correctly', () => {
      const organisationId = 'test-org-id';
      const mockResponse = {
        result: {
          response: {
            id: organisationId,
            name: 'Test Organisation'
          }
        }
      };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getOrgReadData(organisationId).subscribe(response => {
        expect(response).toEqual(mockResponse.result.response);
      });
    });

    it('should handle the case when response does not have expected structure', () => {
      const organisationId = 'test-org-id';
      const mockResponse = {
        // Missing result.response structure
        data: {
          id: organisationId
        }
      };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.getOrgReadData(organisationId).subscribe(response => {
        expect(response).toBeUndefined();
      });
    });
  });

  describe('formReadData', () => {
    it('should make a POST request to the correct endpoint', () => {
      const requestPayload = { request: { type: 'test', subType: 'test-sub' } };
      const mockResponse = { result: { form: { data: { fields: [] } } } };

      httpClientMock.post.mockReturnValue(of(mockResponse));

      service.formReadData(requestPayload).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/v1/form/read',
        requestPayload
      );
    });
  });

  describe('iGOTAIConfigReadData', () => {
    it('should return form data when formReadData succeeds', () => {
      const requestPayload = { request: { type: 'igot-ai', subType: 'config' } };
      const mockFormResponse = {
        result: {
          form: {
            data: {
              fields: [{ name: 'test', value: 'test-value' }]
            }
          }
        }
      };

      httpClientMock.post.mockReturnValue(of(mockFormResponse));

      service.iGOTAIConfigReadData(requestPayload).subscribe(response => {
        expect(response).toEqual(mockFormResponse.result.form.data);
      });

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/v1/form/read',
        requestPayload
      );
    });

    it('should fetch from static JSON file when formReadData fails', () => {
      const requestPayload = { request: { type: 'igot-ai', subType: 'config' } };
      const mockError = new Error('Form read failed');
      const mockJsonResponse = {
        fields: [{ name: 'test', value: 'static-value' }]
      };

      // First request fails
      httpClientMock.post.mockReturnValue(throwError(mockError));
      
      // Fallback request succeeds
      httpClientMock.get.mockReturnValue(of(mockJsonResponse));

      service.iGOTAIConfigReadData(requestPayload).subscribe(response => {
        expect(response).toEqual(mockJsonResponse);
      });

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/v1/form/read',
        requestPayload
      );
      expect(httpClientMock.get).toHaveBeenCalledWith(
        'http://test-site.com/igot-ai.json'
      );
    });

    it('should handle errors when both primary and fallback requests fail', () => {
      const requestPayload = { request: { type: 'igot-ai', subType: 'config' } };
      const mockFirstError = new Error('Form read failed');
      const mockSecondError = new Error('JSON fetch failed');

      // First request fails
      httpClientMock.post.mockReturnValue(throwError(mockFirstError));
      
      // Fallback request also fails
      httpClientMock.get.mockReturnValue(throwError(mockSecondError));

      service.iGOTAIConfigReadData(requestPayload).subscribe(response => {
        expect(response).toEqual({ data: null, error: mockSecondError });
      });

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/v1/form/read',
        requestPayload
      );
      expect(httpClientMock.get).toHaveBeenCalledWith(
        'http://test-site.com/igot-ai.json'
      );
    });

    it('should handle null data in form response', () => {
      const requestPayload = { request: { type: 'igot-ai', subType: 'config' } };
      const mockFormResponse = {
        result: {
          form: {
            // Missing data field
          }
        }
      };

      httpClientMock.post.mockReturnValue(of(mockFormResponse));

      service.iGOTAIConfigReadData(requestPayload).subscribe(response => {
        expect(response).toBeUndefined();
      });
    });

    it('should handle missing result structure in form response', () => {
      const requestPayload = { request: { type: 'igot-ai', subType: 'config' } };
      const mockFormResponse = {
        // Missing result structure
        data: {
          fields: []
        }
      };

      httpClientMock.post.mockReturnValue(of(mockFormResponse));

      service.iGOTAIConfigReadData(requestPayload).subscribe(response => {
        expect(response).toBeUndefined();
      });
    });
  });
});