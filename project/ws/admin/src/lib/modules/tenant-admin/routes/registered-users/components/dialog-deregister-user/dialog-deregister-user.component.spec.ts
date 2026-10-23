import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef } from '@angular/material/dialog'
import { autoMock } from 'src/testing/auto-mock'

import { DialogDeregisterUserComponent } from './dialog-deregister-user.component'

describe('DialogDeregisterUserComponent', () => {
  let component: DialogDeregisterUserComponent
  let fixture: ComponentFixture<DialogDeregisterUserComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DialogDeregisterUserComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(DialogDeregisterUserComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeregisterUserComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
