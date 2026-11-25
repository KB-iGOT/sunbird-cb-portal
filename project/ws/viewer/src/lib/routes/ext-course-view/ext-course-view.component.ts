import { Location } from '@angular/common'
import { Component, DestroyRef, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, Data, Router, RouterLink } from '@angular/router'
import { AppTocIframePageComponent } from '@sunbird-cb/toc'
import { DomainConfService } from '@sunbird-cb/utils-v2'

const EXT_TOC_PATH = '/app/toc/ext'

/**
 * Providers whose pages send `X-Frame-Options: SAMEORIGIN` / `frame-ancestors 'self'`,
 * so browsers refuse to render them inside our iframe ("<host> refused to connect").
 * These are opened in a new tab automatically and the user is taken back to the
 * previous page. Subdomains are matched too.
 */
export const NON_FRAMEABLE_HOSTS = ['coursera.org']

@Component({
  selector: 'ws-app-ext-course-view',
  imports: [
    AppTocIframePageComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './ext-course-view.component.html',
  styleUrl: './ext-course-view.component.scss',
})
export class ExtCourseViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly domainConfSvc = inject(DomainConfService)
  private readonly destroyRef = inject(DestroyRef)
  private readonly router = inject(Router)
  private readonly location = inject(Location)

  ltiLaunchUrl = ''
  appIcon = ''
  previewUrl = ''
  /** True when the launch URL's provider blocks iframes, so it is opened in a new tab instead. */
  openInNewTab = false
  /**
   * True when the automatic new tab was blocked by the browser's popup blocker.
   * The template then shows an "Open course" button, since a click is always allowed.
   */
  popupBlocked = false

  ngOnInit(): void {
    this.appIcon = this.domainConfSvc.getDomainAppLogo() || ''

    // `pageData` is resolved by ltiSearchResolver before this component is created.
    // Subscribing (instead of reading the snapshot once) keeps the view in sync if the
    // route is re-used with different query params; the child re-renders on each change.
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: Data) => {
        const id = this.route.snapshot.queryParamMap.get('id')
        this.previewUrl = id ? `${EXT_TOC_PATH}/${id}` : ''
        const result = data?.['pageData']?.result
        // Prefer the LTI launch URL; some partners return a plain `redirectUrl` instead.
        this.ltiLaunchUrl = result?.ltiLaunchUrl || toIframeUrl(result?.redirectUrl)
        this.openInNewTab = !!this.ltiLaunchUrl && !canBeFramed(this.ltiLaunchUrl)
        this.popupBlocked = false
        if (this.openInNewTab) {
          this.openCourse()
        }
      })
  }

  /**
   * Opens the launch URL in a new tab and takes the user back to where they came from.
   * Runs automatically for non-frameable URLs; if the browser blocks that popup (no recent
   * click), `popupBlocked` is set and the "Open course" button calls this again.
   */
  openCourse(): void {
    if (!this.ltiLaunchUrl) {
      return
    }
    // Not passing 'noopener' in the features string: with it, window.open always returns
    // null and we could not tell a blocked popup from an opened one. Clearing `opener`
    // afterwards gives the same protection.
    const tab = window.open(this.ltiLaunchUrl, '_blank')
    if (!tab) {
      this.popupBlocked = true
      return
    }
    tab.opener = null
    this.navigateBack()
  }

  private navigateBack(): void {
    // `router.navigated` is true once an earlier in-app navigation has finished, i.e. the
    // user reached this page from inside the portal, so history.back() stays in the app.
    // On a direct link / fresh load, go to the course TOC (or home) instead, replacing this
    // page so the browser back button doesn't land here and open the tab again.
    const cameFromApp = this.router.navigated
    // Defer until the current navigation (the one that created this page) has completed.
    setTimeout(() => {
      if (cameFromApp) {
        this.location.back()
      } else {
        this.router.navigateByUrl(this.previewUrl || '/', { replaceUrl: true })
      }
    })
  }
}

/** False when the URL's host is in NON_FRAMEABLE_HOSTS (or a subdomain of one). */
export function canBeFramed(url: string): boolean {
  let host: string
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    return true
  }
  return !NON_FRAMEABLE_HOSTS.some(h => host === h || host.endsWith(`.${h}`))
}

/**
 * Normalises a partner `redirectUrl` so it can be used as an iframe `src`:
 * - decodes it if it arrives percent-encoded (e.g. `https%3A%2F%2F...`)
 * - adds `https:` to protocol-relative (`//host/...`) or scheme-less (`host/...`) URLs
 * - upgrades `http://` to `https://` (the portal is served over https, so an http
 *   iframe would be blocked as mixed content)
 * Returns '' for empty values or anything that is not an http(s) URL.
 */
export function toIframeUrl(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }
  let url = value.trim()
  try {
    // Decode at most twice to handle single/double encoded values.
    for (let i = 0; i < 2 && /^[a-z][a-z0-9+.-]*%(25)?3A/i.test(url); i += 1) {
      url = decodeURIComponent(url)
    }
  } catch {
    return ''
  }
  if (!url) {
    return ''
  }
  if (url.startsWith('//')) {
    url = `https:${url}`
  } else if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    url = `https://${url.replace(/^\/+/, '')}`
  }
  url = url.replace(/^http:\/\//i, 'https://')
  return /^https:\/\/[^/\s]+/i.test(url) ? url : ''
}
