import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'

import { WithdrawRequestComponent } from './withdraw-request.component'

describe('WithdrawRequestComponent', () => {
  let component: WithdrawRequestComponent
  let fixture: ComponentFixture<WithdrawRequestComponent>

  const dialogRef = { close: jest.fn() }
  const matSnackBar = { open: jest.fn() }
  const userProfileService = {
    withDrawRequest: jest.fn(),
    handleTranslateTo: jest.fn((key: string) => `t:${key}`),
  }
  const configService = { unMappedUser: { id: 'user-1' } }
  let dialogData: any

  beforeEach(waitForAsync(() => {
    jest.clearAllMocks()
    dialogData = {
      withDrawType: 'department',
      approvalPendingFields: [{ wfId: 'wf-1' }, { wfId: 'wf-2' }],
    }

    TestBed.configureTestingModule({
      declarations: [WithdrawRequestComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatSnackBar, useValue: matSnackBar },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: ConfigurationsService, useValue: configService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run
    .overrideTemplate(WithdrawRequestComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawRequestComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('handleCloseModal should close the dialog', () => {
    component.handleCloseModal()
    expect(dialogRef.close).toHaveBeenCalledWith()
  })

  describe('handleWithdrawRequest', () => {
    it('should withdraw every pending department request and notify on success', () => {
      userProfileService.withDrawRequest.mockReturnValue(of({}))
      const emitSpy = jest.spyOn(component.enableMakeTransfer, 'emit')

      component.handleWithdrawRequest()

      expect(userProfileService.withDrawRequest).toHaveBeenCalledTimes(2)
      expect(userProfileService.withDrawRequest).toHaveBeenCalledWith('user-1', 'wf-1')
      expect(userProfileService.withDrawRequest).toHaveBeenCalledWith('user-1', 'wf-2')
      expect(matSnackBar.open).toHaveBeenCalledWith('t:withdrawTransferSuccess')
      expect(dialogRef.close).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith(true)
    })

    it('should show a failure message when the withdraw call fails', () => {
      userProfileService.withDrawRequest.mockReturnValue(throwError({ ok: false }))
      const emitSpy = jest.spyOn(component.enableMakeTransfer, 'emit')

      component.handleWithdrawRequest()

      expect(matSnackBar.open).toHaveBeenCalledWith('t:withdrawTransferFailed')
      expect(dialogRef.close).not.toHaveBeenCalled()
      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should not show a message when the error response is ok', () => {
      userProfileService.withDrawRequest.mockReturnValue(throwError({ ok: true }))
      component.handleWithdrawRequest()
      expect(matSnackBar.open).not.toHaveBeenCalled()
    })

    it('should close the dialog with true for non-department withdrawals', () => {
      component.data.withDrawType = 'designation'
      component.handleWithdrawRequest()
      expect(userProfileService.withDrawRequest).not.toHaveBeenCalled()
      expect(dialogRef.close).toHaveBeenCalledWith(true)
    })
  })

  it('handleTranslateTo should delegate to UserProfileService', () => {
    expect(component.handleTranslateTo('key')).toBe('t:key')
    expect(userProfileService.handleTranslateTo).toHaveBeenCalledWith('key')
  })

  it('ngOnDestroy should not throw', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
