import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ProviderFormResolverService } from './provider-form-resolver.service'

describe('ProviderFormResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ProviderFormResolverService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: ProviderFormResolverService = TestBed.inject(ProviderFormResolverService)
    expect(service).toBeTruthy()
  })
})
