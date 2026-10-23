import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { MyFeedbackService } from './my-feedback.service'

describe('MyFeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MyFeedbackService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: MyFeedbackService = TestBed.inject(MyFeedbackService)
    expect(service).toBeTruthy()
  })
})
