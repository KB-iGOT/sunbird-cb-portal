import { TestBed } from '@angular/core/testing'

import { AppTocCohortsService } from './app-toc-cohorts.service'

describe('AppTocCohortsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AppTocCohortsService = TestBed.inject(AppTocCohortsService)
    expect(service).toBeTruthy()
  })
})
