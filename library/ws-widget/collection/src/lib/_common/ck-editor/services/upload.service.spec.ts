import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { ApiService } from '../services/api.service'
import { AccessControlService } from './access-control.service'

import { UploadService } from './upload.service'

describe('UploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UploadService,
      { provide: ApiService, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: UploadService = TestBed.inject(UploadService)
    expect(service).toBeTruthy()
  })
})
