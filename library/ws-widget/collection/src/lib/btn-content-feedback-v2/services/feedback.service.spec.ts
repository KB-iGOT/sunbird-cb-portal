import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { FeedbackService } from './feedback.service'

describe('FeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FeedbackService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: FeedbackService = TestBed.inject(FeedbackService)
    expect(service).toBeTruthy()
  })
})
