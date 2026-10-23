import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PickerContentService } from './picker-content.service'

describe('PickerContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      PickerContentService,
      { provide: HttpClient, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: PickerContentService = TestBed.inject(PickerContentService)
    expect(service).toBeTruthy()
  })
})
