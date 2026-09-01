import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { EventService } from '@sunbird-cb/utils-v2'

import { KarmaWalletComponent } from './karma-wallet.component'
import { KarmaWalletService } from './karma-wallet.service'

describe('KarmaWalletComponent', () => {
  let component: KarmaWalletComponent
  let fixture: ComponentFixture<KarmaWalletComponent>
  const routerStub = { navigate: jest.fn() }
  const eventsStub = { raiseInteractTelemetry: jest.fn() }

  beforeEach(async () => {
    routerStub.navigate.mockClear()
    eventsStub.raiseInteractTelemetry.mockClear()
    await TestBed.configureTestingModule({
      declarations: [KarmaWalletComponent],
      imports: [MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatTooltipModule],
      providers: [
        KarmaWalletService,
        { provide: Router, useValue: routerStub },
        { provide: EventService, useValue: eventsStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(KarmaWalletComponent)
    component = fixture.componentInstance
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

  it('should group transactions by month, newest month first', done => {
    setTimeout(() => {
      expect(component.groups.length).toBe(2)
      expect(component.groups[0].label).toBe('AUG 2026')
      expect(component.groups[1].label).toBe('JUL 2026')
      expect(component.hasTransactions).toBe(true)
      done()
    }, 200)
  })

  it('should keep only credits when the Earned tab is selected', done => {
    setTimeout(() => {
      component.selectTab('earned')
      const shown = component.groups.reduce<number>((count, group) => count + group.transactions.length, 0)
      expect(shown).toBeGreaterThan(0)
      component.groups.forEach(group => {
        group.transactions.forEach(txn => expect(txn.type).toBe('earned'))
      })
      done()
    }, 200)
  })

  /* Mock data sits in Aug and Jul 2026, so the reference date is pinned into Aug 2026 */
  const pinReference = () => { component.referenceDate = new Date(2026, 7, 25) }

  it('should keep only the current month when Current Month is picked', done => {
    setTimeout(() => {
      pinReference()
      component.selectPeriod('currentMonth')
      expect(component.groups.map(g => g.label)).toEqual(['AUG 2026'])
      done()
    }, 200)
  })

  it('should keep only the previous month when Last Month is picked', done => {
    setTimeout(() => {
      pinReference()
      component.selectPeriod('lastMonth')
      expect(component.groups.map(g => g.label)).toEqual(['JUL 2026'])
      done()
    }, 200)
  })

  it('should span both months over Last 3 Months, newest first', done => {
    setTimeout(() => {
      pinReference()
      component.selectPeriod('last3Months')
      expect(component.groups.map(g => g.label)).toEqual(['AUG 2026', 'JUL 2026'])
      done()
    }, 200)
  })

  it('should drop everything older than the window', done => {
    setTimeout(() => {
      /* Jump the anchor forward a year so nothing in the mock data qualifies */
      component.referenceDate = new Date(2027, 7, 25)
      component.selectPeriod('currentMonth')
      expect(component.hasTransactions).toBe(false)
      done()
    }, 200)
  })

  it('should filter nothing for Custom Date until its picker exists', done => {
    setTimeout(() => {
      pinReference()
      component.selectPeriod('custom')
      expect(component.groups.map(g => g.label)).toEqual(['AUG 2026', 'JUL 2026'])
      done()
    }, 200)
  })

  it('should keep a month collapsed across a tab change', done => {
    setTimeout(() => {
      const group = component.groups[0]
      component.toggleGroup(group)
      expect(group.expanded).toBe(false)

      component.selectTab('earned')
      expect(component.groups[0].expanded).toBe(false)
      done()
    }, 200)
  })

  it('should fill the conversion bar from the share of the cap already converted', done => {
    setTimeout(() => {
      /* mock: 120 of a 300 cap converted */
      expect(component.conversionProgress).toBe(40)
      expect(component.redeemInfo.convertibleRemaining).toBe(180)
      done()
    }, 200)
  })

  it('should report zero progress rather than NaN when no cap is set', () => {
    component.redeemInfo = { ...component.redeemInfo, monthlyCap: 0, convertedThisMonth: 10 }
    expect(component.conversionProgress).toBe(0)
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
