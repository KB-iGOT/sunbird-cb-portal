import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AppConfigurationsService } from './app-configurations.service'

describe('AppConfigurationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AppConfigurationsService,
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: AppConfigurationsService = TestBed.inject(AppConfigurationsService)
    expect(service).toBeTruthy()
  })
})
