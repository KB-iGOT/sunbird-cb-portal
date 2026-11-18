import { inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError } from 'rxjs/operators'

const LTI_REDIRECT_API = 'apis/proxies/v8/cios-enroll/lti/redirect'

export interface ILtiRedirectResponse {
  result?: {
    ltiLaunchUrl?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export const ltiSearchResolver: ResolveFn<ILtiRedirectResponse | null> = (
  route: ActivatedRouteSnapshot
): Observable<ILtiRedirectResponse | null> => {
  const id = route.queryParamMap.get('id')
  const partnerId = route.queryParamMap.get('partnerId')

  if (!id || !partnerId) {
    return of(null)
  }

  const url = `${LTI_REDIRECT_API}/${encodeURIComponent(partnerId)}/${encodeURIComponent(id)}`

  return inject(HttpClient).get<ILtiRedirectResponse>(url).pipe(
    catchError(() => of(null))
  )
}
