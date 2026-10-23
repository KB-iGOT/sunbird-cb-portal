import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnFollowService } from './btn-follow.service'

describe('BtnFollowService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BtnFollowService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: EventService, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: BtnFollowService = TestBed.inject(BtnFollowService)
    expect(service).toBeTruthy()
  })
})
