import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MyFeedbackService } from '../../services/my-feedback.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { FeedbackService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { FeedbackThreadComponent } from './feedback-thread.component'

describe('FeedbackThreadComponent', () => {
  let component: FeedbackThreadComponent
  let fixture: ComponentFixture<FeedbackThreadComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackThreadComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: FeedbackService, useValue: autoMock() },
        { provide: MyFeedbackService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FeedbackThreadComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackThreadComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
