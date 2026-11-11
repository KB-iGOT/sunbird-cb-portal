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

/**
 * Bundled config for this portal, by hostname:
 *   portal.igotkarmayogi.gov.in     -> campaign-microsite.json      (prod)
 *   portal.qa.karmayogibharat.net   -> campaign-microsite-qa.json
 *   portal.dev.karmayogibharat.net  -> campaign-microsite-dev.json
 *   portal.uat.karmayogibharat.net  -> campaign-microsite-uat.json
 * Matched on the `.qa.` / `.dev.` / `.uat.` label; any other host (prod, localhost) gets the plain file.
 */
export function campaignMicrositeLocalConfig(hostname: string): string {
  const host = (hostname || '').toLowerCase()
  const env = ['qa', 'dev', 'uat'].find(name => host.includes(`.${name}.`))
  return env ? CAMPAIGN_MICROSITE_LOCAL_CONFIG.replace(/\.json$/, `-${env}.json`) : CAMPAIGN_MICROSITE_LOCAL_CONFIG
}

/** Same shape as PageResolve, so the page keeps reading `route.data.pageData.data` */
export interface ICampaignMicrositePageData {
  data: NsCampaignMicrosite.IPageConfig | null
  error: unknown
}

function isPageConfig(value: unknown): value is NsCampaignMicrosite.IPageConfig {
  return !!value && typeof value === 'object' && Array.isArray((value as NsCampaignMicrosite.IPageConfig).sectionList)
}

/**
 * Loads the campaign microsite config from the public config API, falling back to the bundled asset for this
 * portal (see campaignMicrositeLocalConfig) when that request fails or does not return a page config (e.g.
 * an HTML error page), and to the plain bundled file when the portal's own one is missing too.
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
    map(data => ({ data, error: null } as ICampaignMicrositePageData)),
    catchError(remoteError => {
      // tslint:disable-next-line: no-console
      console.warn('Campaign microsite: config API unavailable, using the bundled config', remoteError)
      const localConfig = campaignMicrositeLocalConfig(window.location.hostname)
      const local$ = localConfig === CAMPAIGN_MICROSITE_LOCAL_CONFIG
        ? fetchConfig(localConfig)
        : fetchConfig(localConfig).pipe(catchError(() => fetchConfig(CAMPAIGN_MICROSITE_LOCAL_CONFIG)))
      return local$.pipe(
        map(data => ({ data, error: null } as ICampaignMicrositePageData)),
        catchError(error => of({ error, data: null })),
      )
    }),
  )
}
