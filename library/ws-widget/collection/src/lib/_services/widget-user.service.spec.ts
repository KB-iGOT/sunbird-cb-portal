import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { WidgetUserService } from './widget-user.service'

describe('WidgetUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WidgetUserService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: WidgetUserService = TestBed.inject(WidgetUserService)
    expect(service).toBeTruthy()
  })
})
