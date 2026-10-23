import { TestBed } from '@angular/core/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { AuthInitService } from './../../../../services/init.service'
import { ApiService } from '../../../../modules/shared/services/api.service'
import { AccessControlService } from '../../../../modules/shared/services/access-control.service'

import { MyContentService } from './my-content.service'

describe('MyContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MyContentService,
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: AuthInitService, useValue: autoMock() },
      { provide: ApiService, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: MyContentService = TestBed.inject(MyContentService)
    expect(service).toBeTruthy()
  })
})
