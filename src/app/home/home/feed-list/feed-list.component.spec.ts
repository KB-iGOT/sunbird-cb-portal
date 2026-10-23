import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { EventService, UtilityService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { FeedListComponent } from './feed-list.component'

describe('FeedListComponent', () => {
  let component: FeedListComponent
  let fixture: ComponentFixture<FeedListComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeedListComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FeedListComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedListComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
