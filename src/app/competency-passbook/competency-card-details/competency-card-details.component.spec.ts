import { CompetencyCardDetailsComponent } from './competency-card-details.component';
import { Subject, of, throwError } from 'rxjs';
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
  
  beforeEach(() => {
    // Mock localStorage
    const mockLocalStorage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || '',
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
      };
    })();
    
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    
    // Set up mocks
    mockActivatedRoute = {
      queryParams: new Subject()
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
      languageSelectedObservable: new Subject()
    };
    
    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    };
    
    mockDialog = {
      open: jest.fn()
    };
    
    mockConfigSvc = {
      compentency: {
        'key': {}
      }
    };
    
    // Setup test data
    localStorage.setItem('websiteLanguage', 'en');
    localStorage.setItem('details_page', JSON.stringify({
      issuedCertificates: [
        {
          courseName: 'test course',
          identifier: 'cert-123',
          lastIssuedOn: '2023-01-01',
          contentId: 'content-123',
          batchId: 'batch-123'
        }
      ]
    }));

    // Initialize component
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
  });

  it('should initialize with details from localStorage', () => {
    expect(component.detailsData).toBeDefined();
    expect(component.certificateData.length).toBe(1);
    expect(component.certificateData[0].courseName).toBe('Test course'); // Should be capitalized
  });

  it('should handle queryParams subscription', () => {
    const params = { id: '123' };
    mockActivatedRoute.queryParams.next(params);
    expect(component.params).toEqual(params);
  });

  it('should handle language changes', () => {
    mockLangTranslations.languageSelectedObservable.next();
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslate.use).toHaveBeenCalledWith('en');
  });

  describe('getCertificateSVG', () => {
    it('should download certificate when type is DOWNLOAD', () => {
      const spy = jest.spyOn(component, 'handleDownloadCertificatePDF').mockImplementation(() => Promise.resolve());
      const obj = { printURI: 'data:image/svg+xml;base64,abc123', identifier: 'cert-123', loading: false };
      
      component.getCertificateSVG(obj, 'DOWNLOAD');
      
      expect(spy).toHaveBeenCalledWith('data:image/svg+xml;base64,abc123');
      expect(obj.loading).toBe(false);
    });

    it('should share certificate when type is SHARE', () => {
      const spy = jest.spyOn(component, 'shareCertificate').mockImplementation(() => null);
      const obj = { printURI: 'data:image/svg+xml;base64,abc123', identifier: 'cert-123', loading:false };
      
      component.getCertificateSVG(obj, 'SHARE');
      
      expect(spy).toHaveBeenCalledWith('cert-123');
      expect(obj.loading).toBe(false);
    });

    it('should fetch certificate if printURI is not available', () => {
      const obj = { 
        identifier: 'cert-123',
        loading: false,
        printURI: 'data:image/svg+xml;base64,newcert'
      };
      
      mockCpService.fetchCertificate.mockReturnValue(of({ 
        result: { 
          printURI: 'data:image/svg+xml;base64,newcert'
        }
      }));
      
      component.getCertificateSVG(obj);
      
      expect(mockCpService.fetchCertificate).toHaveBeenCalledWith('cert-123');
      expect(obj.printURI).toBe('data:image/svg+xml;base64,newcert');
      expect(obj.loading).toBe(false);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should handle error when fetching certificate', () => {
      const obj = { 
        identifier: 'cert-123',
        loading: false,
        error: 'Failed to fetch Certificate'
      };
      
      const errorResponse = new HttpErrorResponse({
        error: 'test error',
        status: 404,
        statusText: 'Not Found',
      });
      
      mockCpService.fetchCertificate.mockReturnValue(throwError(() => errorResponse));
      
      component.getCertificateSVG(obj);
      
      expect(mockCpService.fetchCertificate).toHaveBeenCalledWith('cert-123');
      expect(obj.loading).toBe(false);
      expect(obj.error).toBe('Failed to fetch Certificate');
    });
  });

  describe('handleNavigate', () => {
    it('should navigate to course page', () => {
      const courseObj = {
        contentId: 'content-123',
        batchId: 'batch-123'
      };
      
      component.handleNavigate(courseObj);
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/toc/content-123/overview?batchId=batch-123');
    });
  });

  describe('handleViewMore', () => {
    it('should toggle viewMore property when flag is not provided', () => {
      const obj = { viewMore: false };
      component.handleViewMore(obj);
      expect(obj.viewMore).toBe(true);
    });

    it('should set viewMore to false when flag is provided', () => {
      const obj = { viewMore: true };
      component.handleViewMore(obj, 'any');
      expect(obj.viewMore).toBe(false);
    });
  });

  describe('shareCertificate', () => {
    it('should raise telemetry event and open window', () => {
      // Mock window.open
      const mockOpen = jest.fn();
    //  global.open = mockOpen;
      
      component.shareCertificate('cert-123');
      
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled();
      expect(mockOpen).toHaveBeenCalled();
    });
  });

  describe('raiseShareIntreactTelemetry', () => {
    it('should call events service with correct parameters', () => {
      component.raiseShareIntreactTelemetry('cert-123', 'testType', 'testAction');
      
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'CLICK',
          id: 'testType-CERTIFICATE',
          subType: 'testAction',
        },
        {
          id: 'cert-123',
          type: 'CERTIFICATE',
        }
      );
    });

    it('should use empty string for action if not provided', () => {
      component.raiseShareIntreactTelemetry('cert-123', 'testType');
      
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          subType: '',
        }),
        expect.any(Object)
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from destroySubject', () => {
      const spy = jest.spyOn(component['destroySubject$'], 'unsubscribe');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });
});