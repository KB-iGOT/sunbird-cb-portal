import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ConfigResolverService } from './config-resolver.service'

describe('ConfigResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ConfigResolverService,
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ConfigResolverService = TestBed.inject(ConfigResolverService)
    expect(service).toBeTruthy()
  })
})
