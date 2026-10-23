import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { MdoChannelFormService } from './mdo-channel-form.service'

describe('MdoChannelFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MdoChannelFormService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: MdoChannelFormService = TestBed.inject(MdoChannelFormService)
    expect(service).toBeTruthy()
  })
})
