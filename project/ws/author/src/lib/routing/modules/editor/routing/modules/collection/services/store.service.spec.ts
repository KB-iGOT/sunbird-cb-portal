import { TestBed } from '@angular/core/testing'
import { LoggerService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { CollectionResolverService } from './resolver.service'
import { EditorContentService } from '../../../../services/editor-content.service'
import { EditorService } from '../../../../services/editor.service'
import { AuthInitService } from '../../../../../../../services/init.service'

import { CollectionStoreService } from './store.service'

describe('CollectionStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CollectionStoreService,
      { provide: LoggerService, useValue: autoMock() },
      { provide: CollectionResolverService, useValue: autoMock() },
      { provide: EditorContentService, useValue: autoMock() },
      { provide: EditorService, useValue: autoMock() },
      { provide: AuthInitService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: CollectionStoreService = TestBed.inject(CollectionStoreService)
    expect(service).toBeTruthy()
  })
})
