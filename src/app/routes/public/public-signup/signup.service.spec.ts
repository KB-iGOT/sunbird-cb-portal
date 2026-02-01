import { TestBed } from '@angular/core/testing'

import { SignupService } from '@ws/app'

describe('SignupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SignupService = TestBed.inject(SignupService)
    expect(service).toBeTruthy()
  })
})
