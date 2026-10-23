import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { ApiService } from '@ws/author'
import { of, throwError } from 'rxjs'

import { CertificateService } from '../../services/certificate.service'
import { CertificateDetailsComponent } from './certificate-details.component'

describe('CertificateDetailsComponent', () => {
  let component: CertificateDetailsComponent
  let fixture: ComponentFixture<CertificateDetailsComponent>
  const certData = {
    result: {
      response: {
        json: { recipient: { name: 'Test User' }, badge: { name: 'Test Course' }, issuedOn: '2020-12-10' },
      },
    },
  }
  const certificateServiceMock = {
    validateCertificate: jest.fn(),
    validateMileStoneCertificate: jest.fn(),
  }
  const apiServiceMock = { get: jest.fn() }
  const routerMock: any = { url: '/public/certs/123', navigate: jest.fn() }
  const activatedRouteMock = { snapshot: { params: { uuid: 'cert-1' }, queryParams: {} as any } }
  const configServiceMock = { rootOrg: 'igot', instanceConfig: { logos: { appTransparent: 'logo.png' } } }

  beforeEach(() => {
    jest.clearAllMocks()
    certificateServiceMock.validateCertificate.mockReturnValue(of(certData))
    certificateServiceMock.validateMileStoneCertificate.mockReturnValue(of(certData))
    routerMock.url = '/public/certs/123'
    activatedRouteMock.snapshot.queryParams = {}
    TestBed.configureTestingModule({
      declarations: [CertificateDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: CertificateService, useValue: certificateServiceMock },
        { provide: ConfigurationsService, useValue: configServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: DomSanitizer, useValue: { bypassSecurityTrustResourceUrl: jest.fn((v: string) => `safe:${v}`) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideTemplate(CertificateDetailsComponent, '')
    fixture = TestBed.createComponent(CertificateDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create and set instance and app icon', () => {
    expect(component).toBeTruthy()
    expect(component.instance).toBe('IGOT')
    expect(component.appIcon).toBe('safe:logo.png')
  })

  it('should enable verify button only for 6 character codes', () => {
    component.getCodeLength({ target: { value: '123456' } })
    expect(component.enableVerifyButton).toBe(true)
    component.getCodeLength({ target: { value: '123' } })
    expect(component.enableVerifyButton).toBe(false)
  })

  it('should validate certificate and set details', () => {
    component.certificateCode = ' ABCDEF '
    component.certificateVerify()
    expect(certificateServiceMock.validateCertificate).toHaveBeenCalledWith({
      request: { certId: 'cert-1', accessCode: 'ABCDEF', verifySignature: true },
    })
    expect(component.loader).toBe(false)
    expect(component.viewCertificate).toBe(true)
    expect(component.recipient).toBe('Test User')
    expect(component.courseName).toBe('Test Course')
    expect(component.issuedOn).toBe('10 Dec 2020')
  })

  it('should validate milestone certificate for achievement urls', () => {
    routerMock.url = '/public/achievements/123'
    component.certificateVerify()
    expect(certificateServiceMock.validateMileStoneCertificate).toHaveBeenCalled()
    expect(certificateServiceMock.validateCertificate).not.toHaveBeenCalled()
  })

  it('should reset input on validation error', () => {
    certificateServiceMock.validateCertificate.mockReturnValue(throwError(() => new Error('error')))
    const focus = jest.fn()
    component.codeInputField = { nativeElement: { value: 'abc', focus } }
    component.certificateVerify()
    expect(component.wrongCertificateCode).toBe(true)
    expect(component.loader).toBe(false)
    expect(component.codeInputField.nativeElement.value).toBe('')
    expect(focus).toHaveBeenCalled()
  })

  it('should navigate to courses page', () => {
    component.navigateToCoursesPage()
    expect(routerMock.navigate).toHaveBeenCalledWith(['/page/learn'])
  })

  it('should fetch collection hierarchy and extract content id', () => {
    apiServiceMock.get.mockReturnValue(of({ result: { content: { certVideoUrl: 'https://x/do_123/abc' } } }))
    component.getCourseVideoUrl('do_1')
    expect(apiServiceMock.get).toHaveBeenCalledWith('course/v1/hierarchy/do_1', {})
    expect(component.watchVideoLink).toBe('https://x/do_123/abc')
    expect(component.contentId).toBe('do_123')
  })
})
