import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { MyLearningService } from './my-learning.service'

describe('MyLearningService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MyLearningService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: MyLearningService = TestBed.inject(MyLearningService)
    expect(service).toBeTruthy()
  })
})
