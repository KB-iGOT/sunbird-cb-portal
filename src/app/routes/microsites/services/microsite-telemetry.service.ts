import { Injectable, inject } from '@angular/core'
import { EventService, WsEvents } from '@sunbird-cb/utils-v2'

/** Telemetry `object`: what the event is about (a milestone's content, the pledge form, the popup) */
export interface IMicrositeTelemetryObject {
  id: string
  type: string
}

/**
 * Telemetry for the campaign microsite. `pageId` and `module` come from the route data
 * (`app/leadership-as-mission-2026`, "Campaign Microsite"), so every event here is filed under that page.
 */
@Injectable({ providedIn: 'root' })
export class MicrositeTelemetryService {
  private readonly events = inject(EventService)

  /** INTERACT click, e.g. click('milestone-card', 'milestone-1-start', { id: 'do_1', type: 'assessment' }) */
  click(subType: string, id: string, object: IMicrositeTelemetryObject | {} = {}): void {
    this.events.raiseInteractTelemetry({ type: WsEvents.EnumInteractTypes.CLICK, subType, id }, object)
  }

  /** IMPRESSION of something shown on the page; `pageIdExt` is appended to the page id (e.g. `..._sankalp-form`) */
  impression(pageIdExt: string, object: IMicrositeTelemetryObject): void {
    this.events.raiseCustomImpression(object, { pageIdExt })
  }
}
