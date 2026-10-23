import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { AccessControlService } from '../../../../../../modules/shared/services/access-control.service'
import { ApiService } from '../../../../../../modules/shared/services/api.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { AuthPickerComponent } from './auth-picker.component'

describe('AuthPickerComponent', () => {
  let component: AuthPickerComponent
  let fixture: ComponentFixture<AuthPickerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AuthPickerComponent],
      providers: [
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: ApiService, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: AccessControlService, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(AuthPickerComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPickerComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
