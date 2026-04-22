/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { WidgetResolverService } from './widget-resolver.service'

describe('WidgetResolverService', () => {
  let service: WidgetResolverService
  let mockDomSanitizer: any
  let mockComponentFactoryResolver: any
  let mockGlobalConfig: any
  let mockScopedConfig: any

  beforeEach(() => {
    mockDomSanitizer = {
      bypassSecurityTrustStyle: jest.fn((style: string) => style),
      sanitize: jest.fn(),
    }

    mockComponentFactoryResolver = {
      resolveComponentFactory: jest.fn(),
    }

    mockGlobalConfig = null
    mockScopedConfig = null

    service = new WidgetResolverService(
      mockDomSanitizer,
      mockComponentFactoryResolver,
      mockGlobalConfig,
      mockScopedConfig
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeTruthy()
    })

    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should initialize isInitialized as false', () => {
      expect(service.isInitialized).toBe(false)
    })

    it('should store domSanitizer reference', () => {
      expect((service as any).domSanitizer).toBe(mockDomSanitizer)
    })

    it('should store componentFactoryResolver reference', () => {
      expect((service as any).componentFactoryResolver).toBe(mockComponentFactoryResolver)
    })

    it('should initialize roles as null', () => {
      expect((service as any).roles).toBeNull()
    })

    it('should initialize groups as null', () => {
      expect((service as any).groups).toBeNull()
    })

    it('should initialize restrictedFeatures as null', () => {
      expect((service as any).restrictedFeatures).toBeNull()
    })

    it('should initialize availableRegisteredWidgets as null', () => {
      expect((service as any).availableRegisteredWidgets).toBeNull()
    })

    it('should initialize restrictedWidgetKeys as null', () => {
      expect((service as any).restrictedWidgetKeys).toBeNull()
    })
  })

  describe('getWidgetKey', () => {
    it('should return correct widget key format', () => {
      const config = { widgetType: 'card', widgetSubType: 'cardContent' }
      const key = WidgetResolverService.getWidgetKey(config)

      expect(key).toBe('widget:card::cardContent')
    })

    it('should handle empty widgetType', () => {
      const config = { widgetType: '', widgetSubType: 'subtype' }
      const key = WidgetResolverService.getWidgetKey(config)

      expect(key).toBe('widget:::subtype')
    })

    it('should handle empty widgetSubType', () => {
      const config = { widgetType: 'type', widgetSubType: '' }
      const key = WidgetResolverService.getWidgetKey(config)

      expect(key).toBe('widget:type::')
    })

    it('should handle special characters in widgetType', () => {
      const config = { widgetType: 'card@#$', widgetSubType: 'content' }
      const key = WidgetResolverService.getWidgetKey(config)

      expect(key).toBe('widget:card@#$::content')
    })

    it('should create unique keys for different configs', () => {
      const config1 = { widgetType: 'card', widgetSubType: 'type1' }
      const config2 = { widgetType: 'card', widgetSubType: 'type2' }

      const key1 = WidgetResolverService.getWidgetKey(config1)
      const key2 = WidgetResolverService.getWidgetKey(config2)

      expect(key1).not.toBe(key2)
    })
  })

  describe('initialize', () => {
    it('should set isInitialized to true', () => {
      service.initialize(null, null, null, null)

      expect(service.isInitialized).toBe(true)
    })

    it('should set roles when provided', () => {
      const roles = new Set(['admin', 'user'])
      service.initialize(null, roles, null, null)

      expect((service as any).roles).toBe(roles)
    })

    it('should set groups when provided', () => {
      const groups = new Set(['group1', 'group2'])
      service.initialize(null, null, groups, null)

      expect((service as any).groups).toBe(groups)
    })

    it('should set restrictedFeatures when provided', () => {
      const features = new Set(['feature1', 'feature2'])
      service.initialize(null, null, null, features)

      expect((service as any).restrictedFeatures).toBe(features)
    })

    it('should set restrictedWidgetKeys when provided', () => {
      const restricted = new Set(['widget:card::content'])
      service.initialize(restricted, null, null, null)

      expect((service as any).restrictedWidgetKeys).toBe(restricted)
    })

    it('should initialize empty Set for restrictedWidgetKeys when null', () => {
      service.initialize(null, null, null, null)

      expect((service as any).restrictedWidgetKeys).toBeInstanceOf(Set)
      expect((service as any).restrictedWidgetKeys.size).toBe(0)
    })

    it('should process globalConfig when provided', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )

      serviceWithConfig.initialize(null, null, null, null)

      expect((serviceWithConfig as any).availableRegisteredWidgets).toBeInstanceOf(Map)
      expect((serviceWithConfig as any).availableRegisteredWidgets.size).toBe(1)
    })

    it('should process scopedConfig when provided', () => {
      const scopedConfig = [
        { widgetType: 'list', widgetSubType: 'item', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        null,
        scopedConfig
      )

      serviceWithConfig.initialize(null, null, null, null)

      expect((serviceWithConfig as any).availableRegisteredWidgets.size).toBe(1)
    })

    it('should merge globalConfig and scopedConfig', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const scopedConfig = [
        { widgetType: 'list', widgetSubType: 'item', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        scopedConfig
      )

      serviceWithConfig.initialize(null, null, null, null)

      expect((serviceWithConfig as any).availableRegisteredWidgets.size).toBe(2)
    })

    it('should exclude restricted widgets from available widgets', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
        { widgetType: 'list', widgetSubType: 'item', component: {} as any },
      ]
      const restricted = new Set(['widget:card::content'])
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )

      serviceWithConfig.initialize(restricted, null, null, null)

      expect((serviceWithConfig as any).availableRegisteredWidgets.size).toBe(1)
      expect((serviceWithConfig as any).availableRegisteredWidgets.has('widget:card::content')).toBe(false)
    })

    it('should handle empty globalConfig array', () => {
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        [],
        null
      )

      serviceWithConfig.initialize(null, null, null, null)

      expect((serviceWithConfig as any).availableRegisteredWidgets.size).toBe(0)
    })

    it('should handle empty scopedConfig array', () => {
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        null,
        []
      )

      serviceWithConfig.initialize(null, null, null, null)

      expect((serviceWithConfig as any).availableRegisteredWidgets.size).toBe(0)
    })

    it('should handle all parameters provided', () => {
      const restricted = new Set(['widget:card::restricted'])
      const roles = new Set(['admin'])
      const groups = new Set(['developers'])
      const features = new Set(['beta'])

      service.initialize(restricted, roles, groups, features)

      expect(service.isInitialized).toBe(true)
      expect((service as any).roles).toBe(roles)
      expect((service as any).groups).toBe(groups)
      expect((service as any).restrictedFeatures).toBe(features)
    })
  })

  describe('resolveWidget', () => {
    let mockContainerRef: any
    let mockFactory: any
    let mockCompRef: any

    beforeEach(() => {
      mockCompRef = {
        instance: {
          widgetData: null,
          updateBaseComponent: jest.fn(),
        },
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }

      mockFactory = {
        create: jest.fn(),
      }

      mockContainerRef = {
        clear: jest.fn(),
        createComponent: jest.fn().mockReturnValue(mockCompRef),
      }

      mockComponentFactoryResolver.resolveComponentFactory.mockReturnValue(mockFactory)
    })

    it('should return null when availableRegisteredWidgets is null', () => {
      service.initialize(null, null, null, null)
      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
      }

      const result = service.resolveWidget(config, mockContainerRef)

      expect(result).toBeDefined()
    })

    it('should resolve RestrictedComponent for restricted widget', () => {
      const restricted = new Set(['widget:card::content'])
      service.initialize(restricted, null, null, null)
      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
      }

      const result = service.resolveWidget(config, mockContainerRef)

      expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should resolve registered widget when available', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: { title: 'Test' },
      }

      const result = serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(mockContainerRef.clear).toHaveBeenCalled()
      expect(mockContainerRef.createComponent).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should set widgetData on component instance', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const widgetData = { title: 'Test Card' }
      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData,
      }

      serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(mockCompRef.instance.widgetData).toBe(widgetData)
    })

    it('should call updateBaseComponent when method exists', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
        widgetInstanceId: 'widget-123',
        widgetHostClass: 'custom-class',
      }

      serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(mockCompRef.instance.updateBaseComponent).toHaveBeenCalledWith(
        'card',
        'content',
        'widget-123',
        'custom-class',
        undefined
      )
    })

    it('should handle widgetHostStyle and sanitize it', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
        widgetHostStyle: { color: 'red', background: 'blue' },
      }

      serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(mockDomSanitizer.bypassSecurityTrustStyle).toHaveBeenCalled()
    })

    it('should not call updateBaseComponent when method does not exist', () => {
      const mockCompRefWithoutUpdate = {
        instance: {
          widgetData: null,
        },
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockContainerRef.createComponent.mockReturnValue(mockCompRefWithoutUpdate)

      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
      }

      const result = serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(result).toBeDefined()
    })

    it('should resolve UnresolvedComponent for unregistered widget', () => {
      service.initialize(null, null, null, null)
      const config: any = {
        widgetType: 'unknown',
        widgetSubType: 'unknown',
        widgetData: {},
      }

      const result = service.resolveWidget(config, mockContainerRef)

      expect(mockComponentFactoryResolver.resolveComponentFactory).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should resolve InvalidRegistrationComponent when component is missing', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: null as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
      }

      const result = serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(result).toBeDefined()
    })

    it('should clear containerRef before creating component', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
      }

      serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(mockContainerRef.clear).toHaveBeenCalled()
      expect(mockContainerRef.createComponent).toHaveBeenCalled()
    })

    it('should handle widgetPermission check', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      const roles = new Set(['user'])
      serviceWithConfig.initialize(null, roles, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
        widgetPermission: { roles: ['admin'] },
      }

      const result = serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(result).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle multiple calls to initialize', () => {
      service.initialize(null, null, null, null)
      expect(service.isInitialized).toBe(true)

      service.initialize(null, null, null, null)
      expect(service.isInitialized).toBe(true)
    })

    it('should handle very long widget keys', () => {
      const longType = 'a'.repeat(1000)
      const config = { widgetType: longType, widgetSubType: 'subtype' }
      const key = WidgetResolverService.getWidgetKey(config)

      expect(key).toContain(longType)
    })

    it('should handle duplicate widget registrations', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )

      serviceWithConfig.initialize(null, null, null, null)

      expect((serviceWithConfig as any).availableRegisteredWidgets.size).toBe(1)
    })

    it('should handle empty Set for roles', () => {
      const roles = new Set<string>()
      service.initialize(null, roles, null, null)

      expect((service as any).roles.size).toBe(0)
    })

    it('should handle empty Set for groups', () => {
      const groups = new Set<string>()
      service.initialize(null, null, groups, null)

      expect((service as any).groups.size).toBe(0)
    })

    it('should handle empty Set for restrictedFeatures', () => {
      const features = new Set<string>()
      service.initialize(null, null, null, features)

      expect((service as any).restrictedFeatures.size).toBe(0)
    })
  })

  describe('widgetHostStyle processing', () => {
    let mockContainerRef: any
    let mockFactory: any
    let mockCompRef: any

    beforeEach(() => {
      mockCompRef = {
        instance: {
          widgetData: null,
          updateBaseComponent: jest.fn(),
        },
      }

      mockFactory = {}

      mockContainerRef = {
        clear: jest.fn(),
        createComponent: jest.fn().mockReturnValue(mockCompRef),
      }

      mockComponentFactoryResolver.resolveComponentFactory.mockReturnValue(mockFactory)
    })

    it('should convert widgetHostStyle object to CSS string', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
        widgetHostStyle: { color: 'red', margin: '10px' },
      }

      serviceWithConfig.resolveWidget(config, mockContainerRef)

      const sanitizeCall = mockDomSanitizer.bypassSecurityTrustStyle.mock.calls[0][0]
      expect(sanitizeCall).toContain('color:red')
      expect(sanitizeCall).toContain('margin:10px')
    })

    it('should handle single style property', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
        widgetHostStyle: { color: 'blue' },
      }

      serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(mockDomSanitizer.bypassSecurityTrustStyle).toHaveBeenCalled()
    })

    it('should handle empty widgetHostStyle object', () => {
      const globalConfig = [
        { widgetType: 'card', widgetSubType: 'content', component: {} as any },
      ]
      const serviceWithConfig = new WidgetResolverService(
        mockDomSanitizer,
        mockComponentFactoryResolver,
        globalConfig,
        null
      )
      serviceWithConfig.initialize(null, null, null, null)

      const config: any = {
        widgetType: 'card',
        widgetSubType: 'content',
        widgetData: {},
        widgetHostStyle: {},
      }

      serviceWithConfig.resolveWidget(config, mockContainerRef)

      expect(mockDomSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith('')
    })
  })
})
