import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { ApiService } from '@ws/author'
import { of } from 'rxjs'

import { CertificateService } from './certificate.service'

describe('CertificateService', () => {
  let service: CertificateService
  const apiServiceMock = {
    post: jest.fn().mockReturnValue(of({})),
    get: jest.fn().mockReturnValue(of({})),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: ConfigurationsService, useValue: {} },
      ],
    })
    service = TestBed.inject(CertificateService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call validateCertificate API', () => {
    const params = { request: { certId: '123456', accessCode: 'QWERTY', verifySignature: 'true' } }
    service.validateCertificate(params)
    expect(apiServiceMock.post).toHaveBeenCalledWith('/api/certreg/v2/certs/validate', params)
  })

  it('should call validateMileStoneCertificate API', () => {
    const params = { request: { certId: '123456' } }
    service.validateMileStoneCertificate(params)
    expect(apiServiceMock.post).toHaveBeenCalledWith('/api/certreg/v2/achievement/validate', params)
  })

  it('should call download certificate APIs', () => {
    service.downloadCertificate('c1')
    expect(apiServiceMock.get).toHaveBeenCalledWith('/api/certreg/v2/certs/download/c1')
    service.downloadCertificate_v2('c2')
    expect(apiServiceMock.get).toHaveBeenCalledWith('apis/protected/v8/cohorts/course/batch/cert/download/c2')
  })

  it('should call searchCertificate API with the recipient id', () => {
    service.searchCertificate('u1')
    expect(apiServiceMock.post).toHaveBeenCalledWith('/api/certreg/v1/certs/search', expect.objectContaining({
      request: expect.objectContaining({
        query: { bool: { must: [{ match_phrase: { 'recipient.id': 'u1' } }] } },
        size: 50,
      }),
    }))
  })
})
