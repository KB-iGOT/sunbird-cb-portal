import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../../../../modules/shared/services/access-control.service'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { UploadService } from '../../../../../shared/services/upload.service'
import { AuthInitService } from './../../../../../../../../services/init.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ValueService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { FileUploadComponent } from './file-upload.component'

describe('FileUploadComponent', () => {
  let component: FileUploadComponent
  let fixture: ComponentFixture<FileUploadComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FileUploadComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
        { provide: UploadService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
        { provide: ValueService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(FileUploadComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
