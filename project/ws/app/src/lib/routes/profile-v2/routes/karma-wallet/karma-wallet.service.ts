import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'
import { IKarmaCoinTransaction, IKarmaRedeemInfo, IKarmaWalletSummary } from './karma-wallet.model'

/**
 * Karma Coin Wallet data source.
 *
 * The wallet APIs are not available yet, so both methods resolve mock payloads
 * that match the agreed response contracts. When the endpoints land, replace the
 * `of(...)` bodies with the corresponding `http.get()` calls - the component
 * consumes only the Observables and the interfaces, so nothing else has to change.
 */
@Injectable()
export class KarmaWalletService {

  /* TODO: replace with GET /apis/proxies/v8/karma/wallet/summary */
  getWalletSummary(): Observable<IKarmaWalletSummary> {
    return of(MOCK_SUMMARY).pipe(delay(150))
  }

  /* TODO: replace with GET /apis/proxies/v8/karma/wallet/transactions */
  getTransactions(): Observable<IKarmaCoinTransaction[]> {
    return of(MOCK_TRANSACTIONS).pipe(delay(150))
  }

  /* TODO: replace with GET /apis/proxies/v8/karma/wallet/redeem-info */
  getRedeemInfo(): Observable<IKarmaRedeemInfo> {
    return of(MOCK_REDEEM_INFO).pipe(delay(150))
  }
}

const MOCK_REDEEM_INFO: IKarmaRedeemInfo = {
  conversionRate: 1,
  monthlyCap: 300,
  convertedThisMonth: 120,
  convertibleRemaining: 180,
  /* Matches the wallet summary's unredeemed Karma Points */
  unconvertedBalance: 1341,
}

const MOCK_SUMMARY: IKarmaWalletSummary = {
  walletBalance: 492,
  totalSpent: 849,
  totalRedeemed: 1321,
  unredeemedKarmaPoints: 1341,
}

/* Twelve alternating credit/debit entries for Aug 2026, matching the design. */
const AUGUST_TRANSACTIONS: IKarmaCoinTransaction[] = Array.from({ length: 12 }, (_unused, index) => {
  const isCredit = index % 2 === 0
  return {
    transactionId: 'TXN-000027',
    date: '2026-08-27',
    title: 'Event Attendance',
    description: 'Karmayogi Talks — Evidence-based policy',
    credit: isCredit ? 40 : 0,
    debit: isCredit ? 0 : 40,
    balance: 99999,
    type: isCredit ? 'earned' : 'redeemed',
  } as IKarmaCoinTransaction
})

const JULY_TRANSACTIONS: IKarmaCoinTransaction[] = [
  {
    transactionId: 'TXN-000021',
    date: '2026-07-22',
    title: 'Karma Points Redemption',
    description: 'Converted 500 Karma Points to Karma Coins',
    credit: 500,
    debit: 0,
    balance: 99959,
    type: 'earned',
  },
  {
    transactionId: 'TXN-000018',
    date: '2026-07-14',
    title: 'Marketplace Course Purchase',
    description: 'Foundations of Public Policy — Provider: NIEPA',
    credit: 0,
    debit: 250,
    balance: 99459,
    type: 'redeemed',
  },
  {
    transactionId: 'TXN-000012',
    date: '2026-07-03',
    title: 'Course Completion',
    description: 'Digital Governance for Civil Servants',
    credit: 120,
    debit: 0,
    balance: 99709,
    type: 'earned',
  },
]

const MOCK_TRANSACTIONS: IKarmaCoinTransaction[] = [...AUGUST_TRANSACTIONS, ...JULY_TRANSACTIONS]
