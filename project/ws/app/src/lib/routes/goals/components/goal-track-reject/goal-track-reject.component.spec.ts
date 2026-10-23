import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { BtnGoalsService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { GoalTrackRejectComponent } from './goal-track-reject.component'

describe('GoalTrackRejectComponent', () => {
  let component: GoalTrackRejectComponent
  let fixture: ComponentFixture<GoalTrackRejectComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GoalTrackRejectComponent],
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
    .overrideTemplate(GoalTrackRejectComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalTrackRejectComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
