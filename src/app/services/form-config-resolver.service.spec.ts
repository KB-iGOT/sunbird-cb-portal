import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { FormExtService } from './form-ext.service'

import { FormConfigResolverService } from './form-config-resolver.service'

describe('FormConfigResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FormConfigResolverService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: FormExtService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: FormConfigResolverService = TestBed.inject(FormConfigResolverService)
    expect(service).toBeTruthy()
  })
})
