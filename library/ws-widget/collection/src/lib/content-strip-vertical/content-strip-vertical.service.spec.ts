import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripVerticalService } from './content-strip-vertical.service'

describe('ContentStripVerticalService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentStripVerticalService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentStripVerticalService = TestBed.inject(ContentStripVerticalService)
    expect(service).toBeTruthy()
  })
})
