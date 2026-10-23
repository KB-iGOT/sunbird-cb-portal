import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { BtnGoalsService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { GoalTrackPendingComponent } from './goal-track-pending.component'

describe('GoalTrackPendingComponent', () => {
  let component: GoalTrackPendingComponent
  let fixture: ComponentFixture<GoalTrackPendingComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GoalTrackPendingComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: BtnGoalsService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GoalTrackPendingComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalTrackPendingComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
