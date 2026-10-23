import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { KarmaProgramDataService } from './karma-program-data.service'

describe('KarmaProgramDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      KarmaProgramDataService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: KarmaProgramDataService = TestBed.inject(KarmaProgramDataService)
    expect(service).toBeTruthy()
  })
})
