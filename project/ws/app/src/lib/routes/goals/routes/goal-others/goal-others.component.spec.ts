import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { BtnGoalsService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { GoalOthersComponent } from './goal-others.component'

describe('GoalOthersComponent', () => {
  let component: GoalOthersComponent
  let fixture: ComponentFixture<GoalOthersComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GoalOthersComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: BtnGoalsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GoalOthersComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalOthersComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
