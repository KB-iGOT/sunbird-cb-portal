import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { BtnGoalsService } from '@sunbird-cb/collection'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { GoalCreateCommonComponent } from './goal-create-common.component'

describe('GoalCreateCommonComponent', () => {
  let component: GoalCreateCommonComponent
  let fixture: ComponentFixture<GoalCreateCommonComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCreateCommonComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: BtnGoalsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GoalCreateCommonComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCreateCommonComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
