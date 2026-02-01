import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { IResolveResponse } from '@sunbird-cb/utils-v2'
import { Observable, of } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class MdoChannelDataService {
  constructor(
    @Inject('environment') private environment: any,
    private http: HttpClient) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {
    const mdoChannelsBookmarkId = this.environment && this.environment.mdoChannelsBookmarkId || ''
    const requestUrl: any = `/apis/proxies/v8/orgBookmark/v1/read/${mdoChannelsBookmarkId}`
    return this.http.get(requestUrl).pipe(
      map((rData: any) => ({ data: rData, error: null })),
      tap((resolveData: any) => {
        const finalData = resolveData && resolveData.data.result
        return of({ error: null, data: finalData })
      }),
      catchError((error: any) => of({ error, data: null })),
    )
  }
}
