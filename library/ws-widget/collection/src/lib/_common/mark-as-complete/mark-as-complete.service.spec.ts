import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { MarkAsCompleteService } from './mark-as-complete.service'

describe('MarkAsCompleteService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MarkAsCompleteService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: MarkAsCompleteService = TestBed.inject(MarkAsCompleteService)
    expect(service).toBeTruthy()
  })
})
