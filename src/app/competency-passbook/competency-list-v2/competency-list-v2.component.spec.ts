import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CompetencyPassbookService } from '../competency-passbook.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CompetencyListV2Component } from './competency-list-v2.component'

describe('CompetencyListV2Component', () => {
  let component: CompetencyListV2Component
  let fixture: ComponentFixture<CompetencyListV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencyListV2Component],
      providers: [
        { provide: Router, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: CompetencyPassbookService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CompetencyListV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyListV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
