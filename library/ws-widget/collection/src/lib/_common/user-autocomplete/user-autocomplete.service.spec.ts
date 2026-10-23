import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { UserAutocompleteService } from './user-autocomplete.service'

describe('UserAutocompleteService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UserAutocompleteService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: UserAutocompleteService = TestBed.inject(UserAutocompleteService)
    expect(service).toBeTruthy()
  })
})
