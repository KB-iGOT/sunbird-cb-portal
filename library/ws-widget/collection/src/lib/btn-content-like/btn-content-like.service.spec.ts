import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { BtnContentLikeService } from './btn-content-like.service'

describe('BtnContentLikeService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BtnContentLikeService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: BtnContentLikeService = TestBed.inject(BtnContentLikeService)
    expect(service).toBeTruthy()
  })
})
