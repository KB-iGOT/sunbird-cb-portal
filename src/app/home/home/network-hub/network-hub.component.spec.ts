import { NetworkHubComponent } from './network-hub.component';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

// Mock services
const mockConfigService = {
  userProfile: {
    userId: 'user-123',
    departmentName: 'Engineering'
  }
};

const mockHomePageService = {
  getNetworkRecommendations: jest.fn(),
  getRecentRequests: jest.fn(),
  updateConnection: jest.fn(),
  connectToNetwork: jest.fn()
};

const mockMatSnackBar = {
  open: jest.fn()
};

const mockTranslateService = {
  setDefaultLang: jest.fn(),
  use: jest.fn(),
  instant: jest.fn().mockImplementation(key => key)
};

const mockEventService = {
  raiseInteractTelemetry: jest.fn()
};

describe('NetworkHubComponent', () => {
  let component: NetworkHubComponent;
  let mockLocalStorage: any;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('en')
    };
    global.localStorage = mockLocalStorage;

    // Reset mocks
    jest.clearAllMocks();

    // Create component instance with mocked dependencies
    component = new NetworkHubComponent(
      mockConfigService as any,
      mockHomePageService as any,
      mockMatSnackBar as any,
      mockTranslateService as any,
      mockEventService as any
    );

    // Setup default network config
    component.networkConfig = {
      networkSuggestions: { active: true },
      recentRequests: { active: true }
    };
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize language from localStorage', () => {
    component.ngOnInit();
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should initialize userInfo and fetch data on init', () => {
    // Spy on the fetch methods
    const fetchNetworkSpy = jest.spyOn(component, 'fetchNetworkRecommendations');
    const fetchRequestsSpy = jest.spyOn(component, 'fetchRecentRequests');

    component.ngOnInit();

    expect(component.userInfo).toEqual(mockConfigService.userProfile);
    expect(fetchNetworkSpy).toHaveBeenCalled();
    expect(fetchRequestsSpy).toHaveBeenCalled();
  });

  it('should only fetch network recommendations if active', () => {
    const fetchNetworkSpy = jest.spyOn(component, 'fetchNetworkRecommendations');
    component.networkConfig.networkSuggestions.active = false;
    component.ngOnInit();
    expect(fetchNetworkSpy).not.toHaveBeenCalled();
  });

  it('should only fetch recent requests if active', () => {
    const fetchRequestsSpy = jest.spyOn(component, 'fetchRecentRequests');
    component.networkConfig.recentRequests.active = false;
    component.ngOnInit();
    expect(fetchRequestsSpy).not.toHaveBeenCalled();
  });

  it('should translate hub name correctly', () => {
    const hubName = 'testHub';
    component.translateHub(hubName);
    expect(mockTranslateService.instant).toHaveBeenCalledWith(hubName);
  });

  describe('fetchNetworkRecommendations', () => {
    const mockResponse = {
      result: {
        data: [{
          results: [{
            userId: 'user-456',
            personalDetails: {
              firstname: 'John Doe'
            },
            employmentDetails: {
              departmentName: 'Engineering'
            }
          }]
        }]
      }
    };

    it('should fetch network recommendations successfully', () => {
      mockHomePageService.getNetworkRecommendations.mockReturnValue(of(mockResponse));
      component.userInfo = mockConfigService.userProfile;
      
      component.fetchNetworkRecommendations();
      
      expect(component.network.suggestionsLoader).toBeFalsy();
      expect(component.network.networkRecommended.length).toBe(1);
      expect(component.network.networkRecommended[0].fullName).toBeDefined();
      expect(component.network.networkRecommended[0].connecting).toBeFalsy();
    });

    it('should handle error when fetching network recommendations', () => {
      const errorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      mockHomePageService.getNetworkRecommendations.mockReturnValue(throwError(errorResponse));
      
      component.fetchNetworkRecommendations();
      
      expect(component.network.suggestionsLoader).toBeFalsy();
    });
  });

  describe('fetchRecentRequests', () => {
    const mockRecentRequests = {
      result: {
        data: [{
          userId: 'user-789',
          fullName: 'jane',
        }]
      }
    };

    it('should fetch recent requests successfully', () => {
      mockHomePageService.getRecentRequests.mockReturnValue(of(mockRecentRequests));
      
      component.fetchRecentRequests();
      
      expect(component.recentRequests.loadSkeleton).toBeFalsy();
      expect(component.recentRequests.data).toBeDefined();
      // expect(component.recentRequests.data[0].fullName).toBe('Jane');
      // expect(component.recentRequests.data[0].connecting).toBeFalsy();
    });

    it('should handle error when fetching recent requests', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      mockHomePageService.getRecentRequests.mockReturnValue(throwError(errorResponse));
      
      component.fetchRecentRequests();
      
      expect(component.recentRequests.loadSkeleton).toBeFalsy();
    });
  });

  describe('handleUpdateRequest', () => {
    const mockEvent = {
      action: 'Approved',
      payload: { id: 'req-123' },
      reqObject: { connecting: true }
    };

    it('should handle successful approval', () => {
      mockHomePageService.updateConnection.mockReturnValue(of({}));
      const fetchSpy = jest.spyOn(component, 'fetchRecentRequests');
      
      component.handleUpdateRequest(mockEvent);
      
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Request accepted successfully');
      expect(mockEvent.reqObject.connecting).toBeFalsy();
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should handle successful rejection', () => {
      const rejectEvent = { ...mockEvent, action: 'Rejected' };
      mockHomePageService.updateConnection.mockReturnValue(of({}));
      
      component.handleUpdateRequest(rejectEvent);
      
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Rejected the request');
    });

    it('should handle error when updating connection', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      mockHomePageService.updateConnection.mockReturnValue(throwError(errorResponse));
      
      component.handleUpdateRequest(mockEvent);
      
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to update connection, due to some error!');
      expect(mockEvent.reqObject.connecting).toBeFalsy();
    });
  });

  describe('handleConnect', () => {
    const mockObj = {
      userId: 'user-456',
      connecting: false,
      employmentDetails: {
        departmentName: 'Product'
      }
    };

    it('should connect to network successfully', () => {
      mockHomePageService.connectToNetwork.mockReturnValue(of({}));
      const fetchSpy = jest.spyOn(component, 'fetchNetworkRecommendations');
      const telemetrySpy = jest.spyOn(component as any, 'raiseTelemetryEvent');
      
      component.userInfo = mockConfigService.userProfile;
      component.handleConnect(mockObj);
      
      expect(mockObj.connecting).toBeFalsy();
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Connection request sent successfully!');
      expect(fetchSpy).toHaveBeenCalled();
      expect(telemetrySpy).toHaveBeenCalledWith('card-content');
    });

    it('should handle error when connecting to network', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      mockHomePageService.connectToNetwork.mockReturnValue(throwError(errorResponse));
      
      component.userInfo = mockConfigService.userProfile;
      component.handleConnect(mockObj);
      
      expect(mockObj.connecting).toBeTruthy();
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to connect due to some error!');
    });
  });

  describe('handleShowAll', () => {
    it('should raise telemetry event', () => {
      const telemetrySpy = jest.spyOn(component as any, 'raiseTelemetryEvent');
      
      component.handleShowAll();
      
      expect(telemetrySpy).toHaveBeenCalledWith('show-all');
    });
  });

  describe('createInitials', () => {
    it('should create initials from first and last name', () => {
      const result = component.createInitials('John Smith');
      expect(result).toBe('JS');
    });

    it('should create initials from single name', () => {
      const result = component.createInitials('John');
      expect(result).toBe('JO');
    });

    it('should handle empty string', () => {
      const result = component.createInitials('');
      expect(result).toBe('');
    });
  });

  describe('raiseTelemetryEvent', () => {
    it('should call event service with correct parameters', () => {
      const id = 'test-id';
      (component as any).raiseTelemetryEvent(id);
      
      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          id,
          type: 'CLICK',
          subType: 'SUGGESTED_CONNECTIONS'
        },
        {},
        {
          module: 'HOME'
        }
      );
    });
  });
});