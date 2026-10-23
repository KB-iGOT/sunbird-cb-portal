import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { autoMock } from 'src/testing/auto-mock'

import { LearningAnalyticsService } from './learning-analytics.service'

describe('LearningAnalyticsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      LearningAnalyticsService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: LearningAnalyticsService = TestBed.inject(LearningAnalyticsService)
    expect(service).toBeTruthy()
  })
})
