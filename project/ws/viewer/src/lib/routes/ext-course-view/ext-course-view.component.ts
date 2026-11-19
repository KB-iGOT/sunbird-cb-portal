import { Component, DestroyRef, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Data } from '@angular/router'
import { AppTocIframePageComponent } from '@sunbird-cb/toc'
import { DomainConfService } from '@sunbird-cb/utils-v2'

const EXT_TOC_PATH = '/app/toc/ext'

@Component({
  selector: 'ws-app-ext-course-view',
  imports: [
    AppTocIframePageComponent,
  ],
  templateUrl: './ext-course-view.component.html',
})
export class ExtCourseViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly domainConfSvc = inject(DomainConfService)
  private readonly destroyRef = inject(DestroyRef)

  ltiLaunchUrl = ''
  appIcon = ''
  previewUrl = ''

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
        this.ltiLaunchUrl = data?.['pageData']?.result?.ltiLaunchUrl ?? ''
      })
  }
}
