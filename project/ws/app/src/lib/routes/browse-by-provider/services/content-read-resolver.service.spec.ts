import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ContentReadResolverService } from './content-read-resolver.service'

describe('ContentReadResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentReadResolverService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: ContentReadResolverService = TestBed.inject(ContentReadResolverService)
    expect(service).toBeTruthy()
  })
})
