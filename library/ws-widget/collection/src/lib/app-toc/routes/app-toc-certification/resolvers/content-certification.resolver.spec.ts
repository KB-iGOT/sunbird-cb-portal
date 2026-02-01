import { TestBed } from '@angular/core/testing'

describe('ContentResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentResolver = TestBed.inject(ContentResolver)
    expect(service).toBeTruthy()
  })
})
