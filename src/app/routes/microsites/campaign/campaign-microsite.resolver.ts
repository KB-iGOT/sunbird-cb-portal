import { HttpClient } from '@angular/common/http'
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { NsCampaignMicrosite } from '../models/campaign-microsite.model'

/** Public config API (same origin, so it follows the environment: dev / qa / uat / prod) */
export const CAMPAIGN_MICROSITE_REMOTE_CONFIG = '/apis/public/v8/campaign-microsite/config/portal'
/** Copy shipped with the portal assets, used when the API fails or returns something unusable */
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
 * Loads the campaign microsite config from the public config API, falling back to the bundled asset when
 * that request fails or does not return a page config (e.g. an HTML error page).
 */
export const campaignMicrositeResolver: ResolveFn<ICampaignMicrositePageData> = () => {
  const http = inject(HttpClient)
  const fetchConfig = (url: string): Observable<NsCampaignMicrosite.IPageConfig> => http.get<unknown>(url).pipe(
    map(data => {
      if (!isPageConfig(data)) {
        throw new Error(`campaign microsite config at ${url} is not a page config`)
      }
      return data
    }),
  )

  return fetchConfig(CAMPAIGN_MICROSITE_REMOTE_CONFIG).pipe(
    catchError(remoteError => {
      // tslint:disable-next-line: no-console
      console.warn('Campaign microsite: config API unavailable, using the bundled config', remoteError)
      return fetchConfig(CAMPAIGN_MICROSITE_LOCAL_CONFIG)
    }),
    map(data => ({ data, error: null } as ICampaignMicrositePageData)),
    catchError(error => of({ error, data: null })),
  )
}
