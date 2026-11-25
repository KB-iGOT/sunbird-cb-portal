import { Component, DestroyRef, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, Data, RouterLink } from '@angular/router'
import { AppTocIframePageComponent } from '@sunbird-cb/toc'
import { DomainConfService } from '@sunbird-cb/utils-v2'

const EXT_TOC_PATH = '/app/toc/ext'

/**
 * Providers whose pages send `X-Frame-Options: SAMEORIGIN` / `frame-ancestors 'self'`,
 * so browsers refuse to render them inside our iframe ("<host> refused to connect").
 * These are opened in a new tab instead. Subdomains are matched too.
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

  ltiLaunchUrl = ''
  appIcon = ''
  previewUrl = ''
  /** True when the launch URL's provider blocks iframes, so we offer a new tab instead. */
  openInNewTab = false

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
      })
  }

  /** Called from a click, so the browser's popup blocker allows the new tab. */
  openCourse(): void {
    if (this.ltiLaunchUrl) {
      window.open(this.ltiLaunchUrl, '_blank', 'noopener')
    }
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
