
import { HttpClient } from '@angular/common/http';
import { FormExtService } from '../../services/form-ext.service';
import { of, throwError } from 'rxjs';
import { NSSearch } from '@sunbird-cb/collection/src/lib/_services/widget-search.model';
import { MicrositeService } from './microsites.service';

// Mock dependencies
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn()
};

const mockFormExtService = {
  homeFormReadData: jest.fn()
};

describe('MicrositeService', () => {
  let service: MicrositeService;
  let httpClient: jest.Mocked<HttpClient>;
  let formExtService: jest.Mocked<FormExtService>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create service instance with mocked dependencies
    httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>;
    formExtService = mockFormExtService as unknown as jest.Mocked<FormExtService>;
    
    service = new MicrositeService(httpClient, formExtService);
  });

  describe('Constructor and Initial State', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service.getSeeAllConfig).toBeNull();
    });

    it('should initialize notifyObservable$', () => {
      expect(service.notifyObservable$).toBeDefined();
    });
  });

  describe('fetchSearchData', () => {
    it('should make POST request to SEARCH_V6 endpoint', () => {
      const mockRequest = { query: 'test query' };
      const mockResponse = { result: { content: [] } };
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.fetchSearchData(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        mockRequest
      );
      expect(httpClient.post).toHaveBeenCalledTimes(1);
    });

    it('should handle HTTP errors for fetchSearchData', () => {
      const mockRequest = { query: 'test query' };
      const mockError = new Error('HTTP Error');
      
      httpClient.post.mockReturnValue(throwError(mockError));

      service.fetchSearchData(mockRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBe(mockError);
        }
      });
    });
  });

  describe('trendingContentSearch', () => {
    it('should make POST request to TRENDING_CONTENT_SEARCH endpoint', () => {
      const mockRequest = { query: 'trending query' };
      const mockResponse = { result: { content: [] } };
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.trendingContentSearch(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/trending/content/search',
        mockRequest
      );
    });

    it('should set empty query if not provided', () => {
      const mockRequest:any = {};
      const mockResponse = { result: { content: [] } };
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.trendingContentSearch(mockRequest);

      expect(mockRequest.query).toBe('');
      expect(httpClient.post).toHaveBeenCalledWith(
        'apis/proxies/v8/trending/content/search',
        mockRequest
      );
    });

    it('should preserve existing query if provided', () => {
      const mockRequest = { query: 'existing query' };
      const mockResponse = { result: { content: [] } };
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.trendingContentSearch(mockRequest);

      expect(mockRequest.query).toBe('existing query');
    });
  });

  describe('notifyOther', () => {
    it('should emit data through removeFilter subject when data is provided', (done) => {
      const testData = { filter: 'test' };

      service.notifyObservable$.subscribe(data => {
        expect(data).toEqual(testData);
        done();
      });

      service.notifyOther(testData);
    });

    it('should not emit when data is null', () => {
      const spy = jest.fn();
      service.notifyObservable$.subscribe(spy);

      service.notifyOther(null);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit when data is undefined', () => {
      const spy = jest.fn();
      service.notifyObservable$.subscribe(spy);

      service.notifyOther(undefined);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit when data is falsy', () => {
      const spy = jest.fn();
      service.notifyObservable$.subscribe(spy);

      service.notifyOther('');
      service.notifyOther(0);
      service.notifyOther(false);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('getSeeAllConfigJson', () => {
    const expectedRequestData = {
      'request': {
        'type': 'page',
        'subType': 'home',
        'action': 'page-configuration',
        'component': 'portal',
        'rootOrgId': '*',
      },
    };

    it('should fetch config when getSeeAllConfig is null', async () => {
      const mockConfigResponse = { config: 'test config' };
      formExtService.homeFormReadData.mockReturnValue(of(mockConfigResponse));

      const result = await service.getSeeAllConfigJson();

      expect(formExtService.homeFormReadData).toHaveBeenCalledWith(expectedRequestData);
      expect(service.getSeeAllConfig).toEqual(mockConfigResponse);
      expect(result).toEqual(mockConfigResponse);
    });

    it('should return cached config when getSeeAllConfig is already set', async () => {
      const cachedConfig = { config: 'cached config' };
      service.getSeeAllConfig = cachedConfig;

      const result = await service.getSeeAllConfigJson();

      expect(formExtService.homeFormReadData).not.toHaveBeenCalled();
      expect(result).toEqual(cachedConfig);
    });

    it('should handle errors from homeFormReadData', async () => {
      const mockError = new Error('Form service error');
      formExtService.homeFormReadData.mockReturnValue(throwError(mockError));

      try {
        await service.getSeeAllConfigJson();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(mockError);
        expect(formExtService.homeFormReadData).toHaveBeenCalledWith(expectedRequestData);
      }
    });
  });

  describe('searchV6', () => {
    const mockSearchRequest: NSSearch.ISearchV6Request = {
      query: 'test search'
    };

    it('should make GET request when api.path is provided', () => {
      const apiPath = '/custom/search/path';
      const requestWithPath = { ...mockSearchRequest, api: { path: apiPath } };
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = { result: { content: [] } } as any;
      
      httpClient.get.mockReturnValue(of(mockResponse));

      service.searchV6(requestWithPath).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClient.get).toHaveBeenCalledWith(apiPath);
      expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('should make POST request to SEARCH_V6 when api.path is not provided', () => {
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = { result: { content: [] } } as any;
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.searchV6(mockSearchRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        mockSearchRequest
      );
      expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('should set empty query if not provided', () => {
      const requestWithoutQuery = { filters: {} } as NSSearch.ISearchV6Request;
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = { result: { content: [] } } as any;
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.searchV6(requestWithoutQuery);

      expect(requestWithoutQuery.query).toBe('');
    });

    it('should preserve existing query if provided', () => {
      const requestWithQuery = { query: 'existing query', filters: {} } as NSSearch.ISearchV6Request;
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = { result: { content: [] } } as any;
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.searchV6(requestWithQuery);

      expect(requestWithQuery.query).toBe('existing query');
    });

    it('should handle nested api.path using lodash get', () => {
      const requestWithDeepPath = {
        ...mockSearchRequest,
        api: {
          nested: {
            path: '/deep/nested/path'
          }
        }
      };
      const mockResponse: NSSearch.ISearchV6ApiResultV2 = { result: { content: [] } } as any;
      
      httpClient.post.mockReturnValue(of(mockResponse));

      service.searchV6(requestWithDeepPath);

      // Should use POST since _.get(req, 'api.path') returns undefined for nested structure
      expect(httpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/sunbirdigot/search',
        requestWithDeepPath
      );
    });

    it('should handle HTTP errors for searchV6', () => {
      const mockError = new Error('Search error');
      httpClient.post.mockReturnValue(throwError(mockError));

      service.searchV6(mockSearchRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBe(mockError);
        }
      });
    });
  });

  describe('API_END_POINTS', () => {
    it('should use correct endpoints in HTTP calls', () => {
      const mockResponse = of({});
      httpClient.post.mockReturnValue(mockResponse);
      httpClient.get.mockReturnValue(mockResponse);

      // Test SEARCH_V6 endpoint
      service.fetchSearchData({});
      expect(httpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', {});

      // Test TRENDING_CONTENT_SEARCH endpoint
      service.trendingContentSearch({});
      expect(httpClient.post).toHaveBeenCalledWith('apis/proxies/v8/trending/content/search', {});

      // Test searchV6 with SEARCH_V6 endpoint
      service.searchV6({ query: '' } as NSSearch.ISearchV6Request);
      expect(httpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', { query: '' });
    });
  });
});

// Additional integration-like tests
describe('MicrositeService Integration Scenarios', () => {
  let service: MicrositeService;
  let httpClient: jest.Mocked<HttpClient>;
  let formExtService: jest.Mocked<FormExtService>;

  beforeEach(() => {
    jest.clearAllMocks();
    httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>;
    formExtService = mockFormExtService as unknown as jest.Mocked<FormExtService>;
    service = new MicrositeService(httpClient, formExtService);
  });

  it('should handle multiple subscribers to notifyObservable$', (done) => {
    const testData = { action: 'remove', filter: 'category' };
    const subscribers: any[] = [];
    let completedCount = 0;

    // Create multiple subscribers
    for (let i = 0; i < 3; i++) {
      service.notifyObservable$.subscribe(data => {
        subscribers.push(data);
        completedCount++;
        if (completedCount === 3) {
          //expect(subscribers).toHaveLength(3);
          expect(subscribers.every(sub => sub === testData)).toBe(true);
          done();
        }
      });
    }

    service.notifyOther(testData);
  });

  it('should maintain getSeeAllConfig state across multiple calls', async () => {
    const mockConfig = { pageConfig: 'test' };
    formExtService.homeFormReadData.mockReturnValue(of(mockConfig));

    // First call should fetch from service
    const result1 = await service.getSeeAllConfigJson();
    expect(result1).toEqual(mockConfig);
    expect(formExtService.homeFormReadData).toHaveBeenCalledTimes(1);

    // Second call should use cached value
    const result2 = await service.getSeeAllConfigJson();
    expect(result2).toEqual(mockConfig);
    expect(formExtService.homeFormReadData).toHaveBeenCalledTimes(1); // Still only called once
  });
});