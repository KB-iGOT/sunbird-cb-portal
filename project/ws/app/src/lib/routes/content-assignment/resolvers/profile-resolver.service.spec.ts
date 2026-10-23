import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ProfileResolverService } from './profile-resolver.service'

describe('ProfileResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ProfileResolverService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: ProfileResolverService = TestBed.inject(ProfileResolverService)
    expect(service).toBeTruthy()
  })
})
