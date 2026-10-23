import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'
import { AccessControlService } from '../../../../../../../modules/shared/services/access-control.service'
import { EditorContentService } from '../../../../services/editor-content.service'
import { AuthInitService } from './../../../../../../../services/init.service'

import { CollectionResolverService } from './resolver.service'

describe('CollectionResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CollectionResolverService,
      { provide: AccessControlService, useValue: autoMock() },
      { provide: EditorContentService, useValue: autoMock() },
      { provide: AuthInitService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: CollectionResolverService = TestBed.inject(CollectionResolverService)
    expect(service).toBeTruthy()
  })
})
