import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { PipeContentRoutePipe } from '@sunbird-cb/collection'
import { WidgetContentService } from '@sunbird-cb/toc'
import { autoMock } from 'src/testing/auto-mock'

import { AppTocResolverService } from './app-toc-resolver.service'

describe('AppTocResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AppTocResolverService,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: WidgetContentService, useValue: autoMock() },
      { provide: PipeContentRoutePipe, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: AppTocResolverService = TestBed.inject(AppTocResolverService)
    expect(service).toBeTruthy()
  })
})
