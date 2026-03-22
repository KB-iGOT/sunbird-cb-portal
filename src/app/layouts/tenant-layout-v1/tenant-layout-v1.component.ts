import { Component, OnInit, OnDestroy, ViewChild, ElementRef, TemplateRef } from '@angular/core'
import { Subscription } from 'rxjs'
import { ConfigurationsService, ValueService, DomainConfService, AuthKeycloakService, UtilityService } from '@sunbird-cb/utils-v2'
import { LayoutStateService } from '../layout-state.service'

import { ActivatedRoute, Router } from '@angular/router'
import { UntypedFormControl } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { trigger, transition, style, animate } from '@angular/animations'
import { SearchNLP, SearchV4Request, SearchCategory } from '../../../../project/ws/app/src/lib/routes/search-v3/models/search-v3.model'
import { GbSearchService } from '../../../../project/ws/app/src/lib/routes/search-v3/services/gb-search.service'

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { PrfileEditV2Component } from '../../../../project/ws/app/src/lib/routes/profile-v2/revamp-dialogs/prfile-edit-v2/prfile-edit-v2.component'
import * as _ from 'lodash'
import { ProfileV2RevampService } from '../../../../project/ws/app/src/lib/routes/profile-v2/services/profile-v2-revamp.service'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { HttpErrorResponse } from '@angular/common/http'

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
  isDownloadableIos = false
  isDownloadableAndroid = false
  disabled = false
  dialogRef: any
  primaryDetails: any
  profileImageUrl = '';
  profesionalDetails: any
  profileData: any
  @ViewChild('logoutDialog') logoutDialog!: TemplateRef<any>

  constructor(
    private activated: ActivatedRoute,
    private valueSvc: ValueService,
    public layoutState: LayoutStateService,
    public configSvc: ConfigurationsService,
    public domainConfSvc: DomainConfService,
    private router: Router,
    private searchV3Service: GbSearchService,
    private authService: AuthKeycloakService,
    private utilitySvc: UtilityService,
    private dialog: MatDialog,
    private profileV2RevampSvc: ProfileV2RevampService,
    private snackBar: MatLegacySnackBar,
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

    if (this.configSvc.restrictedFeatures) {
      this.isDownloadableIos = !this.configSvc.restrictedFeatures.has('iosDownload')
      this.isDownloadableAndroid = !this.configSvc.restrictedFeatures.has('androidDownload')
    }
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

  navigateToProfile(header: string): void {
    // this.router.navigate(['/app/person-profile', 'me'])
    console.log(this.configSvc.userProfile)
    let data = this.configSvc.userProfile
    this.profesionalDetails = _.merge(_.get(data, 'profiledetails', _.get(data, 'profileDetails', _.get(data, 'profile.data', {}))), {
      professionalDetails: _.get(data, 'professionalDetails', {})
    })
    this.profileData = _.get(data, 'firstName', '')
    this.profesionalDetails['userId'] = _.get(data, 'userId', '')

    this.profileImageUrl = _.get(data, 'profileImageUrl', '')

    this.primaryDetails = {
      firstname: this.profileData
    }

    const dialogDetails: any = {
      header: header,
      profileDetails: this.primaryDetails,
    }
    if (header === 'Profile') {
      dialogDetails.profileDetails = {
        profileImage: this.profileImageUrl,
        firstname: _.get(this.primaryDetails, 'firstname', ''),
      }
    }

    // For mandatorySection, wrap dialogDetails and include approval fields
    let dialogData: any

    dialogData = dialogDetails

    const dialogRef = this.dialog.open(PrfileEditV2Component, {
      data: dialogData,
      disableClose: true,
      panelClass: 'dialog_sidenav',
      autoFocus: false,
      width: "400px"
    })

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.generateBasicProfileFormBody(result)
      }
    })

  }

  fetchProfileDetails() {
    let userId: any = this.configSvc.userProfile?.userId
    this.profileV2RevampSvc.fetchUserProfile(userId).subscribe({
      next: (response: any) => {
        if (response) {
          console.log('response--', response)
          this.profesionalDetails = _.get(response, 'result.response.profiledetails', _.get(response, 'result.response.profileDetails', _.get(response, 'result', {})))
          // this.userName = `${this.configSvc.userProfile.firstName || ''} ${this.configSvc.userProfile.lastName || ''}`.trim()
          let userPidProfile = response?.result?.response
          this.configSvc.unMappedUser = userPidProfile
          const profileV2 = _.get(userPidProfile, 'profileDetails')
          this.configSvc.userProfile = {
            country: _.get(profileV2, 'personalDetails.countryCode') || null,
            email: _.get(profileV2, 'profileDetails.officialEmail') || userPidProfile.email,
            givenName: userPidProfile.firstName,
            userId: userPidProfile.userId,
            firstName: userPidProfile.firstName,
            lastName: userPidProfile.lastName,
            rootOrgId: userPidProfile.rootOrgId,
            rootOrgName: userPidProfile.channel,
            // tslint:disable-next-line: max-line-length
            // userName: `${userPidProfile.firstName ? userPidProfile.firstName : ' '}${userPidProfile.lastName ? userPidProfile.lastName : ' '}`,
            userName: userPidProfile.userName,
            profileImage: userPidProfile.thumbnail,
            departmentName: userPidProfile.channel,
            dealerCode: null,
            isManager: false,
            profileUpdateCompletion: _.get(userPidProfile, 'profileUpdateCompletion') || 0,
            profileImageUrl: _.get(userPidProfile, 'profileDetails.profileImageUrl') || '',
            professionalDetails: _.get(userPidProfile, 'profileDetails.professionalDetails') || [],
            userRootOrg: _.get(userPidProfile, 'rootOrg') || null
          }
          console.log('this.configSvc.userProfile=--', this.configSvc.userProfile)

          this.configSvc.userProfileV2 = {
            userId: _.get(profileV2, 'userId') || userPidProfile.userId,
            email: _.get(profileV2, 'personalDetails.officialEmail') || userPidProfile.email,
            firstName: _.get(profileV2, 'personalDetails.firstname') || userPidProfile.firstName,
            surName: _.get(profileV2, 'personalDetails.surname') || userPidProfile.lastName,
            middleName: _.get(profileV2, 'personalDetails.middlename') || '',
            departmentName: _.get(profileV2, 'employmentDetails.departmentName') || userPidProfile.channel,
            givenName: _.get(userPidProfile, 'userName'),
            // tslint:disable-next-line: max-line-length
            userName: `${_.get(profileV2, 'personalDetails.firstname') ? _.get(profileV2, 'personalDetails.firstname') : ''}${_.get(profileV2, 'personalDetails.surname') ? _.get(profileV2, 'personalDetails.surname') : ''}`,
            profileImage: _.get(profileV2, 'photo') || userPidProfile.thumbnail,
            profileImageUrl: _.get(userPidProfile, 'profileDetails.profileImageUrl') || '',
            dealerCode: null,
            isManager: false,
            competencies: _.get(profileV2, 'competencies') || [],
            desiredCompetencies: _.get(profileV2, 'desiredCompetencies') || [],
            systemTopics: _.get(profileV2, 'systemTopics') || [],
            desiredTopics: _.get(profileV2, 'desiredTopics') || [],
            userRoles: _.get(profileV2, 'userRoles') || [],
            webPortalLang: _.get(profileV2, 'additionalProperties.webPortalLang') || '',
          }

          this.userName = `${this.configSvc.userProfile.firstName || ''} ${this.configSvc.userProfile.lastName || ''}`.trim()
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error) {
          this.openSnackbar('Something went wrong please try again')
        }
      }
    })
  }

  generateBasicProfileFormBody(result: any): any {
    if (result) {
      const formBody: any = {
        request: {
          userId: this.configSvc.userProfile?.userId,
          profileDetails: {}
        }
      }

      // Define field mappings with their paths in the API response and form body
      const fieldMappings: {
        formField: string,
        resultPath: string,
        formBodyPath: string,
        isCader?: boolean
      }[] = [
          {
            formField: 'profileImageUrl',
            resultPath: 'profileImageUrl',
            formBodyPath: 'profileDetails.profileImageUrl'
          },
          {
            formField: 'firstname',
            resultPath: 'firstname',
            formBodyPath: 'profileDetails.personalDetails.firstname'
          }
        ]

      let hasChanges = false

      // Compare each field and add to form body if changed
      fieldMappings.forEach(mapping => {
        const currentValue = _.get(result, mapping.resultPath, null)
        let formValue = this.primaryDetails[mapping.formField]
        if ((
          (formValue !== currentValue && currentValue !== null) &&
          (
            (formValue === 'NA' && currentValue !== '') ||
            formValue !== 'NA'
          )
        )
          || mapping.isCader
        ) {
          const pathParts = mapping.formBodyPath.split('.')
          let current = formBody.request

          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i]
            if (part.includes('[0]')) {
              const arrayKey = part.replace('[0]', '')
              if (!current[arrayKey]) current[arrayKey] = [{}]
              current = current[arrayKey][0]
            } else {
              if (!current[part]) current[part] = {}
              current = current[part]
            }
          }

          // Set the final value
          const finalKey = pathParts[pathParts.length - 1]
          current[finalKey] = currentValue
          hasChanges = true
        }
      })

      if (hasChanges) {
        this.updateProfileDetails(formBody)
      }
    }
  }

  updateProfileDetails(formBody: any) {
    this.profileV2RevampSvc.updateProfileDetailsV3(formBody).subscribe({
      next: (response: any) => {
        if (response) {
          this.fetchProfileDetails()


          this.openSnackbar('Updated Successfully')
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error) {
          const errorMessage = this.getErrorMessage(error)
          this.openSnackbar(errorMessage)
        }
      }
    })
  }

  getErrorMessage(error: HttpErrorResponse): string {
    const errorMsg = _.get(error, 'error.params.errmsg', '') || _.get(error, 'error.message', '')
    // Return specific error message if available, otherwise return generic message
    return errorMsg || 'Something went wrong please try again'
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
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

  navigateToLogout() {
    this.dialogRef = this.dialog.open(this.logoutDialog, {
      width: '200px'
    })
  }

  confirmed() {
    this.disabled = true
    this.dialogRef.close()
    this.authService.force_logout()
    // this.router.navigate(['public', 'logout'])
    // this.router.logout()
  }

  get isDownloadable() {
    if (this.configSvc.instanceConfig && this.configSvc.instanceConfig.isContentDownloadAvailable &&
      (this.utilitySvc.iOsAppRef || this.utilitySvc.isAndroidApp)) {
      return true
    }
    return false
  }
}
