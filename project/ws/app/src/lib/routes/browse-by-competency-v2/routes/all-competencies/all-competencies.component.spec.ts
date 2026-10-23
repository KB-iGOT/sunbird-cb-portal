import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BrowseCompetencyService } from '../../services/browse-competency.service'
import { LocalDataService } from '../../services/localService'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, EventService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AllCompetenciesComponent } from './all-competencies.component'

describe('AllCompetenciesComponent', () => {
  let component: AllCompetenciesComponent
  let fixture: ComponentFixture<AllCompetenciesComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AllCompetenciesComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: BrowseCompetencyService, useValue: autoMock() },
        { provide: LocalDataService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AllCompetenciesComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AllCompetenciesComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
