import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripSingleService } from './content-strip-single.service'

describe('ContentStripSingleService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentStripSingleService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentStripSingleService = TestBed.inject(ContentStripSingleService)
    expect(service).toBeTruthy()
  })
})
