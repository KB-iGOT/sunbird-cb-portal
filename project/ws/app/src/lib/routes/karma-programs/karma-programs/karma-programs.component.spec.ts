import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LocalDataService } from '../../browse-by-competency/services/localService'
import { BrowseProviderService } from '../../browse-by-provider/services/browse-provider.service'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { KarmaProgramsComponent } from './karma-programs.component'

describe('KarmaProgramsComponent', () => {
  let component: KarmaProgramsComponent
  let fixture: ComponentFixture<KarmaProgramsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [KarmaProgramsComponent],
      providers: [
        { provide: BrowseProviderService, useValue: autoMock() },
        { provide: LocalDataService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(KarmaProgramsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KarmaProgramsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
