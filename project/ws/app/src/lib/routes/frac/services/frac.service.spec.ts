import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { FracService } from './frac.service'

describe('FracService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FracService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: FracService = TestBed.inject(FracService)
    expect(service).toBeTruthy()
  })
})
