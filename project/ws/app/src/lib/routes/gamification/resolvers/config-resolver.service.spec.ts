import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ConfigResolverService } from './config-resolver.service'

describe('ConfigurationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ConfigResolverService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: ConfigResolverService = TestBed.inject(ConfigResolverService)
    expect(service).toBeTruthy()
  })
})
