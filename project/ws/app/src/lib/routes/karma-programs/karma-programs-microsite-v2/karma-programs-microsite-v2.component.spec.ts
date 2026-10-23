import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { KarmaProgramsService } from '../service/karma-programs.service'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { CommonMethodsService } from '@sunbird-cb/consumption'
import { MultilingualTranslationsService, EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { KarmaProgramsMicrositeV2Component } from './karma-programs-microsite-v2.component'

describe('KarmaProgramsMicrositeV2Component', () => {
  let component: KarmaProgramsMicrositeV2Component
  let fixture: ComponentFixture<KarmaProgramsMicrositeV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [KarmaProgramsMicrositeV2Component],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: KarmaProgramsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: CommonMethodsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(KarmaProgramsMicrositeV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KarmaProgramsMicrositeV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
