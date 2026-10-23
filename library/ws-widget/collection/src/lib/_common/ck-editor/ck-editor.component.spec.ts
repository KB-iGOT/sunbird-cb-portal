import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from './services/access-control.service'
import { LoaderService } from './services/loader.service'
import { UploadService } from './services/upload.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { CkEditorComponent } from './ck-editor.component'

describe('CkEditorComponent', () => {
  let component: CkEditorComponent
  let fixture: ComponentFixture<CkEditorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CkEditorComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: UploadService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(CkEditorComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CkEditorComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
