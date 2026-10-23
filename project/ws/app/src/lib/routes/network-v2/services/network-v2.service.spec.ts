import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { NetworkV2Service } from './network-v2.service'

describe('NetworkV2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NetworkV2Service,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: NetworkV2Service = TestBed.inject(NetworkV2Service)
    expect(service).toBeTruthy()
  })
})
