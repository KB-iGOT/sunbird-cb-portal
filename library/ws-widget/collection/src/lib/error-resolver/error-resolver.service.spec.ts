import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ErrorResolverService } from './error-resolver.service'

describe('ErrorResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ErrorResolverService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ErrorResolverService = TestBed.inject(ErrorResolverService)
    expect(service).toBeTruthy()
  })
})
