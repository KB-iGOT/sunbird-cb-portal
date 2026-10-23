import { TestBed } from '@angular/core/testing'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ResourceDownloadHelperService } from './resource-download-helper.service'

describe('ResourceDownloadHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ResourceDownloadHelperService,
      { provide: EventService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ResourceDownloadHelperService = TestBed.inject(ResourceDownloadHelperService)
    expect(service).toBeTruthy()
  })
})
