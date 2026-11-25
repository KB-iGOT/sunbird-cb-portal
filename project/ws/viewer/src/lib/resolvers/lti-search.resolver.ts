import { inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

const LTI_REDIRECT_API = 'apis/proxies/v8/cios-enroll/lti/redirect'
const EXT_CONTENT_READ_API = '/apis/proxies/v8/cios/v1/content/read'

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
  if (!id) {
    return of(null)
  }

  const http = inject(HttpClient)

  // No partnerId: a plain redirect course. Fetch its redirectUrl from the content read API
  // rather than taking it from the URL, so it stays out of the address bar and survives refresh.
  if (!partnerId) {
    return http.get<any>(`${EXT_CONTENT_READ_API}/${encodeURIComponent(id)}`).pipe(
      map(res => {
        const redirectUrl = res?.content?.redirectUrl
        return redirectUrl ? { result: { redirectUrl } } : null
      }),
      catchError(() => of(null))
    )
  }

  const url = `${LTI_REDIRECT_API}/${encodeURIComponent(partnerId)}/${encodeURIComponent(id)}`

  return http.get<ILtiRedirectResponse>(url).pipe(
    catchError(() => of(null))
  )
}
