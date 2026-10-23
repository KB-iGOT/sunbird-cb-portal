import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'
import { autoMock } from 'src/testing/auto-mock'

import { DialogConfirmComponent } from './dialog-confirm.component'

describe('DialogConfirmComponent', () => {
  let component: DialogConfirmComponent
  let fixture: ComponentFixture<DialogConfirmComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DialogConfirmComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: TranslateService, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(DialogConfirmComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogConfirmComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
