import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { SamuhikCharchaService } from './samuhik-charcha.service'

describe('SamuhikCharchaService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SamuhikCharchaService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: SamuhikCharchaService = TestBed.inject(SamuhikCharchaService)
    expect(service).toBeTruthy()
  })
})
