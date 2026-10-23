import { TestBed } from '@angular/core/testing'

import { CKEditorService } from './ck-editor.service'

describe('CKEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CKEditorService,
    ],
  }))

  it('should be created', () => {
    const service: CKEditorService = TestBed.inject(CKEditorService)
    expect(service).toBeTruthy()
  })
})
