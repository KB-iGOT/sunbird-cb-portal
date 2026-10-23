import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { JanKarmayogiService } from './jan-karmayogi.service'

describe('JanKarmayogiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      JanKarmayogiService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: JanKarmayogiService = TestBed.inject(JanKarmayogiService)
    expect(service).toBeTruthy()
  })
})
