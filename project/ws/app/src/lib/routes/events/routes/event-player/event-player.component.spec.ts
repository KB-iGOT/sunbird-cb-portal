import { BehaviorSubject, of } from 'rxjs'
import { EventPlayerComponent } from './event-player.component'

describe('EventPlayerComponent', () => {
  let component: EventPlayerComponent
  let eventSvc: any
  let router: any
  let params$: BehaviorSubject<any>
  let discussWidgetData: any

  const eventData = {
    identifier: 'event-1',
    creatorDetails: JSON.stringify({ name: 'Creator' }).replace(/"/g, '\\"'),
    startDate: '2099-01-01',
    startTime: '1000+0530',
    endDate: '2099-01-01',
    endTime: '1100+0530',
    batches: JSON.stringify([{ batchId: 'batch-1' }]),
    resourceType: 'Event',
  }

  beforeEach(() => {
    localStorage.clear()
    params$ = new BehaviorSubject({ eventId: 'event-1' })
    discussWidgetData = {
      newCommentSection: { commentTreeData: {}, commentBox: {} },
      commentsList: { repliesSection: { newCommentReply: { commentTreeData: {} } } },
    }
    eventSvc = {
      getEventData: jest.fn(() => of({ result: { event: { ...eventData } } })),
      getIsEnrolled: jest.fn(() => of({
        result: {
          events: [{
            contentId: 'event-1',
            completionPercentage: 42.4,
            issuedCertificates: [{ identifier: 'cert-1' }],
          }],
        },
      })),
    }
    router = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    component = new EventPlayerComponent(
      {} as any,
      {
        params: params$,
        parent: { snapshot: { data: { pageData: { data: { enrollFlowItems: ['Event'], discussWidgetData } } } } },
      } as any,
      eventSvc,
      { setDefaultLang: jest.fn(), use: jest.fn() } as any,
      { languageSelectedObservable: new BehaviorSubject(null) } as any,
      { userProfile: { userId: 'user-1' } } as any,
      router,
    )
  })

  it('loads event from route params and prepares discussion widget', () => {
    component.ngOnInit()

    expect(component.eventId).toBe('event-1')
    expect(component.eventData.creatorDetails).toEqual({ name: 'Creator' })
    expect(eventSvc.getEventData).toHaveBeenCalledWith('event-1')
  })

  it('sets enrollment data, certificate object and navigates enrolled route', () => {
    component.eventData = { ...eventData, batches: [{ batchId: 'batch-1' }] }
    component.batchId = 'batch-1'
    component.eventId = 'event-1'
    component.getUseEnrolled()

    expect(component.isEnrolled).toBe(true)
    expect(component.enrolledEvent.certificateObj).toEqual({ certData: '', certId: 'cert-1' })
    expect(component.enrolledEvent.completionPercentage).toBe('42')
    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { isEnrolled: true } }))
  })

  it('navigates public event URL when user is not enrolled', () => {
    eventSvc.getIsEnrolled.mockReturnValueOnce(of({ result: { events: [] } }))
    component.eventData = { ...eventData }
    component.batchId = 'batch-1'
    component.getUseEnrolled()

    expect(component.isEnrolled).toBe(false)
    expect(router.navigateByUrl).toHaveBeenCalledWith('app/event-hub/home/event-1?batchId=batch-1')
  })

  it('computes enroll flow and formats dates', () => {
    component.eventData = { resourceType: 'Event' }
    component.enrollFlowItems = ['Event']
    expect(component.isenrollFlow).toBe(true)

    component.enrollFlowItems = []
    expect(component.isenrollFlow).toBe(false)
    expect(component.customDateFormat('2026-01-02', '0930+0530')).toBe('2026-01-02 0930')
  })

  it('handles event without batch enrollment flow', () => {
    component.eventData = { ...eventData, batches: [], resourceType: 'Other' }
    component.batchId = ''
    component.eventId = 'event-1'
    component.checkEnrollFlowItems()

    expect(eventSvc.getIsEnrolled).not.toHaveBeenCalled()
    expect(component.isenrollFlow).toBe(false)
    expect(component.discussWidgetData.enrolledContent).toBe(true)
  })

  it('uses saved website language', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const translate = { setDefaultLang: jest.fn(), use: jest.fn() }
    const lang = { languageSelectedObservable: new BehaviorSubject(null) }
    const translated = new EventPlayerComponent({} as any, { params: params$ } as any, eventSvc, translate as any, lang as any, {} as any, router)
    expect(translated).toBeTruthy()
    expect(translate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translate.use).toHaveBeenCalledWith('hi')
  })
})
