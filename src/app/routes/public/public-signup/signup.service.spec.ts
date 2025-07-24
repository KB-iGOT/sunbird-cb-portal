// signup.service.optimized.spec.ts
import { SignupService } from './signup.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

// Mock lodash with a more efficient implementation
jest.mock('lodash', () => {
  // Create a simpler implementation
  const lodashMock = {
    get: (obj: any, path: string, defaultValue: any) => {
      if (!obj || typeof path !== 'string') return defaultValue;
      const segments = path.split('.');
      let result = obj;
      
      for (const segment of segments) {
        if (result === null || result === undefined || typeof result !== 'object') {
          return defaultValue;
        }
        result = result[segment];
      }
      
      return result !== undefined ? result : defaultValue;
    },
    
  };
  
  return lodashMock;
});

describe('SignupService', () => {
  let service: SignupService;
  let httpMock: any;
  
  // Utility function to create response objects
  const mockResponse = (data: any) => of(data);
  
  beforeEach(() => {
    // Create a simple mock for HttpClient with spy functions
    httpMock = {
      get: jest.fn().mockImplementation(() => {
        // You could add conditional responses based on URL if needed
        return mockResponse({ result: { success: true, data: [] } });
      }),
      post: jest.fn().mockImplementation((_url) => {
        return mockResponse({ result: { success: true, data: [] } });
      })
    };
    
    // Create service with the mock
    service = new SignupService(httpMock as HttpClient);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  // Grouping basic HTTP request tests together for better organization
  describe('Basic HTTP Methods', () => {
    it('should make correct API calls for registration and related functions', () => {
      // Test registration
      const regPayload = { username: 'testuser', email: 'test@example.com' };
      service.register(regPayload);
      expect(httpMock.post).toHaveBeenCalledWith('/api/user/registration/v1/register', regPayload);
      
      // Test positions and groups
      service.getPositions();
      expect(httpMock.get).toHaveBeenCalledWith('/api/user/v1/positions');
      
      service.getGroups();
      expect(httpMock.get).toHaveBeenCalledWith('/api/user/v1/groups');
    });
    
    it('should make correct API calls for hierarchical data', () => {
      // Test state/ministry -> department -> org hierarchy APIs
      service.getStatesOrMinisteries('state');
      expect(httpMock.get).toHaveBeenCalledWith('/apis/public/v8/org/v1/list/state');
      
      service.getDeparmentsOfState('state-123');
      expect(httpMock.get).toHaveBeenCalledWith('/apis/public/v8/org/v1/list/state-123');
      
      service.getOrgsOfDepartment('dept-123');
      expect(httpMock.get).toHaveBeenCalledWith('/apis/public/v8/org/v1/list/dept-123');
    });
    
    it('should make correct API calls for organization search', () => {
      // Test org search functions
      service.searchOrgs('Test Org', 'state');
      expect(httpMock.post).toHaveBeenCalledWith(
        '/api/org/ext/v2/signup/search',
        {
          request: {
            filters: {
              orgName: 'Test Org',
              parentType: 'state',
            },
            limit: 500,
          },
        }
      );
      
      const searchByIdPayload = { request: { filters: { identifier: ['org-123'] } } };
      service.searchOrgsByIdentifier(searchByIdPayload);
      expect(httpMock.post).toHaveBeenCalledWith('/api/org/ext/v2/signup/search', searchByIdPayload);
    });
  });
  
  // Grouping OTP-related methods
  describe('OTP Methods', () => {
    const otpValue = 'test@example.com';
    const otpType = 'email';
    const expectedOtpPayload = {
      request: {
        type: 'email',
        key: 'test@example.com',
      },
    };
    
    it('should handle OTP generation correctly', () => {
      // Test both OTP versions
      service.sendOtp(otpValue, otpType);
      expect(httpMock.post).toHaveBeenCalledWith('/api/otp/ext/v1/generate', expectedOtpPayload);
      
      service.sendOtpV2(otpValue, otpType);
      expect(httpMock.post).toHaveBeenCalledWith('/api/otp/v1/generate', expectedOtpPayload);
    });
    
    it('should handle OTP resend correctly', () => {
      // Test both resend versions
      service.resendOtp(otpValue, otpType);
      expect(httpMock.post).toHaveBeenCalledWith('/api/otp/ext/v1/generate', expectedOtpPayload);
      
      service.resendOtpv2(otpValue, otpType);
      expect(httpMock.post).toHaveBeenCalledWith('/api/otp/v1/generate', expectedOtpPayload);
    });
    
    it('should handle OTP verification correctly', () => {
      const otpCode = 123456;
      const expectedVerifyPayload = {
        request: {
          otp: otpCode,
          type: 'email',
          key: 'test@example.com',
        },
      };
      
      service.verifyOTP(otpCode, otpValue, otpType);
      expect(httpMock.post).toHaveBeenCalledWith('/api/otp/v1/verify', expectedVerifyPayload);
    });
  });
  
  // Testing the BehaviorSubject-based state management
  describe('State Management', () => {
    it('should update signup data and notify subscribers', (done) => {
      const testState = { name: 'Test User', email: 'test@example.com' };
      
      // Subscribe to the observable
      service.updateSignupDataObservable.subscribe(state => {
        if (state === testState) {
          // Only complete the test when we get the updated state
          // This avoids false positives from the initial empty state
          expect(state).toEqual(testState);
          done();
        }
      });
      
      // Update the state
      service.updateSignUpData(testState);
    });
  });
  
  // Testing data transformation methods with more complex mocks
  describe('Data Transformation', () => {
    it('should transform organization data', () => {
      // Setup a realistic response
      const orgResponse = {
        result: {
          response: {
            id: 'org-123',
            name: 'Test Organization',
            type: 'state',
          }
        }
      };
      
      // Configure mock to return this specific response
      httpMock.post.mockReturnValueOnce(of(orgResponse));
      
      // Call and verify
      service.getOrgReadData('org-123').subscribe(data => {
        expect(data).toEqual(orgResponse.result.response);
      });
      
      expect(httpMock.post).toHaveBeenCalledWith(
        '/api/org/v1/read',
        {
          request: {
            organisationId: 'org-123',
          },
        }
      );
    });
    
    it('should format framework data correctly', () => {
      // Clear any previous data
      service.list = new Map();
      
      // Create mock framework response
      const frameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'category1',
                identifier: 'cat-1',
                index: 1,
                name: 'Category 1',
                status: 'active',
                description: 'Test Category',
                translations: { hi: 'श्रेणी 1' },
                category: 'board',
                terms: [
                  {
                    code: 'term1',
                    name: 'Term 1',
                    associations: [],
                    additionalProperties: {
                      importedById: 'user-1',
                      importedByName: 'User 1',
                      importedOn: '2023-05-01'
                    }
                  }
                ]
              }
            ]
          }
        }
      };
      
      // Spy on formateChildren to verify it's called
      const formatChildrenSpy = jest.spyOn(service, 'formateChildren');
      
      // Call the method
      service.formateData(frameworkResponse);
      
      // Verify expectations
      expect(formatChildrenSpy).toHaveBeenCalledWith(frameworkResponse.result.framework.categories[0].terms);
      expect(service.list.size).toBe(1);
      expect(service.list.has('category1')).toBe(true);
      
      // Verify the structure of the formatted data
      const categoryData = service.list.get('category1');
      expect(categoryData.code).toBe('category1');
      expect(categoryData.name).toBe('Category 1');
      expect(categoryData.children).toBeDefined();
    });
    
    it('should format term associations recursively', () => {
      // Test nested associations
      const nestedTerms = [
        {
          code: 'parent',
          name: 'Parent Term',
          associations: [
            {
              code: 'child',
              name: 'Child Term',
              associations: [
                {
                  code: 'grandchild',
                  name: 'Grandchild Term',
                  associations: []
                }
              ]
            }
          ],
          additionalProperties: {
            importedById: 'user-1',
            importedByName: 'User 1',
            importedOn: '2023-05-01'
          }
        }
      ];
      
      // Use recursion spy to verify recursive calls
      const recursionSpy = jest.spyOn(service, 'formateChildren');
      
      const result = service.formateChildren(nestedTerms);
      
      // Verify first level formatting
      expect(result.length).toBe(1);
      expect(result[0].code).toBe('parent');
      expect(result[0].children).toBeDefined();
      expect(result[0].children.length).toBe(1);
      expect(result[0].importedByName).toBe('User 1');
      
      // Verify recursion behavior
      expect(recursionSpy).toHaveBeenCalledWith(nestedTerms);
      expect(recursionSpy).toHaveBeenCalledWith(nestedTerms[0].associations);
      expect(recursionSpy).toHaveBeenCalledWith(nestedTerms[0].associations[0].associations);
    });
  });
  
  // Test proper API integration with realistic responses
  describe('API Integration', () => {
    it('should correctly integrate with framework API', () => {
      // Mock framework API response
      const mockFrameworkResponse = {
        result: {
          framework: {
            identifier: 'fw1',
            name: 'Test Framework',
            categories: []
          }
        }
      };
      
      // Configure mock to return this response
      httpMock.get.mockReturnValueOnce(of(mockFrameworkResponse));
      
      // Spy on formateData
      const formatDataSpy = jest.spyOn(service, 'formateData');
      
      // Call and verify
      service.getFrameworkInfo('test-framework').subscribe(response => {
        expect(response).toEqual(mockFrameworkResponse);
      });
      
      expect(httpMock.get).toHaveBeenCalledWith(
        '/api/framework/v1/read/test-framework',
        { withCredentials: true }
      );
      
      expect(formatDataSpy).toHaveBeenCalledWith(mockFrameworkResponse);
    });
    
    it('should verify registration link status', () => {
      const statusRequest = {
        request: {
          registrationId: 'reg-123'
        }
      };
      
      const mockStatusResponse = {
        result: {
          isActive: true,
          expiry: '2023-12-31'
        }
      };
      
      // Configure mock response
      httpMock.post.mockReturnValueOnce(of(mockStatusResponse));
      
      // Call and verify
      service.getRegistrationLinkStatus(statusRequest).subscribe(response => {
        expect(response).toEqual(mockStatusResponse);
      });
      
      expect(httpMock.post).toHaveBeenCalledWith(
        '/api/customselfregistration/isregistrationqractive',
        statusRequest
      );
    });
  });
});