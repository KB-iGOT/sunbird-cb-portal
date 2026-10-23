import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HomePageService } from '../../_services/home-page.service'
import { UserProfileService } from '../../_services/user-profile.service'
import { ConfigurationsService, MultilingualTranslationsService, PipeOrdinalPipe } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { UserLeaderboardComponent } from './user-leaderboard.component'

describe('UserLeaderboardComponent', () => {
  let component: UserLeaderboardComponent
  let fixture: ComponentFixture<UserLeaderboardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserLeaderboardComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: HomePageService, useValue: autoMock() },
        { provide: UserProfileService, useValue: autoMock() },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: PipeOrdinalPipe, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(UserLeaderboardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLeaderboardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
