import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { AnalyticsService } from './analytics.service'

describe('AnalyticsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: AnalyticsService = TestBed.inject(AnalyticsService)
    expect(service).toBeTruthy()
  })
})
