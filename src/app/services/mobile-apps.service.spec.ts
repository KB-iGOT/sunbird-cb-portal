import { TestBed } from '@angular/core/testing'

import { MobileAppsService } from '@ws/app'

describe('MobileAppsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: MobileAppsService = TestBed.inject(MobileAppsService)
    expect(service).toBeTruthy()
  })
})
