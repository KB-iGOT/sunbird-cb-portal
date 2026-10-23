import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { SearchApiService } from './search-api.service'

describe('SearchApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SearchApiService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: SearchApiService = TestBed.inject(SearchApiService)
    expect(service).toBeTruthy()
  })
})
