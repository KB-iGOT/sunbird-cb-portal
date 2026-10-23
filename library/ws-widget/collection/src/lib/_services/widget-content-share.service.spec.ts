import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { WidgetContentShareService } from './widget-content-share.service'

describe('WidgetContentShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WidgetContentShareService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: WidgetContentShareService = TestBed.inject(WidgetContentShareService)
    expect(service).toBeTruthy()
  })
})
