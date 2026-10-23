import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ProfileVerificationDialogComponent } from './profile-verification-dialog.component'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { TranslateModule } from '@ngx-translate/core'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('ProfileVerificationDialogComponent', () => {
  let component: ProfileVerificationDialogComponent
  let fixture: ComponentFixture<ProfileVerificationDialogComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileVerificationDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: ConfigurationsService, useValue: { userProfile: { userRootOrg: { ministryOrStateType: 'state' } } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileVerificationDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
