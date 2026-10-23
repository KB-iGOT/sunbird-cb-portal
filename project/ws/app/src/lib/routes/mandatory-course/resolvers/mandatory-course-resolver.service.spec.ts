import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { WidgetUserServiceLib } from '@sunbird-cb/consumption'
import { autoMock } from 'src/testing/auto-mock'

import { MandatoryCourseResolverService } from './mandatory-course-resolver.service'

describe('MandatoryCourseResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MandatoryCourseResolverService,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: WidgetUserServiceLib, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: MandatoryCourseResolverService = TestBed.inject(MandatoryCourseResolverService)
    expect(service).toBeTruthy()
  })
})
