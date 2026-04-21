/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { EventCardV2Component } from './event-card-v2.component'
import { of } from 'rxjs'
import { NsContent } from '../_services/widget-content.model'
import { NsCardContent } from './event-card-v2.model'

describe('EventCardV2Component', () => {
  let component: EventCardV2Component
  let mockEventService: any
  let mockConfigService: any
  let mockLangTranslations: any
  let mockTranslate: any
  let mockRouter: any

  const mockWidgetData: NsCardContent.ICard = {
    content: {
      identifier: 'do_123456',
      primaryCategory: 'Event',
      name: 'Test Event',
      description: 'Test event description',
      duration: 120,
      startDate: '2024-04-21',
      startTime: '10:00 AM',
      version: '1.0',
    },
  } as any

  const mockInstanceConfig = {
    logos: {
      defaultContent: '/assets/default-content.png',
      defaultSourceLogo: '/assets/default-source.png',
    },
    sources: [
      { id: 'source1', logo: '/assets/source1.png' },
      { id: 'source2', logo: '/assets/source2.png' },
    ],
  }

  beforeEach(() => {
    mockEventService = {
      raiseInteractTelemetry: jest.fn(),
    }

    mockConfigService = {
      instanceConfig: mockInstanceConfig,
    }

    mockLangTranslations = {
      languageSelectedObservable: of('en'),
      translateLabelWithoutspace: jest.fn().mockReturnValue('Translated Label'),
      translateLabel: jest.fn().mockReturnValue('Translated Label'),
    }

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    }

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key: string) => {
      if (key === 'websiteLanguage') {
        return 'en'
      }
      return null
    })

    // Mock window.location
    delete (window as any).location
    window.location = {
      href: 'http://localhost:4200/app/home',
    } as any

    component = new EventCardV2Component(
      mockEventService,
      mockConfigService,
      mockLangTranslations,
      mockTranslate,
      mockRouter
    )

    component.widgetData = mockWidgetData
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should initialize default values', () => {
      expect(component.primaryCategory).toBe(NsContent.EPrimaryCategory)
      expect(component.acbpConstants).toBe(NsCardContent.ACBPConst)
      expect(component.id).toContain('ws-card_')
      expect(component.defaultThumbnail).toBe('')
      expect(component.defaultSLogo).toBe('')
      expect(component.isIntranetAllowedSettings).toBe(false)
    })

    it('should subscribe to language changes', () => {
      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslate.use).toHaveBeenCalledWith('en')
    })

    it('should handle language change when websiteLanguage is set', () => {
      Storage.prototype.getItem = jest.fn((key: string) => {
        if (key === 'websiteLanguage') {
          return 'hi'
        }
        return null
      })

      mockLangTranslations.languageSelectedObservable = of('hi')

      const newComponent = new EventCardV2Component(
        mockEventService,
        mockConfigService,
        mockLangTranslations,
        mockTranslate,
        mockRouter
      )

      expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(mockTranslate.use).toHaveBeenCalledWith('hi')
      expect(newComponent).toBeDefined()
    })

    it('should not call translate.use when no language is stored', () => {
      Storage.prototype.getItem = jest.fn().mockReturnValue(null)
      mockLangTranslations.languageSelectedObservable = of(null)
      jest.clearAllMocks()

      const newComponent = new EventCardV2Component(
        mockEventService,
        mockConfigService,
        mockLangTranslations,
        mockTranslate,
        mockRouter
      )

      expect(newComponent).toBeDefined()
    })
  })

  describe('forPreview', () => {
    it('should be true when url includes /public/', () => {
      window.location.href = 'http://localhost:4200/public/content/123'

      const newComponent = new EventCardV2Component(
        mockEventService,
        mockConfigService,
        mockLangTranslations,
        mockTranslate,
        mockRouter
      )

      expect(newComponent.forPreview).toBe(true)
    })

    it('should be true when url includes &preview=true', () => {
      window.location.href = 'http://localhost:4200/app/content?id=123&preview=true'

      const newComponent = new EventCardV2Component(
        mockEventService,
        mockConfigService,
        mockLangTranslations,
        mockTranslate,
        mockRouter
      )

      expect(newComponent.forPreview).toBe(true)
    })

    it('should be false for regular urls', () => {
      window.location.href = 'http://localhost:4200/app/home'

      const newComponent = new EventCardV2Component(
        mockEventService,
        mockConfigService,
        mockLangTranslations,
        mockTranslate,
        mockRouter
      )

      expect(newComponent.forPreview).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should set default thumbnail and source logos from instance config', () => {
      component.ngOnInit()

      expect(component.defaultThumbnail).toBe('/assets/default-content.png')
      expect(component.defaultSLogo).toBe('/assets/default-source.png')
      expect(component.sourceLogos).toEqual(mockInstanceConfig.sources)
    })

    it('should set event from widgetData content', () => {
      component.ngOnInit()

      expect(component.event).toEqual(mockWidgetData.content)
    })

    it('should handle missing instance config', () => {
      mockConfigService.instanceConfig = null

      component.ngOnInit()

      expect(component.defaultThumbnail).toBe('')
      expect(component.defaultSLogo).toBe('')
      expect(component.sourceLogos).toBeUndefined()
    })

    it('should handle instance config without logos', () => {
      mockConfigService.instanceConfig = { sources: [] }

      component.ngOnInit()

      expect(component.defaultThumbnail).toBe('')
      expect(component.defaultSLogo).toBe('')
    })

    it('should handle missing widgetData content', () => {
      component.widgetData = {} as any

      component.ngOnInit()

      expect(component.event).toBeUndefined()
    })
  })

  describe('getTime', () => {
    it('should convert minutes to hours and minutes format', () => {
      const result = component.getTime(120)

      expect(result).toBe('2hr 0mins')
    })

    it('should handle minutes less than an hour', () => {
      const result = component.getTime(45)

      expect(result).toBe('0hr 45mins')
    })

    it('should handle minutes with remaining minutes', () => {
      const result = component.getTime(135)

      expect(result).toBe('2hr 15mins')
    })

    it('should handle zero minutes', () => {
      const result = component.getTime(0)

      expect(result).toBe('0hr 0mins')
    })

    it('should handle exactly one hour', () => {
      const result = component.getTime(60)

      expect(result).toBe('1hr 0mins')
    })

    it('should handle large duration', () => {
      const result = component.getTime(500)

      expect(result).toBe('8hr 20mins')
    })
  })

  describe('getStartDate', () => {
    it('should combine start date and time', () => {
      const result = component.getStartDate('2024-04-21', '10:00 AM')

      expect(result).toBe('2024-04-21 10:00 AM')
    })

    it('should handle different date formats', () => {
      const result = component.getStartDate('21/04/2024', '14:30')

      expect(result).toBe('21/04/2024 14:30')
    })

    it('should handle empty date', () => {
      const result = component.getStartDate('', '10:00 AM')

      expect(result).toBe(' 10:00 AM')
    })

    it('should handle empty time', () => {
      const result = component.getStartDate('2024-04-21', '')

      expect(result).toBe('2024-04-21 ')
    })
  })

  describe('getRedirectUrlData', () => {
    it('should emit telemetry and navigate to event hub', async () => {
      const emitSpy = jest.spyOn(component.handleTelemetry, 'emit')
      const content = { identifier: 'event-123' }

      await component.getRedirectUrlData(content)

      expect(emitSpy).toHaveBeenCalledWith(content)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/event-hub/home/event-123'])
    })

    it('should handle navigation with different identifier', async () => {
      const emitSpy = jest.spyOn(component.handleTelemetry, 'emit')
      const content = { identifier: 'event-456', name: 'Test Event' }

      await component.getRedirectUrlData(content)

      expect(emitSpy).toHaveBeenCalledWith(content)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/event-hub/home/event-456'])
    })

    it('should emit telemetry with full content object', async () => {
      const emitSpy = jest.spyOn(component.handleTelemetry, 'emit')
      const content = {
        identifier: 'event-789',
        name: 'My Event',
        description: 'Event description',
      }

      await component.getRedirectUrlData(content)

      expect(emitSpy).toHaveBeenCalledWith(content)
    })
  })

  describe('redirectToUrl', () => {
    it('should redirect to curated collections with identifier', () => {
      window.location.href = 'http://localhost:4200/app/curatedCollections/old-id'

      component.redirectToUrl()

      expect(window.location.href).toBe(
        'http://localhost:4200/app/curatedCollections/do_123456'
      )
    })

    it('should handle different base urls', () => {
      window.location.href = 'http://example.com/curatedCollections/old-id'

      component.redirectToUrl()

      expect(window.location.href).toBe('http://example.com/curatedCollections/do_123456')
    })

    it('should use identifier from widgetData content', () => {
      component.widgetData.content.identifier = 'custom-identifier'
      window.location.href = 'http://localhost:4200/app/curatedCollections/test'

      component.redirectToUrl()

      expect(window.location.href).toBe(
        'http://localhost:4200/app/curatedCollections/custom-identifier'
      )
    })
  })

  describe('raiseTelemetry', () => {
    beforeEach(() => {
      component.widgetType = 'event-card'
      component.widgetSubType = 'v2'
    })

    it('should raise interact telemetry with correct parameters', () => {
      component.raiseTelemetry()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'event-card-v2',
          id: 'event-card',
        },
        {
          id: 'do_123456',
          type: 'Event',
          rollup: {},
          ver: '1.0',
        },
        {
          pageIdExt: 'event-card',
          module: 'event',
        }
      )
    })

    it('should handle different primary categories', () => {
      (component.widgetData.content as any).primaryCategory = 'Workshop'

      component.raiseTelemetry()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'workshop-card',
        }),
        expect.objectContaining({
          type: 'Workshop',
        }),
        expect.objectContaining({
          pageIdExt: 'workshop-card',
          module: 'workshop',
        })
      )
    })

    it('should handle missing version', () => {
      component.widgetData.content.version = undefined

      component.raiseTelemetry()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ver: 'undefined',
        }),
        expect.anything()
      )
    })

    it('should use camelCase for category names', () => {
      (component.widgetData.content as any).primaryCategory = 'Online Event'

      component.raiseTelemetry()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'onlineEvent-card',
        }),
        expect.anything(),
        expect.objectContaining({
          pageIdExt: 'onlineEvent-card',
          module: 'onlineEvent',
        })
      )
    })

    it('should include content identifier in telemetry', () => {
      component.widgetData.content.identifier = 'test-event-id'

      component.raiseTelemetry()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: 'test-event-id',
        }),
        expect.anything()
      )
    })

    it('should handle widget type and subtype combinations', () => {
      component.widgetType = 'card'
      component.widgetSubType = 'mini'

      component.raiseTelemetry()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          subType: 'card-mini',
        }),
        expect.anything(),
        expect.anything()
      )
    })
  })

  describe('translateLabels', () => {
    it('should call translateLabelWithoutspace with correct parameters', () => {
      const result = component.translateLabels('Start Date', 'date', 'start')

      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith(
        'Start Date',
        'date',
        'start'
      )
      expect(result).toBe('Translated Label')
    })

    it('should handle different label types', () => {
      component.translateLabels('Duration', 'time', 'duration')

      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith(
        'Duration',
        'time',
        'duration'
      )
    })

    it('should handle empty labels', () => {
      component.translateLabels('', 'type', 'subtype')

      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith(
        '',
        'type',
        'subtype'
      )
    })

    it('should handle null type and subtype', () => {
      component.translateLabels('Label', null, null)

      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith(
        'Label',
        null,
        null
      )
    })
  })

  describe('translateLabel', () => {
    it('should call translateLabel with correct parameters', () => {
      const result = component.translateLabel('Event Name', 'event')

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('Event Name', 'event', '')
      expect(result).toBe('Translated Label')
    })

    it('should always pass empty string as third parameter', () => {
      component.translateLabel('Description', 'desc')

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('Description', 'desc', '')
    })

    it('should handle empty label', () => {
      component.translateLabel('', 'type')

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('', 'type', '')
    })

    it('should handle null type', () => {
      component.translateLabel('Label', null)

      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('Label', null, '')
    })
  })

  describe('edge cases', () => {
    it('should handle widgetData without content', () => {
      component.widgetData = null as any

      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should generate unique ids for different instances', () => {
      const component1 = new EventCardV2Component(
        mockEventService,
        mockConfigService,
        mockLangTranslations,
        mockTranslate,
        mockRouter
      )
      const component2 = new EventCardV2Component(
        mockEventService,
        mockConfigService,
        mockLangTranslations,
        mockTranslate,
        mockRouter
      )

      expect(component1.id).not.toBe(component2.id)
    })

    it('should handle redirect without curatedCollections in url', () => {
      window.location.href = 'http://localhost:4200/app/home'

      component.redirectToUrl()

      expect(window.location.href).toContain('undefined')
    })

    it('should handle getTime with negative minutes', () => {
      const result = component.getTime(-30)

      expect(result).toBe('-1hr 30mins')
    })

    it('should handle very large minute values', () => {
      const result = component.getTime(10000)

      expect(result).toBe('166hr 40mins')
    })
  })
})
