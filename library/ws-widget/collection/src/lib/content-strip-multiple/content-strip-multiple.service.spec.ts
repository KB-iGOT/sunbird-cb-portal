import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripMultipleService } from './content-strip-multiple.service'

describe('ContentStripMultipleService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentStripMultipleService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentStripMultipleService = TestBed.inject(ContentStripMultipleService)
    expect(service).toBeTruthy()
  })
})
