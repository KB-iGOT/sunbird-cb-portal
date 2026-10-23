import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { TranslateService } from '@ngx-translate/core'
import { autoMock } from 'src/testing/auto-mock'

import { UserProfileService } from './user-profile.service'

describe('UserProfileService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UserProfileService,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: TranslateService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: UserProfileService = TestBed.inject(UserProfileService)
    expect(service).toBeTruthy()
  })
})
