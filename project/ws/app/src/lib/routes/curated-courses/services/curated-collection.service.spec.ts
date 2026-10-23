import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { CuratedCollectionService } from './curated-collection.service'

describe('CuratedCollectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CuratedCollectionService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: CuratedCollectionService = TestBed.inject(CuratedCollectionService)
    expect(service).toBeTruthy()
  })
})
