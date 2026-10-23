import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { Router } from '@angular/router'
import { WidgetContentService, TocConfigService } from '@sunbird-cb/toc'
import { ConfigurationsService, UtilityService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { PlayerBriefComponent } from './player-brief.component'

describe('PlayerBriefComponent', () => {
  let component: PlayerBriefComponent
  let fixture: ComponentFixture<PlayerBriefComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerBriefComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: WidgetContentService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: TocConfigService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(PlayerBriefComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerBriefComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
