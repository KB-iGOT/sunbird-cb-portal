import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { FeedbackApiService } from './feedback-api.service'

describe('FeedbackApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FeedbackApiService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: FeedbackApiService = TestBed.inject(FeedbackApiService)
    expect(service).toBeTruthy()
  })
})
