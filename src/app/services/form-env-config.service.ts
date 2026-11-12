import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs'

import { environment } from '../../../src/environments/environment'
import { FormConfigService } from '@sunbird-cb/consumption'
const API_END_POINTS = {
  PUBLIC_FORM_READ: '/apis/v1/form/read',
}

const PUBLIC_GLOBAL_ENV_REQUEST = {
  request: {
    type: 'page',
    subType: 'globalenv',
    action: 'portal_global_env_config',
    component: 'portal',
    rootOrgId: '*',
  },
}

/** Host part of a `sitePath` / URL value: "https://portal.uat.x.net/" -> "portal.uat.x.net" */
function hostOf(value: unknown): string {
  return String(value || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/\/.*$/, '')
}

/** True when an env config (globalenv form / global.env.json) belongs to the portal this page is served from */
export function matchesCurrentPortal(config: any): boolean {
  const sitePath = hostOf(config && config.sitePath)
  return !!sitePath && sitePath === window.location.host.toLowerCase()
}

@Injectable({
  providedIn: 'root',
})
export class FormEnvConfigService {

  constructor(private http: HttpClient, private formConfigSvc: FormConfigService) { }

  /**
   * Loads environment values from FormConfig API.
   * The globalenv form is picked by FormConfigService (readFormDetails/portal, then readById);
   * its criteria match any user, so it can load before the user read.
   *
   * Values already loaded from env.json remain untouched unless
   * they are explicitly included in API_ENVIRONMENT_KEYS.
   */
  async loadEnvironmentConfig(user: any = null): Promise<void> {
    try {
      // awaited for real: init reads these values right after, so they must be applied first.
      // globalEnvConfigReadData never errors - it falls back to the static global.env.json
      const response = await firstValueFrom(this.globalEnvConfigReadData(user))
      let formConfig = response?.data || response
      // both reads failed: the fallback is { data: null, error }, not config - keep env.json values
      if (!formConfig || formConfig.error) {
        formConfig = null
      }
      // The values for this portal come first. Without a session the protected read fails and the static
      // global.env.json is returned, which can belong to another environment (e.g. production values on UAT):
      // the public globalenv form read is answered for this portal, so use it when it matches.
      if (!matchesCurrentPortal(formConfig) && window.location.hostname !== 'localhost') {
        const publicConfig = await this.readPublicEnvConfig()
        if (publicConfig && (matchesCurrentPortal(publicConfig) || !formConfig)) {
          formConfig = publicConfig
        }
      }
      if (formConfig) {
        this.setApiEnvironmentValues(formConfig)
      }
    } catch (error) {
      console.error(
        'Error while loading environment configuration from FormConfig API',
        error
      )

      // Do not throw if application should continue with env.json values.
      // If API configuration is mandatory, change this to: throw error;
    }
  }

  /**
   * Loads environment values for a user without a session. The protected
   * formsConfig read returns 419 for them, so this uses the public form read.
   * Falls back to the static global.env.json, and keeps env.json values if both fail.
   */
  async loadPublicEnvironmentConfig(): Promise<void> {
    try {
      const formConfig = (await this.readPublicEnvConfig())
        || await firstValueFrom(this.http.get<any>(`/assets/configurations/global.env.json`).pipe(catchError(() => of(null))))
      if (formConfig) {
        this.setApiEnvironmentValues(formConfig)
      }
    } catch (error) {
      console.error('Error while loading public environment configuration', error)
    }
  }

  /** The public globalenv form read (no session needed); null when it fails or returns nothing */
  private readPublicEnvConfig(): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(API_END_POINTS.PUBLIC_FORM_READ, PUBLIC_GLOBAL_ENV_REQUEST).pipe(
        map((rData: any) => rData?.result?.form?.data || null),
        catchError(() => of(null)),
      ),
    )
  }

  private setApiEnvironmentValues(formConfig: any): void {


    const windowEnv = this.getWindowEnv()

    Object.assign(windowEnv, formConfig)

    // ---------------------------------------
    // Update Angular environment
    // ---------------------------------------

    Object.assign(environment, formConfig)
  }

  globalEnvConfigReadData(user: any): Observable<any> {

    return this.formConfigSvc.getForm(user, 'portal', 'globalenv', 1).pipe(

      tap(),

      map((rData: any) => {

        const finalData = rData?.result?.data

        return finalData
      }),

      catchError(() => {

        return this.http
          .get(`/assets/configurations/global.env.json`)
          .pipe(
            tap(() => {
            }),

            map((data: any) => data),

            catchError((fallbackError) => {
              return of({
                data: null,
                error: fallbackError
              })
            })
          )
      })
    )
  }
  private getWindowEnv(): { [key: string]: any } {
    return (window as { [key: string]: any })['env'] || {}
  }
}