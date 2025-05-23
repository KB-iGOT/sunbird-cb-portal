jest.mock('moment', () => {
  const mockMoment = {
    format: jest.fn().mockReturnValue('2023-01-01 12:00:00'),
    add: jest.fn().mockReturnThis()
  };
  return jest.fn(() => mockMoment);
});

// Import the service

import { of, throwError } from 'rxjs';
import { NetCoreService } from './netcore.service';

// Mock the global smartech function
global.smartech = jest.fn();

// Add type definition for global smartech
// declare global {
//   var smartech: any;
// }

describe('NetCoreService', () => {
  let service: NetCoreService;
  let httpClientMock: any;
  let configSvcMock: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mocks for dependencies
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn()
    };

    configSvcMock = {
      sitePath: 'http://test-site.com'
    };

    // Create service instance with mocked dependencies
    service = new NetCoreService(httpClientMock, configSvcMock);
  });

  describe('getOrgReadData', () => {
    it('should make a POST request and return the mapped response', () => {
      // Arrange
      const mockResponse = {
        result: {
          response: { id: 'org123', name: 'Test Org' }
        }
      };
      httpClientMock.post.mockReturnValue(of(mockResponse));
      const organisationId = 'org123';

      // Act
      let result: any;
      service.getOrgReadData(organisationId).subscribe(res => {
        result = res;
      });

      // Assert
      expect(httpClientMock.post).toHaveBeenCalledWith('/api/org/v1/read', {
        request: {
          organisationId: 'org123'
        }
      });
      expect(result).toEqual({ id: 'org123', name: 'Test Org' });
    });
  });

  describe('netCoreConfigReadData', () => {
    it('should return form data when formReadData succeeds', () => {
      // Arrange
      const mockFormResponse = {
        result: {
          form: {
            data: { key: 'value' }
          }
        }
      };
      const payload = { data: 'test' };
      
      jest.spyOn(service, 'formReadData').mockReturnValue(of(mockFormResponse));

      // Act
      let result: any;
      service.netCoreConfigReadData(payload).subscribe(res => {
        result = res;
      });

      // Assert
      expect(service.formReadData).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ key: 'value' });
    });

    it('should fetch netcore.json when formReadData fails', () => {
      // Arrange
      const errorResponse = new Error('Form read failed');
      const payload = { data: 'test' };
      const mockJsonResponse = { config: 'jsonData' };
      
      jest.spyOn(service, 'formReadData').mockReturnValue(throwError(errorResponse));
      httpClientMock.get.mockReturnValue(of(mockJsonResponse));

      // Act
      let result: any;
      service.netCoreConfigReadData(payload).subscribe(res => {
        result = res;
      });

      // Assert
      expect(service.formReadData).toHaveBeenCalledWith(payload);
      expect(httpClientMock.get).toHaveBeenCalledWith('http://test-site.com/netcore.json');
      expect(result).toEqual(mockJsonResponse);
    });

    it('should handle error when both formReadData and json fetch fail', () => {
      // Arrange
      const formError = new Error('Form read failed');
      const jsonError = new Error('JSON fetch failed');
      const payload = { data: 'test' };
      
      jest.spyOn(service, 'formReadData').mockReturnValue(throwError(formError));
      httpClientMock.get.mockReturnValue(throwError(jsonError));

      // Act
      let result: any;
      service.netCoreConfigReadData(payload).subscribe(res => {
        result = res;
      });

      // Assert
      expect(result).toEqual({ data: null, error: jsonError });
    });
  });

  describe('formReadData', () => {
    it('should make a POST request with the given payload', () => {
      // Arrange
      const mockResponse = { data: 'test response' };
      httpClientMock.post.mockReturnValue(of(mockResponse));
      const request = { data: 'test request' };

      // Act
      let result: any;
      service.formReadData(request).subscribe(res => {
        result = res;
      });

      // Assert
      expect(httpClientMock.post).toHaveBeenCalledWith('/apis/v1/form/read', request);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('smartech tracking functions', () => {
    it('should call smartech for netCoreUserLoginSetup', () => {
      // Arrange
      const payload = { email: 'test@test.com' };

      // Act
      service.netCoreUserLoginSetup(payload);

      // Assert
      expect(global.smartech).toHaveBeenCalledWith('contact', '', payload);
    });

    it('should call smartech for netCoreUserNameUpdate', () => {
      // Arrange
      const payload = { name: 'Test User' };

      // Act
      service.netCoreUserNameUpdate(payload);

      // Assert
      expect(global.smartech).toHaveBeenCalledWith('contact', '', payload);
    });

    it('should call smartech for netCoreUserProfilePhotoUpdate', () => {
      // Arrange
      const payload = { photo: 'url/to/photo' };

      // Act
      service.netCoreUserProfilePhotoUpdate(payload);

      // Assert
      expect(global.smartech).toHaveBeenCalledWith('contact', '', payload);
    });

    it('should call smartech for netCoreUserProfilepdate', () => {
      // Arrange
      const payload = { profile: 'data' };

      // Act
      service.netCoreUserProfilepdate(payload);

      // Assert
      expect(global.smartech).toHaveBeenCalledWith('contact', '', payload);
    });

    it('should call smartech identify and dispatch for netCoreUserProfileUpdateEvent', () => {
      // Arrange
      const payload = { data: 'test' };
      const eventName = 'profile_update';
      const userIdentifier = 'user123';

      // Act
      service.netCoreUserProfileUpdateEvent(payload, eventName, userIdentifier);

      // Assert
      expect(global.smartech).toHaveBeenCalledWith('identify', userIdentifier);
      expect(global.smartech).toHaveBeenCalledWith('dispatch', eventName, payload);
    });
  });

  // describe('trackEvent', () => {
  //   it('should call smartech with correct payload', () => {
  //     // Act
  //     service.trackEvent('test_event', 'user123');

  //     // Assert
  //     expect(global.smartech).toHaveBeenCalledWith('identify', 'user123');
  //     expect(global.smartech).toHaveBeenCalledWith('dispatch', 'test_event', {
  //       action_time: '2023-01-01 12:00:00',
  //       action_device: 'Desktop'
  //     });
  //   });

  //   it('should include profile attributes in payload when provided', () => {
  //     // Act
  //     service.trackEvent('test_event', 'user123', ['attribute1', 'attribute2']);

  //     // Assert
  //     expect(global.smartech).toHaveBeenCalledWith('identify', 'user123');
  //     expect(global.smartech).toHaveBeenCalledWith('dispatch', 'test_event', {
  //       action_time: '2023-01-01 12:00:00',
  //       action_device: 'Desktop',
  //       profile_attribute_updated: 'attribute1,attribute2'
  //     });
  //   });
  // });

  // describe('trackEventForContentAndEvent', () => {
  //   it('should call smartech with merged payload', () => {
  //     // Arrange
  //     const contentPayload = { 
  //       content_id: 'cont123',
  //       content_type: 'video' 
  //     };

  //     // Act
  //     service.trackEventForContentAndEvent('content_event', 'user123', contentPayload);

  //     // Assert
  //     expect(global.smartech).toHaveBeenCalledWith('identify', 'user123');
  //     expect(global.smartech).toHaveBeenCalledWith('dispatch', 'content_event', {
  //       action_time: '2023-01-01 12:00:00',
  //       action_device: 'Desktop',
  //       content_id: 'cont123',
  //       content_type: 'video'
  //     });
  //   });

  //   it('should handle empty content payload', () => {
  //     // Act
  //     service.trackEventForContentAndEvent('content_event', 'user123', {});

  //     // Assert
  //     expect(global.smartech).toHaveBeenCalledWith('identify', 'user123');
  //     expect(global.smartech).toHaveBeenCalledWith('dispatch', 'content_event', {
  //       action_time: '2023-01-01 12:00:00',
  //       action_device: 'Desktop'
  //     });
  //   });
  // });
});
