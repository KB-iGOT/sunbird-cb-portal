import { TestBed } from '@angular/core/testing'

import { FormExtService } from '@ws/app'

describe('FormExtService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: FormExtService = TestBed.inject(FormExtService)
    expect(service).toBeTruthy()
  })
})
