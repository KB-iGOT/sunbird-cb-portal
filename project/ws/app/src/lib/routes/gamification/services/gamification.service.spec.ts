import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { GamificationService } from './gamification.service'

describe('GamificationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      GamificationService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: GamificationService = TestBed.inject(GamificationService)
    expect(service).toBeTruthy()
  })
})
