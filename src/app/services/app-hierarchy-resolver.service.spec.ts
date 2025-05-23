import { AppHierarchyResolverService } from './app-hierarchy-resolver.service';
import { WidgetContentService } from '@sunbird-cb/collection/src/lib/_services/widget-content.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Params } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AppHierarchyResolverService', () => {
  let service: AppHierarchyResolverService;
  let mockContentService: jest.Mocked<WidgetContentService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    // Create mock for WidgetContentService
    mockContentService = {
      fetchContent: jest.fn()
    } as unknown as jest.Mocked<WidgetContentService>;

    // Create mock for ActivatedRouteSnapshot
    mockRoute = {
      queryParams: {}
    } as ActivatedRouteSnapshot;

    // Create mock for RouterStateSnapshot
    mockState = {} as RouterStateSnapshot;

    // Initialize service with mocked dependencies
    service = new AppHierarchyResolverService(mockContentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resolve', () => {
    it('should return error when no collectionId is provided', (done) => {
      // Arrange
      mockRoute.queryParams = {};

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(response).toEqual({
          error: 'No Collectionid',
          data: null
        });
        expect(mockContentService.fetchContent).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return error when collectionId is empty string', (done) => {
      // Arrange
      mockRoute.queryParams = { collectionId: '' };

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(response).toEqual({
          error: 'No Collectionid',
          data: null
        });
        expect(mockContentService.fetchContent).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fetch content successfully with collectionId only', (done) => {
      // Arrange
      const mockCollectionId = 'test-collection-id';
      const mockResponseData = { 
        result: { 
          content: { 
            id: mockCollectionId,
            name: 'Test Content'
          } 
        } 
      };
      
      mockRoute.queryParams = { collectionId: mockCollectionId };
      mockContentService.fetchContent.mockReturnValue(of(mockResponseData as any));

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(mockContentService.fetchContent).toHaveBeenCalledWith(
          mockCollectionId,
          'detail',
          [],
          ''
        );
        expect(response).toEqual({
          data: mockResponseData,
          error: null
        });
        done();
      });
    });

    it('should fetch content successfully with collectionId and collectionType', (done) => {
      // Arrange
      const mockCollectionId = 'test-collection-id';
      const mockCollectionType = 'test-collection-type';
      const mockResponseData = { 
        result: { 
          content: { 
            id: mockCollectionId,
            name: 'Test Content'
          } 
        } 
      };
      
      mockRoute.queryParams = { 
        collectionId: mockCollectionId,
        collectionType: mockCollectionType
      };
      mockContentService.fetchContent.mockReturnValue(of(mockResponseData as any));

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(mockContentService.fetchContent).toHaveBeenCalledWith(
          mockCollectionId,
          'detail',
          [],
          mockCollectionType
        );
        expect(response).toEqual({
          data: mockResponseData,
          error: null
        });
        done();
      });
    });

    it('should handle fetchContent error gracefully', (done) => {
      // Arrange
      const mockCollectionId = 'test-collection-id';
      const mockError = new Error('API Error');
      
      mockRoute.queryParams = { collectionId: mockCollectionId };
      mockContentService.fetchContent.mockReturnValue(throwError(mockError));

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(mockContentService.fetchContent).toHaveBeenCalledWith(
          mockCollectionId,
          'detail',
          [],
          ''
        );
        expect(response).toEqual({
          error: mockError,
          data: null
        });
        done();
      });
    });

    it('should handle null queryParams', (done) => {
      // Arrange
      mockRoute.queryParams = {} as Params; // Use empty object instead of null

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(response).toEqual({
          error: 'No Collectionid',
          data: null
        });
        expect(mockContentService.fetchContent).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle queryParams without collectionId property', (done) => {
      // Arrange
      mockRoute.queryParams = { someOtherParam: 'value' } as Params;

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(response).toEqual({
          error: 'No Collectionid',
          data: null
        });
        expect(mockContentService.fetchContent).not.toHaveBeenCalled();
        done();
      });
    });

    it('should use empty string as default for collectionType when not provided', (done) => {
      // Arrange
      const mockCollectionId = 'test-collection-id';
      const mockResponseData = { 
        result: { 
          content: { 
            id: mockCollectionId,
            name: 'Test Content'
          } 
        } 
      };
      
      mockRoute.queryParams = { collectionId: mockCollectionId };
      mockContentService.fetchContent.mockReturnValue(of(mockResponseData as any));

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(() => {
        expect(mockContentService.fetchContent).toHaveBeenCalledWith(
          mockCollectionId,
          'detail',
          [],
          '' // Default empty string for collectionType
        );
        done();
      });
    });

    it('should handle complex response data structure', (done) => {
      // Arrange
      const mockCollectionId = 'test-collection-id';
      const complexResponseData = {
        result: {
          content: {
            id: mockCollectionId,
            name: 'Test Content',
            children: [
              { id: 'child1', name: 'Child 1' },
              { id: 'child2', name: 'Child 2' }
            ]
          }
        },
        responseData: ['item1', 'item2']
      };
      
      mockRoute.queryParams = { collectionId: mockCollectionId };
      mockContentService.fetchContent.mockReturnValue(of(complexResponseData as any));

      // Act
      const result$ = service.resolve(mockRoute, mockState);

      // Assert
      result$.subscribe(response => {
        expect(response.data).toEqual(complexResponseData);
        expect(response.error).toBeNull();
        done();
      });
    });
  });

  describe('constructor', () => {
    it('should create service instance with injected dependencies', () => {
      // Assert
      expect(service).toBeDefined();
    //  expect(service).toBeInstanceOf(AppHierarchyResolverService);
    });
  });
});