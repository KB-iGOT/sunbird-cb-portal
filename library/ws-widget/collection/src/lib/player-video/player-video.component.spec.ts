import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService, ViewerUtilService, AppTocService } from '@sunbird-cb/toc'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlayerVideoComponent } from './player-video.component'

describe('PlayerVideoComponent', () => {
  let component: PlayerVideoComponent
  let fixture: ComponentFixture<PlayerVideoComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerVideoComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: AppTocService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlayerVideoComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerVideoComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
