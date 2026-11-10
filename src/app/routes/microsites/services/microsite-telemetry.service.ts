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
 * Event names shared with the mobile app, so web and mobile telemetry can be read together.
 * INTERACT events carry the name in `edata.subtype` and the element clicked in `edata.id`.
 */
export const MICROSITE_TELEMETRY = {
  /** Card / button tap on a milestone: subtype `campaign-microsite-milestone-<type>`, id `card-content` */
  milestoneTap: (type: string) => `campaign-microsite-milestone-${type}`,
  cardContent: 'card-content',
  /** Event registration (id), `object.type` Event */
  enrollNow: 'enroll-now',
  eventObjectType: 'Event',
  certificateDownload: 'campaign-microsite-certificate-download',
  certificatePending: 'campaign-microsite-certificate-pending',
  surveyOpen: 'campaign-microsite-survey-open',
  /** Sent only after the form was saved */
  surveySubmit: 'campaign-microsite-survey-submit',
  /** The dialog's X and Cancel */
  surveyClose: 'campaign-microsite-survey-close',
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
   *
   * Dispatched here rather than through EventService.raiseInteractTelemetry: that puts the page context only in
   * `data.pageContext`, while the telemetry listener takes `context.env` from the event's top-level `pageContext`,
   * so web INTERACT events went out without `env`. Both are set here, with `module` defaulting to the
   * microsite's env.
   */
  click(subType: string, id: string, object: IMicrositeTelemetryObject | {} = {}): void {
    const pageContext = { pageId: this.utility.routeData?.pageId, module: MICROSITE_TELEMETRY_ENV }
    this.events.dispatchEvent({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        edata: { type: WsEvents.EnumInteractTypes.CLICK, subType, id },
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
