import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { Platform } from '@angular/cdk/platform'
import { ActivatedRoute } from '@angular/router'
import { ViewerUtilService, WidgetContentService } from '@sunbird-cb/toc'
import { ValueService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { AccessControlService } from '@ws/author'
import { autoMock } from 'src/testing/auto-mock'

import { VideoComponent } from './video.component'

describe('VideoComponent', () => {
  let component: VideoComponent
  let fixture: ComponentFixture<VideoComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VideoComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: Platform, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(VideoComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
