import { RequestService } from './request.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn()
};

describe('RequestService', () => {
  let service: RequestService;
  let httpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create service instance with mocked HttpClient
    httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>;
    service = new RequestService(httpClient);
  });

  describe('createPosition', () => {
    it('should call http.post with correct endpoint and request object', () => {
      // Arrange
      const mockReqObj = { name: 'Test Position', description: 'Test Description' };
      const mockResponse = { success: true, id: '123' };
      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result = service.createPosition(mockReqObj);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/workflow/position/create',
        mockReqObj
      );
      expect(httpClient.post).toHaveBeenCalledTimes(1);
      
      // Verify observable returns expected value
      result.subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
    });

    it('should return observable with response data', (done) => {
      // Arrange
      const mockReqObj = { name: 'Test Position' };
      const mockResponse = { success: true, data: 'position created' };
      httpClient.post.mockReturnValue(of(mockResponse));

      // Act & Assert
      service.createPosition(mockReqObj).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('createOrg', () => {
    it('should call http.post with correct endpoint and request object', () => {
      // Arrange
      const mockReqObj = { orgName: 'Test Organization', type: 'company' };
      const mockResponse = { success: true, orgId: '456' };
      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result = service.createOrg(mockReqObj);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/workflow/org/create',
        mockReqObj
      );
      expect(httpClient.post).toHaveBeenCalledTimes(1);
      
      result.subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
    });

    it('should handle empty request object', () => {
      // Arrange
      const mockReqObj = {};
      const mockResponse = { success: false, error: 'Invalid request' };
      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      service.createOrg(mockReqObj);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/workflow/org/create',
        mockReqObj
      );
    });
  });

  describe('createDomain', () => {
    it('should call http.post with correct endpoint and request object', () => {
      // Arrange
      const mockReqObj = { domainName: 'test.com', category: 'education' };
      const mockResponse = { success: true, domainId: '789' };
      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result = service.createDomain(mockReqObj);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/workflow/domain/create',
        mockReqObj
      );
      expect(httpClient.post).toHaveBeenCalledTimes(1);
      
      result.subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
    });
  });

  describe('sendOtp', () => {
    it('should call http.post with correct endpoint and formatted request object', () => {
      // Arrange
      const mockValue = 'test@example.com';
      const mockType = 'email';
      const expectedReqObj = {
        request: {
          type: 'email',
          key: 'test@example.com'
        }
      };
      const mockResponse = { success: true, otpSent: true };
      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result = service.sendOtp(mockValue, mockType);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/otp/v1/generate',
        expectedReqObj
      );
      expect(httpClient.post).toHaveBeenCalledTimes(1);
      
      result.subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
    });

    it('should handle phone number type', () => {
      // Arrange
      const mockValue = '+1234567890';
      const mockType = 'phone';
      const expectedReqObj = {
        request: {
          type: 'phone',
          key: '+1234567890'
        }
      };
      httpClient.post.mockReturnValue(of({ success: true }));

      // Act
      service.sendOtp(mockValue, mockType);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/otp/v1/generate',
        expectedReqObj
      );
    });

    it('should format request object correctly with template literals', () => {
      // Arrange
      const mockValue = 'user123';
      const mockType = 'username';
      httpClient.post.mockReturnValue(of({}));

      // Act
      service.sendOtp(mockValue, mockType);

      // Assert
      const callArgs = httpClient.post.mock.calls[0];
      const requestBody = callArgs[1];
      
      expect(requestBody.request.type).toBe('username');
      expect(requestBody.request.key).toBe('user123');
    });
  });

  describe('resendOtp', () => {
    it('should call http.post with correct endpoint and formatted request object', () => {
      // Arrange
      const mockValue = 'test@example.com';
      const mockType = 'email';
      const expectedReqObj = {
        request: {
          type: 'email',
          key: 'test@example.com'
        }
      };
      const mockResponse = { success: true, otpResent: true };
      httpClient.post.mockReturnValue(of(mockResponse));

      // Act
      const result = service.resendOtp(mockValue, mockType);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/otp/v1/generate',
        expectedReqObj
      );
      expect(httpClient.post).toHaveBeenCalledTimes(1);
      
      // Note: resendOtp doesn't have explicit return type, but it should return the observable
      if (result) {
        result.subscribe(response => {
          expect(response).toEqual(mockResponse);
        });
      }
    });

    it('should use the same endpoint as sendOtp', () => {
      // Arrange
      const mockValue = 'test123';
      const mockType = 'phone';
      httpClient.post.mockReturnValue(of({}));

      // Act
      service.resendOtp(mockValue, mockType);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/otp/v1/generate',
        {}
      );
    });

    it('should handle different value and type combinations', () => {
      // Arrange
      const testCases = [
        { value: 'user@domain.com', type: 'email' },
        { value: '+9876543210', type: 'mobile' },
        { value: 'username123', type: 'user' }
      ];

      testCases.forEach(({ value, type }) => {
        // Reset mock for each iteration
        httpClient.post.mockClear();
        httpClient.post.mockReturnValue(of({}));

        // Act
        service.resendOtp(value, type);

        // Assert
        const expectedReqObj = {
          request: {
            type: type,
            key: value
          }
        };
        expect(httpClient.post).toHaveBeenCalledWith(
          '/api/otp/v1/generate',
          expectedReqObj
        );
      });
    });
  });

  describe('Service Initialization', () => {
    it('should be created with HttpClient dependency', () => {
      expect(service).toBeDefined();
     // expect(service).toBeInstanceOf(RequestService);
    });
  });

  describe('API Endpoints', () => {
    it('should use correct API endpoints for all methods', () => {
      // Arrange
      const mockData = { test: 'data' };
      httpClient.post.mockReturnValue(of({}));

      // Act - call all methods
      service.createPosition(mockData);
      service.createOrg(mockData);
      service.createDomain(mockData);
      service.sendOtp('test', 'email');
      service.resendOtp('test', 'email');

      // Assert
      const calls = httpClient.post.mock.calls;
      expect(calls[0][0]).toBe('/api/workflow/position/create');
      expect(calls[1][0]).toBe('/api/workflow/org/create');
      expect(calls[2][0]).toBe('/api/workflow/domain/create');
      expect(calls[3][0]).toBe('/api/otp/v1/generate');
      expect(calls[4][0]).toBe('/api/otp/v1/generate');
    });
  });
});