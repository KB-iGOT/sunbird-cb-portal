import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BtnPageBackService } from './btn-page-back.service'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { BtnPageBackComponent } from './btn-page-back.component'

describe('BtnPageBackComponent', () => {
  let component: BtnPageBackComponent
  let fixture: ComponentFixture<BtnPageBackComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnPageBackComponent],
      providers: [
        { provide: BtnPageBackService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(BtnPageBackComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnPageBackComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
