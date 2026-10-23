import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { FormExtService } from './form-ext.service'

import { FormsConfigResolverService } from './forms-config-resolver.service'

describe('FormsConfigResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FormsConfigResolverService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: FormExtService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: FormsConfigResolverService = TestBed.inject(FormsConfigResolverService)
    expect(service).toBeTruthy()
  })
})
