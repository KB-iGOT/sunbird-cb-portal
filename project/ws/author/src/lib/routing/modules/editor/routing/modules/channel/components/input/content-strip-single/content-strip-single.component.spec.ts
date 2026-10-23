import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LoaderService } from '../../../../../../../../../services/loader.service'
import { UploadService } from '../../../../../../shared/services/upload.service'
import { InterestService } from './../../../../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { ContentStripSingleComponent } from './content-strip-single.component'

describe('ContentStripSingleComponent', () => {
  let component: ContentStripSingleComponent
  let fixture: ComponentFixture<ContentStripSingleComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripSingleComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: InterestService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: UploadService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ContentStripSingleComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripSingleComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
