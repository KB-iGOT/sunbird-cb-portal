import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { TncPublicResolverService } from './tnc-public-resolver.service'

describe('TncPublicResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TncPublicResolverService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: TncPublicResolverService = TestBed.inject(TncPublicResolverService)
    expect(service).toBeTruthy()
  })
})
