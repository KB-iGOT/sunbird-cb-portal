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
import { NsCampaignMilestone } from '@sunbird-cb/consumption'
import { DEFAULT_MILESTONE_LABELS, NsCampaignMicrosite, formatLabel } from '../../models/campaign-microsite.model'

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
  /** `milestoneLabel` from config, else the "Milestone N" label */
  label: string
  title: string
  description: string
  icon: NsCampaignMicrosite.TMilestonePopupIcon
  color: NsCampaignMicrosite.TMilestonePopupColor
  status: string
  tone: TStepTone
}

@Component({
  selector: 'ws-app-milestone-popup',
  templateUrl: './milestone-popup.component.html',
  styleUrl: './milestone-popup.component.scss',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestonePopupComponent {
  readonly config = input<NsCampaignMicrosite.IMilestonePopup | undefined>()
  /** Sorted by `order` */
  readonly milestones = input<NsCampaignMilestone.IMilestone[]>([])
  /** Resolved states, same order as `milestones` */
  readonly states = input<NsCampaignMilestone.TMilestoneState[]>([])
  /** Page text from config (already merged with defaults) */
  readonly labels = input<NsCampaignMicrosite.IMilestoneLabels>(DEFAULT_MILESTONE_LABELS)
  /** Same order as `milestones`: "Available from …" text while that milestone waits for the event date, else null */
  readonly availableFrom = input<(string | null)[]>([])

  readonly closed = output<void>()

  private readonly okRef = viewChild<ElementRef<HTMLButtonElement>>('ok')

  readonly steps = computed<IMilestonePopupStepView[]>(() => {
    const configSteps = this.config()?.steps || []
    return this.milestones().map((milestone, index) => {
      const step = configSteps.find(s => s.order === milestone.order)
      const state = milestone.enabled === false ? 'locked' : this.states()[index]
      const waitingLabel = this.availableFrom()[index]
      const { status, tone } = waitingLabel && state !== 'completed'
        ? { status: waitingLabel, tone: 'muted' as TStepTone }
        : this.statusFor(state)
      return {
        status,
        tone,
        number: index + 1,
        label: milestone.milestoneLabel || formatLabel(this.labels().popup.milestone, { number: index + 1 }),
        title: step?.title || milestone.name,
        description: step?.description || '',
        icon: step?.icon || DEFAULT_ICON[milestone.type] || 'assessment',
        color: step?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }
    })
  })

  constructor() {
    afterNextRender(() => this.okRef()?.nativeElement.focus())
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit()
  }

  private statusFor(state: NsCampaignMilestone.TMilestoneState | undefined): { status: string, tone: TStepTone } {
    const labels = this.labels().popup
    switch (state) {
      case 'completed':
        return { status: labels.completed, tone: 'success' }
      case 'inProgress':
        return { status: labels.inProgress, tone: 'warning' }
      case 'notStarted':
        return { status: labels.availableNow, tone: 'success' }
      default:
        return { status: labels.locked, tone: 'muted' }
    }
  }
}
