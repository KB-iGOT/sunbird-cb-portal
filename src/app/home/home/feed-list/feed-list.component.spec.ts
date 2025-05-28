import { FeedListComponent } from './feed-list.component'
import { ActivatedRoute } from '@angular/router'
import { EventService } from '@sunbird-cb/utils-v2'
import { UtilityService } from '@sunbird-cb/utils-v2'
import { WsEvents } from '@sunbird-cb/utils-v2'
import * as _ from 'lodash'

describe('FeedListComponent', () => {
  let component: FeedListComponent
  let mockActivatedRoute: Partial<ActivatedRoute>
  let mockEventService: Partial<EventService>
  let mockUtilityService: Partial<UtilityService>

  beforeEach(() => {
    // Mock the ActivatedRoute
    // mockActivatedRoute = {
    //   snapshot: {
    //     data: {
    //       pageData: {
    //         data: { someData: 'test' },
    //       },
    //     },
    //   },
    // }

    // Mock the EventService
    mockEventService = {
      raiseInteractTelemetry: jest.fn(),
    }

    // Mock the UtilityService
    mockUtilityService = {
      isMobile: false,
    }

    // Instantiate the component
    component = new FeedListComponent(
      mockActivatedRoute as ActivatedRoute,
      mockEventService as EventService,
      mockUtilityService as UtilityService
    )
  })

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('ngOnInit', () => {
    it('should initialize contentStripData and isMobile', () => {
      component.ngOnInit()

      // Test if contentStripData is set from the activated route
      expect(component.contentStripData).toEqual({ someData: 'test' })
      
      // Test if isMobile is initialized correctly
      expect(component.isMobile).toBe(false)
    })
  })

  describe('raiseTelemetryInteratEvent', () => {
    it('should raise telemetry when viewMoreUrl is present', () => {
      const event = {
        viewMoreUrl: { viewMoreText: 'view more' },
        stripTitle: 'Test Title',
        typeOfTelemetry: 'someType',
      }

      // Mock the raiseTelemetry method
      jest.spyOn(component, 'raiseTelemetry')

      component.raiseTelemetryInteratEvent(event)

      expect(component.raiseTelemetry).toHaveBeenCalledWith(
        'Test Title view more',
        'someType'
      )
    })

    it('should raise telemetry when viewMoreUrl is not present and contentId includes "ext"', () => {
      const event = {
        contentId: 'ext123',
        typeOfTelemetry: 'mdo-channels',
        orgId: 'org123',
      }

      component.raiseTelemetryInteratEvent(event)

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'providers',
          id: 'card-content',
        },
        {
          id: 'event.contentId',
          type: 'External content',
        },
        {
          module: WsEvents.EnumTelemetrymodules.HOME,
        }
      )
    })

    it('should raise telemetry for other cases when contentId does not include "ext"', () => {
      const event = {
        contentId: '12345',
        typeOfTelemetry: 'cbpPlan',
        identifier: 'identifier123',
        sakshamAIGenerated: false,
        selectedTab: 'tab1',
        selectedPill: 'pill1',
      }

      component.raiseTelemetryInteratEvent(event)

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'cbpPlan-tab1-pill1',
          id: 'card-content',
          pageid: '/page/home',
        },
        {
          id: 'identifier123',
          type: 'identifier123',
        },
        {
          module: WsEvents.EnumTelemetrymodules.HOME,
        }
      )
    })
  })

  describe('raiseTelemetry', () => {
    it('should raise interact telemetry', () => {
      const name = 'Test Event'
      const subtype = 'someSubType'

      component.raiseTelemetry(name, subtype)

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: subtype,
          id: _.kebabCase(name.toLocaleLowerCase()),
        },
        {},
        {
          module: WsEvents.EnumTelemetrymodules.HOME,
        }
      )
    })
  })
})
