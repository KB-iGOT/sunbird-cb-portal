import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'
import { ApiService } from '../modules/shared/services/api.service'
import { AccessControlService } from '../modules/shared/services/access-control.service'

import { ContentTOCResolver } from './content-resolve.service'

describe('ContentTOCResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentTOCResolver,
      { provide: Router, useValue: autoMock() },
      { provide: ApiService, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentTOCResolver = TestBed.inject(ContentTOCResolver)
    expect(service).toBeTruthy()
  })
})
