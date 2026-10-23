import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { FormExtService } from './form-ext.service'

describe('FormExtService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FormExtService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: FormExtService = TestBed.inject(FormExtService)
    expect(service).toBeTruthy()
  })
})
