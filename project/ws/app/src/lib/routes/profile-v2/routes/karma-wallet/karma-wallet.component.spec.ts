import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { FormsModule } from '@angular/forms'
import { MatNativeDateModule } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatTooltipModule } from '@angular/material/tooltip'
import { EventService } from '@sunbird-cb/utils-v2'

import { KarmaWalletComponent } from './karma-wallet.component'
import { resetKarmaWalletMocks } from './karma-wallet.mock'
import { KarmaWalletService } from './karma-wallet.service'

/* The service answers on a 150ms delay, so every assertion on the table waits one hop. A tab
   or period change re-queries the API, which is why those need a second hop. */
const HOP = 200

describe('KarmaWalletComponent', () => {
  let component: KarmaWalletComponent
  let fixture: ComponentFixture<KarmaWalletComponent>
  const routerStub = { navigate: jest.fn() }
  const eventsStub = { raiseInteractTelemetry: jest.fn() }
  /* Stands in for the redeem dialog: opens, and closes with whatever the test hands it */
  let dialogResult: any
  const dialogStub = { open: jest.fn(() => ({ afterClosed: () => of(dialogResult) })) }
  const snackBarStub = { open: jest.fn() }

  beforeEach(async () => {
    /* A conversion moves the mock wallet, so every test starts from the same figures */
    resetKarmaWalletMocks()
    routerStub.navigate.mockClear()
    eventsStub.raiseInteractTelemetry.mockClear()
    dialogStub.open.mockClear()
    snackBarStub.open.mockClear()
    dialogResult = undefined
    await TestBed.configureTestingModule({
      declarations: [KarmaWalletComponent],
      imports: [
        HttpClientTestingModule, FormsModule, NoopAnimationsModule,
        MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatTooltipModule,
        /* Real datepicker modules, so the Custom Date pickers actually exist to be opened */
        MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule,
      ],
      providers: [
        KarmaWalletService,
        { provide: Router, useValue: routerStub },
        { provide: EventService, useValue: eventsStub },
        { provide: MatDialog, useValue: dialogStub },
        { provide: MatSnackBar, useValue: snackBarStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(KarmaWalletComponent)
    component = fixture.componentInstance
    /* Every acceptance criterion is written against 26 Aug 2026, and the mock history sits in
       Aug and Jul 2026. Pinned before the first change detection so even the initial load,
       which now carries a date window, is deterministic. */
    component.referenceDate = new Date(2026, 7, 26)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default to the All tab over the Recent period', () => {
    expect(component.activeTab).toBe('all')
    expect(component.activePeriod).toBe('recent')
    expect(component.activePeriodLabel).toBe('Recent')
  })

  it('should offer the six documented period options', () => {
    expect(component.periodOptions.map(o => o.label)).toEqual([
      'Recent', 'Current Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Custom Date',
    ])
  })

  it('should open on the Recent window, which is the last 30 days', done => {
    setTimeout(() => {
      /* 27 Jul - 26 Aug 2026 takes in the August rows but not the July ones */
      expect(component.groups.map(g => g.label)).toEqual(['AUG 2026'])
      expect(component.hasTransactions).toBe(true)
      done()
    }, HOP)
  })

  it('should keep only credits when the Earned tab is selected', done => {
    setTimeout(() => {
      component.selectTab('earned')
      setTimeout(() => {
        const shown = component.groups.reduce<number>((count, group) => count + group.transactions.length, 0)
        expect(shown).toBeGreaterThan(0)
        component.groups.forEach(group => {
          group.transactions.forEach(txn => expect(txn.type).toBe('earned'))
        })
        done()
      }, HOP)
    }, HOP)
  })

  it('should render an API row as title, description and a credit/debit split', done => {
    setTimeout(() => {
      /* Newest row: an event attendance credit, its balanceAfter the summary's walletBalance */
      const credit = component.groups[0].transactions[0]
      expect(credit.transactionId).toBe('TXN-000027')
      expect(credit.title).toBe('Event Attendance')
      expect(credit.description).toBe('Karmayogi Talks — Evidence-based policy')
      expect(credit.credit).toBe(40)
      expect(credit.debit).toBe(0)
      expect(credit.balance).toBe(472)

      /* The row below it is a marketplace debit, described from its addinfo */
      const debit = component.groups[0].transactions[1]
      expect(debit.title).toBe('Marketplace Course Purchase')
      expect(debit.description).toBe('Understanding AI from MIT — Provider: MIT OpenCourseWare')
      expect(debit.credit).toBe(0)
      expect(debit.debit).toBe(40)
      done()
    }, HOP)
  })

  it('should spell out a points conversion from its addinfo', done => {
    setTimeout(() => {
      /* The conversion sits in July, which the Recent window does not reach */
      component.selectPeriod('lastMonth')
      setTimeout(() => {
        const conversion = component.groups[0].transactions
          .find(txn => txn.title === 'Karma Points Redemption')
        expect(conversion).toBeTruthy()
        expect(conversion && conversion.description)
          .toBe('Converted 300 Karma Points to Karma Coins')
        done()
      }, HOP)
    }, HOP)
  })

  /* The anchor is already pinned in beforeEach; this restates it where a test reads clearer */
  const pinReference = () => { component.referenceDate = new Date(2026, 7, 26) }

  /* Each of these re-queries the API, so the labels are read after a second hop */
  const expectLabelsAfter = (
    act: () => void, labels: string[], done: jest.DoneCallback) => {
    setTimeout(() => {
      act()
      setTimeout(() => {
        expect(component.groups.map(g => g.label)).toEqual(labels)
        done()
      }, HOP)
    }, HOP)
  }

  it('should keep only the current month when Current Month is picked', done => {
    expectLabelsAfter(() => {
      pinReference()
      component.selectPeriod('currentMonth')
    }, ['AUG 2026'], done)
  })

  it('should keep only the previous month when Last Month is picked', done => {
    expectLabelsAfter(() => {
      pinReference()
      component.selectPeriod('lastMonth')
    }, ['JUL 2026'], done)
  })

  it('should stop before the current month over Last 3 Months', done => {
    /* AC-05.8: 1 May - 31 Jul 2026, so August is out entirely */
    expectLabelsAfter(() => {
      pinReference()
      component.selectPeriod('last3Months')
    }, ['JUL 2026'], done)
  })

  it('should stop before the current month over Last 6 Months', done => {
    /* AC-05.9: 1 Feb - 31 Jul 2026 */
    expectLabelsAfter(() => {
      pinReference()
      component.selectPeriod('last6Months')
    }, ['JUL 2026'], done)
  })

  it('should drop everything older than the window', done => {
    expectLabelsAfter(() => {
      /* Nudge the anchor forward so the mock history falls out of the current month */
      component.referenceDate = new Date(2026, 9, 20)
      component.selectPeriod('currentMonth')
    }, [], done)
  })

  it('should send the tab filter and the period window in the request body', done => {
    setTimeout(() => {
      const spy = jest.spyOn(TestBed.inject(KarmaWalletService), 'getTransactions')
      const lastBody = () => spy.mock.calls[spy.mock.calls.length - 1][0]
      pinReference()

      /* AC-05.5: Recent is the last 30 days through today */
      component.selectTab('redeemed')
      expect(lastBody()).toEqual({
        request: { startDate: '2026-07-27', endDate: '2026-08-26', type: 'DEBIT' },
      })

      /* AC-05.7: the whole previous month */
      component.selectPeriod('lastMonth')
      expect(lastBody()).toEqual({
        request: { startDate: '2026-07-01', endDate: '2026-07-31', type: 'DEBIT' },
      })

      /* AC-05.6: the 1st of this month through today */
      component.selectPeriod('currentMonth')
      expect(lastBody()).toEqual({
        request: { startDate: '2026-08-01', endDate: '2026-08-26', type: 'DEBIT' },
      })

      /* AC-05.8 and AC-05.9: whole months, both stopping before the current one */
      component.selectPeriod('last3Months')
      expect(lastBody()).toEqual({
        request: { startDate: '2026-05-01', endDate: '2026-07-31', type: 'DEBIT' },
      })

      component.selectPeriod('last6Months')
      expect(lastBody()).toEqual({
        request: { startDate: '2026-02-01', endDate: '2026-07-31', type: 'DEBIT' },
      })

      spy.mockRestore()
      done()
    }, HOP)
  })

  /* AC-05.10: month ends come from day 0 of the next month, which the calendar resolves */
  it('should resolve every month-end length, leap February included', done => {
    setTimeout(() => {
      const spy = jest.spyOn(TestBed.inject(KarmaWalletService), 'getTransactions')
      const endAfter = (anchor: Date) => {
        component.referenceDate = anchor
        /* Bounce off another period so each selection is a change */
        component.selectPeriod('recent')
        component.selectPeriod('lastMonth')
        const body = spy.mock.calls[spy.mock.calls.length - 1][0].request
        return body.endDate
      }

      /* 29 days: February 2024 is a leap year */
      expect(endAfter(new Date(2024, 2, 10))).toBe('2024-02-29')
      /* 28 days: February 2026 is not */
      expect(endAfter(new Date(2026, 2, 10))).toBe('2026-02-28')
      /* 30 and 31 day months */
      expect(endAfter(new Date(2026, 4, 10))).toBe('2026-04-30')
      expect(endAfter(new Date(2026, 5, 10))).toBe('2026-05-31')
      /* December of the year before, when the anchor is in January */
      expect(endAfter(new Date(2026, 0, 10))).toBe('2025-12-31')

      spy.mockRestore()
      done()
    }, HOP)
  })

  it('should keep a month collapsed across a tab change', done => {
    setTimeout(() => {
      const group = component.groups[0]
      component.toggleGroup(group)
      expect(group.expanded).toBe(false)

      component.selectTab('earned')
      setTimeout(() => {
        expect(component.groups[0].expanded).toBe(false)
        done()
      }, HOP)
    }, HOP)
  })

  it('should ignore a response that its own filter change has already superseded', done => {
    setTimeout(() => {
      /* Both land while the first is still in flight; only the last one may reach the table */
      component.selectTab('earned')
      component.selectTab('redeemed')

      setTimeout(() => {
        component.groups.forEach(group => {
          group.transactions.forEach(txn => expect(txn.type).toBe('redeemed'))
        })
        done()
      }, HOP)
    }, HOP)
  })

  it('should fill the conversion bar from the share of the cap already converted', done => {
    setTimeout(() => {
      /* summary: 120 of a 300 cap converted */
      expect(component.conversionProgress).toBe(40)
      expect(component.summary.convertibleThisMonth).toBe(180)
      done()
    }, 200)
  })

  it('should report zero progress rather than NaN when no cap is set', () => {
    component.summary = { ...component.summary, monthlyCap: 0, convertedThisMonth: 10 }
    expect(component.conversionProgress).toBe(0)
  })

  it('should report a failed summary call in the snackbar', done => {
    jest.spyOn(TestBed.inject(KarmaWalletService), 'getWalletSummary')
      .mockReturnValue(throwError(() => ({ status: 500, error: {} })))

    /* A fresh component, so the mocked failure is what its own ngOnInit meets */
    const failing = TestBed.createComponent(KarmaWalletComponent)
    failing.componentInstance.referenceDate = new Date(2026, 7, 26)
    failing.detectChanges()

    setTimeout(() => {
      expect(snackBarStub.open).toHaveBeenCalledWith(
        'We could not load your Karma Coin Wallet. Please try again.', 'X', { duration: 5000 })
      done()
    }, HOP)
  })

  it('should map the summary response onto the four cards', done => {
    setTimeout(() => {
      expect(component.summary.walletBalance).toBe(472)
      /* The Total Redeemed card counts points converted into coins, not coins spent */
      expect(component.summary.totalEarnedTillDate).toBe(1321)
      expect(component.summary.unredeemedKarmaPoints).toBe(1341)
      done()
    }, 200)
  })

  it('should label the conversion month from the summary, not the clock', done => {
    setTimeout(() => {
      /* summary yearMonth is 2026-08 whatever today happens to be */
      component.referenceDate = new Date(2027, 2, 9)
      expect(component.currentMonthLabel).toBe('August')
      done()
    }, 200)
  })

  it('should fall back to the anchor month before the summary loads', () => {
    component.referenceDate = new Date(2026, 10, 4)
    component.summary = { ...component.summary, yearMonth: '' }
    expect(component.currentMonthLabel).toBe('November')
  })

  /* What the page does with each way the redeem dialog can close */
  describe('after the redeem dialog closes', () => {

    const closeWith = (result: any, assert: () => void, done: jest.DoneCallback) => {
      setTimeout(() => {
        dialogResult = result
        const summarySpy = jest.spyOn(TestBed.inject(KarmaWalletService), 'getWalletSummary')
        const historySpy = jest.spyOn(TestBed.inject(KarmaWalletService), 'getTransactions')

        component.redeemKarmaPoints()

        expect(summarySpy.mock.calls.length).toBe(result && (result.redeemed || result.pending) ? 1 : 0)
        expect(historySpy.mock.calls.length).toBe(summarySpy.mock.calls.length)
        assert()
        done()
      }, HOP)
    }

    const lastTelemetryIds = () =>
      eventsStub.raiseInteractTelemetry.mock.calls.map((c: any[]) => c[0].id)

    it('should refetch the wallet once a conversion is confirmed', done => {
      closeWith({ redeemed: 50, received: 50, transactionId: 'TXN-000028' }, () => {
        expect(lastTelemetryIds()).toContain('redeem-karma-points-close-convert')
      }, done)
    })

    it('should refetch the wallet for a conversion that is still queued', done => {
      closeWith({ pending: true }, () => {
        expect(lastTelemetryIds()).toContain('redeem-karma-points-close-pending')
      }, done)
    })

    it('should leave the wallet alone when the dialog was simply dismissed', done => {
      closeWith(undefined, () => {
        expect(lastTelemetryIds()).toContain('redeem-karma-points-close-cancel')
      }, done)
    })
  })

  /* Custom Date, against AC-05.11 to AC-05.16 */
  describe('custom date range', () => {

    const lastBody = (spy: any) => spy.mock.calls[spy.mock.calls.length - 1][0].request

    it('should seed the range and open the calendar when Custom Date is picked', done => {
      setTimeout(() => {
        component.selectPeriod('custom')
        /* The fields sit behind an *ngIf; nothing renders them in a test but this */
        fixture.detectChanges()

        /* Seeded with the Recent window rather than two empty fields */
        expect(component.customStart).toEqual(new Date(2026, 6, 27))
        expect(component.customEnd).toEqual(new Date(2026, 7, 26))

        /* The component opens the calendar a tick later, once those fields exist */
        setTimeout(() => {
          expect(component.customStartPicker).toBeTruthy()
          expect(component.customStartPicker && component.customStartPicker.opened).toBe(true)
          done()
        }, 20)
      }, HOP)
    })

    it('should limit the calendar to the last year, ending today', () => {
      /* AC-05.12 and AC-05.13 */
      expect(component.minSelectableDate).toEqual(new Date(2025, 7, 26))
      expect(component.maxSelectableDate).toEqual(new Date(2026, 7, 26))
    })

    it('should refuse an end date earlier than the start date', done => {
      setTimeout(() => {
        component.selectPeriod('custom')
        const spy = jest.spyOn(TestBed.inject(KarmaWalletService), 'getTransactions')

        component.onCustomStartChange(new Date(2026, 7, 20))
        /* That start still pairs with the seeded end, so it queries; the inversion is next */
        const callsBefore = spy.mock.calls.length
        component.onCustomEndChange(new Date(2026, 7, 10))

        /* AC-05.14, to the letter */
        expect(component.customError).toBe('The end date cannot be earlier than the start date.')
        expect(component.hasTransactions).toBe(false)
        /* An inverted pair is never sent */
        expect(spy.mock.calls.length).toBe(callsBefore)

        spy.mockRestore()
        done()
      }, HOP)
    })

    it('should accept the same date at both ends as a one-day range', done => {
      setTimeout(() => {
        component.selectPeriod('custom')
        const spy = jest.spyOn(TestBed.inject(KarmaWalletService), 'getTransactions')

        /* AC-05.16 */
        component.onCustomStartChange(new Date(2026, 7, 20))
        component.onCustomEndChange(new Date(2026, 7, 20))

        expect(component.customError).toBe('')
        expect(lastBody(spy)).toEqual({
          startDate: '2026-08-20', endDate: '2026-08-20', type: 'ALL',
        })

        spy.mockRestore()
        done()
      }, HOP)
    })

    it('should clear the ordering complaint once the range is put right', done => {
      setTimeout(() => {
        component.selectPeriod('custom')
        component.onCustomStartChange(new Date(2026, 7, 20))
        component.onCustomEndChange(new Date(2026, 7, 10))
        expect(component.customError).not.toBe('')

        component.onCustomEndChange(new Date(2026, 7, 25))
        expect(component.customError).toBe('')
        done()
      }, HOP)
    })

    it('should surface the server refusing a range beyond the one-year lookback', done => {
      setTimeout(() => {
        component.selectPeriod('custom')
        /* AC-05.15: the calendar's bounds rule this out, so it is reached by submitting
           directly - and the server, not the client, is what refuses it */
        component.customStart = new Date(2024, 0, 1)
        component.onCustomEndChange(new Date(2026, 7, 26))

        setTimeout(() => {
          /* The refusal is reported in the snackbar and nowhere else */
          expect(snackBarStub.open).toHaveBeenCalledWith(
            'You can view history for up to the last 1 year only.', 'X', { duration: 5000 })
          expect(component.hasTransactions).toBe(false)
          done()
        }, HOP)
      }, HOP)
    })

    it('should keep answering later filter changes after a refused range', done => {
      setTimeout(() => {
        component.selectPeriod('custom')
        component.customStart = new Date(2024, 0, 1)
        component.onCustomEndChange(new Date(2026, 7, 26))

        setTimeout(() => {
          expect(snackBarStub.open).toHaveBeenCalled()

          /* The refusal must not have taken the request stream down with it */
          component.selectPeriod('lastMonth')
          setTimeout(() => {
            expect(component.groups.map(g => g.label)).toEqual(['JUL 2026'])
            done()
          }, HOP)
        }, HOP)
      }, HOP)
    })
  })

  it('should refuse to open the redeem dialog while redemption is switched off', done => {
    setTimeout(() => {
      component.summary = { ...component.summary, redeemEnabled: false }
      expect(component.canRedeem).toBe(false)

      component.redeemKarmaPoints()
      const ids = eventsStub.raiseInteractTelemetry.mock.calls.map((c: any[]) => c[0].id)
      expect(ids).not.toContain('redeem-karma-points-open')
      done()
    }, 200)
  })

  it('should source the coin icon from the karmawallet-v2 asset folder', () => {
    expect(component.icons.karmaCoin).toBe('/assets/icons/karmawallet-v2/karmacoin.svg')
  })

  it('should route to Karma Tracks providers from Use Your Karma Coins', () => {
    component.useKarmaCoins()
    expect(routerStub.navigate).toHaveBeenCalledWith(['/app/seeAll'], {
      queryParams: { key: 'karmaTracks', tabSelected: 'Providers' },
    })
  })

  it('should raise click telemetry under the karmapoints module', () => {
    component.useKarmaCoins()

    expect(eventsStub.raiseInteractTelemetry).toHaveBeenCalledWith(
      { type: 'click', subType: 'karma-wallet-cta', id: 'use-karma-coins' },
      {},
      { module: 'karmapoints', pageId: 'karma-wallet' },
    )
  })

  it('should raise telemetry for the history tabs and period filter', done => {
    setTimeout(() => {
      component.selectTab('earned')
      component.selectPeriod('lastMonth')

      const ids = eventsStub.raiseInteractTelemetry.mock.calls.map((c: any[]) => c[0].id)
      expect(ids).toContain('coin-history-earned-tab')
      expect(ids).toContain('coin-history-period-lastMonth')
      done()
    }, 200)
  })

  it('should distinguish expanding a month from collapsing it', done => {
    setTimeout(() => {
      const group = component.groups[0]
      component.toggleGroup(group)
      component.toggleGroup(group)

      const ids = eventsStub.raiseInteractTelemetry.mock.calls.map((c: any[]) => c[0].id)
      expect(ids).toContain('coin-history-month-collapse')
      expect(ids).toContain('coin-history-month-expand')
      done()
    }, 200)
  })

  it('should route to karma points from View More, flagging where it came from', () => {
    component.viewUnredeemedKarmaPoints()
    expect(routerStub.navigate).toHaveBeenCalledWith(['/app/person-profile/karma-points'], {
      queryParams: { from: 'karma-wallet' },
    })
  })
})
