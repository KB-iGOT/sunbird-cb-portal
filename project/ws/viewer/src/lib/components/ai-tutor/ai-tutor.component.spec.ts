import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, EventService, UtilityService } from '@sunbird-cb/utils-v2'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'
import { RootService } from './../../services/root.service'
import { WebSocketService } from './socket.service'

import { AiTutorComponent } from './ai-tutor.component'

describe('AiTutorComponent', () => {
  let component: AiTutorComponent
  let fixture: ComponentFixture<AiTutorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AiTutorComponent],
      providers: [
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: UtilityService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: RootService, useValue: autoMock() },
        { provide: WebSocketService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AiTutorComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AiTutorComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
