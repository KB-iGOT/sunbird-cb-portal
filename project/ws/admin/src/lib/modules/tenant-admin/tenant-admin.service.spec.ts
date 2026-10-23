import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { autoMock } from 'src/testing/auto-mock'

import { TenantAdminService } from './tenant-admin.service'

describe('TenantAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TenantAdminService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: TenantAdminService = TestBed.inject(TenantAdminService)
    expect(service).toBeTruthy()
  })
})
