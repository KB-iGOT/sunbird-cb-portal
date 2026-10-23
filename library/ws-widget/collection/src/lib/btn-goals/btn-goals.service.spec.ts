import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { BtnGoalsService } from './btn-goals.service'

describe('BtnGoalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BtnGoalsService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: BtnGoalsService = TestBed.inject(BtnGoalsService)
    expect(service).toBeTruthy()
  })
})
