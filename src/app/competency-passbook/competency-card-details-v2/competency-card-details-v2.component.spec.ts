import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CompetencyPassbookService } from '../competency-passbook.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService, EventService, PipeCertificateImageURL } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CompetencyCardDetailsV2Component } from './competency-card-details-v2.component'

// the @ws/app barrel transitively pulls in learn-search.component, which does not compile
// against the installed @sunbird-cb/utils-v2, so only the tokens used here are provided
jest.mock('@ws/app', () => ({
  CertificateViewPopupComponent: class CertificateViewPopupComponent { },
}))

describe('CompetencyCardDetailsV2Component', () => {
  let component: CompetencyCardDetailsV2Component
  let fixture: ComponentFixture<CompetencyCardDetailsV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencyCardDetailsV2Component],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: CompetencyPassbookService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: PipeCertificateImageURL, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    // PipeCertificateImageURL is a component-level provider, so it has to be overridden there
    .overrideProvider(PipeCertificateImageURL, { useValue: autoMock() })
    .overrideTemplate(CompetencyCardDetailsV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyCardDetailsV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
