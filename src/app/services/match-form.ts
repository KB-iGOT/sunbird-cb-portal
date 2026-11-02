import _ from 'lodash'

/**
 * Client-side form selection against the formsConfig catalogue
 * (GET /apis/proxies/v8/formsConfig/v1/readFormDetails).
 *
 * Pure functions, no Angular — see match-form.spec.ts for the contract.
 */

export interface IFormCatalogEntry {
  id: number
  name: string
  type?: string
  subType: string
  clientVersion: number
  criteria?: { [key: string]: any } | null
}

export interface IFormCatalog {
  rulePriority: string[]
  userFields: { [criteriaKey: string]: string }
  valuePriority?: { [criteriaKey: string]: string[] }
  forms: { [role: string]: { [portal: string]: IFormCatalogEntry[] } }
}

export interface IFormUserContext {
  roles: string[]
  /** raw user read response body (result.response) — userFields paths are resolved against this */
  profile: any
}

const WILDCARD = '*'
const ROLE_PUBLIC = 'public'
const ROLE_VOLUNTEER = 'volunteer'

/** volunteer bucket only when the user is a volunteer and NOT public; everything else → public */
export function selectRoleBucket(roles: string[] | undefined | null): string {
  const lower = (roles || []).map(r => String(r).toLowerCase())
  if (lower.includes(ROLE_VOLUNTEER) && !lower.includes(ROLE_PUBLIC)) {
    return ROLE_VOLUNTEER
  }
  return ROLE_PUBLIC
}

function isWildcard(value: any): boolean {
  if (value === undefined || value === null || value === WILDCARD) {
    return true
  }
  if (Array.isArray(value)) {
    return value.length === 0 || (value.length === 1 && value[0] === WILDCARD)
  }
  return String(value).trim() === ''
}

function criteriaMatches(criteriaValue: any, userValue: any): boolean {
  if (userValue === undefined || userValue === null || String(userValue).trim() === '') {
    return false
  }
  const user = String(userValue).toLowerCase()
  const values = Array.isArray(criteriaValue) ? criteriaValue : [criteriaValue]
  return values.some(v => String(v).toLowerCase() === user)
}

/**
 * Score an entry for a user, walking rulePriority in order.
 * Returns null when the entry is ineligible (a declared criterion did not match,
 * including the case where the user attribute is missing).
 * Each rulePriority key contributes two numbers: [matched, valueRank].
 */
export function scoreEntry(catalog: IFormCatalog, entry: IFormCatalogEntry, user: IFormUserContext): number[] | null {
  const criteria = entry.criteria || {}
  const score: number[] = []
  for (const key of catalog.rulePriority || []) {
    const criteriaValue = criteria[key]
    if (isWildcard(criteriaValue)) {
      score.push(0, 0)
      continue
    }
    const path = (catalog.userFields || {})[key]
    const userValue = path ? _.get(user.profile, path) : undefined
    if (!criteriaMatches(criteriaValue, userValue)) {
      return null
    }
    const priorities = (catalog.valuePriority || {})[key]
    let rank = 0
    if (priorities && priorities.length) {
      const idx = priorities.findIndex(p => String(p).toLowerCase() === String(userValue).toLowerCase())
      rank = idx >= 0 ? priorities.length - idx : 0
    }
    score.push(1, rank)
  }
  return score
}

function compareScores(a: number[], b: number[]): number {
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i += 1) {
    const d = (a[i] || 0) - (b[i] || 0)
    if (d !== 0) {
      return d
    }
  }
  return 0
}

/**
 * Pick the form for (type, subType, clientVersion) from the user's role bucket.
 * Highest score wins (lexicographic in rulePriority order); ties → lowest id.
 * Entries with empty criteria are wildcards on every key, so they are the natural default.
 */
export function matchForm(
  catalog: IFormCatalog | null | undefined,
  user: IFormUserContext | null | undefined,
  subType: string,
  clientVersion: number | string,
  portal = 'portal',
  type = 'page',
): IFormCatalogEntry | null {
  if (!catalog || !user || !catalog.forms) {
    return null
  }
  const bucket = catalog.forms[selectRoleBucket(user.roles)]
  const entries = (bucket && bucket[portal]) || []
  const version = Number(clientVersion)

  let best: IFormCatalogEntry | null = null
  let bestScore: number[] = []
  for (const entry of entries) {
    if (entry.subType !== subType || Number(entry.clientVersion) !== version) {
      continue
    }
    if (entry.type && entry.type !== type) {
      continue
    }
    const score = scoreEntry(catalog, entry, user)
    if (!score) {
      continue
    }
    const cmp = best ? compareScores(score, bestScore) : 1
    if (cmp > 0 || (cmp === 0 && best && entry.id < best.id)) {
      best = entry
      bestScore = score
    }
  }
  return best
}
