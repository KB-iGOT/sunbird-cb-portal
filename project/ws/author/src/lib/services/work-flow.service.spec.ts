import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'
import { AuthInitService } from './init.service'
import { ConditionCheckService } from '../modules/shared/services/condition-check.service'
import { AccessControlService } from '../modules/shared/services/access-control.service'

import { WorkFlowService } from './work-flow.service'

describe('WorkFlowService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WorkFlowService,
      { provide: AuthInitService, useValue: autoMock() },
      { provide: ConditionCheckService, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: WorkFlowService = TestBed.inject(WorkFlowService)
    expect(service).toBeTruthy()
  })
})
