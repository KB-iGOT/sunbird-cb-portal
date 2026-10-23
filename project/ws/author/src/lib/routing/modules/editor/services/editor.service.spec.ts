import { TestBed } from '@angular/core/testing'
import { UserAutocompleteService } from '@sunbird-cb/collection'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { ApiService } from '../../../../modules/shared/services/api.service'
import { AccessControlService } from '../../../../modules/shared/services/access-control.service'

import { EditorService } from './editor.service'

describe('EditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EditorService,
      { provide: UserAutocompleteService, useValue: autoMock() },
      { provide: ConfigurationsService, useValue: autoMock() },
      { provide: ApiService, useValue: autoMock() },
      { provide: AccessControlService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: EditorService = TestBed.inject(EditorService)
    expect(service).toBeTruthy()
  })
})
