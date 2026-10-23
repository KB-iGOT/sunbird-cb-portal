import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { FormExtService } from './form-ext.service'

import { AppHomePageResolverService } from './app-home-page-resolver.service'

describe('AppHomePageResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AppHomePageResolverService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: FormExtService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: AppHomePageResolverService = TestBed.inject(AppHomePageResolverService)
    expect(service).toBeTruthy()
  })
})
