import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { KarmaProgramsFormV2Service } from './karma-programs-form-v2.service.'

describe('KarmaProgramsFormV2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      KarmaProgramsFormV2Service,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: KarmaProgramsFormV2Service = TestBed.inject(KarmaProgramsFormV2Service)
    expect(service).toBeTruthy()
  })
})
