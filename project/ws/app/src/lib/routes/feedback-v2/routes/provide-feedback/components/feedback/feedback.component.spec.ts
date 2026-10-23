import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { FeedbackService } from '@sunbird-cb/collection'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { FeedbackComponent } from './feedback.component'

describe('FeedbackComponent', () => {
  let component: FeedbackComponent
  let fixture: ComponentFixture<FeedbackComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackComponent],
      providers: [
        { provide: FeedbackService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FeedbackComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
