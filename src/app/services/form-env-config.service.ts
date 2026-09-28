import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map, Observable, of, tap } from 'rxjs'

import { environment } from '../../../src/environments/environment'
const API_END_POINTS = {
  FORM_READ: '/apis/proxies/v8/formsConfig/v1/read',
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
          "name": "portal_global_env",
          "type": "page",
          "subType": "globalenv",
          "portal": "portal",
          "criteria": {
            "role": "PUBLIC",
            "rootOrg": "*"
          },
          "clientVersion": 1.0
        }
      }
      await this.globalEnvConfigReadData(payload).subscribe({
        next: (response) => {
          console.log('globalEnvConfigReadData response:', response)
          console.log('response-', response)
          const formConfig = response?.data || response

          if (!formConfig) {
            console.warn('FormConfig API returned empty response')
            return
          }

          this.setApiEnvironmentValues(formConfig)
        },
        error: (error) => {
          console.error('globalEnvConfigReadData error:', error)
        }
      })


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


    const windowEnv = this.getWindowEnv()

    Object.assign(windowEnv, formConfig)

    // ---------------------------------------
    // Update Angular environment
    // ---------------------------------------

    Object.assign(environment, formConfig)
  }

  globalEnvConfigReadData(payload: any): Observable<any> {

    console.log('payload:', payload)

    return this.formReadData(payload).pipe(

      tap({
        next: (response) => {
          console.log('3. FORM_READ RESPONSE:', response)
        },
        error: (error) => {
          console.error('3. FORM_READ ERROR:', error)
        },
        complete: () => {
          console.log('4. FORM_READ COMPLETE')
        }
      }),

      map((rData: any) => {

        console.log('rData--:', rData)

        const finalData = rData?.result?.data

        console.log('finalData--:', finalData)

        return finalData
      }),

      catchError((error: any) => {

        console.error('FORM_READ API ERROR:', error)

        return this.http
          .get(`/assets/configurations/global.env.json`)
          .pipe(
            tap((data) => {
              console.log('Fallback global.env.json:', data)
            }),

            map((data: any) => data),

            catchError((fallbackError) => {

              console.error(
                'Fallback global.env.json ERROR:',
                fallbackError
              )

              return of({
                data: null,
                error: fallbackError
              })
            })
          )
      })
    )
  }
  formReadData(request: any): Observable<any> {
    console.log('API_END_POINTS.FORM_READ', API_END_POINTS.FORM_READ)
    return this.http.post<any>(`${API_END_POINTS.FORM_READ}`, request)
  }

  private getWindowEnv(): { [key: string]: any } {
    return (window as { [key: string]: any })['env'] || {}
  }
}
