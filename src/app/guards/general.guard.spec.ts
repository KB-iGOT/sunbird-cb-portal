import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthKeycloakService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { UserRestrictionService } from '../services/user-restriction.service'

import { GeneralGuard } from './general.guard'

describe('GeneralGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      GeneralGuard,
      { provide: Router, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: AuthKeycloakService, useValue: autoMock() },
      { provide: UserRestrictionService, useValue: autoMock() },
    ],
  }))

  it('should ...', () => {
    const service: GeneralGuard = TestBed.inject(GeneralGuard)
    expect(service).toBeTruthy()
  })
})
