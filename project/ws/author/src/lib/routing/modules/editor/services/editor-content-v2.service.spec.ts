import { TestBed } from '@angular/core/testing'

import { EditorContentV2Service } from './editor-content-v2.service'

describe('EditorContentV2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EditorContentV2Service,
    ],
  }))

  it('should be created', () => {
    const service: EditorContentV2Service = TestBed.inject(EditorContentV2Service)
    expect(service).toBeTruthy()
  })
})
