import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { TenantAdminResolverService } from './tenant-admin-resolver.service'

describe('TenantAdminResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TenantAdminResolverService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: Router, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: TenantAdminResolverService = TestBed.inject(TenantAdminResolverService)
    expect(service).toBeTruthy()
  })
})
