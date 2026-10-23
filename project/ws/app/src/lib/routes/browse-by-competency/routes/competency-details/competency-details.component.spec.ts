import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BrowseCompetencyService } from '../../services/browse-competency.service'
import { LocalDataService } from '../../services/localService'
import { ActivatedRoute } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CompetencyDetailsComponent } from './competency-details.component'

describe('CompetencyDetailsComponent', () => {
  let component: CompetencyDetailsComponent
  let fixture: ComponentFixture<CompetencyDetailsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencyDetailsComponent],
      providers: [
        { provide: BrowseCompetencyService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: LocalDataService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CompetencyDetailsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyDetailsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
