
import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { ConfigurationsService, IResolveResponse } from '@sunbird-cb/utils-v2'
import { FormConfigService } from '@sunbird-cb/consumption'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class FormConfigResolverService  implements
Resolve<Observable<IResolveResponse<any>> | IResolveResponse<any>> {
constructor(
private http: HttpClient,
public configSvc: ConfigurationsService,
private formConfigSvc: FormConfigService) {}

resolve(
      _route: ActivatedRouteSnapshot,
      _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {
    const pageDataKey = _route.data.pageKey
    const pageSubType = _route.data.pageSubtype
    const pageType = _route.data.pageType || 'feature'
    return this.formConfigSvc.getForm(this.configSvc.unMappedUser, 'portal', pageSubType, 1).pipe(
        map((rData: any) => {
          const finalData = rData && rData.result?.form?.data || rData.result?.data
          return ({ data: finalData, error: null })
        }),
        catchError((_error: any) => {
          const baseUrl = this.configSvc.sitePath
          return this.http.get(`${baseUrl}/${pageType}/${pageDataKey}.json`).pipe(
            map(data => ({ data, error: null })),
            catchError(err => of({ data: null, error: err })),
          )
        }
      ),
    )
  }
}
