import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { EventService } from '@sunbird-cb/utils-v2'
import { autoMock } from 'src/testing/auto-mock'

import { ProfileCertificateDialogComponent } from './profile-certificate-dialog.component'

describe('ProfileCertificateDialogComponent', () => {
  let component: ProfileCertificateDialogComponent
  let fixture: ComponentFixture<ProfileCertificateDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileCertificateDialogComponent],
      providers: [
        { provide: Router, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: MatDialogRef, useValue: autoMock() },
        { provide: MAT_DIALOG_DATA, useValue: autoMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run, so this only
    // verifies that the component can be constructed with its dependencies
    .overrideTemplate(ProfileCertificateDialogComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCertificateDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
