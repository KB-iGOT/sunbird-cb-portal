import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MilestoneCardComponent, NsCampaignMilestone, isUsableUrl, parseDdMmYyyy } from '@sunbird-cb/consumption'
import dayjs from 'dayjs'
import { of } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'
import { NsCampaignMicrosite } from '../../models/campaign-microsite.model'
import { MilestoneStatusService, isOpenState } from '../../services/milestone-status.service'
import { CampaignSurveyDialogComponent } from '../campaign-survey-dialog/campaign-survey-dialog.component'
import { MilestonePopupComponent } from '../milestone-popup/milestone-popup.component'

export const MILESTONE_POPUP_SEEN_KEY = 'campaignMilestonePopupSeen'
const LABELS = {
  journeyComplete: 'campaignMicrosite.milestones.journeyComplete',
  surveyAlreadySubmitted: 'campaignMicrosite.survey.alreadySubmitted',
}

export function isWithinEventWindow(eventDetails: NsCampaignMicrosite.IEventDetails | undefined, now: Date): boolean {
  const start = parseDdMmYyyy(eventDetails?.startDate)
  const end = parseDdMmYyyy(eventDetails?.endDate)
  if (!start || !end) {
    return true
  }
  const today = dayjs(now)
  return !today.isBefore(start, 'day') && !today.isAfter(end, 'day')
}

// unfilled `<PLACEHOLDER>` config values count as absent
function configValue(value: string | undefined): string | undefined {
  return value && !value.trim().startsWith('<') ? value : undefined
}

@Component({
  selector: 'ws-app-programme-milestones',
  imports: [TranslateModule, MilestoneCardComponent, MilestonePopupComponent],
  templateUrl: './programme-milestones.component.html',
  styleUrl: './programme-milestones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgrammeMilestonesComponent {
  private readonly router = inject(Router)
  private readonly statusSvc = inject(MilestoneStatusService)
  private readonly dialog = inject(MatDialog)
  private readonly snackBar = inject(MatSnackBar)
  private readonly translate = inject(TranslateService)
  private readonly destroyRef = inject(DestroyRef)

  readonly config = input<NsCampaignMicrosite.IProgrammeMilestones | undefined>()
  readonly eventDetails = input<NsCampaignMicrosite.IEventDetails | undefined>()

  readonly labels = LABELS

  readonly milestones = computed(() => [...(this.config()?.items || [])].sort((a, b) => a.order - b.order))

  readonly isVisible = computed(() =>
    !!this.config()?.enabled && this.milestones().length > 0 && isWithinEventWindow(this.eventDetails(), new Date()))

  private readonly refresh = signal(0)

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

  private readonly popupDismissed = signal(false)

  private readonly currentMilestone = computed(() => {
    const index = this.states()?.findIndex(isOpenState) ?? -1
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

  startFromPopup(milestone: NsCampaignMilestone.IMilestone): void {
    this.closePopup()
    this.openMilestone(milestone)
  }

  openMilestone(milestone: NsCampaignMilestone.IMilestone): void {
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
    if (identifier && milestone.type === 'assessment') {
      this.router.navigate(['/app/toc', identifier, 'overview'], { queryParams })
    } else if (identifier && milestone.type === 'event') {
      this.router.navigate(['/app/event-hub/home', identifier], { queryParams })
    } else {
      // tslint:disable-next-line: no-console
      console.warn('ProgrammeMilestonesComponent: no route configured for milestone', milestone.order)
    }
  }

  private openSurvey(milestone: NsCampaignMilestone.IMilestone): void {
    const index = this.milestones().findIndex(m => m.order === milestone.order)
    if (this.stateAt(index) === 'completed') {
      this.snackBar.open(this.translate.instant(this.labels.surveyAlreadySubmitted), 'X', { duration: 5000 })
      return
    }
    this.dialog.open<CampaignSurveyDialogComponent, NsCampaignMicrosite.ICampaignSurveyDialogData, boolean>(CampaignSurveyDialogComponent, {
      data: { milestone },
      width: '750px',
      maxWidth: '90vw',
      autoFocus: false,
      disableClose: true,
    }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(submitted => {
      if (submitted) {
        this.refresh.update(count => count + 1)
      }
    })
  }
}
