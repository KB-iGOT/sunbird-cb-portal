import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'

import { ChannelService } from './channel.service'

describe('ChannelService', () => {
  let service: ChannelService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(ChannelService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should request content analytics for the channel and type', () => {
    const response = { total: 3 }
    service.getContentAnalyticsClient('ch-1', 'views').subscribe(data => {
      expect(data).toEqual(response)
    })
    const req = httpMock.expectOne('/LA1/api/la/contentanalytics?content_id=ch-1&type=views')
    expect(req.request.method).toBe('GET')
    req.flush(response)
  })
})
