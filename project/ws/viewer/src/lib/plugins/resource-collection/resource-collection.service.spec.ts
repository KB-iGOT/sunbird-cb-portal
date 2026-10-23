import { TestBed } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { autoMock } from 'src/testing/auto-mock'

import { ResourceCollectionService } from './resource-collection.service'

describe('ResourceCollectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ResourceCollectionService,
      { provide: HttpClient, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: ResourceCollectionService = TestBed.inject(ResourceCollectionService)
    expect(service).toBeTruthy()
  })
})
