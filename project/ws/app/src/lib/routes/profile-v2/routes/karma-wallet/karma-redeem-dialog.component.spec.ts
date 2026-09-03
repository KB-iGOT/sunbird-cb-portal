import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatIconModule } from '@angular/material/icon'

import { of, throwError } from 'rxjs'

import { KarmaRedeemDialogComponent } from './karma-redeem-dialog.component'
import { EMPTY_KARMA_WALLET_SUMMARY, IKarmaRedeemStatusResult, newRequestId } from './karma-wallet.model'
import { resetKarmaWalletMocks } from './karma-wallet.mock'
import { KarmaWalletService } from './karma-wallet.service'

describe('KarmaRedeemDialogComponent', () => {
  let component: KarmaRedeemDialogComponent
  let fixture: ComponentFixture<KarmaRedeemDialogComponent>
  const dialogRefStub = { close: jest.fn() }
  const snackBarStub = { open: jest.fn() }

  beforeEach(async () => {
    /* A conversion moves the mock wallet, so every test starts from the same figures */
    resetKarmaWalletMocks()
    dialogRefStub.close.mockClear()
    snackBarStub.open.mockClear()
    await TestBed.configureTestingModule({
      declarations: [KarmaRedeemDialogComponent],
      imports: [HttpClientTestingModule, FormsModule, MatIconModule],
      providers: [
        KarmaWalletService,
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MatSnackBar, useValue: snackBarStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(KarmaRedeemDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should mint a well-formed, unique request id for each attempt', () => {
    const first = newRequestId()
    const second = newRequestId()

    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(second).not.toBe(first)
  })

  it('should source the convert icon from the karmawallet-v2 asset folder', () => {
    expect(component.icons.convert).toBe('/assets/icons/karmawallet-v2/convert.svg')
  })

  it('should start with nothing to convert, so Convert is unavailable', () => {
    expect(component.amount).toBe(0)
    expect(component.willReceive).toBe(0)
    expect(component.canConvert).toBe(false)
  })

  it('should show the remaining allowance as the progress fill', done => {
    setTimeout(() => {
      /* summary: 180 convertible of a 300 cap */
      expect(component.progressPercent).toBe(60)
      done()
    }, 200)
  })

  it('should take its cap, balance and reset date from the wallet summary', done => {
    setTimeout(() => {
      expect(component.summary.monthlyCap).toBe(300)
      expect(component.summary.convertibleThisMonth).toBe(180)
      expect(component.summary.unredeemedKarmaPoints).toBe(1341)
      expect(component.currentMonthLabel).toBe('August')
      expect(component.resetOnLabel).toBe('1 Sep')
      done()
    }, 200)
  })

  it('should keep an over-limit amount but refuse to convert it', done => {
    setTimeout(() => {
      /* No upper clamp: the breach has to survive so the limit message can explain it */
      component.onAmountChange(5000)
      expect(component.amount).toBe(5000)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).not.toBe('')
      done()
    }, 200)
  })

  it('should still correct a negative amount to zero', done => {
    setTimeout(() => {
      component.onAmountChange(-10)
      expect(component.amount).toBe(0)
      done()
    }, 200)
  })

  it('should ignore a non-numeric amount rather than produce NaN', done => {
    setTimeout(() => {
      component.onAmountChange('abc')
      expect(component.amount).toBe(0)
      done()
    }, 200)
  })

  it('should fill and clear the amount with the convert-all shortcut', done => {
    setTimeout(() => {
      component.toggleConvertAll(true)
      expect(component.amount).toBe(component.summary.convertibleThisMonth)
      expect(component.canConvert).toBe(true)

      component.toggleConvertAll(false)
      expect(component.amount).toBe(0)
      expect(component.canConvert).toBe(false)
      done()
    }, 200)
  })

  it('should close with the converted totals once the conversion is confirmed', done => {
    setTimeout(() => {
      /* The mock spends a poll in PROCESSING, so a tight interval keeps the test quick */
      component.pollIntervalMs = 20
      component.onAmountChange(50)
      component.convert()

      /* It must not close on the 202 alone - nothing has been written at that point */
      expect(dialogRefStub.close).not.toHaveBeenCalled()
      expect(component.isSubmitting).toBe(true)

      setTimeout(() => {
        const closedWith = dialogRefStub.close.mock.calls[0][0]
        expect(closedWith.redeemed).toBe(50)
        expect(closedWith.received).toBe(50)
        /* The id is minted by the conversion, so only its presence can be asserted */
        expect(typeof closedWith.transactionId).toBe('string')
        expect(closedWith.transactionId.length).toBeGreaterThan(0)
        done()
      }, 900)
    }, 200)
  })

  it('should surface the rejection wording when the request is refused outright', done => {
    setTimeout(() => {
      const service = TestBed.inject(KarmaWalletService)
      jest.spyOn(service, 'redeem').mockReturnValue(throwError(() => ({
        status: 400,
        error: {
          responseCode: 'CLIENT_ERROR',
          params: { err: 'MONTHLY_CAP_EXCEEDED', errmsg: 'Only 180 Karma Points can be converted this month' },
        },
      })))

      component.onAmountChange(50)
      component.convert()

      setTimeout(() => {
        /* The server's wording goes to the snackbar, not into the form */
        expect(snackBarStub.open).toHaveBeenCalledWith(
          'Only 180 Karma Points can be converted this month', 'X', { duration: 5000 })
        expect(component.errorMessage).toBe('')
        /* And the form is editable again, so the amount can be corrected */
        expect(component.isSubmitting).toBe(false)
        expect(component.canConvert).toBe(true)
        expect(dialogRefStub.close).not.toHaveBeenCalled()
        done()
      }, 50)
    }, 200)
  })

  it('should surface the wording of a conversion that fails after it was accepted', done => {
    setTimeout(() => {
      const service = TestBed.inject(KarmaWalletService)
      jest.spyOn(service, 'getRedeemStatus').mockReturnValue(of({
        requestId: 'req-1',
        status: 'FAILED',
        errorCode: 'MONTHLY_CAP_EXCEEDED',
        errorMessage: 'Only 180 Karma Points can be converted this month',
      } as IKarmaRedeemStatusResult))

      component.pollIntervalMs = 20
      component.onAmountChange(50)
      component.convert()

      setTimeout(() => {
        expect(snackBarStub.open).toHaveBeenCalledWith(
          'Only 180 Karma Points can be converted this month', 'X', { duration: 5000 })
        expect(component.isSubmitting).toBe(false)
        expect(dialogRefStub.close).not.toHaveBeenCalled()
        done()
      }, 400)
    }, 200)
  })

  it('should stop polling and report a conversion still queued as pending', done => {
    setTimeout(() => {
      const service = TestBed.inject(KarmaWalletService)
      jest.spyOn(service, 'getRedeemStatus').mockReturnValue(of({
        requestId: 'req-1',
        status: 'PROCESSING',
      } as IKarmaRedeemStatusResult))

      component.pollIntervalMs = 10
      component.pollLimit = 3
      component.onAmountChange(50)
      component.convert()

      setTimeout(() => {
        /* Reaching 'pending' at all means the poll limit was hit and polling stopped. The
           spy's call count is not the poll count: repeat resubscribes to the observable it
           already returned rather than asking for another one. */
        expect(component.submitState).toBe('pending')
        expect(component.pendingNote).not.toBe('')
        expect(component.canConvert).toBe(false)

        /* Closing a pending conversion tells the page behind to refresh anyway */
        component.cancel()
        expect(dialogRefStub.close).toHaveBeenCalledWith({ pending: true })
        done()
      }, 800)
    }, 200)
  })

  it('should fall back to its own wording when a failure carries none', done => {
    setTimeout(() => {
      const service = TestBed.inject(KarmaWalletService)
      jest.spyOn(service, 'redeem').mockReturnValue(throwError(() => ({ status: 500, error: {} })))

      component.onAmountChange(50)
      component.convert()

      setTimeout(() => {
        expect(snackBarStub.open).toHaveBeenCalledWith(
          'We could not convert your Karma Points. Please try again.', 'X', { duration: 5000 })
        done()
      }, 50)
    }, 200)
  })

  it('should report a failed summary call in the snackbar', done => {
    const service = TestBed.inject(KarmaWalletService)
    jest.spyOn(service, 'getWalletSummary')
      .mockReturnValue(throwError(() => ({ status: 500, error: {} })))

    /* A fresh dialog, so the mocked failure is what its own ngOnInit meets */
    const failing = TestBed.createComponent(KarmaRedeemDialogComponent)
    failing.detectChanges()

    setTimeout(() => {
      expect(snackBarStub.open).toHaveBeenCalledWith(
        'We could not load your conversion limit. Please try again.', 'X', { duration: 5000 })
      expect(failing.componentInstance.loading).toBe(false)
      done()
    }, 200)
  })

  it('should not submit on Convert while the amount is zero', () => {
    const service = TestBed.inject(KarmaWalletService)
    const spy = jest.spyOn(service, 'redeem')

    component.convert()

    expect(spy).not.toHaveBeenCalled()
    expect(dialogRefStub.close).not.toHaveBeenCalled()
  })

  it('should close with no result on Cancel', () => {
    component.cancel()
    expect(dialogRefStub.close).toHaveBeenCalledWith()
  })

  /* The four conversion-limit scenarios, asserted against the exact copy */
  describe('conversion limits', () => {

    const withSummary = (over: Partial<typeof component.summary>) => {
      component.summary = {
        ...EMPTY_KARMA_WALLET_SUMMARY,
        monthlyCap: 300,
        convertedThisMonth: 120,
        convertibleThisMonth: 180,
        unredeemedKarmaPoints: 1341,
        yearMonth: '2026-08',
        capResetsOn: '2026-09-01',
        redeemEnabled: true,
        ...over,
      }
      /* Labels fall back to the calendar only when the summary omits its dates */
      component.referenceDate = new Date(2026, 7, 15)
      component.loading = false
    }

    it('should block 400 when only 180 of the monthly cap is left', () => {
      withSummary({})
      component.onAmountChange(400)

      expect(component.amount).toBe(400)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe(
        'You can convert only 180 more Karma Points this month. The cap resets on 1 Sep.')
    })

    it('should block 200 when only 90 unconverted points are held', () => {
      withSummary({ unredeemedKarmaPoints: 90 })
      component.onAmountChange(200)

      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe('You have only 90 unconverted Karma Points available.')
    })

    it('should block everything once the full monthly cap is used', () => {
      withSummary({ convertedThisMonth: 300, convertibleThisMonth: 0 })

      expect(component.isBlocked).toBe(true)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe(
        'You have used your full 300 Karma Point conversion limit for August. It resets on 1 Sep.')
    })

    it('should block everything when no unconverted points are held', () => {
      withSummary({ unredeemedKarmaPoints: 0 })

      expect(component.isBlocked).toBe(true)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe(
        'You do not have any unconverted Karma Points right now. Keep learning to earn more.')
    })

    it('should report the balance, not the cap, when the balance is the tighter ceiling', () => {
      withSummary({ unredeemedKarmaPoints: 90 })
      expect(component.maxConvertible).toBe(90)
    })

    it('should allow an amount within both ceilings', () => {
      withSummary({ unredeemedKarmaPoints: 90 })
      component.onAmountChange(90)

      expect(component.errorMessage).toBe('')
      expect(component.canConvert).toBe(true)
    })

    it('should fill convert-all to the tighter of the two ceilings', () => {
      withSummary({ unredeemedKarmaPoints: 90 })
      component.toggleConvertAll(true)

      expect(component.amount).toBe(90)
      expect(component.canConvert).toBe(true)
    })

    it('should keep an over-limit amount rather than silently clamping it', () => {
      withSummary({})
      component.onAmountChange(400)
      /* Clamping would hide the breach and the message could never appear */
      expect(component.amount).toBe(400)
    })

    it('should derive the month labels from the summary', () => {
      withSummary({})
      expect(component.currentMonthLabel).toBe('August')
      expect(component.resetOnLabel).toBe('1 Sep')
    })

    it('should roll the reset into the next year from December', () => {
      withSummary({ convertibleThisMonth: 0, yearMonth: '2026-12', capResetsOn: '2027-01-01' })

      expect(component.currentMonthLabel).toBe('December')
      expect(component.resetOnLabel).toBe('1 Jan')
      expect(component.errorMessage).toBe(
        'You have used your full 300 Karma Point conversion limit for December. It resets on 1 Jan.')
    })

    it('should fall back to the calendar when the summary carries no dates', () => {
      withSummary({ convertibleThisMonth: 0, yearMonth: '', capResetsOn: '' })
      component.referenceDate = new Date(2026, 11, 20)

      expect(component.currentMonthLabel).toBe('December')
      expect(component.resetOnLabel).toBe('1 Jan')
    })

    it('should block everything when the server has switched redemption off', () => {
      withSummary({ redeemEnabled: false })

      expect(component.isBlocked).toBe(true)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe(
        'Karma Point conversion is unavailable right now. Please try again later.')
    })
  })
})
