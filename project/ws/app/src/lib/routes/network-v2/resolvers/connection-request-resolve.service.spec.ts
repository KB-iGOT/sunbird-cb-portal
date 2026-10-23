import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ConnectionRequestResolveService } from './connection-request-resolve.service'

describe('ConnectionRequestResolveService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ConnectionRequestResolveService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: ConnectionRequestResolveService = TestBed.inject(ConnectionRequestResolveService)
    expect(service).toBeTruthy()
  })
})
