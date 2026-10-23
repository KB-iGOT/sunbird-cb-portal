import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { autoMock } from 'src/testing/auto-mock'

import { SignupSuccessDialogueComponent } from './signup-success-dialogue.component'

describe('SignupSuccessDialogueComponent', () => {
  let component: SignupSuccessDialogueComponent
  let fixture: ComponentFixture<SignupSuccessDialogueComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SignupSuccessDialogueComponent],
      providers: [
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: Router, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(SignupSuccessDialogueComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupSuccessDialogueComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
