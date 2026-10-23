import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnPlaylistService } from './btn-playlist.service'

describe('BtnPlaylistService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BtnPlaylistService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: BtnPlaylistService = TestBed.inject(BtnPlaylistService)
    expect(service).toBeTruthy()
  })
})
