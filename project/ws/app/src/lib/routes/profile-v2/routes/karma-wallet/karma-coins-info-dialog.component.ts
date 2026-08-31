import { Component, ViewEncapsulation } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'

const ICON_BASE = '/assets/icons/karmawallet-v2'

interface IKarmaFlowStep {
  /* Badge artwork; already includes its own disc and step number */
  icon: string
  value: string
  caption: string
}

@Component({
  selector: 'ws-app-karma-coins-info-dialog',
  templateUrl: './karma-coins-info-dialog.component.html',
  styleUrls: ['./karma-coins-info-dialog.component.scss'],
  // The Material dialog surface is this component's ancestor, not its descendant, so it
  // cannot be reached through view encapsulation. Disabling it keeps the surface override
  // in this file instead of the global stylesheet; every selector is scoped under
  // .kci-dialog-panel or .kci so nothing leaks past this dialog.
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class KarmaCoinsInfoDialogComponent {

  /* Every icon this dialog renders, so re-pointing the asset folder is a one-place change */
  readonly icons = {
    /* Numbered discs along the worked example */
    badgeKarmaPoints: `${ICON_BASE}/badgekarmapoints.svg`,
    badgeKarmaCoin: `${ICON_BASE}/badgekarmacoin.svg`,
    badgeRedeem: `${ICON_BASE}/badgeredeem.svg`,
    badgeKarmaWallet: `${ICON_BASE}/badgekarmawallet.svg`,
    /* Plain coin on the "Karma Coins" card */
    karmaCoin: `${ICON_BASE}/karmacoin.svg`,
    /* Heads the "How Karma Coins work" explainer */
    bell: `${ICON_BASE}/bell.svg`,
    /* TODO: no karmawallet-v2 equivalent supplied for this one yet, so it still
       resolves from home-v2. Move it once the new filename is known. */
    karmaPoints: '/assets/icons/home-v2/karma-badge.svg',
  }

  /* Worked example of a 100-point earn, spend and leftover balance */
  readonly flowSteps: IKarmaFlowStep[] = [
    {
      icon: this.icons.badgeKarmaPoints,
      value: '100',
      caption: 'Karma Points earned',
    },
    {
      icon: this.icons.badgeKarmaCoin,
      value: '+100',
      caption: 'Karma Coins received',
    },
    {
      icon: this.icons.badgeRedeem,
      value: '−20',
      caption: 'Redeemed for a course',
    },
    {
      icon: this.icons.badgeKarmaWallet,
      value: '80',
      caption: 'Coins left 100 points stay',
    },
  ]

  constructor(private dialogRef: MatDialogRef<KarmaCoinsInfoDialogComponent>) { }

  /**
   * Closes with the control that dismissed it. Only this component knows whether the X or the
   * confirm button was used, so the opener reads it off afterClosed() for telemetry.
   */
  close(via: 'close-icon' | 'i-understand' = 'close-icon') {
    this.dialogRef.close(via)
  }
}
