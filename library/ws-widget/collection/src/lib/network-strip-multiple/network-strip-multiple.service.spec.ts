import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripNewMultipleService } from './network-strip-multiple.service'

describe('ContentStripNewMultipleService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentStripNewMultipleService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentStripNewMultipleService = TestBed.inject(ContentStripNewMultipleService)
    expect(service).toBeTruthy()
  })
})
