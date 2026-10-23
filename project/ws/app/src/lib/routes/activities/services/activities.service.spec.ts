import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ActivitiesService } from './activities.service'

describe('ActivitiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ActivitiesService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: ActivitiesService = TestBed.inject(ActivitiesService)
    expect(service).toBeTruthy()
  })
})
