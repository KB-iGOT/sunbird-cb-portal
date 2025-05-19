// welcome-user-resolver.service.spec.ts
import { WelcomeUserResolverService } from './welcome-user-resolver.service';
import { of, throwError } from 'rxjs';

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn().mockImplementation((obj, path) => {
    // Simple path resolver for testing
    const parts = path.split('.');
    let result = obj;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return undefined;
      }
    }
    return result;
  })
}));

describe('WelcomeUserResolverService', () => {
  let service: WelcomeUserResolverService;
  let httpBackendMock: any;
  let httpClientSpy: any;
  
  beforeEach(() => {
    // Create a spy object for the HttpClient with the get method
    httpClientSpy = {
      get: jest.fn()
    };
    
    // Create a spy for HttpBackend that allows us to create an HttpClient
    httpBackendMock = {};
    
    // Mock the HttpClient constructor by creating a spy on it
    // and having it return our httpClientSpy
    
    // Create a service instance but replace its httpClient with our spy
    service = new WelcomeUserResolverService(httpBackendMock);
    // Replace the service's httpClient with our spy
    (service as any).httpClient = httpClientSpy;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('getPublicDetails', () => {
    it('should call the correct API endpoint', () => {
      // Setup mock response
      const mockResponse = {
        result: {
          response: {
            firstName: 'Test',
            lastName: 'User'
          }
        }
      };
      
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call method
      service.getPublicDetails().subscribe();
      
      // Verify API endpoint
      expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/proxies/v8/user/basicInfo');
    });
    
   
  });
  
  describe('resolve', () => {
    it('should return data wrapped in IResolveResponse on success', (done) => {
      // Setup mock response
      const mockUserData = {
        firstName: 'Test',
        lastName: 'User'
      };
      
      // Spy on getPublicDetails to control its return value
      jest.spyOn(service, 'getPublicDetails').mockReturnValue(of(mockUserData));
      
      // Call resolve method
      service.resolve().subscribe(result => {
        expect(result).toEqual({
          data: mockUserData,
          error: null
        });
        done();
      });
    });
    
    it('should return error wrapped in IResolveResponse on failure', (done) => {
      // Setup error response
      const mockError = new Error('API error');
      
      // Spy on getPublicDetails to control its return value
      jest.spyOn(service, 'getPublicDetails').mockReturnValue(throwError(mockError));
      
      // Call resolve method
      service.resolve().subscribe(result => {
        expect(result).toEqual({
          data: null,
          error: mockError
        });
        done();
      });
    });
  });
});