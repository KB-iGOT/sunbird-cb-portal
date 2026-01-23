import { TestBed } from '@angular/core/testing'

import { RestrictedFeaturesResolverService } from './restricted-features-resolver.service'

describe('RestrictedFeaturesResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: RestrictedFeaturesResolverService = TestBed.inject(RestrictedFeaturesResolverService)
    expect(service).toBeTruthy()
  })
})
