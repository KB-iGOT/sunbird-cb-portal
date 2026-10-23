import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'
import { EditorService } from './editor.service'

import { CreateContentResolverService } from './create-content-resolver.service'

describe('CreateContentResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CreateContentResolverService,
      { provide: Router, useValue: autoMock() },
      { provide: EditorService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: CreateContentResolverService = TestBed.inject(CreateContentResolverService)
    expect(service).toBeTruthy()
  })
})
