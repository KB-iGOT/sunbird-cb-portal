import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LoaderService } from '../../../../../../../../../services/loader.service'
import { UploadService } from '../../../../../../shared/services/upload.service'
import { UntypedFormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { SliderComponent } from './slider.component'

describe('SliderComponent', () => {
  let component: SliderComponent
  let fixture: ComponentFixture<SliderComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SliderComponent],
      providers: [
        { provide: UploadService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: UntypedFormBuilder, useValue: autoMock() },
        { provide: LoaderService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SliderComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
