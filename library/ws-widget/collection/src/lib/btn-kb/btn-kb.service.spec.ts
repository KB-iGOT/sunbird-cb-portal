import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { WidgetContentService } from '@sunbird-cb/toc'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnKbService } from './btn-kb.service'

describe('BtnKbService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BtnKbService,
      { provide: WidgetContentService, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: BtnKbService = TestBed.inject(BtnKbService)
    expect(service).toBeTruthy()
  })
})
