import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../services/init.service'
import { LoaderService } from '../../../../../services/loader.service'
import { CreateService } from './create.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { CreateComponent } from './create.component'

describe('CreateComponent', () => {
  let component: CreateComponent
  let fixture: ComponentFixture<CreateComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: CreateService, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CreateComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
