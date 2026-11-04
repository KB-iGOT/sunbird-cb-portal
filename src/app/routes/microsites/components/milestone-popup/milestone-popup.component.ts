import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NsCampaignMilestone } from '@sunbird-cb/consumption'
import { NsCampaignMicrosite } from '../../models/campaign-microsite.model'
import { isOpenState } from '../../services/milestone-status.service'

/** Translation keys (assets/i18n/en.json); `{{number}}` is the 1-based milestone position */
const LABELS = {
  close: 'campaignMicrosite.close',
  availableNow: 'campaignMicrosite.milestonePopup.availableNow',
  inProgress: 'campaignMicrosite.milestonePopup.inProgress',
  completed: 'campaignMicrosite.milestonePopup.completed',
  /** Shared with the milestone card */
  locked: 'campaignMicrosite.milestoneCard.locked',
  milestone: 'campaignMicrosite.milestonePopup.milestone',
  start: 'campaignMicrosite.milestonePopup.start',
  resume: 'campaignMicrosite.milestonePopup.resume',
}

const DEFAULT_ICON: Record<NsCampaignMilestone.TMilestoneType, NsCampaignMicrosite.TMilestonePopupIcon> = {
  assessment: 'assessment',
  event: 'event',
  survey: 'pledge',
}
const DEFAULT_COLORS: NsCampaignMicrosite.TMilestonePopupColor[] = ['navy', 'green', 'teal', 'orange']

type TStepTone = 'success' | 'warning' | 'muted'

export interface IMilestonePopupStepView {
  /** 1-based position */
  number: number
  /** `milestoneLabel` from config; the template falls back to the translated "Milestone N" */
  label?: string
  title: string
  description: string
  icon: NsCampaignMicrosite.TMilestonePopupIcon
  color: NsCampaignMicrosite.TMilestonePopupColor
  /** Translation key, interpolated with `number` */
  status: string
  tone: TStepTone
}

@Component({
  selector: 'ws-app-milestone-popup',
  templateUrl: './milestone-popup.component.html',
  styleUrl: './milestone-popup.component.scss',
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestonePopupComponent {
  readonly config = input<NsCampaignMicrosite.IMilestonePopup | undefined>()
  /** Sorted by `order` */
  readonly milestones = input<NsCampaignMilestone.IMilestone[]>([])
  /** Resolved states, same order as `milestones` */
  readonly states = input<NsCampaignMilestone.TMilestoneState[]>([])

  /** CTA: the user wants to open the current milestone */
  readonly start = output<NsCampaignMilestone.IMilestone>()
  readonly closed = output<void>()

  private readonly ctaRef = viewChild<ElementRef<HTMLButtonElement>>('cta')

  readonly labels = LABELS

  readonly steps = computed<IMilestonePopupStepView[]>(() => {
    const configSteps = this.config()?.steps || []
    return this.milestones().map((milestone, index) => {
      const step = configSteps.find(s => s.order === milestone.order)
      const { status, tone } = this.statusFor(milestone.enabled === false ? 'locked' : this.states()[index])
      return {
        status,
        tone,
        number: index + 1,
        label: milestone.milestoneLabel,
        title: step?.title || milestone.name,
        description: step?.description || '',
        icon: step?.icon || DEFAULT_ICON[milestone.type] || 'assessment',
        color: step?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }
    })
  })

  /** First milestone the user can act on (unlocked, not completed) */
  readonly currentIndex = computed(() => this.states().findIndex(isOpenState))

  /** CTA translation key and milestone number; `null` when no milestone is open */
  readonly cta = computed(() => {
    const index = this.currentIndex()
    if (index < 0) {
      return null
    }
    const label = this.states()[index] === 'inProgress' ? this.labels.resume : this.labels.start
    return { label, number: index + 1 }
  })

  constructor() {
    afterNextRender(() => this.ctaRef()?.nativeElement.focus())
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit()
  }

  onStart(): void {
    const milestone = this.milestones()[this.currentIndex()]
    if (milestone) {
      this.start.emit(milestone)
    }
  }

  private statusFor(state: NsCampaignMilestone.TMilestoneState | undefined): { status: string, tone: TStepTone } {
    switch (state) {
      case 'completed':
        return { status: this.labels.completed, tone: 'success' }
      case 'inProgress':
        return { status: this.labels.inProgress, tone: 'warning' }
      case 'notStarted':
        return { status: this.labels.availableNow, tone: 'success' }
      default:
        return { status: this.labels.locked, tone: 'muted' }
    }
  }
}
