import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { InterestService } from '../../services/interest.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { EventService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { InterestComponent } from './interest.component'

describe('InterestComponent', () => {
  let component: InterestComponent
  let fixture: ComponentFixture<InterestComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InterestComponent],
      providers: [
        { provide: EventService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: InterestService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(InterestComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
