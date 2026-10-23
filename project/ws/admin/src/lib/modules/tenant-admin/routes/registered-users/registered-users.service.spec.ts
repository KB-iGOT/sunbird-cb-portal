import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { autoMock } from 'src/testing/auto-mock'

import { RegisteredUsersService } from './registered-users.service'

describe('RegisteredUsersService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      RegisteredUsersService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: RegisteredUsersService = TestBed.inject(RegisteredUsersService)
    expect(service).toBeTruthy()
  })
})
