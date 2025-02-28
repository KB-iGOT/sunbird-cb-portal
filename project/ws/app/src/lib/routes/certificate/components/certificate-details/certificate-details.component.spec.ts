import { CertificateDetailsComponent } from './certificate-details.component';
import * as _ from 'lodash';
import { of } from 'rxjs';

describe('CertificateDetailsComponent', () => {
  let component: CertificateDetailsComponent;
  let activatedRouteMock: any;
  let certificateServiceMock: any;
  let configServiceMock: any;
  let apiServiceMock: any;
  let domSanitizerMock: any;
  let routerMock: any;

  beforeEach(() => {
    activatedRouteMock = {
      snapshot: {
        params: { uuid: 'some-uuid' },
        queryParams: { clientId: 'web' },
        data: {
          telemetry: {
            pageid: 'certificate-page',
            type: 'view'
          }
        }
      }
    };

    certificateServiceMock = {
      validateCertificate: jest.fn()
    };

    configServiceMock = {
      rootOrg: 'karmyogi',
      instanceConfig: { logos: { appTransparent: 'some-url' } }
    };

    apiServiceMock = {
      get: jest.fn()
    };

    domSanitizerMock = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url')
    };

    routerMock = {
      navigate: jest.fn()
    };

    component = new CertificateDetailsComponent(
      activatedRouteMock,
      certificateServiceMock,
      configServiceMock,
      domSanitizerMock,
      apiServiceMock,
      routerMock
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct values', () => {
    component.ngOnInit();
    expect(component.appIcon).toBe('safe-url');
    expect(component.instance).toBe('KARMYOGI');
  });

  it('should verify certificate and set details on success', () => {
    const mockResponse = {
      result: {
        response: {
          json: {
            recipient: { name: 'Amit Kumar' },
            badge: { name: 'Course 1' },
            issuedOn: '2020-12-10'
          }
        }
      }
    };
    
    certificateServiceMock.validateCertificate.mockReturnValue(of(mockResponse));

    component.certificateCode = 'valid-code';
    component.certificateVerify();

    expect(certificateServiceMock.validateCertificate).toHaveBeenCalledWith({
      request: {
        certId: 'some-uuid',
        accessCode: 'valid-code',
        verifySignature: true
      }
    });
    
    setTimeout(() => {
      expect(component.loader).toBe(false);
      expect(component.viewCertificate).toBe(true);
      expect(component.recipient).toBe('Amit Kumar');
      expect(component.courseName).toBe('Course 1');
      expect(component.issuedOn).toBe('10 Dec 2020');
    });
  });

  it('should handle certificate verification failure', () => {
    certificateServiceMock.validateCertificate.mockReturnValue(of(null));

    component.certificateCode = 'invalid-code';
    component.certificateVerify();

    expect(certificateServiceMock.validateCertificate).toHaveBeenCalledWith({
      request: {
        certId: 'some-uuid',
        accessCode: 'invalid-code',
        verifySignature: true
      }
    });

    setTimeout(() => {
      expect(component.wrongCertificateCode).toBe(true);
      expect(component.loader).toBe(false);
      expect(component.codeInputField.nativeElement.value).toBe('');
      expect(component.enableVerifyButton).toBe(false);
    });
  });

  it('should enable the verify button when code length is 6', () => {
    const eventMock = { target: { value: '123456' } };
    component.getCodeLength(eventMock);
    expect(component.enableVerifyButton).toBe(true);
  });

  it('should disable the verify button when code length is not 6', () => {
    const eventMock = { target: { value: '123' } };
    component.getCodeLength(eventMock);
    expect(component.enableVerifyButton).toBe(false);
  });

  it('should navigate to courses page for mobile clients', () => {
    activatedRouteMock.snapshot.queryParams.clientId = 'android';
    component.navigateToCoursesPage();
    expect(window.location.href).toBe('/page/learn');
  });

  it('should navigate to courses page for non-mobile clients', () => {
    activatedRouteMock.snapshot.queryParams.clientId = 'web';
    component.navigateToCoursesPage();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/page/learn']);
  });

  it('should retrieve course video url', () => {
    const mockCourseId = 'course-id';
    const mockResponse = { result: { content: { certVideoUrl: 'http://video-url' } } };
    apiServiceMock.get.mockReturnValue(of(mockResponse));

    component.getCourseVideoUrl(mockCourseId);

    setTimeout(() => {
      expect(component.watchVideoLink).toBe('http://video-url');
      expect(component.contentId).toBe('do_course-id');
    });
  });

  it('should handle error while retrieving course video url', () => {
    const mockCourseId = 'course-id';
    apiServiceMock.get.mockReturnValue(of(null));

    component.getCourseVideoUrl(mockCourseId);

    setTimeout(() => {
      expect(component.watchVideoLink).toBe(undefined);
    });
  });
});
