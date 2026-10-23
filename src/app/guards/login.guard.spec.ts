import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { LoginGuard } from './login.guard'

describe('LoginGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      LoginGuard,
      { provide: Router, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should ...', () => {
    const service: LoginGuard = TestBed.inject(LoginGuard)
    expect(service).toBeTruthy()
  })
})
