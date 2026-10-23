import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { BtnGoalsService } from '@sunbird-cb/collection'
import { EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { GoalCommonCardComponent } from './goal-common-card.component'

describe('GoalCommonCardComponent', () => {
  let component: GoalCommonCardComponent
  let fixture: ComponentFixture<GoalCommonCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCommonCardComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: BtnGoalsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GoalCommonCardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCommonCardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
