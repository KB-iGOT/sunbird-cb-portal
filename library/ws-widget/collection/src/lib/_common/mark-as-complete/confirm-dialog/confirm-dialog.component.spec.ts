import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ContentProgressService } from '../../content-progress/content-progress.service'
import { MarkAsCompleteService } from '../mark-as-complete.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { autoMock } from 'src/testing/auto-mock'

import { ConfirmDialogComponent } from './confirm-dialog.component'

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent
  let fixture: ComponentFixture<ConfirmDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
        { provide: MarkAsCompleteService, useValue: autoMock() },
        { provide: ContentProgressService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ConfirmDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
