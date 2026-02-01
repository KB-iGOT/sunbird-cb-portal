import { TestBed } from '@angular/core/testing'

import { TncPublicResolverService } from '@ws/app'

describe('TncPublicResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TncPublicResolverService = TestBed.inject(TncPublicResolverService)
    expect(service).toBeTruthy()
  })
})
