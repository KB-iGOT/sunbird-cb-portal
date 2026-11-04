import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core'
import { Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { isKarmaWalletTourSnoozed } from '../../../component/app-tour/karma-wallet-tour-snooze'
import { CommonDataService } from '../../../services/common-data.service'

/** global-config -> components.dialogs key that switches the popup on and off */
export const CAMPAIGN_POPUP_DIALOG_KEY = 'milestoneCampaign'

// TODO: mock content until the client's design lands (the real homepage popup is planned on Netcore)
export const CAMPAIGN_POPUP_MOCK = {
  image: '/assets/images/micro-sites/campaign/leadership-as-mission-banner.png',
  eyebrow: 'National Workshop · NITI Aayog',
  title: 'Leadership as Mission',
  description: 'Lessons from twenty-five years of Leadership, 2001 – 2026. Complete your programme milestones and be part of the journey.',
  meta: ['17 November 2026', 'Bharat Mandapam, New Delhi'],
  ctaLabel: 'Explore the campaign',
  dismissLabel: 'Maybe later',
  redirectUrl: '/app/microsites/campaign',
}

@Component({
  selector: 'ws-campaign-popup',
  templateUrl: './campaign-popup.component.html',
  styleUrls: ['./campaign-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslateModule],
})
export class CampaignPopupComponent {
  private readonly router = inject(Router)
  private readonly configSvc = inject(ConfigurationsService)
  private readonly commonDataSvc = inject(CommonDataService)

  private readonly ctaRef = viewChild<ElementRef<HTMLButtonElement>>('cta')

  readonly content = CAMPAIGN_POPUP_MOCK
  readonly isOpen = signal(this.shouldOpen())

  constructor() {
    afterNextRender(() => this.ctaRef()?.nativeElement.focus())
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close()
    }
  }

  close(): void {
    this.isOpen.set(false)
  }

  openCampaign(): void {
    this.close()
    this.router.navigateByUrl(this.content.redirectUrl)
  }

  /** Opens on every homepage visit while switched on in config */
  private shouldOpen(): boolean {
    return this.commonDataSvc.isDialogEnabled(CAMPAIGN_POPUP_DIALOG_KEY) && !this.isTourPending()
  }

  private isTourPending(): boolean {
    if (!this.commonDataSvc.isDialogEnabled('tour')) {
      return false
    }
    const user = this.configSvc.unMappedUser
    const profileDetails = user?.profileDetails
    const getStarted = profileDetails?.get_started_tour_v2
    if (!(getStarted?.skipped || getStarted?.visited)) {
      return true
    }
    const karmaWalletTour = profileDetails?.karma_wallet_tour
    const walletDone = isKarmaWalletTourSnoozed(user?.id)
      || (karmaWalletTour?.visited === true && karmaWalletTour?.video_visited === true)
    return !walletDone
  }
}
