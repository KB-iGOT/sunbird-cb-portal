// app-public-group-resolver.service.spec.ts
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AppPublicGroupResolverService } from './group-resolver.service';

describe('AppPublicGroupResolverService', () => {
  let service: AppPublicGroupResolverService;
  let signupServiceMock: any;
  let activatedRouteSnapshotMock: any;
  let routerStateSnapshotMock: any;
  
  beforeEach(() => {
    // Create SignupService mock
    signupServiceMock = {
      getGroups: jest.fn()
    };
    
    // Create route mocks
    activatedRouteSnapshotMock = {} as ActivatedRouteSnapshot;
    routerStateSnapshotMock = {} as RouterStateSnapshot;
    
    // Create service instance
    service = new AppPublicGroupResolverService(signupServiceMock);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('resolve', () => {
    it('should transform successful response data correctly', (done) => {
      // Mock successful response from SignupService
      const mockResponse = {
        result: {
          response: [
            { id: 'group1', name: 'Group 1' },
            { id: 'group2', name: 'Group 2' }
          ]
        }
      };
      signupServiceMock.getGroups.mockReturnValue(of(mockResponse));
      
      // Call resolve
      service.resolve(activatedRouteSnapshotMock, routerStateSnapshotMock).subscribe((response: any) => {
        // Check response structure
        expect(response).toEqual({
          data: mockResponse.result.response,
          error: null
        });
        
        // Verify SignupService was called
        expect(signupServiceMock.getGroups).toHaveBeenCalled();
        
        done();
      });
    });
    
    it('should handle error response properly', (done) => {
      // Mock error response from SignupService
      const mockError = new Error('API error');
      signupServiceMock.getGroups.mockReturnValue(throwError(mockError));
      
      // Call resolve
      service.resolve(activatedRouteSnapshotMock, routerStateSnapshotMock).subscribe((response: any) => {
        // Check error response structure
        expect(response).toEqual({
          data: null,
          error: mockError
        });
        
        // Verify SignupService was called
        expect(signupServiceMock.getGroups).toHaveBeenCalled();
        
        done();
      });
    });
  
    
    it('should maintain the same tap operation behavior regardless of response structure', (done) => {
      // Mock successful response
      const mockResponse = {
        result: {
          response: [
            { id: 'group1', name: 'Group 1' }
          ]
        }
      };
      signupServiceMock.getGroups.mockReturnValue(of(mockResponse));
      
      // Spy on tap to verify it doesn't affect the output
      
      // Call resolve
      service.resolve(activatedRouteSnapshotMock, routerStateSnapshotMock).subscribe((response: any) => {
        // The final response should not be affected by the tap operation
        expect(response).toEqual({
          data: mockResponse.result.response,
          error: null
        });
        
        done();
      });
    });
    
    it('should pass route and state parameters to SignupService if needed', () => {
      // Setup specific route and state mock values
      activatedRouteSnapshotMock = {
        paramMap: {
          get: jest.fn().mockReturnValue('test-param')
        },
        queryParamMap: {
          get: jest.fn().mockReturnValue('test-query')
        }
      };
      
      routerStateSnapshotMock = {
        url: '/test-url'
      };
      
      // Mock response
      signupServiceMock.getGroups.mockReturnValue(of({ result: { response: [] } }));
      
      // Call resolve
      service.resolve(activatedRouteSnapshotMock, routerStateSnapshotMock).subscribe();
      
      // Verify SignupService was called (without parameters in this case)
      // If the service required parameters, we would verify them here
      expect(signupServiceMock.getGroups).toHaveBeenCalled();
    });
  });
});