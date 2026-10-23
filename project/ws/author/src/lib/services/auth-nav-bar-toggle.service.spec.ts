import { TestBed } from '@angular/core/testing'

import { AuthNavBarToggleService } from './auth-nav-bar-toggle.service'

describe('AuthNavBarToggleService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthNavBarToggleService,
    ],
  }))

  it('should be created', () => {
    const service: AuthNavBarToggleService = TestBed.inject(AuthNavBarToggleService)
    expect(service).toBeTruthy()
  })
})
