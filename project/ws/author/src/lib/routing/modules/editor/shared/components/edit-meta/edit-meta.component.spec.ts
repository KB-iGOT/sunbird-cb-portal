import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { InterestService } from '../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'
import { EditorContentService } from '../../../services/editor-content.service'
import { EditorService } from '../../../services/editor.service'
import { UploadService } from '../../services/upload.service'
import { AccessControlService } from './../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from './../../../../../../services/init.service'
import { LoaderService } from './../../../../../../services/loader.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { EditMetaComponent } from './edit-meta.component'

describe('EditMetaComponent', () => {
  let component: EditMetaComponent
  let fixture: ComponentFixture<EditMetaComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditMetaComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: UploadService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: EditorService, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: InterestService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(EditMetaComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMetaComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
