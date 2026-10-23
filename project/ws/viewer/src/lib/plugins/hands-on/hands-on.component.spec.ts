import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HandsOnService } from './hands-on.service'
import { MatDialog } from '@angular/material/dialog'
import { LoggerService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { HandsOnComponent } from './hands-on.component'

describe('HandsOnComponent', () => {
  let component: HandsOnComponent
  let fixture: ComponentFixture<HandsOnComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HandsOnComponent],
      providers: [
        { provide: LoggerService, useValue: autoMock() },
        { provide: HandsOnService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HandsOnComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HandsOnComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
