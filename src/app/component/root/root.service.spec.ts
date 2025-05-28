import { RootService } from './root.service';
import { HttpClient } from '@angular/common/http';
import {  of } from 'rxjs';

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn()
};

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
});

describe('RootService', () => {
  let service: RootService;
  let httpClientSpy: jest.Mocked<HttpClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create service instance with mocked HttpClient
    httpClientSpy = mockHttpClient as unknown as jest.Mocked<HttpClient>;
    service = new RootService(httpClientSpy);
    
    // Reset document.cookie
    document.cookie = '';
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize showNavbarDisplay$ with true', () => {
    //  expect(service.showNavbarDisplay$).toBeInstanceOf(BehaviorSubject);
      expect(service.showNavbarDisplay$.value).toBe(true);
    });

    it('should have discussionCnfig property', () => {
      expect(service.discussionCnfig).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should call http.post with correct URL and request data', () => {
      const mockRequest = { name: 'John', email: 'john@example.com' };
      const mockResponse = { id: 1, success: true };
      
      httpClientSpy.post.mockReturnValue(of(mockResponse));

      service.createUser(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/discussion/user/v1/create',
        mockRequest
      );
      expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    });

    it('should return observable from http.post', () => {
      const mockRequest = {};
      httpClientSpy.post.mockReturnValue(of({}));

      const result = service.createUser(mockRequest);
      
      expect(result).toBeDefined();
      result.subscribe(); // Ensure it's subscribable
    });
  });

  describe('setDiscussionConfig', () => {
    it('should set discussionCnfig property', () => {
      const mockConfig = { theme: 'dark', language: 'en' };
      
      service.setDiscussionConfig(mockConfig);
      
      expect(service.discussionCnfig).toEqual(mockConfig);
    });

    it('should handle null config', () => {
      service.setDiscussionConfig(null);
      
      expect(service.discussionCnfig).toBeNull();
    });
  });

  describe('getCookie', () => {
    it('should return cookie value when cookie exists', () => {
      document.cookie = 'testCookie=testValue; path=/';
      
      const result = service.getCookie('testCookie');
      
      expect(result).toBe('testValue');
    });

    it('should return empty string when cookie does not exist', () => {
      document.cookie = 'otherCookie=otherValue';
      
      const result = service.getCookie('nonExistentCookie');
      
      expect(result).toBe('');
    });

    it('should handle cookies with spaces', () => {
      document.cookie = ' spacedCookie=spacedValue; anotherCookie=anotherValue';
      
      const result = service.getCookie('spacedCookie');
      
      expect(result).toBe('spacedValue');
    });

    it('should return first matching cookie when multiple cookies exist', () => {
      document.cookie = 'cookie1=value1; cookie2=value2; cookie3=value3';
      
      const result = service.getCookie('cookie2');
      
      expect(result).toBe('value2');
    });

    it('should handle empty cookie string', () => {
      document.cookie = '';
      
      const result = service.getCookie('anyCookie');
      
      expect(result).toBe('');
    });
  });

  describe('setCookie', () => {
    it('should set cookie with name, value, and expiry days', () => {
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      service.setCookie('testCookie', 'testValue', 7);

      expect(document.cookie).toContain('testCookie=testValue');
      expect(document.cookie).toContain('expires=');
    });

    it('should set cookie with path when provided', () => {
      service.setCookie('testCookie', 'testValue', 7, '/test');

      expect(document.cookie).toContain('testCookie=testValue');
      expect(document.cookie).toContain('path=/test');
    });

    it('should set cookie without path when path is empty', () => {
      service.setCookie('testCookie', 'testValue', 7, '');

      expect(document.cookie).toContain('testCookie=testValue');
      expect(document.cookie).not.toContain('path=');
    });

    it('should handle negative expiry days', () => {
      service.setCookie('testCookie', 'testValue', -1);

      expect(document.cookie).toContain('testCookie=testValue');
      expect(document.cookie).toContain('expires=');
    });
  });

  describe('deleteCookie', () => {
    it('should call setCookie with empty value and -1 expiry', () => {
      const setCookieSpy = jest.spyOn(service, 'setCookie');
      
      service.deleteCookie('testCookie');
      
      expect(setCookieSpy).toHaveBeenCalledWith('testCookie', '', -1);
    });
  });

  describe('getChatData', () => {
    it('should call http.post with correct URL and tab type', () => {
      const mockTabType = { type: 'general' };
      const mockResponse = { data: 'chatData' };
      
      httpClientSpy.post.mockReturnValue(of(mockResponse));

      service.getChatData(mockTabType).subscribe((response:any) => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/api/faq/v1/assistant/configs/language',
        mockTabType
      );
      expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    });

    it('should return observable from http.post', () => {
      const mockTabType = {};
      httpClientSpy.post.mockReturnValue(of({}));

      const result = service.getChatData(mockTabType);
      
      expect(result).toBeDefined();
      result.subscribe(); // Ensure it's subscribable
    });
  });

  describe('getLangugages', () => {
    it('should call http.get with correct URL', () => {
      const mockResponse = { languages: ['en', 'es', 'fr'] };
      
      httpClientSpy.get.mockReturnValue(of(mockResponse));

      service.getLangugages().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        '/api/faq/v1/assistant/available/language'
      );
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });

    it('should return observable from http.get', () => {
      httpClientSpy.get.mockReturnValue(of({}));

      const result = service.getLangugages();
      
      expect(result).toBeDefined();
      result.subscribe(); // Ensure it's subscribable
    });
  });

  describe('aiGlobalSearch', () => {
    it('should call http.post with correct URL including query parameters', () => {
      const mockRequestBody = { query: 'test search' };
      const mockChatId = 'chat123';
      const mockUserId = 'user456';
      const mockResponse = { results: [] };
      
      httpClientSpy.post.mockReturnValue(of(mockResponse));

      service.aiGlobalSearch(mockRequestBody, mockChatId, mockUserId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/chatbot/v3/search?chatID=chat123&userID=user456',
        mockRequestBody
      );
      expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    });

    it('should handle different parameter types', () => {
      const mockRequestBody = { query: 'another search' };
      const mockChatId = 999;
      const mockUserId = 'user@email.com';
      
      httpClientSpy.post.mockReturnValue(of({}));

      service.aiGlobalSearch(mockRequestBody, mockChatId, mockUserId);

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/chatbot/v3/search?chatID=999&userID=user@email.com',
        mockRequestBody
      );
    });

    it('should return observable from http.post', () => {
      httpClientSpy.post.mockReturnValue(of({}));

      const result = service.aiGlobalSearch({}, 'chat', 'user');
      
      expect(result).toBeDefined();
      result.subscribe(); // Ensure it's subscribable
    });
  });

  describe('API Endpoints', () => {
    it('should use correct API endpoints', () => {
      // Test createUser endpoint
      httpClientSpy.post.mockReturnValue(of({}));
      service.createUser({});
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/discussion/user/v1/create',
        {}
      );

      // Test getChatData endpoint
      service.getChatData({});
    //   expect(httpClientSpy.post).toHaveBeenLastCalledWith(
    //     '/api/faq/v1/assistant/configs/language',
    //     {}
    //   );

      // Test getLangugages endpoint
      httpClientSpy.get.mockReturnValue(of({}));
      service.getLangugages();
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        '/api/faq/v1/assistant/available/language'
      );

      // Test aiGlobalSearch endpoint
      service.aiGlobalSearch({}, 'chat', 'user');
    //   expect(httpClientSpy.post).toHaveBeenLastCalledWith(
    //     '/apis/proxies/v8/chatbot/v3/search?chatID=chat&userID=user',
    //     {}
    //   );
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors in createUser', () => {
      const errorResponse = new Error('HTTP Error');
      httpClientSpy.post.mockReturnValue(of().pipe(() => {
        throw errorResponse;
      }));

      expect(() => {
        service.createUser({}).subscribe();
      }).toThrow();
    });

    it('should handle HTTP errors in getLangugages', () => {
      const errorResponse = new Error('HTTP Error');
      httpClientSpy.get.mockReturnValue(of().pipe(() => {
        throw errorResponse;
      }));

      expect(() => {
        service.getLangugages().subscribe();
      }).toThrow();
    });
  });
});