import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LearningHistoryService } from '../../services/learning-history.service'
import { autoMock } from 'src/testing/auto-mock'

import { LearningHistoryProgressComponent } from './learning-history-progress.component'

describe('LearningHistoryProgressComponent', () => {
  let component: LearningHistoryProgressComponent
  let fixture: ComponentFixture<LearningHistoryProgressComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LearningHistoryProgressComponent],
      providers: [
        { provide: LearningHistoryService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(LearningHistoryProgressComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningHistoryProgressComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
