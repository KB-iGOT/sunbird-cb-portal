import { Params, Router } from '@angular/router'

/**
 * Query param carrying the page that opened the player (e.g. the campaign microsite).
 * When present, Back and Finish in the viewer return there instead of the TOC.
 */
export const VIEWER_REDIRECT_PARAM = 'redirectUrl'

export interface IViewerRedirect {
  /** Full in-app URL, for `router.navigateByUrl` */
  fullUrl: string
  /** Path only, for components that take `url` + `queryParams` separately (back-nav widget) */
  url: string
  queryParams: Params
}

/**
 * Accepts in-app paths only (`/app/...`), so a crafted link cannot send users to another site:
 * rejects absolute URLs, protocol-relative `//host` and `/\host`.
 */
export function getViewerRedirect(router: Router, raw: string | null | undefined): IViewerRedirect | null {
  const value = (raw || '').trim()
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return null
  }
  const tree = router.parseUrl(value)
  const segments = tree.root.children['primary']?.segments.map(segment => segment.path) || []
  return {
    fullUrl: value,
    url: `/${segments.join('/')}`,
    queryParams: tree.queryParams,
  }
}
