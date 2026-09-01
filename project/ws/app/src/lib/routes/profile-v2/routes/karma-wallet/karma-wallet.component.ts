import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { EventService, WsEvents } from '@sunbird-cb/utils-v2'
import { NoopScrollStrategy } from '@angular/cdk/overlay'
import { KarmaCoinsInfoDialogComponent } from './karma-coins-info-dialog.component'
import { KarmaRedeemDialogComponent } from './karma-redeem-dialog.component'
import {
  IKarmaCoinTransaction,
  IKarmaCoinTxnGroup,
  IKarmaRedeemInfo,
  IKarmaWalletPeriodOption,
  IKarmaWalletSummary,
  IKarmaWalletTab,
  TKarmaWalletPeriod,
} from './karma-wallet.model'
import { KarmaWalletService } from './karma-wallet.service'

const ICON_BASE = '/assets/icons/karmawallet-v2'

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/* Full names for the conversion card's footnote; the short set above labels the history groups */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

@Component({
  selector: 'ws-app-karma-wallet',
  templateUrl: './karma-wallet.component.html',
  styleUrls: ['./karma-wallet.component.scss'],
  standalone: false,
})
export class KarmaWalletComponent implements OnInit {

  /* Card icons, kept here so re-pointing the asset folder is a one-place change */
  readonly icons = {
    karmaCoin: `${ICON_BASE}/karmacoin.svg`,
    /* TODO: no karmawallet-v2 equivalent supplied yet, so this still resolves from home-v2 */
    karmaPoints: '/assets/icons/home-v2/karma-badge.svg',
  }

  readonly tabs: IKarmaWalletTab[] = [
    { value: 'all', label: 'All' },
    { value: 'earned', label: 'Earned' },
    { value: 'redeemed', label: 'Redeemed' },
  ]

  readonly periodOptions: IKarmaWalletPeriodOption[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'custom', label: 'Custom Date' },
  ]

  summary: IKarmaWalletSummary = {
    walletBalance: 0,
    totalSpent: 0,
    totalRedeemed: 0,
    unredeemedKarmaPoints: 0,
  }

  redeemInfo: IKarmaRedeemInfo = {
    conversionRate: 1,
    monthlyCap: 0,
    convertedThisMonth: 0,
    convertibleRemaining: 0,
    unconvertedBalance: 0,
  }

  activeTab: IKarmaWalletTab['value'] = 'all'
  activePeriod: TKarmaWalletPeriod = 'recent'
  groups: IKarmaCoinTxnGroup[] = []
  loading = true
  /* Anchor for the relative period ranges; overridable so tests are not clock-dependent */
  referenceDate = new Date()

  private transactions: IKarmaCoinTransaction[] = []
  /* Collapsed month keys, so a collapse survives a tab or sort change */
  private collapsedKeys = new Set<string>()

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private events: EventService,
    private karmaWalletSvc: KarmaWalletService,
  ) { }

  /**
   * Interact telemetry for this page. subType and module are plain strings on the contract, so
   * the ids below are descriptive rather than drawn from EnumInteractSubTypes, which has no
   * karma wallet members. The module is the existing KARMAPOINTS bucket.
   */
  private raiseTelemetry(id: string, subType: string) {
    this.events.raiseInteractTelemetry(
      {
        subType,
        id,
        type: WsEvents.EnumInteractTypes.CLICK,
      },
      {},
      {
        module: WsEvents.EnumTelemetrymodules.KARMAPOINTS,
        pageId: 'karma-wallet',
      }
    )
  }

  ngOnInit() {
    this.fetchWallet()
  }

  get activePeriodLabel(): string {
    const selected = this.periodOptions.find(option => option.value === this.activePeriod)
    return selected ? selected.label : ''
  }

  /* Calendar month the conversion figures belong to, e.g. 'August' */
  get currentMonthLabel(): string {
    return MONTH_NAMES[this.referenceDate.getMonth()]
  }

  /* Share of this month's cap already converted - what the card's orange bar fills to */
  get conversionProgress(): number {
    if (!this.redeemInfo.monthlyCap) {
      return 0
    }
    const ratio = this.redeemInfo.convertedThisMonth / this.redeemInfo.monthlyCap
    return Math.max(0, Math.min(100, ratio * 100))
  }

  get hasTransactions(): boolean {
    return this.groups.some(group => group.transactions.length > 0)
  }

  openKarmaCoinsInfo() {
    this.raiseTelemetry('karma-coins-info-open', 'karma-wallet-dialog')
    this.dialog.open(KarmaCoinsInfoDialogComponent, {
      width: '608px',
      maxWidth: '94vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'kci-dialog-panel',
      // Styled in karma-coins-info-dialog.component.scss. Naming a class here replaces the
      // CDK default cdk-overlay-dark-backdrop, so there is no competing rule to outrank.
      backdropClass: 'kci-dialog-backdrop',
      // Material's default block-scroll strategy takes the scrollbar out of 100vw, and the
      // shell sizes its content column from that unit - so the page behind slides ~8px left
      // while any dialog is open. Noop keeps the page still.
      scrollStrategy: new NoopScrollStrategy(),
    }).afterClosed().subscribe((closedVia: any) => {
      /* The dialog reports which control dismissed it; fall back if it closed some other way */
      this.raiseTelemetry(`karma-coins-info-close-${closedVia || 'dismiss'}`, 'karma-wallet-dialog')
    })
  }

  selectTab(tab: IKarmaWalletTab['value']) {
    if (this.activeTab === tab) {
      return
    }
    this.activeTab = tab
    this.raiseTelemetry(`coin-history-${tab}-tab`, 'coin-history-tab')
    this.buildGroups()
  }

  selectPeriod(period: TKarmaWalletPeriod) {
    if (this.activePeriod === period) {
      return
    }
    this.activePeriod = period
    this.raiseTelemetry(`coin-history-period-${period}`, 'coin-history-period')
    this.buildGroups()
  }

  toggleGroup(group: IKarmaCoinTxnGroup) {
    group.expanded = !group.expanded
    this.raiseTelemetry(
      `coin-history-month-${group.expanded ? 'expand' : 'collapse'}`, 'coin-history-month')
    if (group.expanded) {
      this.collapsedKeys.delete(group.key)
    } else {
      this.collapsedKeys.add(group.key)
    }
  }

  viewUnredeemedKarmaPoints() {
    this.raiseTelemetry('unredeemed-view-more', 'karma-wallet-link')
    /* `from` lets the karma points page show a trail back here; without it that page keeps
       whatever navigation it already had. */
    this.router.navigate(['/app/person-profile/karma-points'], {
      queryParams: { from: 'karma-wallet' },
    })
  }

  redeemKarmaPoints() {
    this.raiseTelemetry('redeem-karma-points-open', 'karma-wallet-dialog')
    this.dialog.open(KarmaRedeemDialogComponent, {
      width: '652px',
      maxWidth: '94vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'krd-dialog-panel',
      // Styled in karma-redeem-dialog.component.scss; replaces the CDK default backdrop class.
      backdropClass: 'krd-dialog-backdrop',
      // Only the Cancel button closes this dialog - no backdrop click, no Escape.
      disableClose: true,
      // Material's block-scroll strategy takes the scrollbar out of 100vw and the shell sizes
      // its content column from that unit, so the page behind would slide ~8px left.
      scrollStrategy: new NoopScrollStrategy(),
    }).afterClosed().subscribe((result: any) => {
      this.raiseTelemetry(
        `redeem-karma-points-close-${result && result.redeemed ? 'convert' : 'cancel'}`,
        'karma-wallet-dialog')
      /* TODO: refresh the summary and history from the API once redemption is wired up */
      if (result && result.redeemed) {
        this.fetchWallet()
      }
    })
  }

  /* Karma Tracks see-all, opened on the Providers tab */
  useKarmaCoins() {
    this.raiseTelemetry('use-karma-coins', 'karma-wallet-cta')
    this.router.navigate(['/app/seeAll'], {
      queryParams: { key: 'karmaTracks', tabSelected: 'Providers' },
    })
  }

  private fetchWallet() {
    this.loading = true
    this.karmaWalletSvc.getWalletSummary().subscribe(summary => {
      this.summary = summary
    })
    this.karmaWalletSvc.getRedeemInfo().subscribe(info => {
      this.redeemInfo = info
    })
    this.karmaWalletSvc.getTransactions().subscribe(transactions => {
      this.transactions = transactions || []
      this.buildGroups()
      this.loading = false
    })
  }

  /* Inclusive lower bound for the selected period, or null when everything qualifies */
  private periodStart(): Date | null {
    const ref = this.referenceDate
    const monthStart = (monthsBack: number) =>
      new Date(ref.getFullYear(), ref.getMonth() - monthsBack, 1)

    switch (this.activePeriod) {
      case 'currentMonth': return monthStart(0)
      case 'lastMonth': return monthStart(1)
      case 'last3Months': return monthStart(2)
      case 'last6Months': return monthStart(5)
      /* TODO: 'custom' needs its date-range picker; until then it filters nothing */
      default: return null
    }
  }

  /* Exclusive upper bound; only 'lastMonth' stops short of today */
  private periodEnd(): Date | null {
    if (this.activePeriod !== 'lastMonth') {
      return null
    }
    return new Date(this.referenceDate.getFullYear(), this.referenceDate.getMonth(), 1)
  }

  private withinPeriod(txn: IKarmaCoinTransaction): boolean {
    const start = this.periodStart()
    const end = this.periodEnd()
    if (!start && !end) {
      return true
    }
    const stamp = new Date(txn.date).getTime()
    if (start && stamp < start.getTime()) {
      return false
    }
    return !(end && stamp >= end.getTime())
  }

  private buildGroups() {
    const filtered = this.transactions
      .filter(txn => this.activeTab === 'all' || txn.type === this.activeTab)
      .filter(txn => this.withinPeriod(txn))

    const grouped = new Map<string, IKarmaCoinTxnGroup>()
    filtered.forEach(txn => {
      const date = new Date(txn.date)
      const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          label: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`,
          expanded: !this.collapsedKeys.has(key),
          transactions: [],
        })
      }
      const group = grouped.get(key)
      if (group) {
        group.transactions.push(txn)
      }
    })

    /* Always newest-first; the dropdown now narrows the period rather than flipping order */
    const groups = Array.from(grouped.values())
    groups.sort((a, b) => a.key < b.key ? 1 : (a.key > b.key ? -1 : 0))
    groups.forEach(group => {
      group.transactions.sort((a, b) => {
        const first = new Date(a.date).getTime()
        const second = new Date(b.date).getTime()
        return first < second ? 1 : (first > second ? -1 : 0)
      })
    })
    this.groups = groups
  }
}
