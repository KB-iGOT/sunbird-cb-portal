import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { CompLocalService } from '../../services/comp.service'

import { DesiredCompetenciesComponent } from './desired-competencies.component'

describe('DesiredCompetenciesComponent', () => {
  let component: DesiredCompetenciesComponent
  let fixture: ComponentFixture<DesiredCompetenciesComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DesiredCompetenciesComponent],
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
    .overrideTemplate(DesiredCompetenciesComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DesiredCompetenciesComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
