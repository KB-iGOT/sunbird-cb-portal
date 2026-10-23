import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ConfigurationsService111 } from './config-resolver.service'

describe('ConfigurationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ConfigurationsService111,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: ConfigurationsService111 = TestBed.inject(ConfigurationsService111)
    expect(service).toBeTruthy()
  })
})
