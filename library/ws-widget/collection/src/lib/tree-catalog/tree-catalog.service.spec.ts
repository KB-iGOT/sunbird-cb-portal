import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'

import { TreeCatalogService } from './tree-catalog.service'

describe('TreeCatalogService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TreeCatalogService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: TreeCatalogService = TestBed.inject(TreeCatalogService)
    expect(service).toBeTruthy()
  })
})
