import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { AppGyaanKarmayogiService } from './app-gyaan-karmayogi.service'

describe('AppGyaanKarmayogiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AppGyaanKarmayogiService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: AppGyaanKarmayogiService = TestBed.inject(AppGyaanKarmayogiService)
    expect(service).toBeTruthy()
  })
})
