import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService } from '@sunbird-cb/toc'
import { SubapplicationRespondService, EventService, ConfigurationsService, DomainConfService } from '@sunbird-cb/utils-v2'
import { AccessControlService } from '@ws/author'
import { autoMock } from 'src/testing/auto-mock'

import { HtmlMobileComponent } from './html-mobile.component'

describe('HtmlMobileComponent', () => {
  let component: HtmlMobileComponent
  let fixture: ComponentFixture<HtmlMobileComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HtmlMobileComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: SubapplicationRespondService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: DomainConfService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HtmlMobileComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlMobileComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
