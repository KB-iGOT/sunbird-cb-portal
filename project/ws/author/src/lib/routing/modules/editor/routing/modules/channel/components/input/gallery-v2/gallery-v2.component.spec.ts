import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LoaderService } from '../../../../../../../../../services/loader.service'
import { UploadService } from '../../../../../../shared/services/upload.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { GalleryV2Component } from './gallery-v2.component'

describe('GalleryV2Component', () => {
  let component: GalleryV2Component
  let fixture: ComponentFixture<GalleryV2Component>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GalleryV2Component],
      providers: [
        { provide: UploadService, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(GalleryV2Component, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryV2Component)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
