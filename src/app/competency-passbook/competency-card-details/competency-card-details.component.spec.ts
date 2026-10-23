import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CompetencyPassbookService } from '../competency-passbook.service'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService, EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CompetencyCardDetailsComponent } from './competency-card-details.component'

describe('CompetencyCardDetailsComponent', () => {
  let component: CompetencyCardDetailsComponent
  let fixture: ComponentFixture<CompetencyCardDetailsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencyCardDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: CompetencyPassbookService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CompetencyCardDetailsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyCardDetailsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
