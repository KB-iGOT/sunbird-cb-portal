import { BreakpointObserver } from '@angular/cdk/layout'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'
import { AccessControlService } from '../../../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { NotificationService } from '../../../../../../../../services/notification.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { EditorService } from '../../../../../services/editor.service'
import { UploadService } from '../../../../../shared/services/upload.service'
import { WebStoreService } from '../../services/store.service'

import { WebModuleEditorComponent } from './web-module-editor.component'

describe('WebModuleEditorComponent', () => {
  let component: WebModuleEditorComponent
  let fixture: ComponentFixture<WebModuleEditorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WebModuleEditorComponent],
      providers: [
        { provide: MatDialog, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: BreakpointObserver, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
        { provide: UploadService, useValue: autoMock() },
        { provide: EditorService, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: NotificationService, useValue: autoMock() },
        { provide: WebStoreService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(WebModuleEditorComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebModuleEditorComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
