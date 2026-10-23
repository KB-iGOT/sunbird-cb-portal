import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'
import { ApiService } from '../modules/shared/services/api.service'
import { WorkFlowService } from './work-flow.service'
import { AccessControlService } from '../modules/shared/services/access-control.service'
import { AuthInitService } from './init.service'

import { NotificationService } from './notification.service'

describe('NotificationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NotificationService,
      { provide: ApiService, useValue: autoMock() },
      { provide: WorkFlowService, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
      { provide: AuthInitService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: NotificationService = TestBed.inject(NotificationService)
    expect(service).toBeTruthy()
  })
})
