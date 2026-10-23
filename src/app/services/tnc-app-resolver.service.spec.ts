import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { TncAppResolverService } from './tnc-app-resolver.service'

describe('TncAppResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TncAppResolverService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: TncAppResolverService = TestBed.inject(TncAppResolverService)
    expect(service).toBeTruthy()
  })
})
