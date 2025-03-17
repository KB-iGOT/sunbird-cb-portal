import { Subject, of, throwError } from 'rxjs';
import { CompetencyCardDetailsComponent } from './competency-card-details.component';
import { HttpErrorResponse } from '@angular/common/http';

describe('CompetencyCardDetailsComponent', () => {
  let component: CompetencyCardDetailsComponent;
  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockCpService: any;
  let mockTranslate: any;
  let mockLangTranslations: any;
  let mockEvents: any;
  let mockDialog: any;
  let mockConfigSvc: any;
  let mockQueryList: any;
  let mockSubject: Subject<any>;

  beforeEach(() => {
    mockSubject = new Subject();
    
    mockActivatedRoute = {
      queryParams: mockSubject
    };
    
    mockRouter = {
      navigateByUrl: jest.fn()
    };
    
    mockCpService = {
      fetchCertificate: jest.fn()
    };
    
    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    };
    
    mockLangTranslations = {
      languageSelectedObservable: {
        subscribe: jest.fn(callback => {
          callback();
          return { unsubscribe: jest.fn() };
        })
      }
    };
    
    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    };
    
    mockDialog = {
      open: jest.fn()
    };
    
    mockConfigSvc = {
      compentency: {
        competencyVersion: {}
      }
    };

    mockQueryList = {
      forEach: jest.fn()
    };

    // Mock local storage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        })
      };
    })();
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'innerWidth', { value: 1024 });

    // Mock Element functions
    // const mockNativeElement = {
    //   getBoundingClientRect: jest.fn().mockReturnValue({ height: 50 })
    // };

    // Set up the mock details page data
    const mockDetailsData = {
      issuedCertificates: [
        { 
          courseName: 'test course', 
          identifier: 'cert123', 
          lastIssuedOn: '2023-01-01',
          contentId: 'content123',
          batchId: 'batch123'
        }
      ]
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDetailsData));

    // Set up environment
    jest.mock('src/environments/environment', () => ({
      environment: {
        compentencyVersionKey: 'competencyVersion',
        contentHost: 'https://example.com'
      }
    }));

    // Create component instance
    component = new CompetencyCardDetailsComponent(
      mockActivatedRoute,
      mockRouter,
      mockCpService,
      mockTranslate,
      mockLangTranslations,
      mockEvents,
      mockDialog,
      mockConfigSvc
    );

    // Mock ViewChildren
    component.courseNameDiv = mockQueryList as any;
    
    // Mock window.open
    global.open = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct data from localStorage', () => {
    expect(component.detailsData).toBeDefined();
    expect(component.certificateData.length).toBe(1);
    expect(component.certificateData[0].courseName).toBe('Test course'); // First letter capitalized
  });

  it('should handle ngAfterViewInit', () => {
    // Mock the QueryList forEach implementation
    // component.courseNameDiv.forEach.mockImplementation((callback) => {
    //   callback({ nativeElement: { getBoundingClientRect: () => ({ height: 50 }) } }, 0);
    // });
    
    component.ngAfterViewInit();
    
    expect(component.detailsData.issuedCertificates[0].courseEllipsis).toBe(true);
  });

  it('should handle getCertificateSVG download for existing printURI', () => {
    const mockObj = { printURI: 'test-uri', loading: false };
    const spy = jest.spyOn(component, 'handleDownloadCertificatePDF').mockImplementation();
    
    component.getCertificateSVG(mockObj, 'DOWNLOAD');
    
    expect(spy).toHaveBeenCalledWith('test-uri');
    expect(mockObj.loading).toBe(false);
  });

  it('should handle getCertificateSVG share for existing printURI', () => {
    const mockObj = { printURI: 'test-uri', loading: false, identifier: 'cert123' };
    const spy = jest.spyOn(component, 'shareCertificate').mockImplementation();
    
    component.getCertificateSVG(mockObj, 'SHARE');
    
    expect(spy).toHaveBeenCalledWith('cert123');
    expect(mockObj.loading).toBe(false);
  });

  it('should handle getCertificateSVG for new certificate', () => {
    const mockObj = { identifier: 'cert123', loading: false };
    const mockResponse = { result: { printUri: 'test-uri' } };
    
    mockCpService.fetchCertificate.mockReturnValue(of(mockResponse));
    
    component.getCertificateSVG(mockObj);
    
    expect(mockCpService.fetchCertificate).toHaveBeenCalledWith('cert123');
    // expect(mockObj.printURI).toBe('test-uri');
    expect(mockObj.loading).toBe(false);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should handle getCertificateSVG error', () => {
    const mockObj = { identifier: 'cert123', loading: false };
    const mockError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    
    mockCpService.fetchCertificate.mockReturnValue(throwError(mockError));
    
    component.getCertificateSVG(mockObj);
    
    expect(mockCpService.fetchCertificate).toHaveBeenCalledWith('cert123');
    expect(mockObj.loading).toBe(false);
    // expect(mockObj.error).toBe('Failed to fetch Certificate');
  });

  it('should navigate to course overview', () => {
    const mockCourseObj = { contentId: 'content123', batchId: 'batch123' };
    
    component.handleNavigate(mockCourseObj);
    
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/toc/content123/overview?batchId=batch123');
  });

  it('should handle view more toggle', () => {
    const mockObj = { viewMore: false };
    
    component.handleViewMore(mockObj);
    expect(mockObj.viewMore).toBe(true);
    
    component.handleViewMore(mockObj, 'flag');
    expect(mockObj.viewMore).toBe(false);
  });

  it('should share certificate', () => {
    const spy = jest.spyOn(component, 'raiseShareIntreactTelemetry');
    jest.spyOn(window, 'open').mockReturnValue(null as any);
    
    component.shareCertificate('cert123');
    
    expect(spy).toHaveBeenCalledWith('cert123', 'share');
    expect(window.open).toHaveBeenCalled();
  });

  it('should raise share interaction telemetry', () => {
    component.raiseShareIntreactTelemetry('cert123', 'share', 'action');
    
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: 'CLICK',
        id: 'share-CERTIFICATE',
        subType: 'action',
      },
      {
        id: 'cert123',
        type: 'CERTIFICATE',
      }
    );
  });

  it('should unsubscribe on destroy', () => {
    const spy = jest.spyOn(component['destroySubject$'], 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(spy).toHaveBeenCalled();
  });
});