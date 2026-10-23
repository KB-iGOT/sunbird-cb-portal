import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ContentPickerV2Service } from './content-picker-v2.service'

describe('ContentPickerV2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentPickerV2Service,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentPickerV2Service = TestBed.inject(ContentPickerV2Service)
    expect(service).toBeTruthy()
  })
})
