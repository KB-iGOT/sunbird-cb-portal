import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { NationalLearningWeekFormService } from './national-learning-week-form.service'

describe('NationalLearningWeekFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NationalLearningWeekFormService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: NationalLearningWeekFormService = TestBed.inject(NationalLearningWeekFormService)
    expect(service).toBeTruthy()
  })
})
