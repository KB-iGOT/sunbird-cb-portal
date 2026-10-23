import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../services/init.service'
import { LoaderService } from '../../../../../services/loader.service'
import { MyContentService } from '../../services/my-content.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { MyContentComponent } from './my-content.component'

describe('MyContentComponent', () => {
  let component: MyContentComponent
  let fixture: ComponentFixture<MyContentComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MyContentComponent],
      providers: [
        { provide: MyContentService, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(MyContentComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MyContentComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
