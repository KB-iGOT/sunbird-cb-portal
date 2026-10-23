import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

import { ProfileResolverService } from './profile-resolver.service'

describe('ProfileResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ProfileResolverService,
      { provide: ConfigurationsService, useValue: {} },
    ],
  }))

  it('should be created', () => {
    const service: ProfileResolverService = TestBed.inject(ProfileResolverService)
    expect(service).toBeTruthy()
  })
})
