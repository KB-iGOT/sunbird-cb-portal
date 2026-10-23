import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { IntranetSelectorService } from './intranet-selector.service'

describe('IntranetSelectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      IntranetSelectorService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: IntranetSelectorService = TestBed.inject(IntranetSelectorService)
    expect(service).toBeTruthy()
  })
})
