import { ChangeDetectionStrategy, Component, DestroyRef, NgZone, computed, effect, inject, input, signal, untracked } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { CertificateDialogComponent, MilestoneCardComponent, NsCampaignMilestone, isUsableUrl, parseDdMmYyyy } from '@sunbird-cb/consumption'
import { ConfigurationsService, ServerClockService } from '@sunbird-cb/utils-v2'
import dayjs from 'dayjs'
import { of } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'
import { NsCampaignMicrosite, formatLabel, formatOrdinalDate, formatOrdinalDateTime, resolveMilestoneLabels } from '../../models/campaign-microsite.model'
import { MilestoneStatusService, isOpenState } from '../../services/milestone-status.service'
import { MICROSITE_TELEMETRY, MicrositeTelemetryService } from '../../services/microsite-telemetry.service'
import { CampaignSurveyDialogComponent } from '../campaign-survey-dialog/campaign-survey-dialog.component'
import { MilestonePopupComponent } from '../milestone-popup/milestone-popup.component'

export const MILESTONE_POPUP_SEEN_KEY = 'campaignMilestonePopupSeen'

/** localStorage key for this user's "popup seen" flag (per user, so a shared browser still shows it to the next user) */
export function milestonePopupSeenKey(userId: string | undefined): string {
  return `${MILESTONE_POPUP_SEEN_KEY}:${userId || 'anonymous'}`
}

// storage can throw (private mode, blocked site data): then the popup simply shows again next time
function readSeen(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function writeSeen(key: string): void {
  try {
    localStorage.setItem(key, 'true')
  } catch {
    // ignore
  }
}

// unfilled `<PLACEHOLDER>` config values count as absent
function configValue(value: string | undefined): string | undefined {
  return value && !value.trim().startsWith('<') ? value : undefined
}

/** Fills `{token}` placeholders; unknown tokens become empty strings */
function fillTokens(value: string, tokens: Record<string, string>): string {
  return value.replace(/\{(\w+)\}/g, (_match, key: string) => tokens[key] ?? '')
}

/** Router commands + query params for an assessment's `player` config, or undefined when not configured */
export function buildPlayerRoute(
  milestone: NsCampaignMicrosite.IMilestone,
  batchId: string | undefined,
): { commands: string[]; queryParams: Record<string, string> } | undefined {
  const player = milestone.player
  const resourceId = configValue(player?.resourceId)
  if (!player?.path || !resourceId) {
    return undefined
  }
  const tokens: Record<string, string> = {
    resourceId,
    identifier: milestone.identifier || '',
    name: milestone.name || '',
    batchId: batchId || '',
    language: milestone.language || '',
  }
  const queryParams: Record<string, string> = {}
  for (const [key, value] of Object.entries(player.queryParams || {})) {
    const filled = fillTokens(String(value), tokens)
    if (filled) {
      queryParams[key] = filled
    }
  }
  // the router encodes each segment and query value; config holds raw values
  return { commands: ['/', ...fillTokens(player.path, tokens).split('/').filter(Boolean)], queryParams }
}

export type TEventPhase = 'upcoming' | 'live' | 'ended'

/** Missing or invalid times are ignored: no start = already started, no end = not ended */
export function eventPhase(milestone: NsCampaignMicrosite.IMilestone, now: number): TEventPhase {
  const end = milestone.endDateTime ? dayjs(milestone.endDateTime) : null
  if (end?.isValid() && now >= end.valueOf()) {
    return 'ended'
  }
  const start = milestone.startDateTime ? dayjs(milestone.startDateTime) : null
  return start?.isValid() && now < start.valueOf() ? 'upcoming' : 'live'
}

/**
 * A registered event comes back from the event read as status 1 (`inProgress`) whatever the time, so by its
 * start / end time: before `startDateTime` it is `notStarted` (not "In progress" yet), once `endDateTime` has
 * passed it is `completed`. Registration itself is read separately (isEventEnrolled), so buttons are unaffected.
 */
export function withEndedEvents(
  states: NsCampaignMilestone.TMilestoneState[] | null,
  milestones: NsCampaignMicrosite.IMilestone[],
  now: number,
): NsCampaignMilestone.TMilestoneState[] | null {
  return states && states.map((state, i) => {
    const milestone = milestones[i]
    if (state !== 'inProgress' || milestone?.type !== 'event') {
      return state
    }
    switch (eventPhase(milestone, now)) {
      case 'upcoming':
        return 'notStarted'
      case 'ended':
        return 'completed'
      default:
        return state
    }
  })
}

/** Assessment button: not enrolled -> Start, enrolled but not finished -> Resume, finished -> View */
export function assessmentCtaLabel(
  state: NsCampaignMilestone.TMilestoneState,
  labels: NsCampaignMicrosite.IMilestoneLabels['assessment'],
): string {
  switch (state) {
    case 'inProgress':
      return labels.resume
    case 'completed':
      return labels.view
    default:
      return labels.start
  }
}

export interface IEventCta {
  label: string
  disabled: boolean
  /** Hover text on the button, e.g. why it is disabled */
  tooltip?: string
}

/** Completed assessment that must not open again (`openWhenCompleted` not set in the page JSON) */
export function isClosedWhenCompleted(milestone: NsCampaignMicrosite.IMilestone, state: NsCampaignMilestone.TMilestoneState): boolean {
  return milestone.type === 'assessment' && state === 'completed' && milestone.openWhenCompleted !== true
}

function hasValidDateTime(value: string | undefined): boolean {
  return !!value && dayjs(value).isValid()
}

/** Pledge `autoOpen` is on and `now` (server time) is within its start/end; a missing or invalid date means never */
export function isInAutoOpenWindow(milestone: NsCampaignMicrosite.IMilestone, now: number): boolean {
  const autoOpen = milestone.autoOpen
  if (milestone.type !== 'survey' || !autoOpen || autoOpen.enabled === false
    || !hasValidDateTime(autoOpen.startDateTime) || !hasValidDateTime(autoOpen.endDateTime)) {
    return false
  }
  return now >= dayjs(autoOpen.startDateTime).valueOf() && now < dayjs(autoOpen.endDateTime).valueOf()
}

export interface IUnlock {
  at: Date
  /** `false` when only a date is known (from `eventDetails.startDate`), so the label leaves the time out */
  hasTime: boolean
}

/**
 * When an assessment opens, while that is still ahead; else null (open). The assessment cannot be opened before it.
 * - `startDateTime` (date and time) when set
 * - otherwise, with `lockUntilEventStart`, the start of `eventDetails.startDate`
 */
export function assessmentUnlockAt(
  milestone: NsCampaignMicrosite.IMilestone,
  now: number,
  eventStartDate?: string,
): IUnlock | null {
  if (milestone.type !== 'assessment') {
    return null
  }
  if (milestone.startDateTime) {
    const start = dayjs(milestone.startDateTime)
    return start.isValid() && now < start.valueOf() ? { at: start.toDate(), hasTime: true } : null
  }
  const eventStart = milestone.lockUntilEventStart ? parseDdMmYyyy(eventStartDate) : null
  return eventStart && now < eventStart.getTime() ? { at: eventStart, hasTime: false } : null
}


/**
 * Event button: not registered -> Register (whatever the phase); completed -> View recording (whatever the
 * phase: `openBeforeStart` lets a user finish before the start); otherwise Event yet to start / Join event /
 * View recording, by phase. "Event yet to start" is disabled unless the milestone has `openBeforeStart`.
 */
export function eventCta(
  phase: TEventPhase,
  isEnrolled: boolean,
  labels: NsCampaignMicrosite.IMilestoneLabels['event'],
  openBeforeStart = false,
  completed = false,
): IEventCta {
  if (!isEnrolled) {
    return { label: labels.register, disabled: false }
  }
  if (completed) {
    return { label: labels.recording, disabled: false }
  }
  switch (phase) {
    case 'upcoming':
      return { label: labels.upcoming, disabled: !openBeforeStart }
    case 'live':
      return { label: labels.join, disabled: false }
    default:
      return { label: labels.recording, disabled: false }
  }
}

/**
 * What a click on a milestone does, for telemetry: a stable key, not the JSON button text (which can change).
 * `locked` / `completed`: the click is ignored (not open yet, or a finished assessment that stays closed).
 */
export function milestoneAction(
  milestone: NsCampaignMicrosite.IMilestone,
  state: NsCampaignMilestone.TMilestoneState,
  ctx: { now: number, eventStartDate?: string, isEventEnrolled: boolean, hasCertificate: boolean },
): string {
  if (configValue(milestone.redirectUrl) && isUsableUrl(milestone.redirectUrl!)) {
    return 'redirect'
  }
  if (state === 'locked') {
    return 'locked'
  }
  switch (milestone.type) {
    case 'assessment':
      if (assessmentUnlockAt(milestone, ctx.now, ctx.eventStartDate)) {
        return 'locked'
      }
      if (isClosedWhenCompleted(milestone, state)) {
        return 'completed'
      }
      return state === 'inProgress' ? 'resume' : state === 'completed' ? 'view' : 'start'
    case 'event': {
      if (!ctx.isEventEnrolled) {
        return 'register'
      }
      if (state === 'completed') {
        return 'recording'
      }
      const phase = eventPhase(milestone, ctx.now)
      return phase === 'upcoming' ? 'yet-to-start' : phase === 'live' ? 'join' : 'recording'
    }
    case 'survey':
      if (state !== 'completed') {
        return 'take-sankalp'
      }
      return ctx.hasCertificate ? 'download-certificate' : 'certificate-pending'
    default:
      return 'open'
  }
}

/** Telemetry object for a milestone: its content id (assessment / event), else the form id, else its order */
export function milestoneTelemetryObject(milestone: NsCampaignMicrosite.IMilestone): { id: string, type: string } {
  const id = configValue(milestone.identifier) || configValue(milestone.formId) || `milestone-${milestone.order}`
  return { id, type: milestone.type }
}

/** A pledge (survey) that is tracked through an event: registering, progress and certificate all use that event */
export function isEventBackedSurvey(milestone: NsCampaignMicrosite.IMilestone): boolean {
  return milestone.type === 'survey' && !!configValue(milestone.identifier) && !!configValue(milestone.batchId)
}

/** How often the event button re-checks the clock, so "Join event" appears once the event starts */
const CLOCK_TICK_MS = 30_000
/** Clock rate while a countdown is on screen, so its seconds move */
const COUNTDOWN_TICK_MS = 1_000
/** Seconds are only shown in the last day; before that "5D 12H" only needs the 30s clock */
const DAY_MS = 86_400_000
/** The card's "Overdue" check is by day, so cards get the time rounded to the minute */
const CARD_CLOCK_MS = 60_000

// Equality for computed arrays: an unchanged result keeps the same reference, so the cards / popup bound
// to it are not marked for re-render on every clock tick.
function sameList<T>(a: readonly T[], b: readonly T[], same: (x: T, y: T) => boolean): boolean {
  return a.length === b.length && a.every((item, i) => same(item, b[i]))
}
const sameUnlock = (x: IUnlock | null, y: IUnlock | null) =>
  x === y || (!!x && !!y && x.hasTime === y.hasTime && x.at.getTime() === y.at.getTime())
const sameCta = (x: IEventCta | null, y: IEventCta | null) =>
  x === y || (!!x && !!y && x.label === y.label && x.disabled === y.disabled && x.tooltip === y.tooltip)

/** Time left as "5D 12H" (a day or more) or "12H 30M 20S" (less than a day); leading zero units dropped */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) {
    return `${days}D ${hours}H`
  }
  if (hours > 0) {
    return `${hours}H ${minutes}M ${seconds}S`
  }
  return minutes > 0 ? `${minutes}M ${seconds}S` : `${seconds}S`
}

@Component({
  selector: 'ws-app-programme-milestones',
  imports: [MilestoneCardComponent, MilestonePopupComponent],
  templateUrl: './programme-milestones.component.html',
  styleUrl: './programme-milestones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgrammeMilestonesComponent {
  private readonly router = inject(Router)
  private readonly statusSvc = inject(MilestoneStatusService)
  private readonly dialog = inject(MatDialog)
  private readonly snackBar = inject(MatSnackBar)
  private readonly destroyRef = inject(DestroyRef)
  /** Server time, not the device clock: changing the system time must not unlock anything early */
  private readonly clock = inject(ServerClockService)
  private readonly telemetry = inject(MicrositeTelemetryService)
  private readonly configSvc = inject(ConfigurationsService)

  readonly config = input<NsCampaignMicrosite.IProgrammeMilestones | undefined>()
  readonly eventDetails = input<NsCampaignMicrosite.IEventDetails | undefined>()

  /** Page text from `labels` in the page JSON, falling back to defaults (not localized: campaign copy changes often) */
  readonly labels = computed(() => resolveMilestoneLabels(this.config()?.labels))

  readonly milestones = computed(() => [...(this.config()?.items || [])].sort((a, b) => a.order - b.order))

  /**
   * Shown whenever enabled: the Baseline is open from day one. `eventDetails` dates only drive
   * "Available on" labels; they must not hide the section.
   */
  readonly isVisible = computed(() => !!this.config()?.enabled && this.milestones().length > 0)

  private readonly refresh = signal(0)

  /** `order` of the milestone currently being enrolled; blocks repeat clicks while the call is in flight */
  readonly enrollingOrder = signal<number | null>(null)

  /** Server's current time, ticking so event buttons, unlocks and countdowns update without a reload */
  readonly now = signal(this.clock.now())

  private readonly apiStates = toSignal(
    // `refresh` is part of the value: the same milestones array alone would not re-emit
    toObservable(computed(() => ({ items: this.isVisible() ? this.milestones() : [], refresh: this.refresh() }))).pipe(
      switchMap(({ items }) => items.length
        ? this.statusSvc.resolveStates(items).pipe(startWith(null))
        : of(null)),
    ),
    { initialValue: null },
  )

  readonly states = computed(() => withEndedEvents(this.apiStates(), this.milestones(), this.cardNow()))

  readonly isLoading = computed(() => this.states() === null)

  /** Unlock per milestone while an assessment is not open yet (see assessmentUnlockAt), else null */
  private readonly unlockAt = computed(() => {
    const now = this.now()
    const eventStartDate = this.eventDetails()?.startDate
    return this.milestones().map(milestone => assessmentUnlockAt(milestone, now, eventStartDate))
  }, { equal: (a, b) => sameList(a, b, sameUnlock) })

  /** A `showCountdown` assessment unlocks within a day, so its countdown shows seconds and needs the 1s clock */
  readonly needsSecondTicks = computed(() => {
    const now = this.now()
    return this.milestones().some((milestone, i) => {
      const unlock = this.unlockAt()[i]
      return !!milestone.showCountdown && !!unlock && unlock.at.getTime() - now < DAY_MS
    })
  })

  /** Time for the cards ("Overdue" is by day): changes once a minute, not on every tick */
  readonly cardNow = computed(() => Math.floor(this.now() / CARD_CLOCK_MS) * CARD_CLOCK_MS)

  /**
   * Green "Completed" in place of the button for finished assessments. Events never get it: their button
   * always follows Register / Event yet to start / Join event / View recording.
   */
  readonly completedLabels = computed(() => {
    const states = this.states()
    const label = this.labels().completed
    return this.milestones().map((milestone, i) => (states?.[i] === 'completed' && milestone.type === 'assessment' ? label : null))
  })

  readonly isJourneyComplete = computed(() => {
    const states = this.states()
    const enabled = this.milestones()
      .map((milestone, index) => ({ milestone, state: states?.[index] }))
      .filter(({ milestone }) => milestone.enabled !== false)
    return !!states && enabled.length > 0 && enabled.every(({ state }) => state === 'completed')
  })

  /**
   * Host-provided button per milestone (text from the page JSON); `null` keeps the card's default button.
   * Assessments: Start / Resume (disabled until `startDateTime`). Events: Register / yet to start / Join / recording.
   * Completed assessments show `completedLabels` instead of a button.
   * Pledge: Take Sankalpa, then Download certificate once an event-backed one is completed
   * (disabled, with the "be patient" tooltip, until a certificate is issued).
   */
  readonly ctas = computed<(IEventCta | null)[]>(() => {
    const states = this.states()
    const labels = this.labels()
    const now = this.now()
    const unlockAt = this.unlockAt()
    return this.milestones().map((milestone, index) => {
      const state = states?.[index]
      if (!state || state === 'locked') {
        return null
      }
      switch (milestone.type) {
        case 'assessment': {
          const unlock = unlockAt[index]
          if (unlock && milestone.showCountdown) {
            return { label: formatLabel(labels.assessment.opensIn, { time: formatCountdown(unlock.at.getTime() - now) }), disabled: true }
          }
          return {
            label: assessmentCtaLabel(state, labels.assessment),
            disabled: !!unlock || isClosedWhenCompleted(milestone, state),
          }
        }
        case 'event':
          return eventCta(eventPhase(milestone, now), this.statusSvc.isEventEnrolled(milestone.identifier), labels.event,
            !!milestone.openBeforeStart, state === 'completed')
        case 'survey':
          if (state !== 'completed') {
            return { label: labels.survey.start, disabled: false }
          }
          if (!isEventBackedSurvey(milestone)) {
            return null
          }
          return this.statusSvc.issuedCertificateId(milestone.identifier)
            ? { label: labels.survey.downloadCertificate, disabled: false }
            // clickable while pending, as on mobile: the click shows the "be patient" message (and is tracked)
            : { label: labels.survey.downloadCertificate, disabled: false, tooltip: labels.survey.certificatePending }
        default:
          return null
      }
    })
  }, { equal: (a, b) => sameList(a, b, sameCta) })

  private readonly popupDismissed = signal(false)

  constructor() {
    // One interval for the page. It runs outside Angular's zone: zone.js would otherwise run change detection
    // for the whole app on every tick. Only the ticks that move `now` (every second while a countdown shows
    // seconds, otherwise every 30s) update the signal, and that alone schedules a render of what reads it.
    const timer = inject(NgZone).runOutsideAngular(() => setInterval(() => {
      const current = this.clock.now()
      if (this.needsSecondTicks() || current - this.now() >= CLOCK_TICK_MS) {
        this.now.set(current)
      }
    }, COUNTDOWN_TICK_MS))
    this.destroyRef.onDestroy(() => clearInterval(timer))

    // one impression when the info popup appears (it shows once per user)
    effect(() => {
      if (this.showPopup()) {
        untracked(() => this.telemetry.impression('milestone-popup', { id: 'milestone-popup', type: 'popup' }))
      }
    })

    // the window can also start while the page is open: `now` moves autoOpenSurvey along
    effect(() => {
      const milestone = this.autoOpenSurvey()
      if (!milestone || this.autoOpened) {
        return
      }
      untracked(() => {
        // the user already has a dialog open (e.g. clicked a card): leave it alone
        if (this.dialog.openDialogs.length || this.enrollingOrder() !== null) {
          return
        }
        this.autoOpened = true
        this.openSurvey(milestone, true)
      })
    })
  }

  /**
   * Per milestone, else null:
   * - assessment with a future `startDateTime`: "Available from 17th Nov, 10:00 AM" (and it cannot be opened yet)
   * - `lockUntilEventStart` while `eventDetails.startDate` is ahead: "Available from 17th Nov" (informational only)
   */
  readonly availableFrom = computed<(string | null)[]>(() => {
    const template = this.labels().popup.availableFrom
    const now = this.now()
    const start = parseDdMmYyyy(this.eventDetails()?.startDate)
    const waiting = !!start && now < start.getTime()
    const eventLabel = waiting && start ? formatLabel(template, { date: formatOrdinalDate(start) }) : null
    const unlockAt = this.unlockAt()
    return this.milestones().map((milestone, i) => {
      const unlock = unlockAt[i]
      if (unlock) {
        return formatLabel(template, { date: unlock.hasTime ? formatOrdinalDateTime(unlock.at) : formatOrdinalDate(unlock.at) })
      }
      // an event shows its own start until it begins ("Available from 10th Nov, 3:15 PM"); only the status
      // label changes: Register / `openBeforeStart` still work before the start
      if (milestone.type === 'event' && hasValidDateTime(milestone.startDateTime) && eventPhase(milestone, now) === 'upcoming') {
        return formatLabel(template, { date: formatOrdinalDateTime(dayjs(milestone.startDateTime).toDate()) })
      }
      // an assessment's own startDateTime decides alone: once it has passed, the event date says nothing more
      if (milestone.type === 'assessment' && hasValidDateTime(milestone.startDateTime)) {
        return null
      }
      return eventLabel && milestone.lockUntilEventStart ? eventLabel : null
    })
  }, { equal: (a, b) => sameList(a, b, (x, y) => x === y) })

  /** First milestone the user can act on now: open and not waiting for the event date */
  private readonly currentMilestone = computed(() => {
    const waiting = this.availableFrom()
    const index = this.states()?.findIndex((state, i) => isOpenState(state) && !waiting[i]) ?? -1
    return index < 0 ? undefined : this.milestones()[index]
  })

  // shown only once per user: closing it hides it for good, also after finishing a milestone or on a new visit
  // (seen once = never again for this user, whichever milestone they are on, across sessions and visits)
  readonly showPopup = computed(() => !!this.config()?.popup?.enabled && this.isVisible()
    && !!this.currentMilestone() && !this.popupDismissed()
    && !readSeen(milestonePopupSeenKey(this.configSvc.userProfile?.userId)))

  /**
   * Pledge to open by itself: not submitted yet, inside its `autoOpen` window, and only once the info popup
   * is out of the way. Undefined while statuses load or the popup shows.
   */
  readonly autoOpenSurvey = computed(() => {
    const states = this.states()
    if (!states || this.showPopup()) {
      return undefined
    }
    const now = this.now()
    return this.milestones().find((milestone, i) => milestone.enabled !== false && !!configValue(milestone.formId)
      && isOpenState(states[i]) && isInAutoOpenWindow(milestone, now))
  })

  /** Set once the pledge has opened by itself, so it opens at most once per page load (a reload opens it again) */
  private autoOpened = false

  stateAt(index: number): NsCampaignMilestone.TMilestoneState {
    return this.states()?.[index] ?? 'locked'
  }

  closePopup(): void {
    this.telemetry.click('milestone-popup', 'milestone-popup-close', { id: 'milestone-popup', type: 'popup' })
    writeSeen(milestonePopupSeenKey(this.configSvc.userProfile?.userId))
    this.popupDismissed.set(true)
  }

  openMilestone(milestone: NsCampaignMicrosite.IMilestone): void {
    this.trackMilestoneClick(milestone)
    const redirectUrl = configValue(milestone.redirectUrl)
    if (redirectUrl && isUsableUrl(redirectUrl)) {
      if (/^https?:\/\//.test(redirectUrl)) {
        window.location.assign(redirectUrl)
      } else {
        this.router.navigateByUrl(redirectUrl)
      }
      return
    }

    // not open yet, or completed and closed (the card ignores the click too)
    const index = this.milestones().findIndex(m => m.order === milestone.order)
    if (assessmentUnlockAt(milestone, this.clock.now(), this.eventDetails()?.startDate)
      || isClosedWhenCompleted(milestone, this.stateAt(index))) {
      return
    }

    if (milestone.type === 'survey' && configValue(milestone.formId)) {
      this.openSurvey(milestone)
      return
    }

    const identifier = configValue(milestone.identifier)
    const batchId = configValue(milestone.batchId)
    const queryParams = batchId ? { batchId } : {}
    if (identifier && milestone.type === 'assessment' && buildPlayerRoute(milestone, batchId)) {
      this.openAssessment(milestone)
    } else if (identifier && milestone.type === 'assessment') {
      this.router.navigate(['/app/toc', identifier, 'overview'], { queryParams })
    } else if (identifier && milestone.type === 'event' && buildPlayerRoute(milestone, batchId)) {
      this.openEvent(milestone)
    } else if (identifier && milestone.type === 'event') {
      this.router.navigate(['/app/event-hub/home', identifier], { queryParams })
    } else {
      // tslint:disable-next-line: no-console
      console.warn('ProgrammeMilestonesComponent: no route configured for milestone', milestone.order)
    }
  }

  /** One INTERACT per card / button click, as on mobile: subtype `campaign-microsite-milestone-<type>`, id `card-content` */
  private trackMilestoneClick(milestone: NsCampaignMicrosite.IMilestone): void {
    this.telemetry.click(MICROSITE_TELEMETRY.milestoneTap(milestone.type), MICROSITE_TELEMETRY.cardContent,
      milestoneTelemetryObject(milestone))
  }

  /** Registered for an event (the event milestone, or the event behind the pledge): subtype `enroll-now`, object type Event */
  private trackEventRegistered(milestone: NsCampaignMicrosite.IMilestone): void {
    this.telemetry.click(MICROSITE_TELEMETRY.enrollNow, undefined,
      { id: milestoneTelemetryObject(milestone).id, type: MICROSITE_TELEMETRY.eventObjectType })
  }

  /**
   * Not enrolled -> auto-enroll (API D) with the config `language`, then open the player with the batch enrolled into.
   * Already enrolled (record from API A) -> open the player directly with the enrolled batch.
   */
  private async openAssessment(milestone: NsCampaignMicrosite.IMilestone): Promise<void> {
    if (this.enrollingOrder() !== null) {
      return
    }
    let batchId = this.statusSvc.enrolledBatchId(milestone.identifier)
    if (!batchId) {
      this.enrollingOrder.set(milestone.order)
      try {
        batchId = await this.statusSvc.enrollAssessment(milestone)
      } catch (error: any) {
        // tslint:disable-next-line: no-console
        console.error('ProgrammeMilestonesComponent: auto-enrollment failed', error)
        const message = error?.error?.params?.errmsg || this.labels().enrollError
        this.snackBar.open(message, 'X', { duration: 5000 })
        return
      } finally {
        this.enrollingOrder.set(null)
      }
    }
    const route = buildPlayerRoute(milestone, batchId || configValue(milestone.batchId))
    if (route) {
      // the player's Back / Finish return to this page (read by the viewer top bars)
      this.router.navigate(route.commands, { queryParams: { ...route.queryParams, redirectUrl: this.router.url } })
    }
  }

  /**
   * Not registered -> register (event enroll API), then open the player unless the event has not started yet.
   * Registered -> open the player once the event has started (the button is disabled before that).
   * With `openBeforeStart`, or once completed, the player opens before the start too.
   */
  private async openEvent(milestone: NsCampaignMicrosite.IMilestone): Promise<void> {
    if (this.enrollingOrder() !== null) {
      return
    }
    const phase = eventPhase(milestone, this.clock.now())
    if (!this.statusSvc.isEventEnrolled(milestone.identifier)) {
      this.enrollingOrder.set(milestone.order)
      try {
        await this.statusSvc.enrollEvent(milestone)
        this.trackEventRegistered(milestone)
      } catch (error: any) {
        // tslint:disable-next-line: no-console
        console.error('ProgrammeMilestonesComponent: event registration failed', error)
        this.snackBar.open(error?.error?.params?.errmsg || this.labels().event.registerError, 'X', { duration: 5000 })
        return
      } finally {
        this.enrollingOrder.set(null)
      }
      // re-read statuses so the button moves on from Register
      this.refresh.update(count => count + 1)
      if (phase === 'upcoming' && !milestone.openBeforeStart) {
        this.snackBar.open(this.labels().event.registered, 'X', { duration: 5000 })
        return
      }
    } else if (phase === 'upcoming' && !milestone.openBeforeStart
      && this.stateAt(this.milestones().findIndex(m => m.order === milestone.order)) !== 'completed') {
      return
    }
    const route = buildPlayerRoute(milestone, configValue(milestone.batchId))
    if (route) {
      this.router.navigate(route.commands, { queryParams: { ...route.queryParams, redirectUrl: this.router.url } })
    }
  }

  /**
   * Pledge. Completed: certificate (event-backed) or "already submitted".
   * Otherwise: event-backed -> register for the event if needed, then open the form; after a successful
   * submit mark the event complete (progress 100%) and re-read statuses (event read gives status + certificate).
   */
  private async openSurvey(milestone: NsCampaignMicrosite.IMilestone, _autoOpened = false): Promise<void> {
    if (this.enrollingOrder() !== null) {
      return
    }
    const eventBacked = isEventBackedSurvey(milestone)
    const index = this.milestones().findIndex(m => m.order === milestone.order)
    if (this.stateAt(index) === 'completed') {
      if (eventBacked) {
        await this.openCertificate(milestone)
      } else {
        this.snackBar.open(this.labels().survey.alreadySubmitted, 'X', { duration: 5000 })
      }
      return
    }

    if (eventBacked && !this.statusSvc.isEventEnrolled(milestone.identifier)) {
      this.enrollingOrder.set(milestone.order)
      try {
        await this.statusSvc.enrollEvent(milestone)
        this.trackEventRegistered(milestone)
      } catch (error: any) {
        // tslint:disable-next-line: no-console
        console.error('ProgrammeMilestonesComponent: pledge event registration failed', error)
        this.snackBar.open(error?.error?.params?.errmsg || this.labels().event.registerError, 'X', { duration: 5000 })
        return
      } finally {
        this.enrollingOrder.set(null)
      }
    }

    // INTERACT, as on mobile, whether it was clicked or opened by itself (the automatic one sends no milestone tap).
    // object.id is the milestone's content id (the form id only when it has none); edata.id the same
    this.telemetry.click(MICROSITE_TELEMETRY.surveyOpen, undefined, milestoneTelemetryObject(milestone))
    this.dialog.open<CampaignSurveyDialogComponent, NsCampaignMicrosite.ICampaignSurveyDialogData, boolean>(CampaignSurveyDialogComponent, {
      data: { milestone, labels: this.labels() },
      width: '750px',
      maxWidth: '90vw',
      panelClass: 'campaign-survey-panel',
      autoFocus: false,
      disableClose: true,
    }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async submitted => {
      if (!submitted) {
        return
      }
      if (eventBacked) {
        try {
          await this.statusSvc.completeEvent(milestone)
        } catch (error) {
          // the form is saved; the next page load re-reads the event status
          // tslint:disable-next-line: no-console
          console.error('ProgrammeMilestonesComponent: pledge event progress update failed', error)
        }
      }
      this.refresh.update(count => count + 1)
    })
  }

  /** Certificate dialog when one has been issued for the pledge's event; otherwise the "be patient" message */
  private async openCertificate(milestone: NsCampaignMicrosite.IMilestone): Promise<void> {
    const certId = this.statusSvc.issuedCertificateId(milestone.identifier)
    const object = milestoneTelemetryObject(milestone)
    if (!certId) {
      // as on mobile, only when there is a pending message to show
      const pending = this.labels().survey.certificatePending
      if (pending) {
        this.telemetry.click(MICROSITE_TELEMETRY.certificatePending, MICROSITE_TELEMETRY.downloadCertificate, object)
        this.snackBar.open(pending, 'X', { duration: 10000 })
      }
      return
    }
    this.telemetry.click(MICROSITE_TELEMETRY.certificateDownload, MICROSITE_TELEMETRY.downloadCertificate, object)
    this.enrollingOrder.set(milestone.order)
    try {
      const printUri = await this.statusSvc.fetchCertificate(certId)
      this.dialog.open(CertificateDialogComponent, { width: '1200px', data: { cet: printUri, certId } })
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error('ProgrammeMilestonesComponent: certificate download failed', error)
      this.snackBar.open(this.labels().survey.certificateError, 'X', { duration: 5000 })
    } finally {
      this.enrollingOrder.set(null)
    }
  }
}
