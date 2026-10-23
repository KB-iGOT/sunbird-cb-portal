import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService, ViewerUtilService } from '@sunbird-cb/toc'
import { EventService, ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlayerYoutubeComponent } from './player-youtube.component'

describe('PlayerYoutubeComponent', () => {
  let component: PlayerYoutubeComponent
  let fixture: ComponentFixture<PlayerYoutubeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerYoutubeComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlayerYoutubeComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerYoutubeComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
