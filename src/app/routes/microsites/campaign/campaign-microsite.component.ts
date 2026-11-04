import { Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ContentStripWithTabsLibModule, KeyHighlightsModule, SlidersLibModule } from '@sunbird-cb/consumption'
import { UtilityService } from '@sunbird-cb/utils-v2'
import { cloneDeep } from 'lodash'
import { NsCampaignMicrosite } from '../models/campaign-microsite.model'
import { ProgrammeMilestonesComponent } from '../components/programme-milestones/programme-milestones.component'

@Component({
  selector: 'ws-app-campaign-microsite',
  imports: [SlidersLibModule, KeyHighlightsModule, ContentStripWithTabsLibModule, ProgrammeMilestonesComponent],
  templateUrl: './campaign-microsite.component.html',
  styleUrl: './campaign-microsite.component.scss',
})
export class CampaignMicrositeComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly utilitySvc = inject(UtilityService)

  private readonly pageConfig = signal<NsCampaignMicrosite.IPageConfig | undefined>(
    this.route.snapshot.data?.pageData?.data,
  )
  /** Column keys whose key-highlights reported empty content */
  private readonly hiddenColumns = signal<ReadonlySet<string>>(new Set())

  readonly isMobile = this.utilitySvc.isMobile || false
  readonly sectionList = computed(() => (this.pageConfig()?.sectionList || []).filter(section => section?.enabled))
  readonly individualSection = computed(() => this.pageConfig()?.individualSection || {})
  readonly eventDetails = computed(() => this.pageConfig()?.eventDetails)

  /** Set when the case studies strip reports no content */
  readonly caseStudiesEmpty = signal(false)

  /** Case studies strip config, or null when the section is off or has nothing to show */
  readonly caseStudiesStrip = computed(() => {
    const caseStudies = this.individualSection().caseStudies
    if (!caseStudies?.enabled || !caseStudies.contentStrip?.strips?.length || this.caseStudiesEmpty()) {
      return null
    }
    // The strip writes its resolved filters back into the config, so it gets its own copy
    const contentStrip = cloneDeep(caseStudies.contentStrip)
    contentStrip.strips.forEach(strip => {
      // A `<...>` placeholder path would navigate nowhere; drop View All until it's filled in
      if (strip.viewMoreUrl?.path?.includes('<')) {
        delete strip.viewMoreUrl
      }
    })
    return contentStrip
  })

  /** Areas to render for a `mainContentSection` column, empty ones dropped */
  contentAreas(data: NsCampaignMicrosite.IMainContent | undefined): NsCampaignMicrosite.IContentArea[] {
    const { leftContent, rightContent } = data?.deskTopKeys || {}
    if (this.isMobile && data?.mobileKeys?.length) {
      return [{ colspan: 12, data: data.mobileKeys }]
    }
    return [leftContent, rightContent].filter((area): area is NsCampaignMicrosite.IContentArea => !!area?.data?.length)
  }

  isColumnHidden(columnKey: string): boolean {
    return this.hiddenColumns().has(columnKey)
  }

  hideKeyHighlight(isEmpty: boolean, columnKey: string) {
    if (isEmpty) {
      this.hiddenColumns.update(keys => new Set(keys).add(columnKey))
    }
  }
}
