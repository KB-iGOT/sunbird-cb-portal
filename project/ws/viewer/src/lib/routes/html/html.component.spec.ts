import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService } from '@sunbird-cb/toc'
import { SubapplicationRespondService, EventService, ConfigurationsService, DomainConfService } from '@sunbird-cb/utils-v2'
import { AccessControlService } from '@ws/author'
import { autoMock } from 'src/testing/auto-mock'

import { HtmlComponent } from './html.component'

describe('HtmlComponent', () => {
  let component: HtmlComponent
  let fixture: ComponentFixture<HtmlComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HtmlComponent],
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
    .overrideTemplate(HtmlComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
