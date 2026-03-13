import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ConfigurationsService, ValueService, DomainConfService } from '@sunbird-cb/utils-v2'
import { LayoutStateService } from '../layout-state.service'

import { Router } from '@angular/router'

/**
 * TenantLayoutV1Component
 *
 * Custom layout for external tenants (e.g., Mauritius).
 * Features a simplified header with tenant branding, clean content area,
 * and minimal footer. No chatbot, no bottom nav.
 */
@Component({
  selector: 'app-tenant-layout-v1',
  templateUrl: './tenant-layout-v1.component.html',
  styleUrls: ['./tenant-layout-v1.component.scss'],
})
export class TenantLayoutV1Component implements OnInit, OnDestroy {
  isXSmall$ = this.valueSvc.isXSmall$
  private subs: Subscription[] = []

  showNavbar = true
  showFooter = false
  hideHeaderAndFooter = false
  headerFooterConfigData: any = null
  isSetupPage = false
  navBarRequired = true

  tenantName = ''
  tenantLogo = ''
  userName = ''
  userProfileImg = ''

  constructor(
    private valueSvc: ValueService,
    public layoutState: LayoutStateService,
    public configSvc: ConfigurationsService,
    public domainConfSvc: DomainConfService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Build tenant branding
    this.tenantName = this.domainConfSvc.subdomain
    this.tenantLogo = this.domainConfSvc.getDomainAppLogo()

    if (this.configSvc.userProfile) {
      this.userName = `${this.configSvc.userProfile.firstName || ''} ${this.configSvc.userProfile.lastName || ''}`.trim()
      this.userProfileImg = this.configSvc.userProfile.source_profile_picture || ''
    }

    // Single subscription to the unified state stream — 1 subscription instead of 6
    this.subs.push(
      this.layoutState.state$.subscribe(s => {
        this.showNavbar = s.showNavbar
        this.showFooter = s.showFooter
        this.hideHeaderAndFooter = s.hideHeaderAndFooter
        this.headerFooterConfigData = s.headerFooterConfigData
        this.isSetupPage = s.isSetupPage
        this.navBarRequired = s.navBarRequired
      }),
    )
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe())
  }

  navigateToHome(): void {
    this.router.navigate(['/page/home'])
  }

  navigateToExplore(): void {
    this.router.navigate(['/app/globalsearch'], { queryParams: { tab: 'Explore' } })
  }

  navigateToProfile(): void {
    this.router.navigate(['/app/person-profile', 'me'])
  }
}
