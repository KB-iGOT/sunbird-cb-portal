import { CertificateService } from './certificate.service';
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { of } from 'rxjs';

describe('CertificateService', () => {
  let service: CertificateService;
  let apiServiceMock: jest.Mocked<ApiService>;
  let configServiceMock: jest.Mocked<ConfigurationsService>;
  
  beforeEach(() => {
    // Create mocks for the dependencies
    apiServiceMock = {
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;
    
    configServiceMock = {} as jest.Mocked<ConfigurationsService>;
    
    // Instantiate the service with mocked dependencies
    service = new CertificateService(apiServiceMock, configServiceMock);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('validateCertificate', () => {
    it('should call apiService.post with the correct URL and data', () => {
      // Arrange
      const mockData = { certificateId: 'cert-123' };
      const expectedUrl = '/api/certreg/v2/certs/validate';
      const mockResponse = { responseCode: 'OK' };
      
      (apiServiceMock.post as jest.Mock).mockReturnValue(of(mockResponse));
      
      // Act
      let result: any;
      service.validateCertificate(mockData).subscribe(response => {
        result = response;
      });
      
      // Assert
      expect(apiServiceMock.post).toHaveBeenCalledWith(expectedUrl, mockData);
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('downloadCertificate', () => {
    it('should call apiService.get with the correct URL', () => {
      // Arrange
      const certId = 'cert-123';
      const expectedUrl = `/api/certreg/v2/certs/download/${certId}`;
      const mockResponse = { 
        responseCode: 'OK',
        result: {
          printUri: 'data:image/svg+xml'
        }
      };
      
      (apiServiceMock.get as jest.Mock).mockReturnValue(of(mockResponse));
      
      // Act
      let result: any;
      service.downloadCertificate(certId).subscribe(response => {
        result = response;
      });
      
      // Assert
      expect(apiServiceMock.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('downloadCertificate_v2', () => {
    it('should call apiService.get with the correct URL', () => {
      // Arrange
      const certId = 'cert-123';
      const expectedUrl = `apis/protected/v8/cohorts/course/batch/cert/download/${certId}`;
      const mockResponse = { 
        responseCode: 'OK',
        result: {
          printUri: 'data:image/svg+xml'
        }
      };
      
      (apiServiceMock.get as jest.Mock).mockReturnValue(of(mockResponse));
      
      // Act
      let result: any;
      service.downloadCertificate_v2(certId).subscribe(response => {
        result = response;
      });
      
      // Assert
      expect(apiServiceMock.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('searchCertificate', () => {
    it('should call apiService.post with the correct URL and search parameters', () => {
      // Arrange
      const recipientId = 'user-123';
      const expectedUrl = '/api/certreg/v1/certs/search';
      const expectedData = {
        request: {
          _source: ['data.badge.issuer.name', 'pdfUrl', 'data.issuedOn', 'data.badge.name'],
          query: {
            bool: {
              must: [{
                match_phrase: { 'recipient.id': recipientId },
              }],
            },
          },
          size: 50,
        },
      };
      
      const mockResponse = { 
        responseCode: 'OK',
        result: {
          response: []
        }
      };
      
      (apiServiceMock.post as jest.Mock).mockReturnValue(of(mockResponse));
      
      // Act
      let result: any;
      service.searchCertificate(recipientId).subscribe(response => {
        result = response;
      });
      
      // Assert
      expect(apiServiceMock.post).toHaveBeenCalledWith(expectedUrl, expectedData);
      expect(result).toEqual(mockResponse);
    });
  });
});