import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { BtnFeatureService } from './btn-feature.service'

describe('BtnFeatureService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BtnFeatureService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: BtnFeatureService = TestBed.inject(BtnFeatureService)
    expect(service).toBeTruthy()
  })
})
