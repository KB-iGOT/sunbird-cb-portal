import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateService } from '@ngx-translate/core'
import { EventService, TelemetryService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AppTourVideoComponent } from './app-tour-video.component'

describe('AppTourVideoComponent', () => {
  let component: AppTourVideoComponent
  let fixture: ComponentFixture<AppTourVideoComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppTourVideoComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
        { provide: TelemetryService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AppTourVideoComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTourVideoComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
