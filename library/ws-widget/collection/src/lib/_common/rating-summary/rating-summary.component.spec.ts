import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RatingService } from '../../_services/rating.service'
import { autoMock } from 'src/testing/auto-mock'

import { RatingSummaryComponent } from './rating-summary.component'

describe('RatingSummaryComponent', () => {
  let component: RatingSummaryComponent
  let fixture: ComponentFixture<RatingSummaryComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RatingSummaryComponent],
      providers: [
        { provide: RatingService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(RatingSummaryComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingSummaryComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
