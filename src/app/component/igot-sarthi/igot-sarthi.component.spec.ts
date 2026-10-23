import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar as MatSnackbarNew } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'
import { RootService } from '../../component/root/root.service'

import { IGotSarthiComponent } from './igot-sarthi.component'

describe('AiTutorComponent', () => {
  let component: IGotSarthiComponent
  let fixture: ComponentFixture<IGotSarthiComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IGotSarthiComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: Renderer2, useValue: autoMock() },
        { provide: RootService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackbarNew, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(IGotSarthiComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IGotSarthiComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
