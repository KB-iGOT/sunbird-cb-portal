import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { CertificateDialogComponent, MilestoneCardComponent, NsCampaignMilestone, isUsableUrl, parseDdMmYyyy } from '@sunbird-cb/consumption'
import dayjs from 'dayjs'
import { of } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'
import { NsCampaignMicrosite, formatLabel, formatOrdinalDate, resolveMilestoneLabels } from '../../models/campaign-microsite.model'
import { MilestoneStatusService, isOpenState } from '../../services/milestone-status.service'
import { CampaignSurveyDialogComponent } from '../campaign-survey-dialog/campaign-survey-dialog.component'
import { MilestonePopupComponent } from '../milestone-popup/milestone-popup.component'

export const MILESTONE_POPUP_SEEN_KEY = 'campaignMilestonePopupSeen'

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
}

/**
 * Event button: not registered -> Register (whatever the phase);
 * registered -> Event yet to start (disabled) / Join event / View recording, by phase.
 */
export function eventCta(
  phase: TEventPhase,
  isEnrolled: boolean,
  labels: NsCampaignMicrosite.IMilestoneLabels['event'],
): IEventCta {
  if (!isEnrolled) {
    return { label: labels.register, disabled: false }
  }
  switch (phase) {
    case 'upcoming':
      return { label: labels.upcoming, disabled: true }
    case 'live':
      return { label: labels.join, disabled: false }
    default:
      return { label: labels.recording, disabled: false }
  }
}

/** A pledge (survey) that is tracked through an event: registering, progress and certificate all use that event */
export function isEventBackedSurvey(milestone: NsCampaignMicrosite.IMilestone): boolean {
  return milestone.type === 'survey' && !!configValue(milestone.identifier) && !!configValue(milestone.batchId)
}

/** How often the event button re-checks the clock, so "Join event" appears once the event starts */
const CLOCK_TICK_MS = 30_000

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

  /** Current time, ticking so event buttons change phase without a reload */
  readonly now = signal(Date.now())

  readonly states = toSignal(
    // `refresh` is part of the value: the same milestones array alone would not re-emit
    toObservable(computed(() => ({ items: this.isVisible() ? this.milestones() : [], refresh: this.refresh() }))).pipe(
      switchMap(({ items }) => items.length
        ? this.statusSvc.resolveStates(items).pipe(startWith(null))
        : of(null)),
    ),
    { initialValue: null },
  )

  readonly isLoading = computed(() => this.states() === null)

  readonly isJourneyComplete = computed(() => {
    const states = this.states()
    const enabled = this.milestones()
      .map((milestone, index) => ({ milestone, state: states?.[index] }))
      .filter(({ milestone }) => milestone.enabled !== false)
    return !!states && enabled.length > 0 && enabled.every(({ state }) => state === 'completed')
  })

  /**
   * Host-provided button per milestone (text from the page JSON); `null` keeps the card's default button.
   * Assessments: Start / Resume / View. Events: Register / yet to start / Join / recording.
   * Pledge: Take Sankalpa, then Download certificate once an event-backed one is completed.
   */
  readonly ctas = computed<(IEventCta | null)[]>(() => {
    const states = this.states()
    const labels = this.labels()
    const now = this.now()
    return this.milestones().map((milestone, index) => {
      const state = states?.[index]
      if (!state || state === 'locked') {
        return null
      }
      switch (milestone.type) {
        case 'assessment':
          return { label: assessmentCtaLabel(state, labels.assessment), disabled: false }
        case 'event':
          return eventCta(eventPhase(milestone, now), this.statusSvc.isEventEnrolled(milestone.identifier), labels.event)
        case 'survey':
          if (state !== 'completed') {
            return { label: labels.survey.start, disabled: false }
          }
          return isEventBackedSurvey(milestone) ? { label: labels.survey.downloadCertificate, disabled: false } : null
        default:
          return null
      }
    })
  })

  private readonly popupDismissed = signal(false)

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), CLOCK_TICK_MS)
    this.destroyRef.onDestroy(() => clearInterval(timer))
  }

  /**
   * Per milestone: "Available from 17th Nov" while a `lockUntilEventStart` milestone waits for
   * `eventDetails.startDate`, else null. A missing or invalid start date locks nothing.
   */
  readonly availableFrom = computed<(string | null)[]>(() => {
    const start = parseDdMmYyyy(this.eventDetails()?.startDate)
    const waiting = !!start && this.now() < start.getTime()
    const label = waiting && start ? formatLabel(this.labels().popup.availableFrom, { date: formatOrdinalDate(start) }) : null
    return this.milestones().map(milestone => (label && milestone.lockUntilEventStart ? label : null))
  })

  /** First milestone the user can act on now: open and not waiting for the event date */
  private readonly currentMilestone = computed(() => {
    const waiting = this.availableFrom()
    const index = this.states()?.findIndex((state, i) => isOpenState(state) && !waiting[i]) ?? -1
    return index < 0 ? undefined : this.milestones()[index]
  })

  // shown once per session per milestone reached, so it returns for the next one
  readonly showPopup = computed(() => {
    const current = this.currentMilestone()
    return !!this.config()?.popup?.enabled && this.isVisible() && !!current && !this.popupDismissed()
      && sessionStorage.getItem(MILESTONE_POPUP_SEEN_KEY) !== String(current.order)
  })

  stateAt(index: number): NsCampaignMilestone.TMilestoneState {
    return this.states()?.[index] ?? 'locked'
  }

  closePopup(): void {
    const current = this.currentMilestone()
    if (current) {
      sessionStorage.setItem(MILESTONE_POPUP_SEEN_KEY, String(current.order))
    }
    this.popupDismissed.set(true)
  }

  openMilestone(milestone: NsCampaignMicrosite.IMilestone): void {
    const redirectUrl = configValue(milestone.redirectUrl)
    if (redirectUrl && isUsableUrl(redirectUrl)) {
      if (/^https?:\/\//.test(redirectUrl)) {
        window.location.assign(redirectUrl)
      } else {
        this.router.navigateByUrl(redirectUrl)
      }
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
   */
  private async openEvent(milestone: NsCampaignMicrosite.IMilestone): Promise<void> {
    if (this.enrollingOrder() !== null) {
      return
    }
    const phase = eventPhase(milestone, Date.now())
    if (!this.statusSvc.isEventEnrolled(milestone.identifier)) {
      this.enrollingOrder.set(milestone.order)
      try {
        await this.statusSvc.enrollEvent(milestone)
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
      if (phase === 'upcoming') {
        this.snackBar.open(this.labels().event.registered, 'X', { duration: 5000 })
        return
      }
    } else if (phase === 'upcoming') {
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
  private async openSurvey(milestone: NsCampaignMicrosite.IMilestone): Promise<void> {
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
      } catch (error: any) {
        // tslint:disable-next-line: no-console
        console.error('ProgrammeMilestonesComponent: pledge event registration failed', error)
        this.snackBar.open(error?.error?.params?.errmsg || this.labels().event.registerError, 'X', { duration: 5000 })
        return
      } finally {
        this.enrollingOrder.set(null)
      }
    }

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
    if (!certId) {
      this.snackBar.open(this.labels().survey.certificatePending, 'X', { duration: 10000 })
      return
    }
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
