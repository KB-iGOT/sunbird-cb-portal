import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { MdoChannelDataService } from './mdo-channel-data.service'

describe('MdoChannelDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MdoChannelDataService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: MdoChannelDataService = TestBed.inject(MdoChannelDataService)
    expect(service).toBeTruthy()
  })
})
