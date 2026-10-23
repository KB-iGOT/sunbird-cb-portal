import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { WidgetContentService, ViewerUtilService } from '@sunbird-cb/toc'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlayerAudioComponent } from './player-audio.component'

describe('PlayerAudioComponent', () => {
  let component: PlayerAudioComponent
  let fixture: ComponentFixture<PlayerAudioComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerAudioComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: ViewerUtilService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlayerAudioComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerAudioComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
