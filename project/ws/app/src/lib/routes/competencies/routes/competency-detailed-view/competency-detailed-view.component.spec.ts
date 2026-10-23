import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CompetenceService } from '../../services/competence.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CompetencyDetailedViewComponent } from './competency-detailed-view.component'

describe('CompetencyDetailedViewComponent', () => {
  let component: CompetencyDetailedViewComponent
  let fixture: ComponentFixture<CompetencyDetailedViewComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencyDetailedViewComponent],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: CompetenceService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CompetencyDetailedViewComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyDetailedViewComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
