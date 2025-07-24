import { CertificateDetailsComponent } from './certificate-details.component';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { ApiService } from '@ws/author/src/public-api';
import { CertificateService } from '../../services/certificate.service';
import * as _ from 'lodash';
import moment from 'moment';

describe('CertificateDetailsComponent', () => {
  let component: CertificateDetailsComponent;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockCertificateService: Partial<CertificateService>;
  let mockConfigService: Partial<ConfigurationsService>;
  let mockApiService: Partial<ApiService>;
  let mockDomSanitizer: Partial<DomSanitizer>;
  let mockRouter: Partial<Router>;
  
  beforeEach(() => {
    // Mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        params: { uuid: 'test-uuid' },
        data: { telemetry: { env: 'test-env', type: 'test-type', pageid: 'test-pageid' } },
        queryParams: {}
      } as any
    };
    
    // Mock CertificateService
    mockCertificateService = {
      validateCertificate: jest.fn()
    };
    
    // Mock ConfigService
    mockConfigService = {
      rootOrg: 'karmyogi',
      // instanceConfig: {
      //   logos: {
      //     appTransparent: 'test-logo-url'
      //   }
      // }
    };
    
    // Mock ApiService
    mockApiService = {
      get: jest.fn()
    };
    
    // Mock DomSanitizer
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('sanitized-url')
    };
    
    // Mock Router
    mockRouter = {
      navigate: jest.fn(),
      url: '/test-url'
    };
    
    // Create component instance
    component = new CertificateDetailsComponent(
      mockActivatedRoute as ActivatedRoute,
      mockCertificateService as CertificateService,
      mockConfigService as ConfigurationsService,
      mockDomSanitizer as DomSanitizer,
      mockApiService as ApiService,
      mockRouter as Router
    );
    
    // Setup element ref for code input field
    component.codeInputField = {
      nativeElement: {
        value: '',
        focus: jest.fn()
      }
    } as any;
  });
  
  it('should initialize correctly', () => {
    component.ngOnInit();
    
    expect(component.instance).toBe('KARMYOGI');
    expect(component.appIcon).toBe('sanitized-url');
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('test-logo-url');
  });
  
  describe('certificateVerify', () => {
    it('should set view certificate to true and populate certificate data on successful validation', () => {
      // Arrange
      const mockCertResponse = {
        result: {
          response: {
            json: {
              recipient: { name: 'Test User' },
              badge: { name: 'Test Course' },
              issuedOn: '2023-05-15T00:00:00Z'
            }
          }
        }
      };
      
      (mockCertificateService.validateCertificate as jest.Mock).mockReturnValue(of(mockCertResponse));
      component.certificateCode = '123456';
      
      // Act
      component.certificateVerify();
      
      // Assert
      expect(mockCertificateService.validateCertificate).toHaveBeenCalledWith({
        request: {
          certId: 'test-uuid',
          accessCode: '123456',
          verifySignature: true
        }
      });
      
      expect(component.loader).toBeFalsy();
      expect(component.viewCertificate).toBeTruthy();
      expect(component.recipient).toBe('Test User');
      expect(component.courseName).toBe('Test Course');
      expect(component.issuedOn).toBe(moment(new Date('2023-05-15T00:00:00Z')).format('DD MMM YYYY'));
    });
    
    it('should handle validation error correctly', () => {
      // Arrange
      (mockCertificateService.validateCertificate as jest.Mock).mockReturnValue(throwError('error'));
      component.certificateCode = '123456';
      
      // Act
      component.certificateVerify();
      
      // Assert
      expect(component.wrongCertificateCode).toBeTruthy();
      expect(component.loader).toBeFalsy();
      expect(component.codeInputField.nativeElement.value).toBe('');
      expect(component.codeInputField.nativeElement.focus).toHaveBeenCalled();
      expect(component.enableVerifyButton).toBeFalsy();
    });
  });
  
  describe('getCodeLength', () => {
    it('should enable verify button when code length is 6', () => {
      // Arrange
      const mockEvent = { target: { value: '123456' } };
      
      // Act
      component.getCodeLength(mockEvent);
      
      // Assert
      expect(component.enableVerifyButton).toBeTruthy();
      expect(component.wrongCertificateCode).toBeFalsy();
    });
    
    it('should disable verify button when code length is not 6', () => {
      // Arrange
      const mockEvent = { target: { value: '12345' } };
      
      // Act
      component.getCodeLength(mockEvent);
      
      // Assert
      expect(component.enableVerifyButton).toBeFalsy();
    });
  });
  
  describe('navigateToCoursesPage', () => {
    it('should change window location for android client', () => {
      // Arrange
      //const originalWindow = { ...window };
      const windowSpy = jest.spyOn(global, 'window', 'get');
      
      // windowSpy.mockImplementation(() => ({
      //   ...originalWindow,
      //   location: {
      //     ...originalWindow.location,
      //     href: ''
      //   }
      // }));
      
      mockActivatedRoute.snapshot!.queryParams = { clientId: 'android' };
      
      // Act
      component.navigateToCoursesPage();
      
      // Assert
      expect(window.location.href).toBe('/page/learn');
      
      // Cleanup
      windowSpy.mockRestore();
    });
    
    it('should navigate using router for non-android clients', () => {
      // Act
      component.navigateToCoursesPage();
      
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/learn']);
    });
  });
  
  describe('getCourseVideoUrl', () => {
    it('should extract content ID from video URL', () => {
      // Arrange
      const mockHierarchyResponse = {
        result: {
          content: {
            certVideoUrl: 'https://example.com/do_12345/video'
          }
        }
      };
      
      (mockApiService.get as jest.Mock).mockReturnValue(of(mockHierarchyResponse));
      
      // Act
      component.getCourseVideoUrl('course-123');
      
      // Assert
      expect(mockApiService.get).toHaveBeenCalledWith(
        `${component.urls.HIERARCHY}/course-123`, 
        undefined
      );
      
      expect(component.watchVideoLink).toBe('https://example.com/do_12345/video');
      expect(component.contentId).toBe('do_12345');
    });
    
    it('should handle errors when getting course hierarchy', () => {
      // Arrange
      (mockApiService.get as jest.Mock).mockReturnValue(throwError('error'));
      
      // Act
      component.getCourseVideoUrl('course-123');
      
      // Assert
      expect(mockApiService.get).toHaveBeenCalled();
      // No error should be thrown, the method handles it silently
    });
    
    it('should handle cases where video URL is not present', () => {
      // Arrange
      const mockHierarchyResponse = {
        result: {
          content: {}
        }
      };
      
      (mockApiService.get as jest.Mock).mockReturnValue(of(mockHierarchyResponse));
      
      // Act
      component.getCourseVideoUrl('course-123');
      
      // Assert
      expect(component.watchVideoLink).toBeUndefined();
      expect(component.contentId).toBeUndefined();
    });
  });
  
  describe('getCollectionHierarchy', () => {
    it('should get collection data and return response', (done) => {
      // Arrange
      const mockResponse = {
        result: {
          content: { id: 'test-content' }
        }
      };
      
      (mockApiService.get as jest.Mock).mockReturnValue(of(mockResponse));
      
      // Act
      component.getCollectionHierarchy('test-id').subscribe(response => {
        // Assert
        expect(response).toEqual(mockResponse);
        expect(component.collectionData).toEqual({ id: 'test-content' });
        done();
      });
      
      // Assert
      expect(mockApiService.get).toHaveBeenCalledWith(
        `${component.urls.HIERARCHY}/test-id`, 
        undefined
      );
    });
  });
});