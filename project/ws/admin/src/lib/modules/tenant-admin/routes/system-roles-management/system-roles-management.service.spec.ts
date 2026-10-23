import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { autoMock } from 'src/testing/auto-mock'

import { SystemRolesManagementService } from './system-roles-management.service'

describe('SystemRolesManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SystemRolesManagementService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: SystemRolesManagementService = TestBed.inject(SystemRolesManagementService)
    expect(service).toBeTruthy()
  })
})
