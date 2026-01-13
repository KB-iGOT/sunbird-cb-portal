import { of } from 'rxjs'
import { SamuhikCharchaContentComponent } from './samuhik-charcha-content.component'

describe('SamuhikCharchaContentComponent (unit, no TestBed)', () => {
  let samuhikSvc: any
  let events: any
  let configSvc: any
  let component: SamuhikCharchaContentComponent

  const mockConfig: any = {
    strips: [
      {
        tabs: [
          {
            request: {
              searchV6: {
                request: {
                  filters: {
                    identifier: [],
                    createdFor: [],
                    endDateTime: {
                      '>=': '',
                      '<': '',
                    },
                  },
                },
              },
            },
          },
        ],
        viewMoreUrl: {
          path: '/app/events?foo=1',
          viewMoreText: 'Old',
          queryParams: { some: 'x' },
        },
      },
    ],
  }

  beforeEach(() => {
    samuhikSvc = {
      fetchConfigFile: jest.fn().mockReturnValue(of(mockConfig)),
    }

    events = {
      raiseInteractTelemetry: jest.fn(),
    }

    configSvc = {
      userProfile: {
        userRootOrg: {
          id: 'org123',
        },
      },
    }

    component = new SamuhikCharchaContentComponent(
      samuhikSvc,
      events,
      configSvc,
    )

    component.content = {
      eventLinked: ['e1', 'e2'],
      identifier: 'course1',
    }
    component.conditionData = {
      userEnrollmentList: [{ completionPercentage: 10 }],
    }
  })

  it('getCurrentTimeInUTC returns ISO string with +0000', () => {
    const val = component.getCurrentTimeInUTC
    expect(typeof val).toBe('string')
    expect(val).toContain('T')
    expect(val.endsWith('+0000')).toBe(true)
  })

  it('ngOnInit locks content when completion < 30 and configures samuhikConfig', async () => {
    await component.ngOnInit()

    expect(samuhikSvc.fetchConfigFile).toHaveBeenCalled()
    expect(component.locked).toBe(true)
    expect(component.samuhikConfigLoaded).toBe(true)

    const tab = component.samuhikConfig.strips[0].tabs[0]
    const filters = tab.request.searchV6.request.filters
    expect(filters.identifier).toEqual(['e1', 'e2'])
    expect(filters.createdFor).toEqual(['org123'])
    expect(typeof filters.endDateTime['>=']).toBe('string')
    expect(filters.endDateTime['>='].endsWith('+0000')).toBe(true)
    expect(typeof filters.endDateTime['<']).toBe('string')
    expect(filters.endDateTime['<'].endsWith('+0000')).toBe(true)

    const viewMore = component.samuhikConfig.strips[0].viewMoreUrl
    expect(viewMore.path).toBe('/app/events')
    expect(viewMore.viewMoreText).toBe('Show all')
    expect(viewMore.queryParams.courseId).toBe('course1')
  })

  it('ngOnInit does not lock when completion >= 30', async () => {
    component.conditionData = {
      userEnrollmentList: [{ completionPercentage: 40 }],
    }
    component.locked = false

    await component.ngOnInit()

    expect(component.locked).toBe(false)
  })

  it('raiseTelemetryInteratEvent sends telemetry with correct subtype for recommendedEvents', () => {
    const event: any = {
      context: { pageSection: 'recommendedEvents' },
      content: { contentId: 'c1' },
    }

    component.raiseTelemetryInteratEvent(event)

    const raiseMock: any = events.raiseInteractTelemetry
    expect(raiseMock).toHaveBeenCalled()
    const args = raiseMock.mock.calls[0]
    expect(args[0].subType).toBe('recommended-events')
    expect(args[1].id).toBe('c1')
  })

  it('raiseTelemetryInteratEvent defaults subtype to my-events for unknown section', () => {
    const event: any = {
      context: { pageSection: 'unknownSection' },
      content: { contentId: 'c2' },
    }

    component.raiseTelemetryInteratEvent(event)

    const raiseMock: any = events.raiseInteractTelemetry
    expect(raiseMock).toHaveBeenCalled()
    const args = raiseMock.mock.calls[0]
    expect(args[0].subType).toBe('my-events')
  })

  it('resumeContentData emits resumeContent event', () => {
    const emitSpy = jest.spyOn(component.resumeContent, 'emit')
    component.resumeContentData()
    expect(emitSpy).toHaveBeenCalled()
  })
})

