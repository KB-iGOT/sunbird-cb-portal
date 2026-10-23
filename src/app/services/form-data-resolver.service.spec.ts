import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { FormExtService } from './form-ext.service'

import { FormDataResolverService } from './form-data-resolver.service'

describe('FormDataResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FormDataResolverService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: FormExtService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: FormDataResolverService = TestBed.inject(FormDataResolverService)
    expect(service).toBeTruthy()
  })
})
