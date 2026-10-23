import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { NationalLearningConfigService } from './national-learning-config.service'

describe('NationalLearningConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NationalLearningConfigService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: NationalLearningConfigService = TestBed.inject(NationalLearningConfigService)
    expect(service).toBeTruthy()
  })
})
