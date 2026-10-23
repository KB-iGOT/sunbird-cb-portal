import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CertificateService } from '../_services/certificate.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { WidgetContentLibService, CommonMethodsService, CbpPlanCacheService } from '@sunbird-cb/consumption'
import { EventService, ConfigurationsService, DomainConfService, UtilityService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CardContentV2Component } from './card-content-v2.component'

describe('CardContentV2Component', () => {
  let component: CardContentV2Component
  let fixture: ComponentFixture<CardContentV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CardContentV2Component],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: CertificateService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: WidgetContentLibService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: CommonMethodsService, useValue: autoMock() },
        { provide: CbpPlanCacheService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CardContentV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CardContentV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
