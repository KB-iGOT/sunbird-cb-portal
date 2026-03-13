import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { Subscription } from 'rxjs'
import { ConfigurationsService, ValueService, DomainConfService } from '@sunbird-cb/utils-v2'
import { LayoutStateService } from '../layout-state.service'

import { ActivatedRoute, Router } from '@angular/router'
import { UntypedFormControl } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { trigger, transition, style, animate } from '@angular/animations'
import { SearchNLP, SearchV4Request, SearchCategory } from '../../../../project/ws/app/src/lib/routes/search-v3/models/search-v3.model'
import { GbSearchService } from '../../../../project/ws/app/src/lib/routes/search-v3/services/gb-search.service'

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
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transition: 'visibility 0s linear 0.23s, opacity 0.33s linear', opacity: 0 }),
        animate('500ms', style({ transition: 'visibility 0s linear 0.23s, opacity 0.33s linear', opacity: 1, 'transition-delay': '0s' })),
      ]),
      transition(':leave', [
        style({ transition: 'visibility 1s linear 0.33s, opacity 0.33s linear', opacity: 1 }),
        animate('300ms', style({ transition: 'visibility 1s linear 0.33s, opacity 0.33s linear', opacity: 0, 'transition-delay': '0s' })),
      ]),
    ]
    ),
  ],
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
  loaderSearching = false

  tenantName = ''
  tenantLogo = ''
  userName = ''
  userProfileImg = ''
  queryControl: UntypedFormControl
  SAKSHAMAI_ICON_LOADER = '/assets/images/sakshamAI/saksham_ai_loader.gif';
  selectedSearchCategory: string = SearchCategory.Courses;
  openSearchTemplate = false;
  responseNlpQuery = '';
  searchSubscription: any
  allSearchResults: any[] = [];
  ref = 'home'
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>
  constructor(
    private activated: ActivatedRoute,
    private valueSvc: ValueService,
    public layoutState: LayoutStateService,
    public configSvc: ConfigurationsService,
    public domainConfSvc: DomainConfService,
    private router: Router,
    private searchV3Service: GbSearchService,
  ) {
    this.queryControl = new UntypedFormControl(
      this.activated.snapshot.queryParams.q || ''
    )


    this.queryControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(async (value) => {
        if (value.length > 1) {
          await this.searchFromQuery(value)
          this.loaderSearching = false
        } else {
          this.loaderSearching = false
        }
      })
  }

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

  clearSearchText() {

    this.queryControl.reset()
    this.updateQuery('')
  }

  processSearchText(query: any) {
    document.getElementById('global-search-input')?.blur()
    const queryParams = {
      q: query ? query?.trim() : '',
      search: query && this.responseNlpQuery ? this.responseNlpQuery : null,
      category: this.selectedSearchCategory || null,
      p: null,
      f: null,
      tab: null,
      filtersPanel: 'show',
    }
    const navigationExtras = {
      queryParams,
      queryParamsHandling: 'merge' as 'merge',
    }
    console.log('queryParams--', queryParams)
    const mergeQueryParams = window.location.pathname === '/app/globalsearch'
    if (this.ref === 'home') {
      this.router.navigate(['/app/globalsearch'], mergeQueryParams ? navigationExtras : { queryParams })
    } else {
      this.router.navigate([], { ...navigationExtras, relativeTo: this.activated.parent })
    }
    localStorage.removeItem('activeRoute')
    this.openSearchTemplate = false
  }

  async updateQuery(query: string) {
    if (query && query.length) {
      await this.searchInNLP(query).then(() => {
        this.processSearchText(query)
      }).catch(() => {
        this.processSearchText(query)
      })
    } else {
      this.processSearchText(query)
    }
  }

  async searchInNLP(query: string) {
    const searchRequest = new SearchNLP()
    searchRequest.query = query
    await this.searchV3Service
      .nlpSearch(searchRequest)
      .then(async (response) => {
        if (response?.data && response?.data?.keywords) {
          if (response?.data?.keywords.length > 0) {
            this.responseNlpQuery = response?.data?.keywords[0]?.keyword

          }
        } else {
          this.responseNlpQuery = ''
        }
      })
      .catch()
  }

  async searchFromQuery(query: string) {
    let courseSearchResult: any
    const searchRequest = new SearchV4Request([])
    searchRequest.request.query = query
    switch (this.selectedSearchCategory) {
      case SearchCategory.Courses:
        searchRequest.request.filters.courseCategory = 'course'
        break
    }
    courseSearchResult = await this.searchV3Service.searchCoursesv4(
      searchRequest
    ).catch()

    const validKeys = Object.keys(courseSearchResult?.result || {}).filter(
      (key) =>
        (key === 'Event' || key === 'content') &&
        Array.isArray(courseSearchResult.result[key]) &&
        courseSearchResult.result[key].length > 0
    )

    this.allSearchResults = validKeys.length
      ? courseSearchResult.result[validKeys[0]]
      : []
  }

  navigateToMyLearning(): void {
    this.router.navigate(['/app/seeAll/new'], {
      queryParams: { key: 'continueLearning' }
    })
  }

  navigateToSettings(): void {
    this.router.navigate(['/app/profile/settings'])
  }

  navigateToLogout(): void {

  }
}
