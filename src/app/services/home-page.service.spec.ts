// home-page.service.spec.ts
import { HomePageService } from './home-page.service';
import { HttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';

describe('HomePageService', () => {
  let service: HomePageService;
  let httpClientSpy: jest.Mocked<HttpClient>;
  
  beforeEach(() => {
    // Create HttpClient spy
    httpClientSpy = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>;
    
    // Create service with mocked HttpClient
    service = new HomePageService(httpClientSpy);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('getInsightsData', () => {
    it('should make a POST request to the insights endpoint', () => {
      // Test data
      const payload = { userId: 'test-user' };
      const mockResponse = { result: { progress: 75 } };
      
      // Set up spy return value
      httpClientSpy.post.mockReturnValue(of(mockResponse));
      
      // Call service method
      const result = service.getInsightsData(payload);
      
      // Verify HTTP request
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'apis/proxies/v8/read/user/insights',
        payload
      );
      
      // Verify result
      result.subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
    });
  });
  
  describe('geteventsHoursData', () => {
    it('should make a GET request to the event enroll endpoint', () => {
      // Mock response
      const mockResponse = { enrollments: [] };
      
      // Set up spy return value
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.geteventsHoursData().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'apis/proxies/v8/user/events/enroll/summary'
      );
    });
  });
  
  describe('getDiscussionsData', () => {
    it('should make a GET request to the discussions endpoint with username', () => {
      // Test data
      const username = 'test-user';
      const mockResponse = { discussions: [] };
      
      // Set up spy return value
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.getDiscussionsData(username).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'apis/proxies/v8/discussion/user/test-user'
      );
    });
  });
  
  describe('getNetworkRecommendations', () => {
    it('should make a POST request to the network endpoint', () => {
      // Test data
      const payload = { size: 5 };
      const mockResponse = { connections: [] };
      
      // Set up spy return value
      httpClientSpy.post.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.getNetworkRecommendations(payload).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'apis/protected/v8/connections/v2/connections/recommended',
        payload
      );
    });
  });
  
  describe('connectToNetwork', () => {
    it('should make a POST request to add connection endpoint', () => {
      // Test data
      const payload = { connectionId: 'user123' };
      const mockResponse = { success: true };
      
      // Set up spy return value
      httpClientSpy.post.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.connectToNetwork(payload).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'apis/protected/v8/connections/v2/add/connection',
        payload
      );
    });
  });
  
  describe('updateConnection', () => {
    it('should make a POST request to update connection endpoint', () => {
      // Test data
      const payload = { connectionId: 'user123', status: 'ACCEPTED' };
      const mockResponse = { success: true };
      
      // Set up spy return value
      httpClientSpy.post.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.updateConnection(payload).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'apis/protected/v8/connections/v2/update/connection',
        payload
      );
    });
  });
  
  describe('getRecentRequests', () => {
    it('should make a GET request to connection requests endpoint', () => {
      // Mock response
      const mockResponse = { requests: [] };
      
      // Set up spy return value
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.getRecentRequests().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'apis/protected/v8/connections/v2/connections/requests/received'
      );
    });
  });
  
  describe('getTrendingDiscussions', () => {
    it('should make a GET request to trending discussions endpoint', () => {
      // Mock response
      const mockResponse = { trending: [] };
      
      // Set up spy return value
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.getTrendingDiscussions().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'apis/proxies/v8/discussion/popular'
      );
    });
  });
  
  describe('getAssessmentinfo', () => {
    it('should make a GET request to assessment data endpoint', () => {
      // Mock response
      const mockResponse = { assessments: [] };
      
      // Set up spy return value
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.getAssessmentinfo().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'apis/proxies/v8/wheebox/read'
      );
    });
  });
  
  describe('getLearnerLeaderboard', () => {
    it('should make a GET request to leader board endpoint', () => {
      // Mock response
      const mockResponse = { leaderboard: [] };
      
      // Set up spy return value
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.getLearnerLeaderboard().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'apis/proxies/v8/halloffame/learnerleaderboard'
      );
    });
  });
  
  describe('getNwlConfigiration', () => {
    it('should make a GET request to the provided URL with /nlw.json', () => {
      // Test data
      const url = 'https://example.com';
      const mockResponse = { config: {} };
      
      // Set up spy return value
      httpClientSpy.get.mockReturnValue(of(mockResponse));
      
      // Call service method
      service.getNwlConfigiration(url).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verify HTTP request
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'https://example.com/nlw.json'
      );
    });
  });
  
  describe('closeDialogPop Subject', () => {
    it('should have a Subject for closeDialogPop', () => {
      expect(service.closeDialogPop).toBeDefined();
      expect(service.closeDialogPop instanceof Subject).toBeTruthy();
    });
    
    it('should allow subscribers to receive emitted values', (done) => {
      // Subscribe to the subject
      service.closeDialogPop.subscribe(value => {
        expect(value).toBe('test');
        done();
      });
      
      // Emit a value
      service.closeDialogPop.next('test');
    });
  });
});