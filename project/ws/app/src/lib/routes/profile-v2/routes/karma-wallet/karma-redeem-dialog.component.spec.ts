import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'

import { KarmaRedeemDialogComponent } from './karma-redeem-dialog.component'
import { KarmaWalletService } from './karma-wallet.service'

describe('KarmaRedeemDialogComponent', () => {
  let component: KarmaRedeemDialogComponent
  let fixture: ComponentFixture<KarmaRedeemDialogComponent>
  const dialogRefStub = { close: jest.fn() }

  beforeEach(async () => {
    dialogRefStub.close.mockClear()
    await TestBed.configureTestingModule({
      declarations: [KarmaRedeemDialogComponent],
      imports: [FormsModule, MatIconModule],
      providers: [
        KarmaWalletService,
        { provide: MatDialogRef, useValue: dialogRefStub },
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
      /* mock: 180 convertible of a 300 cap */
      expect(component.progressPercent).toBe(60)
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
      expect(component.amount).toBe(component.info.convertibleRemaining)
      expect(component.canConvert).toBe(true)

      component.toggleConvertAll(false)
      expect(component.amount).toBe(0)
      expect(component.canConvert).toBe(false)
      done()
    }, 200)
  })

  it('should close with the converted totals on Convert', done => {
    setTimeout(() => {
      component.onAmountChange(50)
      component.convert()
      expect(dialogRefStub.close).toHaveBeenCalledWith({ redeemed: 50, received: 50 })
      done()
    }, 200)
  })

  it('should not close on Convert while the amount is zero', () => {
    component.convert()
    expect(dialogRefStub.close).not.toHaveBeenCalled()
  })

  it('should close with no result on Cancel', () => {
    component.cancel()
    expect(dialogRefStub.close).toHaveBeenCalledWith()
  })

  /* The four conversion-limit scenarios, asserted against the exact copy */
  describe('conversion limits', () => {

    const withInfo = (over: Partial<typeof component.info>) => {
      component.info = {
        conversionRate: 1,
        monthlyCap: 300,
        convertedThisMonth: 120,
        convertibleRemaining: 180,
        unconvertedBalance: 1341,
        ...over,
      }
      /* Month labels come from the calendar, so pin the anchor into August 2026 */
      component.referenceDate = new Date(2026, 7, 15)
    }

    it('should block 400 when only 180 of the monthly cap is left', () => {
      withInfo({})
      component.onAmountChange(400)

      expect(component.amount).toBe(400)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe(
        'You can convert only 180 more Karma Points this month. The cap resets on 1 Sep.')
    })

    it('should block 200 when only 90 unconverted points are held', () => {
      withInfo({ unconvertedBalance: 90 })
      component.onAmountChange(200)

      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe('You have only 90 unconverted Karma Points available.')
    })

    it('should block everything once the full monthly cap is used', () => {
      withInfo({ convertedThisMonth: 300, convertibleRemaining: 0 })

      expect(component.isBlocked).toBe(true)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe(
        'You have used your full 300 Karma Point conversion limit for August. It resets on 1 Sep.')
    })

    it('should block everything when no unconverted points are held', () => {
      withInfo({ unconvertedBalance: 0 })

      expect(component.isBlocked).toBe(true)
      expect(component.canConvert).toBe(false)
      expect(component.errorMessage).toBe(
        'You do not have any unconverted Karma Points right now. Keep learning to earn more.')
    })

    it('should report the balance, not the cap, when the balance is the tighter ceiling', () => {
      withInfo({ unconvertedBalance: 90 })
      expect(component.maxConvertible).toBe(90)
    })

    it('should allow an amount within both ceilings', () => {
      withInfo({ unconvertedBalance: 90 })
      component.onAmountChange(90)

      expect(component.errorMessage).toBe('')
      expect(component.canConvert).toBe(true)
    })

    it('should fill convert-all to the tighter of the two ceilings', () => {
      withInfo({ unconvertedBalance: 90 })
      component.toggleConvertAll(true)

      expect(component.amount).toBe(90)
      expect(component.canConvert).toBe(true)
    })

    it('should keep an over-limit amount rather than silently clamping it', () => {
      withInfo({})
      component.onAmountChange(400)
      /* Clamping would hide the breach and the message could never appear */
      expect(component.amount).toBe(400)
    })

    it('should derive the month labels from the calendar', () => {
      withInfo({})
      expect(component.currentMonthLabel).toBe('August')
      expect(component.resetOnLabel).toBe('1 Sep')
    })

    it('should roll the reset into the next year from December', () => {
      withInfo({ convertibleRemaining: 0 })
      component.referenceDate = new Date(2026, 11, 20)

      expect(component.currentMonthLabel).toBe('December')
      expect(component.resetOnLabel).toBe('1 Jan')
      expect(component.errorMessage).toBe(
        'You have used your full 300 Karma Point conversion limit for December. It resets on 1 Jan.')
    })
  })
})
