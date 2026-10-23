import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CustomTourService } from '../_common/tour-guide/tour-guide.service'
import { ActivatedRoute } from '@angular/router'
import { LoggerService, ConfigurationsService, ValueService, EventService, SubapplicationRespondService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PageComponent } from './page.component'

describe('PageComponent', () => {
  let component: PageComponent
  let fixture: ComponentFixture<PageComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: CustomTourService, useValue: autoMock() },
        { provide: SubapplicationRespondService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PageComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PageComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
