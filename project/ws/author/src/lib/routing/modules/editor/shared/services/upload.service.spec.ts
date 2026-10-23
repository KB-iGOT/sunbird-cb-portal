import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { ApiService } from '../../../../../modules/shared/services/api.service'
import { AccessControlService } from '../../../../../modules/shared/services/access-control.service'

import { UploadService } from './upload.service'

describe('UploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UploadService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: ApiService, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: UploadService = TestBed.inject(UploadService)
    expect(service).toBeTruthy()
  })
})
