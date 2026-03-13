import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ValueService } from '@sunbird-cb/utils-v2'
import { LayoutStateService } from '../layout-state.service'
import { DomainConfService } from '@sunbird-cb/utils-v2'

/**
 * DefaultLayoutComponent
 *
 * Renders the standard portal layout with ws-header, router-outlet,
 * chatbot, footer, and bottom navigation. Used for core and internal tenants.
 */
@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  isXSmall$ = this.valueSvc.isXSmall$
  private subs: Subscription[] = []

  // State from LayoutStateService - synced via subscriptions
  navBarRequired = true
  showNavbar = true
  showFooter = false
  showBottomNav = true
  showHubs = true
  headerFooterConfigData: any = null
  hideHeaderAndFooter = false
  isSetupPage = false
  customHeight = false
  disableHeightOnTop = false
  mobileTopHeaderVisibilityStatus = true
  viewerPage = false
  iGOTAIConfigLoaded = false
  rootOrgId = ''

  constructor(
    private valueSvc: ValueService,
    public layoutState: LayoutStateService,
    public tenantConfigSvc: DomainConfService,
  ) {}

  ngOnInit(): void {
    // Single subscription to the unified state stream — 1 subscription instead of 14
    this.subs.push(
      this.layoutState.state$.subscribe(s => {
        this.navBarRequired = s.navBarRequired
        this.showNavbar = s.showNavbar
        this.showFooter = s.showFooter
        this.showBottomNav = s.showBottomNav
        this.showHubs = s.showHubs
        this.headerFooterConfigData = s.headerFooterConfigData
        this.hideHeaderAndFooter = s.hideHeaderAndFooter
        this.isSetupPage = s.isSetupPage
        this.customHeight = s.customHeight
        this.disableHeightOnTop = s.disableHeightOnTop
        this.mobileTopHeaderVisibilityStatus = s.mobileTopHeaderVisibilityStatus
        this.viewerPage = s.viewerPage
        this.iGOTAIConfigLoaded = s.iGOTAIConfigLoaded
        this.rootOrgId = s.rootOrgId
      }),
    )
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe())
  }
}
