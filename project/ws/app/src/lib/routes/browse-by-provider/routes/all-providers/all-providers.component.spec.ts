import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LocalDataService } from '../../../browse-by-competency/services/localService'
import { BrowseProviderService } from '../../services/browse-provider.service'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AllProvidersComponent } from './all-providers.component'

describe('AllProvidersComponent', () => {
  let component: AllProvidersComponent
  let fixture: ComponentFixture<AllProvidersComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AllProvidersComponent],
      providers: [
        { provide: BrowseProviderService, useValue: autoMock() },
        { provide: LocalDataService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AllProvidersComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AllProvidersComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
