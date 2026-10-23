import { TestBed } from '@angular/core/testing'
import { autoMock } from 'src/testing/auto-mock'
import { FormExtService } from '../../../services/form-ext.service'

import { CustomHomeFormResolverService } from './custom-home-form-resolver.service'

describe('CustomHomeFormResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CustomHomeFormResolverService,
      { provide: FormExtService, useValue: autoMock() },
    ],
  }))

  it('should be created', () => {
    const service: CustomHomeFormResolverService = TestBed.inject(CustomHomeFormResolverService)
    expect(service).toBeTruthy()
  })
})
