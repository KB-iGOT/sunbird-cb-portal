import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { TipsForLearnerCardComponent } from './tips-for-learner-card.component'

describe('TipsForLearnerCardComponent', () => {
  let component: TipsForLearnerCardComponent
  let fixture: ComponentFixture<TipsForLearnerCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TipsForLearnerCardComponent],
      providers: [
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(TipsForLearnerCardComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TipsForLearnerCardComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
