import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UntypedFormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { BtnGoalsService } from '@sunbird-cb/collection'
import { EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { GoalCreateCustomComponent } from './goal-create-custom.component'

describe('GoalCreateCustomComponent', () => {
  let component: GoalCreateCustomComponent
  let fixture: ComponentFixture<GoalCreateCustomComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCreateCustomComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: BtnGoalsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GoalCreateCustomComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCreateCustomComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
