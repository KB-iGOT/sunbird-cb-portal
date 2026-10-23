import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MyFeedbackService } from '../../services/my-feedback.service'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { FeedbackService } from '@sunbird-cb/collection'
import { autoMock } from 'src/testing/auto-mock'

import { FeedbackListComponent } from './feedback-list.component'

describe('FeedbackListComponent', () => {
  let component: FeedbackListComponent
  let fixture: ComponentFixture<FeedbackListComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackListComponent],
      providers: [
        { provide: FeedbackService, useValue: autoMock() },
        { provide: MyFeedbackService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FeedbackListComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackListComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
