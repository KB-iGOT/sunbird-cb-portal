import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { NoAccessDialogComponent } from './no-access-dialog.component'

describe('NoAccessDialogComponent', () => {
  let component: NoAccessDialogComponent
  let fixture: ComponentFixture<NoAccessDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NoAccessDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(NoAccessDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NoAccessDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
