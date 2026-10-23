import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CustomTourService } from './tour-guide.service'

describe('CustomTourService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CustomTourService,
      { provide: Router, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: CustomTourService = TestBed.inject(CustomTourService)
    expect(service).toBeTruthy()
  })
})
