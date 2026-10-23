import { HttpBackend } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { SignupAutoService } from './signup-auto.service'

describe('SignupAutoService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SignupAutoService,
      { provide: HttpBackend, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: SignupAutoService = TestBed.inject(SignupAutoService)
    expect(service).toBeTruthy()
  })
})
