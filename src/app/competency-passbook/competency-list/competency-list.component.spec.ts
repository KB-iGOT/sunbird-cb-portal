import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { WidgetEnrollService, ConfigurationsService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CompetencyListComponent } from './competency-list.component'

describe('CompetencyListComponent', () => {
  let component: CompetencyListComponent
  let fixture: ComponentFixture<CompetencyListComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencyListComponent],
      providers: [
        { provide: WidgetEnrollService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CompetencyListComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyListComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
