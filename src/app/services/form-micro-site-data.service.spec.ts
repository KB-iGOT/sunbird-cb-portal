import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { FormExtService } from './form-ext.service'

import { FormMicroSiteDataService } from './form-micro-site-data.service'

describe('FormMicroSiteDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FormMicroSiteDataService,
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: FormExtService, useValue: autoMock() },
      { provide: Router, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: FormMicroSiteDataService = TestBed.inject(FormMicroSiteDataService)
    expect(service).toBeTruthy()
  })
})
