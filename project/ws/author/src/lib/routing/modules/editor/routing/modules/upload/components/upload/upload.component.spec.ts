import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { NotificationService } from '../../../../../../../../services/notification.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { EditorService } from '../../../../../services/editor.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { UploadComponent } from './upload.component'

describe('UploadComponent', () => {
  let component: UploadComponent
  let fixture: ComponentFixture<UploadComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UploadComponent],
      providers: [
        { provide: AuthInitService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: EditorService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: NotificationService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(UploadComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
