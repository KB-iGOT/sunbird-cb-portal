import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { OtpService } from '../../../user-profile/services/otp.services'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'

import { VerifyOtpComponent } from './verify-otp.component'

describe('VerifyOtpComponent', () => {
  let component: VerifyOtpComponent
  let fixture: ComponentFixture<VerifyOtpComponent>

  const dialogRef = { close: jest.fn() }
  const otpService = {
    verifyEmailOTPV4: jest.fn(),
    verifyOTPV4: jest.fn(),
  }
  const matSnackBar = { open: jest.fn() }
  const userProfileService = { handleTranslateTo: jest.fn((key: string) => `t:${key}`) }
  let dialogData: any

  beforeEach(waitForAsync(() => {
    jest.clearAllMocks()
    dialogData = { type: 'email', value: 'user@example.com', apiConfig: { base: 'cfg' } }

    TestBed.configureTestingModule({
      declarations: [VerifyOtpComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: OtpService, useValue: otpService },
        { provide: MatSnackBar, useValue: matSnackBar },
        { provide: UserProfileService, useValue: userProfileService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out and change detection is not run
    .overrideTemplate(VerifyOtpComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyOtpComponent)
    component = fixture.componentInstance
    component.timerDiv = { nativeElement: { innerHTML: '' } }
  })

  afterEach(() => {
    component.ngOnDestroy()
    jest.useRealTimers()
  })

  it('should create and read apiConfig from dialog data', () => {
    expect(component).toBeTruthy()
    expect(component.apiConfig).toEqual({ base: 'cfg' })
  })

  describe('timer', () => {
    it('ngOnInit should start the timer', () => {
      const spy = jest.spyOn(component, 'startTimer').mockImplementation(() => undefined)
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should count down and update the timer text', () => {
      jest.useFakeTimers()
      component.startTimer()
      jest.advanceTimersByTime(1000)
      expect(component.timeLeft).toBe(149)
      expect(component.timerDiv.nativeElement.innerHTML).toBe('2m: 29s')
    })

    it('should show resend option when the timer runs out', () => {
      jest.useFakeTimers()
      component.timeLeft = 1
      component.startTimer()
      jest.advanceTimersByTime(1000)
      expect(component.timeLeft).toBe(0)
      expect(component.showResendOTP).toBe(false)
      jest.advanceTimersByTime(1000)
      expect(component.showResendOTP).toBe(true)
    })
  })

  describe('handleVerifyOTP', () => {
    it('should verify email OTP when type is email', () => {
      const emailSpy = jest.spyOn(component, 'verifyEmailOTP').mockImplementation(() => undefined)
      const mobileSpy = jest.spyOn(component, 'verifyMobileOTP').mockImplementation(() => undefined)
      component.handleVerifyOTP()
      expect(emailSpy).toHaveBeenCalled()
      expect(mobileSpy).not.toHaveBeenCalled()
    })

    it('should verify mobile OTP when type is not email', () => {
      component.data.type = 'phone'
      const emailSpy = jest.spyOn(component, 'verifyEmailOTP').mockImplementation(() => undefined)
      const mobileSpy = jest.spyOn(component, 'verifyMobileOTP').mockImplementation(() => undefined)
      component.handleVerifyOTP()
      expect(mobileSpy).toHaveBeenCalled()
      expect(emailSpy).not.toHaveBeenCalled()
    })
  })

  describe('verifyEmailOTP', () => {
    it('should close the dialog and emit the token on success', () => {
      otpService.verifyEmailOTPV4.mockReturnValue(of({ result: { contextToken: 'tok' } }))
      const emitSpy = jest.spyOn(component.otpVerified, 'emit')
      component.otpEntered = '1234'

      component.verifyEmailOTP()

      expect(otpService.verifyEmailOTPV4).toHaveBeenCalledWith('1234', 'user@example.com', {
        apiConfig: { base: 'cfg' },
        urlConfigPath: 'otpV3Verify',
        defaultUrl: '',
      })
      expect(matSnackBar.open).toHaveBeenCalledWith('t:OTPSentSuccess')
      expect(dialogRef.close).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith({ type: 'email', token: 'tok', otp: '1234' })
    })

    it('should show the server error message on failure', () => {
      otpService.verifyEmailOTPV4.mockReturnValue(throwError({ ok: false, error: { params: { errmsg: 'Invalid OTP' } } }))
      component.verifyEmailOTP()
      expect(matSnackBar.open).toHaveBeenCalledWith('Invalid OTP')
      expect(dialogRef.close).toHaveBeenCalled()
    })

    it('should fall back to the default error message', () => {
      otpService.verifyEmailOTPV4.mockReturnValue(throwError({ ok: false }))
      component.verifyEmailOTP()
      expect(matSnackBar.open).toHaveBeenCalledWith('t:OTPVerifyFailed')
    })

    it('should do nothing when the error response is ok', () => {
      otpService.verifyEmailOTPV4.mockReturnValue(throwError({ ok: true }))
      component.verifyEmailOTP()
      expect(matSnackBar.open).not.toHaveBeenCalled()
      expect(dialogRef.close).not.toHaveBeenCalled()
    })
  })

  describe('verifyMobileOTP', () => {
    it('should close the dialog and emit on success', () => {
      otpService.verifyOTPV4.mockReturnValue(of({}))
      const emitSpy = jest.spyOn(component.otpVerified, 'emit')
      component.otpEntered = '5678'

      component.verifyMobileOTP()

      expect(otpService.verifyOTPV4).toHaveBeenCalledWith('5678', 'user@example.com', expect.any(Object))
      expect(matSnackBar.open).toHaveBeenCalledWith('t:OTPSentSuccess')
      expect(dialogRef.close).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith({ type: 'mobile', otp: '5678' })
    })

    it('should show the server error message on failure', () => {
      otpService.verifyOTPV4.mockReturnValue(throwError({ ok: false, error: { params: { errmsg: 'Expired' } } }))
      component.verifyMobileOTP()
      expect(matSnackBar.open).toHaveBeenCalledWith('Expired')
      expect(dialogRef.close).toHaveBeenCalled()
    })

    it('should fall back to the default error message', () => {
      otpService.verifyOTPV4.mockReturnValue(throwError({ ok: false }))
      component.verifyMobileOTP()
      expect(matSnackBar.open).toHaveBeenCalledWith('t:OTPVerifyFailed')
    })

    it('should do nothing when the error response is ok', () => {
      otpService.verifyOTPV4.mockReturnValue(throwError({ ok: true }))
      component.verifyMobileOTP()
      expect(matSnackBar.open).not.toHaveBeenCalled()
    })
  })

  it('handleResendOTP should reset the timer and emit the dialog data', () => {
    const timerSpy = jest.spyOn(component, 'startTimer').mockImplementation(() => undefined)
    const emitSpy = jest.spyOn(component.resendOTP, 'emit')
    component.timeLeft = 0
    component.showResendOTP = true

    component.handleResendOTP()

    expect(component.timeLeft).toBe(150)
    expect(component.showResendOTP).toBe(false)
    expect(timerSpy).toHaveBeenCalled()
    expect(emitSpy).toHaveBeenCalledWith(dialogData)
  })

  it('handleCloseModal should close the dialog', () => {
    component.handleCloseModal()
    expect(dialogRef.close).toHaveBeenCalled()
  })

  it('handleTranslateTo should delegate to UserProfileService', () => {
    expect(component.handleTranslateTo('key')).toBe('t:key')
    expect(userProfileService.handleTranslateTo).toHaveBeenCalledWith('key')
  })

  it('getConfigDetails should build config from apiConfig', () => {
    expect(component.getConfigDetails('someKey')).toEqual({
      apiConfig: { base: 'cfg' },
      urlConfigPath: 'someKey',
      defaultUrl: '',
    })
  })

  it('ngOnDestroy should clear the interval', () => {
    const clearSpy = jest.spyOn(global, 'clearInterval')
    component.interval = 42
    component.ngOnDestroy()
    expect(clearSpy).toHaveBeenCalledWith(42)
  })
})
