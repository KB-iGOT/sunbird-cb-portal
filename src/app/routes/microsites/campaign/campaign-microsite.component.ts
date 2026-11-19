import { ApplicationRef, Component, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ContentConfig, ContentSectionConfig, ContentStripsComponent, ContentStripWithPillsComponent, DisplayType, KeyHighlightsModule,
  SlidersLibModule, VisibilityMode } from '@sunbird-cb/consumption'
import { ServerClockService, UtilityService } from '@sunbird-cb/utils-v2'
import dayjs from 'dayjs'
import { cloneDeep, omit } from 'lodash'
import { NsCampaignMicrosite } from '../models/campaign-microsite.model'
import { ProgrammeMilestonesComponent } from '../components/programme-milestones/programme-milestones.component'

/** Content the strip would show: `contents` left after the courseCategories filter, or ids / an API to load */
export function hasContent(config?: ContentConfig): config is ContentConfig {
  if (!config) {
    return false
  }
  const allowed = (config.courseCategories || []).filter(Boolean)
  const contents = (config.contents || []).filter(content =>
    !!content && (!allowed.length || allowed.includes(content['courseCategory'] as string)))
  return !!(contents.length || config.contentIds?.length || config.apiDetailsKey)
}

export type TPageAvailabilityState = 'notStarted' | 'closed'

export interface IPageGate {
  state: TPageAvailabilityState
  title: string
  description: string
  buttonText: string
  buttonUrl: string
}

const PAGE_GATE_DEFAULTS: Record<TPageAvailabilityState, Required<NsCampaignMicrosite.IPageAvailabilityMessage>> = {
  notStarted: {
    title: 'This event has not started yet',
    description: 'The page opens on {{date}}. Please come back then.',
    buttonText: 'Go to home',
    buttonUrl: '/page/home',
  },
  closed: {
    title: 'This event has closed',
    description: 'This event ended on {{date}}. Thank you for your interest.',
    buttonText: 'Go to home',
    buttonUrl: '/page/home',
  },
}

/** Epoch ms of an ISO date-time, or null when missing or invalid (that side of the window stays open) */
function toTime(value?: string): number | null {
  const time = value ? new Date(value).getTime() : NaN
  return Number.isNaN(time) ? null : time
}

/**
 * Whether the campaign page may load at `now` (server time). Null means open; otherwise the screen to
 * show instead. The start is inclusive, the end exclusive.
 */
export function pageGate(config: NsCampaignMicrosite.IPageAvailability | undefined, now: number): IPageGate | null {
  if (!config || config.enabled === false) {
    return null
  }
  const start = toTime(config.startDateTime)
  const end = toTime(config.endDateTime)
  let state: TPageAvailabilityState | null = null
  let date: number | null = null
  if (start !== null && now < start) {
    state = 'notStarted'
    date = start
  } else if (end !== null && now >= end) {
    state = 'closed'
    date = end
  }
  if (!state || date === null) {
    return null
  }
  const message = { ...PAGE_GATE_DEFAULTS[state], ...stripEmpty(config[state]) }
  const formatted = dayjs(date).format('D MMM YYYY, h:mm A')
  return {
    state,
    title: message.title,
    description: message.description.replace(/{{\s*date\s*}}/g, formatted),
    buttonText: message.buttonText,
    buttonUrl: message.buttonUrl,
  }
}

/** Drops empty strings so a blank JSON value falls back to the default text */
function stripEmpty(message?: NsCampaignMicrosite.IPageAvailabilityMessage): NsCampaignMicrosite.IPageAvailabilityMessage {
  const result: NsCampaignMicrosite.IPageAvailabilityMessage = {}
  for (const [key, value] of Object.entries(message || {})) {
    if (typeof value === 'string' && value.trim()) {
      result[key as keyof NsCampaignMicrosite.IPageAvailabilityMessage] = value
    }
  }
  return result
}

@Component({
  selector: 'ws-app-campaign-microsite',
  imports: [RouterLink, SlidersLibModule, KeyHighlightsModule, ContentStripsComponent, ContentStripWithPillsComponent, ProgrammeMilestonesComponent],
  templateUrl: './campaign-microsite.component.html',
  styleUrl: './campaign-microsite.component.scss',
})
export class CampaignMicrositeComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly utilitySvc = inject(UtilityService)
  private readonly translate = inject(TranslateService)
  private readonly appTranslate = inject(ApplicationRef).injector.get(TranslateService)
  /** Server time, not the device clock: changing the system time must not open the page early */
  private readonly clock = inject(ServerClockService)

  private readonly pageConfig = signal<NsCampaignMicrosite.IPageConfig | undefined>(
    this.route.snapshot.data?.pageData?.data,
  )
  /** Column keys whose key-highlights reported empty content */
  private readonly hiddenColumns = signal<ReadonlySet<string>>(new Set())

  readonly isMobile = this.utilitySvc.isMobile || false
  readonly sectionList = computed(() => (this.pageConfig()?.sectionList || []).filter(section => section?.enabled))
  readonly individualSection = computed(() => this.pageConfig()?.individualSection || {})
  readonly eventDetails = computed(() => this.pageConfig()?.eventDetails)
  /** "Not open yet" / "closed" screen shown instead of the page, or null while the page is open (checked on load) */
  readonly gate = computed(() => pageGate(this.pageConfig()?.pageAvailability, this.clock.now()))

  /** Case studies strip config, or null when the section is off or has no content to show */
  readonly caseStudies = computed(() => {
    const caseStudies = this.individualSection().caseStudies
    const contentConfig = caseStudies?.contentConfig
    if (!caseStudies?.enabled || !hasContent(contentConfig)) {
      return null
    }
    // The strip gets its own copy, so it can never change the page config
    const config = cloneDeep(contentConfig)
    // A `<...>` placeholder path would navigate nowhere; drop View All until it's filled in
    if (config.viewMoreUrl?.path?.includes('<')) {
      config.showViewAll = false
    }
    return { header: caseStudies.header || '', contentConfig: config }
  })

  /** Strip with pills, or null when the section is off or no pill has content to show */
  readonly contentPills = computed(() => {
    const section = this.individualSection().contentPills
    if (!section || section.enabled === false || section.visibilityMode === VisibilityMode.Hidden) {
      return null
    }
    const pills = (section.pills || []).filter(pill => hasContent(pill?.contentConfig))
    if (!pills.length) {
      return null
    }
    // Copies, so the strips can never change the page config
    const ownPills = cloneDeep(pills).map(pill => {
      // A `<...>` placeholder path would navigate nowhere; drop View All until it's filled in
      if (pill.contentConfig.viewMoreUrl?.path?.includes('<')) {
        pill.contentConfig.showViewAll = false
      }
      return {
        ...pill,
        visibilityMode: pill.visibilityMode || VisibilityMode.Visible,
        noDataMessage: pill.noDataMessage ?? section.noDataMessage,
      }
    })
    // The pills component reads its display options (pillEnlarge, canShowScrollArrow) off the section
    const sectionConfig = {
      ...omit(section, ['pills', 'enabled']),
      sectionKey: section.sectionKey || 'contentPills',
      header: section.header || '',
      translateHeader: section.translateHeader ?? false,
      visibilityMode: VisibilityMode.Visible,
      displayType: DisplayType.Pills,
      pillEnlarge: section.pillEnlarge ?? false,
      canShowScrollArrow: section.canShowScrollArrow ?? true,
      pills: ownPills,
    } as ContentSectionConfig
    return { header: section.header || '', defaultPillKey: section.defaultPillKey || '', pills: ownPills, section: sectionConfig }
  })

  constructor() {
    if (this.translate !== this.appTranslate) {
      this.translate.setDefaultLang('en')
      this.translate.use(this.appTranslate.currentLang || localStorage.getItem('websiteLanguage') || 'en')
      this.appTranslate.onLangChange.pipe(takeUntilDestroyed()).subscribe(({ lang }) => this.translate.use(lang))
    }
  }

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
