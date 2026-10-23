import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { NotificationService } from './notification.service'

describe('NotificationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NotificationService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: NotificationService = TestBed.inject(NotificationService)
    expect(service).toBeTruthy()
  })
})
