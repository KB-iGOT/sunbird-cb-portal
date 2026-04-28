import { of } from 'rxjs'

jest.mock('moment', () => {
  const fn: any = (_date?: any) => ({
    format: jest.fn().mockReturnValue('2024-01-01 10:00'),
    toDate: jest.fn().mockReturnValue(new Date('2024-01-01')),
    isSame: jest.fn().mockReturnValue(false),
    isBetween: jest.fn().mockReturnValue(false),
    isAfter: jest.fn().mockReturnValue(false),
    isBefore: jest.fn().mockReturnValue(false),
    diff: jest.fn().mockReturnValue(120),
  })
  fn.utc = jest.fn().mockImplementation(fn)
  return { default: fn, __esModule: true }
})

jest.mock('@angular/router', () => ({ ActivatedRoute: jest.fn(), Router: jest.fn() }), { virtual: true })
jest.mock('@angular/forms', () => {
  const actual = jest.requireActual('@angular/forms')
  return actual
})
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  EventService: jest.fn(),
  WsEvents: {
    EnumInteractTypes: { CLICK: 'CLICK' },
    EnumInteractSubTypes: { EVENTS_TAB: 'EVENTS_TAB' },
    EnumTelemetrymodules: { EVENTS: 'EVENTS' },
  },
  MultilingualTranslationsService: jest.fn(),
}), { virtual: true })
jest.mock('@ngx-translate/core', () => ({ TranslateService: jest.fn() }), { virtual: true })
jest.mock('../../services/events.service', () => ({ EventService: jest.fn() }), { virtual: true })
jest.mock('../../../search-v2/services/gb-search.service', () => ({ GbSearchService: jest.fn() }), { virtual: true })
jest.mock('@angular/material/legacy-tabs', () => ({ MatLegacyTabChangeEvent: jest.fn() }), { virtual: true })
jest.mock('src/environments/environment', () => ({
  environment: { spvorgID: 'spv1' },
}), { virtual: true })

import { EventsComponent } from './events.component'
import { UntypedFormControl } from '@angular/forms'

const mockEventData = [
  {
    name: 'Event 1',
    startDate: '2024-01-01',
    endDate: '2024-01-02',
    startTime: '0900+0530',
    endTime: '1100+0530',
    duration: 120,
    creatorDetails: '',
    appIcon: '/icon.png',
    createdFor: ['spv1'],
    resourceType: 'Karmayogi Saptah',
    createdOn: '2024-01-01T09:00:00',
  },
  {
    name: 'Event 2',
    startDate: '2024-01-01',
    endDate: '2024-01-01',
    startTime: '1400+0530',
    endTime: '1600+0530',
    duration: 65,
    creatorDetails: '[]',
    appIcon: null,
    createdFor: ['deptId1'],
    resourceType: 'Karmayogi Talks',
    createdOn: '2024-01-01T14:00:00',
  },
  {
    name: 'Event 3',
    startDate: '2024-01-01',
    endDate: '2024-01-01',
    startTime: '0800+0530',
    endTime: '0900+0530',
    duration: 0,
    creatorDetails: '[{"name":"Creator1"}]',
    appIcon: undefined,
    createdFor: ['org2'],
    resourceType: 'Rajya Karmayogi Saptah',
    createdOn: '2024-01-01T08:00:00',
  },
]

const mockEventListResponse = {
  result: {
    count: 3,
    Event: mockEventData,
  },
}

function buildComponent() {
  const mockRoute: any = {
    snapshot: {
      data: {
        topics: { data: { pagination: {} } },
        eventsCategoryId: 2,
      },
      parent: null,
    },
    parent: {
      snapshot: {
        data: {
          pageData: {
            data: {
              eventStrips: [],
              todaysEventStrips: [],
            },
          },
        },
      },
    },
    queryParams: of({}),
  }
  // Make route.parent accessible
  Object.defineProperty(mockRoute, 'parent', { value: mockRoute.parent })

  const mockRouter: any = { navigate: jest.fn() }
  const mockEventSvc: any = {
    getEventsList: jest.fn().mockReturnValue(of(mockEventListResponse)),
    getPublicUrl: jest.fn().mockImplementation((url: string) => url),
    getKeySpeakerJson: jest.fn().mockResolvedValue({ keySpeakersEvents: { strips: [] } }),
    customDateFormat: jest.fn().mockReturnValue('2024-01-01 0900'),
  }
  const mockConfigSvc: any = {
    userProfile: { rootOrgId: 'deptId1' },
  }
  const mockEventServiceGlobal: any = {
    raiseInteractTelemetry: jest.fn(),
    customDateFormat: jest.fn().mockReturnValue('2024-01-01 0900'),
  }
  const mockTranslate: any = {
    setDefaultLang: jest.fn(),
    use: jest.fn(),
    instant: jest.fn().mockReturnValue('translated'),
  }
  const mockSearchSrvc: any = {
    fetchSearchDataByCategory: jest.fn().mockReturnValue(of({ result: { Event: mockEventData } })),
  }
  const mockLang: any = {
    translateActualLabel: jest.fn().mockReturnValue('label'),
  }

  const comp = new EventsComponent(
    mockRoute, mockRouter, mockEventSvc, mockConfigSvc,
    mockEventServiceGlobal, mockTranslate, mockSearchSrvc, mockLang,
  )
  return { comp, mockRoute, mockRouter, mockEventSvc, mockConfigSvc, mockEventServiceGlobal, mockTranslate, mockSearchSrvc, mockLang }
}

describe('EventsComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should initialize queryControl as UntypedFormControl', () => {
    const { comp } = buildComponent()
    expect(comp.queryControl).toBeInstanceOf(UntypedFormControl)
  })

  it('ngOnInit - calls getEventsList and getKeySpeakerEventList', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.ngOnInit()
    expect(mockEventSvc.getEventsList).toHaveBeenCalled()
    expect(mockEventSvc.getKeySpeakerJson).toHaveBeenCalled()
  })

  it('getEventsList - populates allEventData and calls setEventListData', () => {
    const { comp } = buildComponent()
    comp.departmentID = 'deptId1'
    comp.getEventsList()
    expect(comp.totalResults).toBe(3)
    expect(comp.allEventData.length).toBe(3)
  })

  it('setEventListData - processes event data', () => {
    const { comp } = buildComponent()
    comp.departmentID = 'deptId1'
    comp.allEventData = mockEventData
    comp.setEventListData(mockEventData)
    expect(comp.allEvents['all'].length).toBe(3)
  })

  it('setEventListData - handles zero-minute duration', () => {
    const { comp } = buildComponent()
    comp.allEventData = [{ ...mockEventData[2] }]
    comp.setEventListData(comp.allEventData)
    expect(comp.allEvents['all'].length).toBeGreaterThan(0)
  })

  it('filter - all filter populates alltypeEvents', () => {
    const { comp } = buildComponent()
    comp.departmentID = 'deptId1'
    comp.allEventData = mockEventData
    comp.setEventListData(mockEventData)
    comp.filter('all')
    expect(comp.alltypeEvents.length).toBeGreaterThan(0)
  })

  it('filter - todayEvents filter', () => {
    const { comp } = buildComponent()
    comp.allEventData = mockEventData
    comp.allEvents = { all: [], todayEvents: [], featuredEvents: [], curatedEvents: [], karmayogiSaptahEvents: [], karmayogiTalksEvents: [], rajyaKarmayogiSaptahEvents: [] }
    comp.filter('todayEvents')
    expect(comp.todaysEvents).toBeDefined()
  })

  it('filter - karmayogiSaptahEvents', () => {
    const { comp } = buildComponent()
    comp.allEventData = mockEventData
    comp.allEvents = { karmayogiSaptahEvents: [], all: [], todayEvents: [], featuredEvents: [], curatedEvents: [], karmayogiTalksEvents: [], rajyaKarmayogiSaptahEvents: [] }
    comp.filter('karmayogiSaptahEvents')
    expect(comp.karmayogiSaptahEvents).toBeDefined()
  })

  it('filter - rajyaKarmayogiSaptahEvents', () => {
    const { comp } = buildComponent()
    comp.allEvents = { rajyaKarmayogiSaptahEvents: [], all: [], todayEvents: [], featuredEvents: [], curatedEvents: [], karmayogiSaptahEvents: [], karmayogiTalksEvents: [] }
    comp.filter('rajyaKarmayogiSaptahEvents')
    expect(comp.rajyaKarmayogiSaptahEvents).toBeDefined()
  })

  it('filter - karmayogiTalksEvents', () => {
    const { comp } = buildComponent()
    comp.allEvents = { karmayogiTalksEvents: [], all: [], todayEvents: [], featuredEvents: [], curatedEvents: [], karmayogiSaptahEvents: [], rajyaKarmayogiSaptahEvents: [] }
    comp.filter('karmayogiTalksEvents')
    expect(comp.karmayogiTalksEvents).toBeDefined()
  })

  it('customDateFormat - formats date and time', () => {
    const { comp } = buildComponent()
    const result = comp.customDateFormat('2024-01-01', '0900+0530')
    expect(result).toBe('2024-01-01 0900')
  })

  it('allEventDateFormat - formats date', () => {
    const { comp } = buildComponent()
    const result = comp.allEventDateFormat('2024-01-01T09:00:00')
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('compareDate - returns true for today', () => {
    const { comp } = buildComponent()
    const now = new Date()
    const day = ('0' + now.getDate()).slice(-2)
    const month = ('0' + (now.getMonth() + 1)).slice(-2)
    const year = now.getFullYear()
    const today = `${year}-${month}-${day}`
    expect(comp.compareDate(today)).toBe(true)
  })

  it('compareDate - returns false for past date', () => {
    const { comp } = buildComponent()
    expect(comp.compareDate('2000-01-01')).toBe(false)
  })

  it('sortEvents - sorts in descending order', () => {
    const { comp } = buildComponent()
    const events = [
      { eventCustomStartDate: '2024-01-01' },
      { eventCustomStartDate: '2024-01-03' },
      { eventCustomStartDate: '2024-01-02' },
    ]
    const sorted = comp.sortEvents(events)
    expect(sorted[0].eventCustomStartDate).toBe('2024-01-03')
  })

  it('sortEventsAsc - sorts in ascending order', () => {
    const { comp } = buildComponent()
    const events = [
      { eventCustomStartDate: '2024-01-03' },
      { eventCustomStartDate: '2024-01-01' },
      { eventCustomStartDate: '2024-01-02' },
    ]
    const sorted = comp.sortEventsAsc(events)
    expect(sorted[0].eventCustomStartDate).toBe('2024-01-01')
  })

  it('navigateWithPage - navigates when page is different', () => {
    const { comp, mockRouter } = buildComponent()
    comp.currentActivePage = 1
    comp.navigateWithPage(2)
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('navigateWithPage - does not navigate if same page', () => {
    const { comp, mockRouter } = buildComponent()
    comp.currentActivePage = 1
    comp.navigateWithPage(1)
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })

  it('translateHub - returns translated value', () => {
    const { comp } = buildComponent()
    const result = comp.translateHub('someHub')
    expect(result).toBe('translated')
  })

  it('updateQuery - calls searchSrvc and processes events', () => {
    const { comp, mockSearchSrvc } = buildComponent()
    comp.departmentID = 'deptId1'
    comp.updateQuery('test')
    expect(mockSearchSrvc.fetchSearchDataByCategory).toHaveBeenCalled()
  })

  it('updateQuery - empty key does nothing', () => {
    const { comp, mockSearchSrvc } = buildComponent()
    comp.updateQuery('')
    expect(mockSearchSrvc.fetchSearchDataByCategory).not.toHaveBeenCalled()
  })

  it('tabClicked - raises telemetry event', () => {
    const { comp, mockEventServiceGlobal } = buildComponent()
    comp.tabClicked({ tab: { textLabel: 'All Events' }, index: 0 } as any)
    expect(mockEventServiceGlobal.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('getKeySpeakerEventList - calls eventSvc', async () => {
    const { comp, mockEventSvc } = buildComponent()
    await comp.getKeySpeakerEventList()
    expect(mockEventSvc.getKeySpeakerJson).toHaveBeenCalled()
  })

  it('onScrollEnd - loads more events when page <= totalpages', () => {
    const { comp, mockEventSvc } = buildComponent()
    comp.currentQuery = ''
    comp.page = 0
    comp.totalpages = 5
    comp.alltypeEvents = new Array(15)
    comp.totalResults = 50
    comp.eventRequestObj.request.offset = 0
    comp.allEventData = mockEventData
    comp.onScrollEnd()
    expect(mockEventSvc.getEventsList).toHaveBeenCalled()
  })

  it('onScrollEnd - shows loading false when page exceeds totalpages', () => {
    const { comp } = buildComponent()
    comp.currentQuery = ''
    comp.page = 10
    comp.totalpages = 5
    comp.alltypeEvents = []
    comp.totalResults = 100
    comp.onScrollEnd()
    expect(comp.showLoading).toBe(false)
  })

  it('onScrollEnd - currentQuery truthy sets showLoading false', () => {
    const { comp } = buildComponent()
    comp.currentQuery = 'test'
    comp.onScrollEnd()
    expect(comp.showLoading).toBe(false)
  })

  it('translateLabels - calls lang service', () => {
    const { comp } = buildComponent()
    expect(comp.translateLabels('label', 'type')).toBe('label')
  })

  it('viewAll - navigates to Karmayogi Talks view all', () => {
    const { comp, mockRouter } = buildComponent()
    comp.viewAll()
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/event-hub/view-all'],
      { queryParams: { resourceType: 'Karmayogi Talks' } },
    )
  })

  it('seeAll - navigates to see-all with category', () => {
    const { comp, mockRouter } = buildComponent()
    comp.seeAll('Featured')
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/event-hub/see-all'],
      { queryParams: { category: 'Featured' } },
    )
  })

  it('addCustomDateAndTime - adds custom date/time fields', () => {
    const { comp } = buildComponent()
    const event = {
      event: { startDate: '2024-01-01', startTime: '0900+0530', endDate: '2024-01-01', endTime: '1100+0530' },
    }
    comp.addCustomDateAndTime(event)
    expect(event).toHaveProperty('eventCustomStartDate')
    expect(event).toHaveProperty('eventCustomEndDate')
  })
})
