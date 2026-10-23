import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthKeycloakService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { EmptyRouteGuard } from './empty-route.guard'

describe('EmptyRouteGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EmptyRouteGuard,
      { provide: Router, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: AuthKeycloakService, useValue: autoMock() },
      { provide: ActivatedRoute, useValue: autoMock() },
    ],
  }))

  it('should ...', () => {
    const service: EmptyRouteGuard = TestBed.inject(EmptyRouteGuard)
    expect(service).toBeTruthy()
  })
})
