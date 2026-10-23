import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AnalyticsService } from '../../../analytics/services/analytics.service'
import { LearningHistoryService } from '../../services/learning-history.service'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService, ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { LearningHistoryComponent } from './learning-history.component'

describe('LearningHistoryComponent', () => {
  let component: LearningHistoryComponent
  let fixture: ComponentFixture<LearningHistoryComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LearningHistoryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: LearningHistoryService, useValue: autoMock() },
        { provide: AnalyticsService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(LearningHistoryComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningHistoryComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
