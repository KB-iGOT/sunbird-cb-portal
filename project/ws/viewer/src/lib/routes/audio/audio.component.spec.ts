import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService, ViewerUtilService } from '@sunbird-cb/toc'
import { ValueService } from '@sunbird-cb/utils-v2'
import { AccessControlService } from '@ws/author'
import { autoMock } from 'src/testing/auto-mock'

import { AudioComponent } from './audio.component'

describe('AudioComponent', () => {
  let component: AudioComponent
  let fixture: ComponentFixture<AudioComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AudioComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AudioComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
