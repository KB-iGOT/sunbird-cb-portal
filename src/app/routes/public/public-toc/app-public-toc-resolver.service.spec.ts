import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AppPublicTocResolverService } from './app-public-toc-resolver.service'; // Update the import path as per your project structure
import { WidgetContentService } from '@sunbird-cb/collection/src/lib/_services/widget-content.service';


// Mock the dependencies
jest.mock('@sunbird-cb/collection');

describe('AppPublicTocResolverService', () => {
  let service: AppPublicTocResolverService;
  let mockContentSvc: jest.Mocked<WidgetContentService>;
  let mockRoute: Partial<ActivatedRouteSnapshot>;
  let mockState: Partial<RouterStateSnapshot>;

  const ADDITIONAL_FIELDS_IN_CONTENT = [
    'averageRating',
    'body',
    'creatorContacts',
    'creatorDetails',
    'curatedTags',
    'contentType',
    'collections',
    'hasTranslations',
    'expiryDate',
    'exclusiveContent',
    'introductoryVideo',
    'introductoryVideoIcon',
    'isInIntranet',
    'isTranslationOf',
    'keywords',
    'learningMode',
    'license',
    'playgroundResources',
    'price',
    'registrationInstructions',
    'region',
    'registrationUrl',
    'resourceType',
    'subTitle',
    'softwareRequirements',
    'studyMaterials',
    'systemRequirements',
    'totalRating',
    'uniqueLearners',
    'viewCount',
    'labels',
    'sourceUrl',
    'sourceName',
    'sourceShortName',
    'sourceIconUrl',
    'locale',
    'hasAssessment',
    'preContents',
    'postContents',
    'kArtifacts',
    'equivalentCertifications',
    'certificationList',
    'posterImage',
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock for ContentService
    mockContentSvc = {
      fetchContent: jest.fn(),
    } as unknown as jest.Mocked<WidgetContentService>;

    // Setup mock for ActivatedRouteSnapshot
    mockRoute = {
      paramMap: {
        get: jest.fn(),
        has: jest.fn(),
        getAll:jest.fn(),
        keys:[]
      },
    };

    // Setup mock for RouterStateSnapshot
    mockState = {} as RouterStateSnapshot;

    // Create service instance with mocked dependencies
    service = new AppPublicTocResolverService(mockContentSvc);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resolve', () => {
    it('should return error object when contentId is not provided', (done) => {
      // Arrange
      jest.spyOn(mockRoute.paramMap!, 'get').mockReturnValue(null);

      // Act
      const result = service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot);

      // Assert
      result.subscribe(response => {
        expect(response).toEqual({ error: 'NO_ID', data: null });
        done();
      });
    });

    it('should fetch content and return data when contentId is provided', (done) => {
      // Arrange
      const contentId = 'test-content-id';
      const mockContent:any = {
        result: {
          content: {
            identifier: contentId,
            name: 'Test Content',
            description: 'Test Description',
          }
        }
      };
      const expectedResult = {
        identifier: contentId,
        name: 'Test Content',
        description: 'Test Description',
      };

      jest.spyOn(mockRoute.paramMap!, 'get').mockReturnValue(contentId);
      mockContentSvc.fetchContent.mockReturnValue(of(mockContent));

      // Act
      const result = service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot);

      // Assert
      result.subscribe(response => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith(
          contentId, 
          'detail', 
          ADDITIONAL_FIELDS_IN_CONTENT, 
          ''
        );
        expect(response).toEqual({ error: null, data: expectedResult });
        done();
      });
    });

    it('should return error when fetchContent throws an error', (done) => {
      // Arrange
      const contentId = 'test-content-id';
      const mockError = new Error('Fetch content error');

      jest.spyOn(mockRoute.paramMap!, 'get').mockReturnValue(contentId);
      mockContentSvc.fetchContent.mockReturnValue(throwError(mockError));

      // Act
      const result = service.resolve(mockRoute as ActivatedRouteSnapshot, mockState as RouterStateSnapshot);

      // Assert
      result.subscribe(response => {
        expect(mockContentSvc.fetchContent).toHaveBeenCalledWith(
          contentId, 
          'detail', 
          ADDITIONAL_FIELDS_IN_CONTENT, 
          ''
        );
        expect(response).toEqual({ error: mockError, data: null });
        done();
      });
    });
  });
});
