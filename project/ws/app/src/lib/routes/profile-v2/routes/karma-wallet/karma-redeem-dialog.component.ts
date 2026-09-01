import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { IKarmaRedeemInfo } from './karma-wallet.model'
import { KarmaWalletService } from './karma-wallet.service'

const ICON_BASE = '/assets/icons/karmawallet-v2'

/* Fixed English names rather than toLocaleString, so the copy cannot shift with the runtime
   locale and the tests stay deterministic. */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

@Component({
  selector: 'ws-app-karma-redeem-dialog',
  templateUrl: './karma-redeem-dialog.component.html',
  styleUrls: ['./karma-redeem-dialog.component.scss'],
  // Needed to reach the Material dialog surface, which is this component's ancestor.
  // Every selector in the stylesheet is scoped under .krd or .krd-dialog-panel.
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class KarmaRedeemDialogComponent implements OnInit {

  readonly icons = {
    karmaCoin: `${ICON_BASE}/karmacoin.svg`,
    convert: `${ICON_BASE}/convert.svg`,
    /* TODO: no karmawallet-v2 equivalent supplied yet, so this still resolves from home-v2 */
    karmaPoints: '/assets/icons/home-v2/karma-badge.svg',
  }

  info: IKarmaRedeemInfo = {
    conversionRate: 1,
    monthlyCap: 0,
    convertedThisMonth: 0,
    convertibleRemaining: 0,
    unconvertedBalance: 0,
  }

  amount = 0
  convertAll = false
  loading = true
  /* Anchor for the month labels; overridable so tests are not clock-dependent */
  referenceDate = new Date()

  constructor(
    private dialogRef: MatDialogRef<KarmaRedeemDialogComponent>,
    private karmaWalletSvc: KarmaWalletService,
  ) { }

  ngOnInit() {
    this.karmaWalletSvc.getRedeemInfo().subscribe(info => {
      this.info = info
      this.loading = false
    })
  }

  /* Karma Coins the current amount would yield; coins are whole units */
  get willReceive(): number {
    const rate = this.info.conversionRate || 1
    return Math.floor(this.amount / rate)
  }

  /* Width of the orange fill: how much of the monthly cap is still convertible */
  get progressPercent(): number {
    if (!this.info.monthlyCap) {
      return 0
    }
    const ratio = this.info.convertibleRemaining / this.info.monthlyCap
    return Math.max(0, Math.min(100, ratio * 100))
  }

  /* Calendar month the cap currently applies to, e.g. 'August' */
  get currentMonthLabel(): string {
    return MONTH_NAMES[this.referenceDate.getMonth()]
  }

  /* First day of the following month, e.g. '1 Sep'. Rolls the year over in December. */
  get resetOnLabel(): string {
    const next = new Date(this.referenceDate.getFullYear(), this.referenceDate.getMonth() + 1, 1)
    return `1 ${MONTH_SHORT[next.getMonth()]}`
  }

  /* Two independent ceilings apply; the lower one is the real limit */
  get maxConvertible(): number {
    return Math.min(this.info.convertibleRemaining, this.info.unconvertedBalance)
  }

  /**
   * Non-empty when there is nothing to convert at all, whatever the user types. The input and
   * the Convert button are both disabled in this state.
   *
   * Zero balance is reported ahead of an exhausted cap: with no points held, the cap is moot
   * and "keep learning" is the actionable advice.
   */
  get blockedMessage(): string {
    if (this.info.unconvertedBalance <= 0) {
      return 'You do not have any unconverted Karma Points right now. Keep learning to earn more.'
    }
    if (this.info.convertibleRemaining <= 0) {
      return `You have used your full ${this.info.monthlyCap} Karma Point conversion limit`
        + ` for ${this.currentMonthLabel}. It resets on ${this.resetOnLabel}.`
    }
    return ''
  }

  get isBlocked(): boolean {
    return this.blockedMessage !== ''
  }

  /* Blocking state first, then whichever ceiling the typed amount actually breaches */
  get errorMessage(): string {
    if (this.isBlocked) {
      return this.blockedMessage
    }
    if (this.amount > this.maxConvertible) {
      /* Report the ceiling that binds - the balance when it is the tighter of the two */
      if (this.info.unconvertedBalance <= this.info.convertibleRemaining) {
        return `You have only ${this.info.unconvertedBalance} unconverted Karma Points available.`
      }
      return `You can convert only ${this.info.convertibleRemaining} more Karma Points this month.`
        + ` The cap resets on ${this.resetOnLabel}.`
    }
    return ''
  }

  get canConvert(): boolean {
    return !this.isBlocked && this.amount > 0 && this.amount <= this.maxConvertible
  }

  onAmountChange(value: any) {
    const parsed = Math.floor(Number(value))
    const safe = isNaN(parsed) ? 0 : parsed
    /* Deliberately not clamped to the ceiling: an over-limit amount has to survive so the
       matching message can be shown. Only negatives are corrected. */
    this.amount = Math.max(0, safe)
    /* Typing anything short of the full allowance clears the shortcut */
    this.convertAll = this.amount === this.maxConvertible && this.amount > 0
  }

  toggleConvertAll(checked: boolean) {
    this.convertAll = checked
    this.amount = checked ? this.maxConvertible : 0
  }

  /* TODO: POST the conversion once the API is available, then close with the result */
  convert() {
    if (!this.canConvert) {
      return
    }
    this.dialogRef.close({ redeemed: this.amount, received: this.willReceive })
  }

  cancel() {
    this.dialogRef.close()
  }
}
