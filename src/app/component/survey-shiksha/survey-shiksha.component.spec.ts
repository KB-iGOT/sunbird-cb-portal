import { SurveyShikshaComponent } from './survey-shiksha.component';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

// Mock environment
jest.mock('src/environments/environment', () => ({
  environment: {
    azureHost: 'https://example-azure.com'
  }
}));

describe('SurveyShikshaComponent', () => {
  let component: SurveyShikshaComponent;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;
  let mockDomSanitizer: jest.Mocked<DomSanitizer>;
  
  beforeEach(() => {
    // Create mock for ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn()
        }
      }
    } as unknown as jest.Mocked<ActivatedRoute>;

    // Create mock for DomSanitizer
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn()
    } as unknown as jest.Mocked<DomSanitizer>;

    // Initialize component with mocks
    component = new SurveyShikshaComponent(
      mockActivatedRoute,
      mockDomSanitizer
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct hostUrl from environment', () => {
    expect(component.hostUrl).toBe('https://example-azure.com');
  });

  it('should get solutionId from route params and set iframeUrl during ngOnInit', () => {
    // Arrange
    const mockSolutionId = 'mock-solution-123';
    
    const expectedUrl = 'https://example-azure.com/mligot/mlsurvey/mock-solution-123';
    const mockSanitizedUrl = 'sanitized-url' as any;
    mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue(mockSanitizedUrl);

    // Act
    component.ngOnInit();

    // Assert
    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(component.solutionId).toBe(mockSolutionId);
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(expectedUrl);
    expect(component.iframeUrl).toBe(mockSanitizedUrl);
  });

  it('should handle null or undefined solutionId', () => {
    // Arrange
    
    const expectedUrl = 'https://example-azure.com/mligot/mlsurvey/null';
    const mockSanitizedUrl = 'sanitized-url' as any;
    mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue(mockSanitizedUrl);

    // Act
    component.ngOnInit();

    // Assert
    expect(component.solutionId).toBeNull();
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(expectedUrl);
    expect(component.iframeUrl).toBe(mockSanitizedUrl);
  });

  it('should construct the iframe URL correctly with all parts', () => {
    // Arrange
    const mockSolutionId = 'abc123';
    
    // Spy on the sanitizer method
    const spy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl');

    // Act
    component.ngOnInit();

    // Assert
    // Check that URL was constructed with correct format
   
    expect(spy).toHaveBeenCalledWith(`${environment.azureHost}/mligot/mlsurvey/${mockSolutionId}`);
  });
});