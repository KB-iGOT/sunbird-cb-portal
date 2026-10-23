import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LoaderService } from '../../../../../../../../../services/loader.service'
import { UploadService } from '../../../../../../shared/services/upload.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { HtmlComponent } from './html.component'

describe('HtmlComponent', () => {
  let component: HtmlComponent
  let fixture: ComponentFixture<HtmlComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HtmlComponent],
      providers: [
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: UploadService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(HtmlComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
