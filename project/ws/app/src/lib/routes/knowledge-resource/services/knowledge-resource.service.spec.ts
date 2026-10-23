import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { KnowledgeResourceService } from './knowledge-resource.service'

describe('KnowledgeResourceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      KnowledgeResourceService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }))

  it('should be created', () => {
    const service: KnowledgeResourceService = TestBed.inject(KnowledgeResourceService)
    expect(service).toBeTruthy()
  })
})
