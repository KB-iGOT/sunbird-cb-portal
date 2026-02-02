import { TestBed } from '@angular/core/testing'

import { InitService } from '@ws/app'

describe('InitService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: InitService = TestBed.inject(InitService)
    expect(service).toBeTruthy()
  })
})
