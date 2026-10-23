import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { AppCbpPlansService } from './app-cbp-plans.service'

describe('AppCbpPlansService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AppCbpPlansService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: AppCbpPlansService = TestBed.inject(AppCbpPlansService)
    expect(service).toBeTruthy()
  })
})
