import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { BtnContentFeedbackService } from './btn-content-feedback.service'

describe('BtnContentFeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BtnContentFeedbackService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: BtnContentFeedbackService = TestBed.inject(BtnContentFeedbackService)
    expect(service).toBeTruthy()
  })
})
