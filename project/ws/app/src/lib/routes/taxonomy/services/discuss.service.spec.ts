import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { TaxonomyService } from './taxonomy.service'

describe('DiscussServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TaxonomyService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: TaxonomyService = TestBed.inject(TaxonomyService)
    expect(service).toBeTruthy()
  })
})
