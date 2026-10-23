import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ContentProgressService } from './content-progress.service'

describe('ContentProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentProgressService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentProgressService = TestBed.inject(ContentProgressService)
    expect(service).toBeTruthy()
  })
})
