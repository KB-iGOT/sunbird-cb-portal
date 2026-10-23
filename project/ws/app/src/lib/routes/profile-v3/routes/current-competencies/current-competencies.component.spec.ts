import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CompLocalService } from '../../services/comp.service'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CurrentCompetenciesComponent } from './current-competencies.component'

describe('CurrentCompetenciesComponent', () => {
  let component: CurrentCompetenciesComponent
  let fixture: ComponentFixture<CurrentCompetenciesComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentCompetenciesComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: CompLocalService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CurrentCompetenciesComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentCompetenciesComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
