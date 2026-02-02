import { TestBed } from '@angular/core/testing'
import { HomePageService } from '@ws/app'

describe('HomePageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: HomePageService = TestBed.inject(HomePageService)
    expect(service).toBeTruthy()
  })
})
