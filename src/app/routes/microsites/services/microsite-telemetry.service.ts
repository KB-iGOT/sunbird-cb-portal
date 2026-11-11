import { Injectable, inject } from '@angular/core'
import { EventService, UtilityService, WsEvents } from '@sunbird-cb/utils-v2'

/** Telemetry `object`: what the event is about (a milestone's content, the pledge form, the popup) */
export interface IMicrositeTelemetryObject {
  id: string
  type: string
}

/** `context.env` on every campaign microsite INTERACT, as the mobile app sends it */
export const MICROSITE_TELEMETRY_ENV = 'Campaign Microsite'

/**
 * Event names, as the mobile app sends them (so web and mobile telemetry can be read together).
 * INTERACT: `edata.type` click, the name in `edata.subtype`, `object` = { the milestone's content id, its type },
 * and `edata.id` as noted below; where none is noted it is the same as `object.id`.
 */
export const MICROSITE_TELEMETRY = {
  /** Milestone tap (card or its button), type = assessment / event / survey / content; edata.id `card-content` */
  milestoneTap: (type: string) => `campaign-microsite-milestone-${type}`,
  cardContent: 'card-content',
  /** Event register: object.type Event */
  enrollNow: 'enroll-now',
  eventObjectType: 'Event',
  /** Certificate download / pending: edata.id `download-certificate` */
  certificateDownload: 'campaign-microsite-certificate-download',
  certificatePending: 'campaign-microsite-certificate-pending',
  downloadCertificate: 'download-certificate',
  /** From a tap or the automatic popup (the automatic one sends no milestone tap) */
  surveyOpen: 'campaign-microsite-survey-open',
  /** Successful submits only */
  surveySubmit: 'campaign-microsite-survey-submit',
  /** Closed without submitting (X or Cancel) */
  surveyClose: 'campaign-microsite-survey-close',
  /** Web only (no mobile equivalent): Try again after the form failed to load */
  surveyRetry: 'campaign-microsite-survey-retry',
} as const

/**
 * Telemetry for the campaign microsite. `pageId` and `module` come from the route data
 * (`app/leadership-as-mission-2026`, "Campaign Microsite"), so every event here is filed under that page.
 */
@Injectable({ providedIn: 'root' })
export class MicrositeTelemetryService {
  private readonly events = inject(EventService)
  private readonly utility = inject(UtilityService)

  /**
   * INTERACT click, e.g. click('campaign-microsite-milestone-assessment', 'card-content', { id: 'do_1', type: 'assessment' }).
   * `id` (edata.id) defaults to `object.id`, as on mobile.
   *
   * Dispatched here rather than through EventService.raiseInteractTelemetry: that puts the page context only in
   * `data.pageContext`, while the telemetry listener takes `context.env` from the event's top-level `pageContext`,
   * so web INTERACT events went out without `env`. Both are set here, with `module` defaulting to the
   * microsite's env.
   */
  click(subType: string, id: string | undefined, object: IMicrositeTelemetryObject | {} = {}): void {
    const pageContext = { pageId: this.utility.routeData?.pageId, module: MICROSITE_TELEMETRY_ENV }
    this.events.dispatchEvent({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        edata: { type: WsEvents.EnumInteractTypes.CLICK, subType, id: id || (object as IMicrositeTelemetryObject).id || '' },
        object,
        pageContext,
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
      },
      pageContext,
      from: '',
      to: 'Telemetry',
    })
  }

  /** IMPRESSION of something shown on the page; `pageIdExt` is appended to the page id (e.g. `..._milestone-popup`) */
  impression(pageIdExt: string, object: IMicrositeTelemetryObject): void {
    this.events.raiseCustomImpression(object, { pageIdExt })
  }
}
