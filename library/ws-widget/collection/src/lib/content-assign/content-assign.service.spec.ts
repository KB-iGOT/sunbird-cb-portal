import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { ContentAssignService } from './content-assign.service'

describe('ContentAssignService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ContentAssignService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ContentAssignService = TestBed.inject(ContentAssignService)
    expect(service).toBeTruthy()
  })
})
