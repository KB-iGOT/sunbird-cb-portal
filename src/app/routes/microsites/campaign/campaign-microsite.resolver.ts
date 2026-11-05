import { HttpClient } from '@angular/common/http'
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { NsCampaignMicrosite } from '../models/campaign-microsite.model'

/** Published page config in the content store (same origin, so it follows the environment: dev / uat / prod) */
export const CAMPAIGN_MICROSITE_REMOTE_CONFIG = '/assets/public/content/campaign-microsite/campaign-microsite.json'
/** Copy shipped with the portal assets, used when the published one is missing or unusable */
export const CAMPAIGN_MICROSITE_LOCAL_CONFIG = '/assets/configurations/feature/campaign-microsite.json'

/** Same shape as PageResolve, so the page keeps reading `route.data.pageData.data` */
export interface ICampaignMicrositePageData {
  data: NsCampaignMicrosite.IPageConfig | null
  error: unknown
}

function isPageConfig(value: unknown): value is NsCampaignMicrosite.IPageConfig {
  return !!value && typeof value === 'object' && Array.isArray((value as NsCampaignMicrosite.IPageConfig).sectionList)
}

/**
 * Loads the campaign microsite config from the content store, falling back to the bundled asset when
 * that request fails or does not return a page config (e.g. an HTML error page).
 */
export const campaignMicrositeResolver: ResolveFn<ICampaignMicrositePageData> = () => {
  const http = inject(HttpClient)
  // `timestamp` busts browser / CDN caches so content-store edits show up on the next page load
  const fetchConfig = (url: string): Observable<NsCampaignMicrosite.IPageConfig> => http.get<unknown>(url, {
    params: { timestamp: Date.now().toString() },
  }).pipe(
    map(data => {
      if (!isPageConfig(data)) {
        throw new Error(`campaign microsite config at ${url} is not a page config`)
      }
      return data
    }),
  )

  return fetchConfig(CAMPAIGN_MICROSITE_REMOTE_CONFIG).pipe(
    map(data => ({ data, error: null } as ICampaignMicrositePageData)),
    catchError(remoteError => {
      // tslint:disable-next-line: no-console
      console.warn('Campaign microsite: published config unavailable, using the bundled one', remoteError)
      return fetchConfig(CAMPAIGN_MICROSITE_LOCAL_CONFIG).pipe(
        map(data => ({ data, error: null } as ICampaignMicrositePageData)),
        catchError(error => of({ data: null, error })),
      )
    }),
  )
}
