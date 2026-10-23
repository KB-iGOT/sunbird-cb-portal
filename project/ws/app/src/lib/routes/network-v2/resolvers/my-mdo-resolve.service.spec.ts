import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { MyMdoResolveService } from './my-mdo-resolve.service'

describe('MyMdoResolveService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MyMdoResolveService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: MyMdoResolveService = TestBed.inject(MyMdoResolveService)
    expect(service).toBeTruthy()
  })
})
