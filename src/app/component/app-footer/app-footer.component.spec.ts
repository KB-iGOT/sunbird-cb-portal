import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, ValueService, DomainConfService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AppFooterComponent } from './app-footer.component'

describe('AppFooterComponent', () => {
  let component: AppFooterComponent
  let fixture: ComponentFixture<AppFooterComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppFooterComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: HttpClient, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AppFooterComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppFooterComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
