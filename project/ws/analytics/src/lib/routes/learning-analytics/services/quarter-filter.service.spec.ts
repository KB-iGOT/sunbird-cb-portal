import { TestBed } from '@angular/core/testing'
import { DatePipe } from '@angular/common'
import { autoMock } from 'src/testing/auto-mock'

import { QuarterServiceService } from './quarter-filter.service'

describe('QuarterServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      QuarterServiceService,
      { provide: DatePipe, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: QuarterServiceService = TestBed.inject(QuarterServiceService)
    expect(service).toBeTruthy()
  })
})
