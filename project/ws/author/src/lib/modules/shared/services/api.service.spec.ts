import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { autoMock } from 'src/testing/auto-mock'

import { ApiService } from './api.service'

describe('ApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ApiService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ApiService = TestBed.inject(ApiService)
    expect(service).toBeTruthy()
  })
})
