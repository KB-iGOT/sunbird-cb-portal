import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { RecommendedResolveService } from './recommended-resolve.service'

describe('RecommendedResolveService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      RecommendedResolveService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: RecommendedResolveService = TestBed.inject(RecommendedResolveService)
    expect(service).toBeTruthy()
  })
})
