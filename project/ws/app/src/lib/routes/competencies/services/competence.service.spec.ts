import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { CompetenceService } from './competence.service'

describe('CompetenceServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CompetenceService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: CompetenceService = TestBed.inject(CompetenceService)
    expect(service).toBeTruthy()
  })
})
