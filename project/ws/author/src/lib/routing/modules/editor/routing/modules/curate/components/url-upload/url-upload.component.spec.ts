import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { AuthInitService } from './../../../../../../../../services/init.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { UrlUploadComponent } from './url-upload.component'

describe('UrlUploadComponent', () => {
  let component: UrlUploadComponent
  let fixture: ComponentFixture<UrlUploadComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UrlUploadComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: EditorContentService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: AuthInitService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(UrlUploadComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlUploadComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
