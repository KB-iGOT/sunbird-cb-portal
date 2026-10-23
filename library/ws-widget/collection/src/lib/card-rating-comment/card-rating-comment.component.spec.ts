import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RatingService } from '../_services/rating.service'
import { autoMock } from 'src/testing/auto-mock'

import { CardRatingCommentComponent } from './card-rating-comment.component'

describe('CardRatingCommentComponent', () => {
  let component: CardRatingCommentComponent
  let fixture: ComponentFixture<CardRatingCommentComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CardRatingCommentComponent],
      providers: [
        { provide: RatingService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CardRatingCommentComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CardRatingCommentComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
