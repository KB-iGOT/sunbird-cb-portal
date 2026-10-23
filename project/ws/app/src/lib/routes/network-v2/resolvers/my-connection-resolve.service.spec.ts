import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { MyConnectionResolveService } from './my-connection-resolve.service'

describe('MyConnectionResolveService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MyConnectionResolveService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: MyConnectionResolveService = TestBed.inject(MyConnectionResolveService)
    expect(service).toBeTruthy()
  })
})
