import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { EventService } from '../../services/event.service'
import { ActivatedRoute } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { EventSessionsComponent } from './event-sessions.component'

describe('EventSessionsComponent', () => {
  let component: EventSessionsComponent
  let fixture: ComponentFixture<EventSessionsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EventSessionsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(EventSessionsComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSessionsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
