/**
 * Contracts for the Karma Coin Wallet page.
 *
 * These mirror the shape the wallet APIs are expected to return, so swapping
 * `KarmaWalletService`'s mock responses for real HTTP calls needs no changes here
 * or in the component.
 */

export type TKarmaCoinTxnType = 'earned' | 'redeemed'

export interface IKarmaWalletSummary {
  /* Coins available to spend on marketplace courses */
  walletBalance: number
  /* Coins already spent on marketplace courses */
  totalSpent: number
  /* Karma Points that have been converted into Karma Coins */
  totalRedeemed: number
  /* Karma Points still waiting to be converted */
  unredeemedKarmaPoints: number
}

export interface IKarmaCoinTransaction {
  transactionId: string
  /* ISO date string */
  date: string
  /* Primary label, e.g. 'Event Attendance' */
  title: string
  /* Secondary label, e.g. 'Karmayogi Talks — Evidence-based policy' */
  description: string
  credit: number
  debit: number
  balance: number
  type: TKarmaCoinTxnType
}

export interface IKarmaCoinTxnGroup {
  /* Sort/group key, e.g. '2026-08' */
  key: string
  /* Display label, e.g. 'AUG 2026' */
  label: string
  expanded: boolean
  transactions: IKarmaCoinTransaction[]
}

/**
 * Coin History period filter. 'recent' is the unfiltered default; 'custom' opens a date range
 * the user picks themselves.
 */
export type TKarmaWalletPeriod =
  'recent' | 'currentMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'custom'

export interface IKarmaWalletPeriodOption {
  value: TKarmaWalletPeriod
  label: string
}

export interface IKarmaWalletTab {
  value: 'all' | TKarmaCoinTxnType
  label: string
}

export interface IKarmaRedeemInfo {
  /* Karma Points that convert into one Karma Coin */
  conversionRate: number
  /* Ceiling on how many Karma Points may be converted per calendar month */
  monthlyCap: number
  /* Already converted inside the current month */
  convertedThisMonth: number
  /* Still convertible before the monthly cap is reached */
  convertibleRemaining: number
  /*
   * Karma Points the user actually holds and has not converted yet. Independent of the cap:
   * a user can be under the monthly cap and still not hold enough points to convert.
   * The real limit is min(convertibleRemaining, unconvertedBalance).
   */
  unconvertedBalance: number
}
