/**
 * ============================================================================================
 * DUMMY DATA - DELETE THIS FILE WHEN THE WALLET APIS GO LIVE
 * ============================================================================================
*/
import { defer, Observable, of, throwError } from 'rxjs'
import { delay } from 'rxjs/operators'
import {
  IKarmaCoinTransactionApi,
  IKarmaRedeemAcceptedResponse,
  IKarmaApiRejection,
  IKarmaRedeemRequest,
  IKarmaRedeemStatusResponse,
  IKarmaRedeemStatusResult,
  IKarmaTransactionsRequest,
  IKarmaTransactionsResponse,
  IKarmaWalletSummary,
  IKarmaWalletSummaryResponse,
  KARMA_CONVERSION_RATE,
} from './karma-wallet.model'

/* Stand-in for network latency, so loading states are exercised rather than skipped */
const MOCK_LATENCY_MS = 150
/* The redeem POST is the slower of the two, as a queue-and-publish round trip would be */
const MOCK_REDEEM_LATENCY_MS = 200

/* ------------------------------------------------------------------------------------------ *
 * The four endpoints
 *
 * Each is wrapped in `defer` so that, like an HTTP call, it is only computed on subscribe and
 * recomputed on every resubscribe - which is what lets the redeem status poll see a job move
 * from PROCESSING to SUCCESS.
 * ------------------------------------------------------------------------------------------ */

/* GET /v1/user/karma-wallet/summary */
export function mockWalletSummary(): Observable<IKarmaWalletSummaryResponse> {
  return defer(() => of(MOCK_SUMMARY_RESPONSE)).pipe(delay(MOCK_LATENCY_MS))
}

/* POST /v1/karma-wallet/transactions - or a 400-shaped rejection when the range is too wide */
export function mockTransactions(
  request: IKarmaTransactionsRequest): Observable<IKarmaTransactionsResponse> {
  return defer(() => {
    const body = (request && request.request) || { type: 'ALL' as const }
    const invalid = validateWindow(body.startDate, body.endDate)
    /* Shaped like an HttpErrorResponse, so the caller's error handling is the real one */
    return invalid
      ? throwError(() => ({ status: 400, error: invalid }))
      : of(mockTransactionsResponse(request))
  }).pipe(delay(MOCK_LATENCY_MS))
}

/* POST /v1/karma-wallet/redeem - 202, or a 400-shaped rejection on the error channel */
export function mockRedeem(
  request: IKarmaRedeemRequest): Observable<IKarmaRedeemAcceptedResponse> {
  return defer(() => queueRedeem(request)).pipe(delay(MOCK_REDEEM_LATENCY_MS))
}

/* GET /v1/karma-wallet/redeem/status/{requestId} */
export function mockRedeemStatus(requestId: string): Observable<IKarmaRedeemStatusResponse> {
  return defer(() => of(redeemStatusResponse(requestId))).pipe(delay(MOCK_LATENCY_MS))
}

/* ------------------------------------------------------------------------------------------ *
 * The figures
 * ------------------------------------------------------------------------------------------ */

/* Sample GET /v1/user/karma-wallet/summary response, verbatim */
const MOCK_SUMMARY_RESPONSE: IKarmaWalletSummaryResponse = {
  responseCode: 'OK',
  result: {
    walletBalance: 472,
    totalRedeemed: 849,
    totalEarnedTillDate: 1321,
    totalKarmaPoints: 2662,
    unredeemedKarmaPoints: 1341,
    yearMonth: '2026-08',
    monthlyCap: 300,
    convertedThisMonth: 120,
    convertibleThisMonth: 180,
    capResetsOn: '2026-09-01',
    redeemEnabled: true,
  },
}

/* Local noon, so no mock row can slip into the neighbouring month in a behind-UTC timezone */
const at = (year: number, monthIndex: number, day: number) =>
  new Date(year, monthIndex, day, 12).getTime()

/* Balance the newest transaction leaves behind - the summary's walletBalance */
const CLOSING_BALANCE = 472

/* Newest first, without balanceAfter: that is walked backwards from CLOSING_BALANCE below */
type TTransactionSeed = Pick<IKarmaCoinTransactionApi,
  'date' | 'type' | 'amount' | 'actionType' | 'contextType' | 'contextId' | 'addinfo'>

const AUGUST_SEEDS: TTransactionSeed[] = Array.from({ length: 12 }, (_unused, index) => {
  /* Alternating, so the history shows both directions and both addinfo shapes */
  const isCredit = index % 2 === 0
  return isCredit
    ? {
      date: at(2026, 7, 26 - index),
      type: 'CREDIT',
      amount: 40,
      actionType: 'EVENT_ATTENDANCE',
      contextType: 'EVENT',
      contextId: `evt_2026080${index}`,
      addinfo: JSON.stringify({ eventName: 'Karmayogi Talks — Evidence-based policy' }),
    } as TTransactionSeed
    : {
      date: at(2026, 7, 26 - index),
      type: 'DEBIT',
      amount: 40,
      actionType: 'COURSE_ENROLLMENT',
      contextType: 'MARKETPLACE_COURSE',
      contextId: `ext_114438406598230016${index}`,
      addinfo: JSON.stringify({
        courseName: 'Understanding AI from MIT',
        providerName: 'MIT OpenCourseWare',
      }),
    } as TTransactionSeed
})

const JULY_SEEDS: TTransactionSeed[] = [
  {
    date: at(2026, 6, 22),
    type: 'CREDIT',
    amount: 300,
    actionType: 'POINTS_REDEMPTION',
    contextType: 'POINTS_CONVERSION',
    contextId: 'req-abc123',
    addinfo: JSON.stringify({ pointsUsed: 300, ratio: '1:1' }),
  },
  {
    date: at(2026, 6, 14),
    type: 'DEBIT',
    amount: 250,
    actionType: 'COURSE_ENROLLMENT',
    contextType: 'MARKETPLACE_COURSE',
    contextId: 'ext_11443840659823001611',
    addinfo: JSON.stringify({
      courseName: 'Foundations of Public Policy',
      providerName: 'NIEPA',
    }),
  },
  {
    date: at(2026, 6, 3),
    type: 'CREDIT',
    amount: 120,
    actionType: 'COURSE_COMPLETION',
    contextType: 'COURSE',
    contextId: 'do_11394298933',
    addinfo: JSON.stringify({ courseName: 'Digital Governance for Civil Servants' }),
  },
]

/**
 * The full history, newest first, with a running balance: each row's balanceAfter is the one
 * before it, undone. So the newest lands on CLOSING_BALANCE and the column adds up.
 */
const MOCK_TRANSACTIONS: IKarmaCoinTransactionApi[] = (() => {
  let balance = CLOSING_BALANCE
  return [...AUGUST_SEEDS, ...JULY_SEEDS].map((seed, index) => {
    const row: IKarmaCoinTransactionApi = {
      ...seed,
      transactionId: `TXN-${`${27 - index}`.padStart(6, '0')}`,
      balanceAfter: balance,
    }
    balance = seed.type === 'CREDIT' ? balance - seed.amount : balance + seed.amount
    return row
  })
})()

/**
 * 'YYYY-MM-DD' to a local timestamp at the given time of day, or null when it is not a date.
 * Split rather than handed to `new Date(string)`: a date-only ISO string parses as UTC, which
 * would move the boundary by the timezone offset.
 */
function dayBoundary(day: string | undefined, endOfDay: boolean): number | null {
  const parts = (day || '').split('-')
  if (parts.length !== 3) {
    return null
  }
  const year = Number(parts[0])
  const month = Number(parts[1])
  const date = Number(parts[2])
  if (!year || !month || !date) {
    return null
  }
  return endOfDay
    ? new Date(year, month - 1, date, 23, 59, 59, 999).getTime()
    : new Date(year, month - 1, date).getTime()
}

/* How far back history may be asked for */
const LOOKBACK_YEARS = 1

/* One year back from the given moment - the earliest history may reach */
function lookbackFloor(from: number): number {
  const date = new Date(from)
  return new Date(
    date.getFullYear() - LOOKBACK_YEARS, date.getMonth(), date.getDate()).getTime()
}

/**
 * The server's range check. History is capped at one year, so a window reaching further back
 * than a year from today - or spanning more than a year in itself - is refused, not trimmed.
 */
function validateWindow(startDate?: string, endDate?: string): IKarmaApiRejection | null {
  const from = dayBoundary(startDate, false)
  if (from === null) {
    return null
  }

  const to = dayBoundary(endDate, true)
  const tooOld = from < lookbackFloor(Date.now())
  const tooWide = to !== null && from < lookbackFloor(to)

  return tooOld || tooWide
    ? rejection('HISTORY_RANGE_EXCEEDED', 'You can view history for up to the last 1 year only.')
    : null
}

/* Applies the request the way the server will: range check, then direction, then the window */
function mockTransactionsResponse(request: IKarmaTransactionsRequest): IKarmaTransactionsResponse {
  const body = (request && request.request) || { type: 'ALL' as const }
  const from = dayBoundary(body.startDate, false)
  const to = dayBoundary(body.endDate, true)

  const transactions = MOCK_TRANSACTIONS.filter(txn => {
    if (body.type !== 'ALL' && txn.type !== body.type) {
      return false
    }
    if (from !== null && txn.date < from) {
      return false
    }
    return !(to !== null && txn.date > to)
  })

  return { responseCode: 'OK', result: { transactions } }
}

/* ------------------------------------------------------------------------------------------ *
 * Mock redemption
 *
 * Kafka, a consumer and a wallet table stand in as a Map and a poll counter: a queued request
 * reports PROCESSING for a poll or two, then applies itself to the mocks above. That is what
 * makes the round trip real - convert, and the summary and the history genuinely move.
 * ------------------------------------------------------------------------------------------ */

/* Polls a queued request spends PROCESSING before the stand-in consumer commits it */
const MOCK_PROCESSING_POLLS = 2

interface IMockRedeemJob {
  pointsToConvert: number
  pollsLeft: number
  /* Set once the job reaches SUCCESS or FAILED; replayed from then on, so polling is idempotent */
  settled: IKarmaRedeemStatusResult | null
}

const REDEEM_JOBS = new Map<string, IMockRedeemJob>()

function rejection(err: string, errmsg: string): IKarmaApiRejection {
  return { responseCode: 'CLIENT_ERROR', params: { err, errmsg } }
}

/**
 * The server's pre-publish validation, mirrored: reject nothing-to-convert, then anything over
 * what the cap and the held balance jointly allow.
 */
function validateRedeem(points: number): IKarmaApiRejection | null {
  const summary = MOCK_SUMMARY_RESPONSE.result
  const convertible = Math.min(summary.convertibleThisMonth, summary.unredeemedKarmaPoints)

  if (!points || points <= 0) {
    return rejection('BAD_REQUEST', 'Enter the number of Karma Points you want to convert.')
  }
  if (points > convertible) {
    return rejection(
      'MONTHLY_CAP_EXCEEDED', `Only ${convertible} Karma Points can be converted this month`)
  }
  return null
}

function queueRedeem(request: IKarmaRedeemRequest): Observable<IKarmaRedeemAcceptedResponse> {
  const body = (request && request.request) || { pointsToConvert: 0, requestId: '' }
  const existing = REDEEM_JOBS.get(body.requestId)

  /* Idempotency: the same requestId is the same job, not a second conversion */
  if (existing) {
    return of({
      responseCode: 'ACCEPTED',
      result: { requestId: body.requestId, status: existing.settled ? existing.settled.status : 'PROCESSING' },
    } as IKarmaRedeemAcceptedResponse)
  }

  const invalid = validateRedeem(body.pointsToConvert)
  if (invalid) {
    /* Shaped like an HttpErrorResponse, so the caller's error handling is the real one */
    return throwError(() => ({ status: 400, error: invalid }))
  }

  REDEEM_JOBS.set(body.requestId, {
    pointsToConvert: body.pointsToConvert,
    pollsLeft: MOCK_PROCESSING_POLLS,
    settled: null,
  })

  return of({
    responseCode: 'ACCEPTED',
    result: { requestId: body.requestId, status: 'PROCESSING' },
  } as IKarmaRedeemAcceptedResponse)
}

function redeemStatusResponse(requestId: string): IKarmaRedeemStatusResponse {
  const job = REDEEM_JOBS.get(requestId)

  if (!job) {
    return {
      responseCode: 'OK',
      result: {
        requestId,
        status: 'FAILED',
        errorCode: 'REQUEST_NOT_FOUND',
        errorMessage: 'We could not find that conversion request.',
      },
    }
  }

  if (job.settled) {
    return { responseCode: 'OK', result: job.settled }
  }

  job.pollsLeft -= 1
  if (job.pollsLeft > 0) {
    return { responseCode: 'OK', result: { requestId, status: 'PROCESSING' } }
  }

  /* The consumer re-validates before writing, so a job queued against a stale read can still
     fail here rather than at the POST */
  const invalid = validateRedeem(job.pointsToConvert)
  if (invalid) {
    job.settled = {
      requestId,
      status: 'FAILED',
      errorCode: invalid.params.err,
      errorMessage: invalid.params.errmsg,
    }
    return { responseCode: 'OK', result: job.settled }
  }

  job.settled = {
    requestId,
    status: 'SUCCESS',
    transactionId: applyRedeemToMocks(requestId, job.pointsToConvert),
    pointsConverted: job.pointsToConvert,
  }
  return { responseCode: 'OK', result: job.settled }
}

/**
 * What the consumer would write: the wallet moves, the monthly cap tightens and the conversion
 * shows up at the head of the history. Mock-only - the real page just refetches both endpoints.
 */
function applyRedeemToMocks(requestId: string, points: number): string {
  const summary = MOCK_SUMMARY_RESPONSE.result
  const coins = Math.floor(points / (KARMA_CONVERSION_RATE || 1))

  summary.walletBalance += coins
  summary.totalEarnedTillDate += coins
  summary.unredeemedKarmaPoints -= points
  summary.convertedThisMonth += points
  summary.convertibleThisMonth -= points

  const transactionId = `TXN-${`${28 + REDEEM_JOBS.size}`.padStart(6, '0')}`
  MOCK_TRANSACTIONS.unshift({
    transactionId,
    date: Date.now(),
    type: 'CREDIT',
    amount: coins,
    balanceAfter: summary.walletBalance,
    actionType: 'POINTS_REDEMPTION',
    contextType: 'POINTS_CONVERSION',
    contextId: requestId,
    addinfo: JSON.stringify({ pointsUsed: points, ratio: `${KARMA_CONVERSION_RATE}:1` }),
  })

  return transactionId
}

/* Starting point of the mutable mock state, captured before anything can convert against it */
const INITIAL_SUMMARY: IKarmaWalletSummary = { ...MOCK_SUMMARY_RESPONSE.result }
const SEEDED_TRANSACTION_COUNT = MOCK_TRANSACTIONS.length

/**
 * Puts the mock wallet back to its starting point.
 *
 * Only the mocks hold state - a converted request moves the summary and adds a row - so specs
 * call this between tests to stay order-independent. It goes away with the mocks themselves.
 */
export function resetKarmaWalletMocks() {
  Object.assign(MOCK_SUMMARY_RESPONSE.result, INITIAL_SUMMARY)
  MOCK_TRANSACTIONS.splice(0, MOCK_TRANSACTIONS.length - SEEDED_TRANSACTION_COUNT)
  REDEEM_JOBS.clear()
}
