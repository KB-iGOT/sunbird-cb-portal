import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RatingService } from '../../_services/rating.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { EventService, LoggerService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ContentRatingV2DialogComponent } from './content-rating-v2-dialog.component'

describe('ContentRatingV2DialogComponent', () => {
  let component: ContentRatingV2DialogComponent
  let fixture: ComponentFixture<ContentRatingV2DialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentRatingV2DialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: RatingService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentRatingV2DialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentRatingV2DialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
