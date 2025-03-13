import { of, throwError } from 'rxjs';

import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppContentResolverService } from './app-content-read-resolver.service';

// Mock the WidgetContentService
const mockWidgetContentService = {
  fetchProgramContent: jest.fn()
};

// Mock the Injectable decorator
jest.mock('@angular/core', () => ({
  Injectable: () => jest.fn()
}));

// Mock the imports from the collection library
jest.mock('@sunbird-cb/collection/src/lib/_services/widget-content.service', () => ({
  WidgetContentService: jest.fn()
}));

describe('AppContentResolverService', () => {
  let service: AppContentResolverService;
  let mockActivatedRouteSnapshot: Partial<ActivatedRouteSnapshot>;
  let mockRouterStateSnapshot: Partial<RouterStateSnapshot>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create the service with the mock
    service = new AppContentResolverService(mockWidgetContentService as any);

    // Create mocks for router related objects
    mockActivatedRouteSnapshot = {
      queryParams: {}
    };
    mockRouterStateSnapshot = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return error when collectionId is not provided', (done) => {
    // Set up route without collectionId
    mockActivatedRouteSnapshot.queryParams = {};

    // Call the resolve method
    service.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    ).subscribe(result => {
      expect(result).toEqual({ error: 'Collection Id not found', data: null });
      done();
    });
  });

  it('should fetch content when collectionId is provided', (done) => {
    // Set up route with collectionId
    mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' };
    
    // Mock the response from content service
    const mockResponse = { data: 'test-data' };
    mockWidgetContentService.fetchProgramContent.mockReturnValue(of(mockResponse));

    // Call the resolve method
    service.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    ).subscribe(result => {
      expect(result).toEqual({ data: mockResponse, error: null });
      expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('test-id');
      done();
    });
  });

  it('should handle error when content fetch fails', (done) => {
    // Set up route with collectionId
    mockActivatedRouteSnapshot.queryParams = { collectionId: 'test-id' };
    
    // Mock an error response
    const mockError = new Error('Fetch failed');
    mockWidgetContentService.fetchProgramContent.mockReturnValue(throwError(mockError));

    // Call the resolve method
    service.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
      mockRouterStateSnapshot as RouterStateSnapshot
    ).subscribe(result => {
      expect(result).toEqual({ error: mockError, data: null });
      expect(mockWidgetContentService.fetchProgramContent).toHaveBeenCalledWith('test-id');
      done();
    });
  });
});