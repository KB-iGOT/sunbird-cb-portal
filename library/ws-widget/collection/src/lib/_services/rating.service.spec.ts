import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { RatingService } from './rating.service'

describe('RatingService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      RatingService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: RatingService = TestBed.inject(RatingService)
    expect(service).toBeTruthy()
  })
})
