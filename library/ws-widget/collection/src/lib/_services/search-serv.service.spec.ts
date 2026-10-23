import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { SearchApiService } from './search-api.service'

import { SearchServService } from './search-serv.service'

describe('SearchServService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SearchServService,
      { provide: EventService, useValue: autoMock() },
      { provide: SearchApiService, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: SearchServService = TestBed.inject(SearchServService)
    expect(service).toBeTruthy()
  })
})
