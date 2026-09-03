import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { MatDatepicker } from '@angular/material/datepicker'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EventService, WsEvents } from '@sunbird-cb/utils-v2'
import { NoopScrollStrategy } from '@angular/cdk/overlay'
import { of, Subject } from 'rxjs'
import { catchError, switchMap, takeUntil } from 'rxjs/operators'
import { KarmaCoinsInfoDialogComponent } from './karma-coins-info-dialog.component'
import { KarmaRedeemDialogComponent } from './karma-redeem-dialog.component'
import {
  EMPTY_KARMA_WALLET_SUMMARY,
  IKarmaCoinTransaction,
  IKarmaCoinTxnGroup,
  IKarmaTransactionsRequest,
  IKarmaWalletPeriodOption,
  IKarmaWalletSummary,
  IKarmaWalletTab,
  readApiError,
  TKarmaWalletPeriod,
} from './karma-wallet.model'
import { KarmaWalletService } from './karma-wallet.service'

const ICON_BASE = '/assets/icons/karmawallet-v2'

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/* Recent is a rolling window ending today; 30 days back from it is its start */
const RECENT_DAYS = 30

/* How far back the history APIs will look, and so how far back the calendar may go */
const LOOKBACK_YEARS = 1

const END_BEFORE_START = 'The end date cannot be earlier than the start date.'

/* Fallbacks for when a call fails without the server saying why */
const HISTORY_ERROR = 'We could not load your coin history. Please try again.'
const SUMMARY_ERROR = 'We could not load your Karma Coin Wallet. Please try again.'

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
export class KarmaWalletComponent implements OnInit, OnDestroy {

  /* Card icons, kept here so re-pointing the asset folder is a one-place change */
  readonly icons = {
    karmaCoin: `${ICON_BASE}/karmacoin.svg`,
    /* TODO: no karmawallet-v2 equivalent supplied yet, so this still resolves from home-v2 */
    karmaPoints: '/assets/icons/home-v2/karma-badge.svg',
  }

  /* The one place the tabs are mapped onto the transactions request's `type` filter */
  readonly tabs: IKarmaWalletTab[] = [
    { value: 'all', label: 'All', apiType: 'ALL' },
    { value: 'earned', label: 'Earned', apiType: 'CREDIT' },
    { value: 'redeemed', label: 'Redeemed', apiType: 'DEBIT' },
  ]

  readonly periodOptions: IKarmaWalletPeriodOption[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'custom', label: 'Custom Date' },
  ]

  /* Everything the page renders comes from the one summary response */
  summary: IKarmaWalletSummary = { ...EMPTY_KARMA_WALLET_SUMMARY }

  activeTab: IKarmaWalletTab['value'] = 'all'
  activePeriod: TKarmaWalletPeriod = 'recent'
  groups: IKarmaCoinTxnGroup[] = []
  loading = true

  /* Custom Date range. Both are picked from the calendar, so neither can be a malformed date */
  customStart: Date | null = null
  customEnd: Date | null = null
  /* Client-side complaint about the pair, e.g. an end date before the start. API failures do
     not land here - those go to the snackbar. */
  customError = ''

  @ViewChild('customStartPicker') customStartPicker?: MatDatepicker<Date>
  /* Anchor for the relative period ranges, and the fallback month label before the summary
     loads; overridable so tests are not clock-dependent */
  referenceDate = new Date()

  private transactions: IKarmaCoinTransaction[] = []
  /* Collapsed month keys, so a collapse survives a tab or sort change */
  private collapsedKeys = new Set<string>()
  /* Every tab or period change pushes a request here; switchMap keeps only the latest */
  private readonly historyRequest$ = new Subject<IKarmaTransactionsRequest>()
  private readonly destroy$ = new Subject<void>()

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private events: EventService,
    private karmaWalletSvc: KarmaWalletService,
    private snackBar: MatSnackBar,
  ) { }

  /* Every API failure on this page is reported here and nowhere else */
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

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
    this.fetchSummary()

    this.historyRequest$.pipe(
      /* switchMap, so a quick second tab or period change cannot be overtaken by the response
         to the first one and leave the table showing a filter the user has moved off */
      switchMap(request => this.karmaWalletSvc.getTransactions(request).pipe(
        /* Caught inside, so a rejected range cannot take the whole stream down with it and
           leave every later filter change unanswered */
        catchError(err => {
          this.openSnackbar(readApiError(err) || HISTORY_ERROR)
          return of([] as IKarmaCoinTransaction[])
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe(transactions => {
      this.transactions = transactions || []
      this.buildGroups()
      this.loading = false
    })

    this.fetchTransactions()
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get activePeriodLabel(): string {
    const selected = this.periodOptions.find(option => option.value === this.activePeriod)
    return selected ? selected.label : ''
  }

  /* Month the conversion figures belong to, e.g. 'August' - the API's yearMonth, not the clock */
  get currentMonthLabel(): string {
    const parts = (this.summary.yearMonth || '').split('-')
    const month = Number(parts[1])
    const index = parts.length === 2 && month >= 1 && month <= 12
      ? month - 1
      : this.referenceDate.getMonth()
    return MONTH_NAMES[index]
  }

  /* Share of this month's cap already converted - what the card's orange bar fills to */
  get conversionProgress(): number {
    if (!this.summary.monthlyCap) {
      return 0
    }
    const ratio = this.summary.convertedThisMonth / this.summary.monthlyCap
    return Math.max(0, Math.min(100, ratio * 100))
  }

  /* Conversion can be switched off server-side, which greys out Redeem Karma Points */
  get canRedeem(): boolean {
    return this.summary.redeemEnabled
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
      backdropClass: 'kci-dialog-backdrop',
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
    this.fetchTransactions()
  }

  selectPeriod(period: TKarmaWalletPeriod) {
    /* Re-picking Custom Date is how the calendar is reopened, so it is not a no-op */
    if (this.activePeriod === period) {
      if (period === 'custom') {
        this.openCustomStartPicker()
      }
      return
    }
    this.activePeriod = period
    this.raiseTelemetry(`coin-history-period-${period}`, 'coin-history-period')

    if (period === 'custom') {
      this.startCustomRange()
      return
    }

    this.customError = ''
    this.fetchTransactions()
  }

  /* Earliest date the calendar offers: history only reaches back a year */
  get minSelectableDate(): Date {
    const ref = this.referenceDate
    return new Date(ref.getFullYear() - LOOKBACK_YEARS, ref.getMonth(), ref.getDate())
  }

  /* Latest date the calendar offers - there is no history in the future */
  get maxSelectableDate(): Date {
    return this.referenceDate
  }

  onCustomStartChange(value: Date | null) {
    this.customStart = value
    this.applyCustomRange()
  }

  onCustomEndChange(value: Date | null) {
    this.customEnd = value
    this.applyCustomRange()
  }

  private startCustomRange() {
    if (!this.customStart || !this.customEnd) {
      const ref = this.referenceDate
      this.customStart = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - RECENT_DAYS)
      this.customEnd = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())
    }
    this.customError = ''
    this.fetchTransactions()
    this.openCustomStartPicker()
  }

  private openCustomStartPicker() {
    /* The fields sit behind an *ngIf, so they do not exist until this change is rendered */
    setTimeout(() => {
      if (this.customStartPicker) {
        this.customStartPicker.open()
      }
    })
  }

  private applyCustomRange() {
    if (!this.customStart || !this.customEnd) {
      this.customError = ''
      return
    }

    if (this.customEnd.getTime() < this.customStart.getTime()) {
      /* Same day at both ends is a valid one-day range; only a true inversion is refused */
      this.customError = END_BEFORE_START
      this.groups = []
      return
    }

    this.customError = ''
    this.raiseTelemetry('coin-history-period-custom-range', 'coin-history-period')
    this.fetchTransactions()
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
    if (!this.canRedeem) {
      return
    }
    this.raiseTelemetry('redeem-karma-points-open', 'karma-wallet-dialog')
    this.dialog.open(KarmaRedeemDialogComponent, {
      width: '652px',
      maxWidth: '94vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'krd-dialog-panel',
      backdropClass: 'krd-dialog-backdrop',
      disableClose: true,
      scrollStrategy: new NoopScrollStrategy(),
    }).afterClosed().subscribe((result: any) => {
      const outcome = result && result.redeemed
        ? 'convert'
        : (result && result.pending ? 'pending' : 'cancel')
      this.raiseTelemetry(`redeem-karma-points-close-${outcome}`, 'karma-wallet-dialog')
      if (outcome !== 'cancel') {
        this.fetchSummary()
        this.fetchTransactions()
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

  private fetchSummary() {
    this.karmaWalletSvc.getWalletSummary().pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: summary => {
        this.summary = summary
      },
      error: err => this.openSnackbar(readApiError(err) || SUMMARY_ERROR),
    })
  }

  /* Asks the API for the active tab over the active period */
  private fetchTransactions() {
    this.loading = true
    this.historyRequest$.next(this.transactionRequest())
  }

  private transactionRequest(): IKarmaTransactionsRequest {
    const tab = this.tabs.find(option => option.value === this.activeTab)
    return {
      request: {
        ...this.periodWindow(),
        type: tab ? tab.apiType : 'ALL',
      },
    }
  }

  private periodWindow(): { startDate?: string, endDate?: string } {
    const ref = this.referenceDate
    const monthStart = (monthsBack: number) =>
      new Date(ref.getFullYear(), ref.getMonth() - monthsBack, 1)
    /* Day 0 of a month is the last day of the one before it */
    const monthEnd = (monthsBack: number) =>
      new Date(ref.getFullYear(), ref.getMonth() - monthsBack + 1, 0)
    const window = (start: Date, end: Date) =>
      ({ startDate: this.toApiDate(start), endDate: this.toApiDate(end) })

    switch (this.activePeriod) {
      case 'currentMonth':
        return window(monthStart(0), ref)
      case 'lastMonth':
        return window(monthStart(1), monthEnd(1))
      case 'last3Months':
        return window(monthStart(3), monthEnd(1))
      case 'last6Months':
        return window(monthStart(6), monthEnd(1))
      case 'custom':
        return this.customStart && this.customEnd
          ? window(this.customStart, this.customEnd)
          : {}
      /* Recent: a rolling 30 days through today, both ends inclusive */
      default: {
        const start = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - RECENT_DAYS)
        return window(start, ref)
      }
    }
  }

  /* 'YYYY-MM-DD' from the local date parts - toISOString would shift the day westward */
  private toApiDate(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }

  /* Tab and period are applied by the API now, so this only groups what came back */
  private buildGroups() {
    const grouped = new Map<string, IKarmaCoinTxnGroup>()
    this.transactions.forEach(txn => {
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
      group.transactions.sort((a, b) => a.date < b.date ? 1 : (a.date > b.date ? -1 : 0))
    })
    this.groups = groups
  }
}
