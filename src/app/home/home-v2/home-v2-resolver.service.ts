import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService, IResolveResponse } from '@sunbird-cb/utils-v2'
import { FormConfigService } from '@sunbird-cb/consumption'
import { Observable, map, catchError, of, switchMap } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class HomeV2ResolverService {
  private readonly configSvc = inject(ConfigurationsService)
  private readonly router = inject(Router)
  private readonly http = inject(HttpClient)
  private readonly formConfigSvc = inject(FormConfigService)

  constructor() { }

  resolve(): Observable<IResolveResponse<any>> {
    const profileDetails = this.configSvc?.unMappedUser?.profileDetails

    const isNotMyUser = profileDetails?.profileStatus?.toLowerCase() === 'not-my-user'
    const isIgotOrg = profileDetails?.employmentDetails?.departmentName?.toLowerCase() === 'igot'

    if (isNotMyUser && isIgotOrg) {
      this.router.navigateByUrl('app/person-profile/me#profileInfo')
    }
    const baseUrl = this.configSvc.sitePath
    const homeConfig = this.http.get<any>(`${baseUrl}/page/home-v2.json`).pipe(catchError(() => of(null)))
    const clientVersion = this.configSvc?.globalConfig?.formClientVersion?.['home'] || 1.0
    const response$ = this.formConfigSvc.getForm(this.configSvc?.unMappedUser, 'portal', 'home', clientVersion)
      .pipe(catchError(() => of(null)))

    return response$.pipe(
      switchMap(responseRes => {
        const responseConfigDetails = responseRes && responseRes.result && responseRes.result.data
        if (responseConfigDetails) {
          return of(responseConfigDetails)
        }
        return homeConfig.pipe(map(homeConfigRes => homeConfigRes ? homeConfigRes : []))
      }),
      map(configDetails => {
        // Pill visibility depends on /apis/proxies/v8/user/content/info, which is slow — that call
        // now happens in HomeV2Component after the page renders, so the pills section starts
        // optimistically visible with sectionLoading=true and shows a skeleton until it resolves.
        this.markPillsSectionLoading(configDetails)
        this.applyBharatKalpVisibility(configDetails)
        return { data: configDetails, error: null }
      }),
      catchError(err => of({ data: null, error: err })),
    )
  }

  private markPillsSectionLoading(configDetails: any): void {
    if (!configDetails || !Array.isArray(configDetails.homeSection)) {
      return
    }
    const pillsSection = configDetails.homeSection.find((section: any) => section.sectionKey === 'aparCourses')
    if (pillsSection) {
      pillsSection['sectionLoading'] = true
    }
  }

  // Bharat Kalp spotlight card is only for BharatKalp members, the route itself is guarded too
  private applyBharatKalpVisibility(configDetails: any): void {
    if (!configDetails || !Array.isArray(configDetails.homeSection) || this.isBharatKalpMember()) {
      return
    }
    const spotlightSection = configDetails.homeSection.find((section: any) => section.sectionKey === 'spotlight')
    if (spotlightSection && Array.isArray(spotlightSection.spotlightConfig)) {
      spotlightSection.spotlightConfig = spotlightSection.spotlightConfig
        .filter((card: any) => card?.cardClickDetails?.id !== 'bharat-kalp')
    }
  }

  private isBharatKalpMember(): boolean {
    const val = this.configSvc?.unMappedUser?.profileDetails?.additionalProperties?.isBharatKalpMember
    return val === true || val === 'true'
  }
}
