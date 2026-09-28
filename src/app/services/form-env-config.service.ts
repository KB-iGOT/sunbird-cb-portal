import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map, Observable, of } from 'rxjs'

import { environment } from '../../../src/environments/environment'
const API_END_POINTS = {
  FORM_READ: '/apis/v1/form/read',
}
@Injectable({
  providedIn: 'root',
})
export class FormEnvConfigService {

  constructor(private http: HttpClient) { }

  /**
   * Loads environment values from FormConfig API.
   *
   * Values already loaded from env.json remain untouched unless
   * they are explicitly included in API_ENVIRONMENT_KEYS.
   */
  async loadEnvironmentConfig(): Promise<void> {
    try {
      let payload = {
        "request": {
          "type": "page",
          "subType": "globalenv",
          "action": "page-configuration",
          "component": "portal",
          "rootOrgId": "*"
        }
      }
      const response: any = await this.globalEnvConfigReadData(payload)

      const formConfig = response?.data || response

      if (!formConfig) {
        console.warn('FormConfig API returned empty response')
        return
      }

      this.setApiEnvironmentValues(formConfig)

    } catch (error) {
      console.error(
        'Error while loading environment configuration from FormConfig API',
        error
      )

      // Do not throw if application should continue with env.json values.
      // If API configuration is mandatory, change this to: throw error;
    }
  }



  private setApiEnvironmentValues(formConfig: any): void {

    /**
     * ONLY PUT FIELDS HERE THAT SHOULD COME FROM FORMCONFIG API.
     *
     * Example:
     *
     * API:
     * {
     *   "azureHost": "...",
     *   "contentHost": "...",
     *   "channelId": "..."
     * }
     *
     * Then those fields will override the values from env.json.
     */

    const apiEnvironmentValues: Partial<typeof environment> = {
      // Example fields:
      portals: formConfig.portals
    }
    console.log('environment formConfig', formConfig)
    Object.keys(apiEnvironmentValues).forEach((key) => {
      const value = apiEnvironmentValues[key as keyof typeof apiEnvironmentValues]

      // Only override when API actually returned a value.
      if (value !== undefined && value !== null) {
        (environment as any)[key] = value
      }
    })
  }

  globalEnvConfigReadData(payload: any): Observable<any> {

    console.log('payload', payload)
    return this.formReadData(payload).pipe(
      map((rData: any) => {
        console.log('rData--', rData)
        const finalData = rData && rData.result.form.data
        return (finalData)
      }),
      catchError((_error: any) => {
        alert(2)
        return this.http.get(`/assets/configurations/global.env.json`).pipe(
          map(data => (data)),
          catchError(err => of({ data: null, error: err })),
        )
      }
      ),
    )
  }

  formReadData(request: any): Observable<any> {
    console.log('API_END_POINTS.FORM_READ', API_END_POINTS.FORM_READ)
    return this.http.post<any>(API_END_POINTS.FORM_READ, request)
  }
}