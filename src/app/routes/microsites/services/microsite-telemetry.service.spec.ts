import { TestBed } from '@angular/core/testing'
import { EventService, UtilityService, WsEvents } from '@sunbird-cb/utils-v2'
import { MICROSITE_TELEMETRY_ENV, MicrositeTelemetryService } from './microsite-telemetry.service'

describe('MicrositeTelemetryService', () => {
  let events: { dispatchEvent: jest.Mock, raiseCustomImpression: jest.Mock }
  let service: MicrositeTelemetryService

  beforeEach(() => {
    events = { dispatchEvent: jest.fn(), raiseCustomImpression: jest.fn() }
    TestBed.configureTestingModule({
      providers: [
        { provide: EventService, useValue: events },
        { provide: UtilityService, useValue: { routeData: { pageId: '/app/leadership-as-mission-2026', module: 'Campaign Microsite' } } },
      ],
    })
    service = TestBed.inject(MicrositeTelemetryService)
  })

  it('click: INTERACT with subtype/id, and the page context at the top level too, so context.env is set', () => {
    service.click('campaign-microsite-milestone-assessment', 'card-content', { id: 'do_1', type: 'assessment' })
    const event = events.dispatchEvent.mock.calls[0][0]
    const pageContext = { pageId: '/app/leadership-as-mission-2026', module: MICROSITE_TELEMETRY_ENV }
    expect(event.eventType).toBe(WsEvents.WsEventType.Telemetry)
    expect(event.data.eventSubType).toBe(WsEvents.EnumTelemetrySubType.Interact)
    expect(event.data.edata).toEqual({ type: WsEvents.EnumInteractTypes.CLICK, subType: 'campaign-microsite-milestone-assessment', id: 'card-content' })
    expect(event.data.object).toEqual({ id: 'do_1', type: 'assessment' })
    expect(event.data.pageContext).toEqual(pageContext)
    // the telemetry listener reads context.env from here
    expect(event.pageContext).toEqual(pageContext)
  })

  it('click: edata.id defaults to object.id, as on mobile', () => {
    service.click('campaign-microsite-survey-submit', undefined, { id: 'do_pledge', type: 'survey' })
    expect(events.dispatchEvent.mock.calls[0][0].data.edata.id).toBe('do_pledge')
  })

  it('impression: unchanged, filed under the page id extension', () => {
    service.impression('milestone-popup', { id: 'milestone-popup', type: 'popup' })
    expect(events.raiseCustomImpression).toHaveBeenCalledWith({ id: 'milestone-popup', type: 'popup' }, { pageIdExt: 'milestone-popup' })
  })
})
