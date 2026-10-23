import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { SignupService } from './signup.service'

describe('SignupService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SignupService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: SignupService = TestBed.inject(SignupService)
    expect(service).toBeTruthy()
  })
})
