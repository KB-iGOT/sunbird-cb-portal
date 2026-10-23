import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { LeadershipService } from './leadership.service'

describe('LeadershipService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      LeadershipService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: LeadershipService = TestBed.inject(LeadershipService)
    expect(service).toBeTruthy()
  })
})
