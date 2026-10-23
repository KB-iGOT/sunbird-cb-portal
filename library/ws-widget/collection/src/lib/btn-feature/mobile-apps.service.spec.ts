import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'
import { NavigationExternalService } from './navigation-external.service'

import { MobileAppsService } from './mobile-apps.service'

describe('MobileAppsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MobileAppsService,
      { provide: NavigationExternalService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: MobileAppsService = TestBed.inject(MobileAppsService)
    expect(service).toBeTruthy()
  })
})
