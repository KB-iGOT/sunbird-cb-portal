import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'
import { AccessControlService } from '../../../../../../../modules/shared/services/access-control.service'
import { ApiService } from '../../../../../../../modules/shared/services/api.service'

import { QuizResolverService } from './resolver.service'

describe('QuizResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      QuizResolverService,
      { provide: Router, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
      { provide: ApiService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: QuizResolverService = TestBed.inject(QuizResolverService)
    expect(service).toBeTruthy()
  })
})
