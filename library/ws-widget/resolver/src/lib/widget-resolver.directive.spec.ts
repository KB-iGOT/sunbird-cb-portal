/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { WidgetResolverDirective } from './widget-resolver.directive'

describe('WidgetResolverDirective', () => {
  let directive: WidgetResolverDirective
  let mockViewContainerRef: any
  let mockWidgetResolverSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockViewContainerRef = {
      clear: jest.fn(),
      createComponent: jest.fn(),
      createEmbeddedView: jest.fn(),
    }

    mockWidgetResolverSvc = {
      isInitialized: true,
      resolveWidget: jest.fn(),
    }

    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
    }

    directive = new WidgetResolverDirective(
      mockViewContainerRef,
      mockWidgetResolverSvc,
      mockLogger
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(directive).toBeTruthy()
    })

    it('should be defined', () => {
      expect(directive).toBeDefined()
    })

    it('should initialize wsResolverWidget as null', () => {
      expect(directive.wsResolverWidget).toBeNull()
    })

    it('should store viewContainerRef reference', () => {
      expect((directive as any).viewContainerRef).toBe(mockViewContainerRef)
    })

    it('should store widgetResolverSvc reference', () => {
      expect((directive as any).widgetResolverSvc).toBe(mockWidgetResolverSvc)
    })

    it('should store logger reference', () => {
      expect((directive as any).logger).toBe(mockLogger)
    })
  })

  describe('ngOnChanges', () => {
    it('should log error and return when service is not initialized', () => {
      mockWidgetResolverSvc.isInitialized = false
      directive.wsResolverWidget = { widgetType: 'test', widgetSubType: 'test' } as any

      directive.ngOnChanges()

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Widgets Registration Not Done. Used Before Initialization.',
        directive.wsResolverWidget
      )
      expect(mockWidgetResolverSvc.resolveWidget).not.toHaveBeenCalled()
    })

    it('should not call resolveWidget when service is not initialized', () => {
      mockWidgetResolverSvc.isInitialized = false
      directive.wsResolverWidget = { widgetType: 'card' } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).not.toHaveBeenCalled()
    })

    it('should call resolveWidget when service is initialized and wsResolverWidget exists', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.isInitialized = true
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'card', widgetSubType: 'cardContent' } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalledWith(
        directive.wsResolverWidget,
        mockViewContainerRef
      )
      expect(mockCompRef.changeDetectorRef.detectChanges).toHaveBeenCalled()
    })

    it('should call detectChanges on component reference', () => {
      const mockDetectChanges = jest.fn()
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: mockDetectChanges,
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'list' } as any

      directive.ngOnChanges()

      expect(mockDetectChanges).toHaveBeenCalledTimes(1)
    })

    it('should not call detectChanges when compRef is null', () => {
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(null)
      directive.wsResolverWidget = { widgetType: 'card' } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should not call detectChanges when compRef is undefined', () => {
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(undefined)
      directive.wsResolverWidget = { widgetType: 'card' } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should not call resolveWidget when wsResolverWidget is null', () => {
      directive.wsResolverWidget = null

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).not.toHaveBeenCalled()
      expect(mockLogger.error).not.toHaveBeenCalled()
    })

    it('should not call resolveWidget when wsResolverWidget is undefined', () => {
      directive.wsResolverWidget = undefined as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).not.toHaveBeenCalled()
    })

    it('should handle widget with widgetData', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = {
        widgetType: 'card',
        widgetSubType: 'cardContent',
        widgetData: { title: 'Test' },
      }

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalledWith(
        directive.wsResolverWidget,
        mockViewContainerRef
      )
    })

    it('should handle widget with widgetHostClass', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = {
        widgetType: 'card',
        widgetSubType: 'cardContent',
        widgetHostClass: 'custom-class',
      } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
      expect(mockCompRef.changeDetectorRef.detectChanges).toHaveBeenCalled()
    })

    it('should handle widget with widgetInstanceId', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = {
        widgetType: 'card',
        widgetInstanceId: 'widget-123',
      } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should handle multiple consecutive ngOnChanges calls', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'card1' } as any

      directive.ngOnChanges()
      directive.ngOnChanges()
      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalledTimes(3)
      expect(mockCompRef.changeDetectorRef.detectChanges).toHaveBeenCalledTimes(3)
    })

    it('should handle changing wsResolverWidget between calls', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)

      directive.wsResolverWidget = { widgetType: 'card' } as any
      directive.ngOnChanges()

      directive.wsResolverWidget = { widgetType: 'list' } as any
      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalledTimes(2)
    })

    it('should not log error when service is initialized', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.isInitialized = true
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'card' } as any

      directive.ngOnChanges()

      expect(mockLogger.error).not.toHaveBeenCalled()
    })

    it('should handle complex widget configuration', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = {
        widgetType: 'card',
        widgetSubType: 'cardContent',
        widgetHostClass: 'mb-4 custom-class',
        widgetInstanceId: 'widget-456',
        widgetData: {
          title: 'Complex Widget',
          content: 'Content here',
          metadata: { author: 'Test' },
        },
      }

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalledWith(
        directive.wsResolverWidget,
        mockViewContainerRef
      )
      expect(mockCompRef.changeDetectorRef.detectChanges).toHaveBeenCalled()
    })
  })

  describe('service initialization checks', () => {
    it('should check isInitialized before resolving widget', () => {
      mockWidgetResolverSvc.isInitialized = false
      directive.wsResolverWidget = { widgetType: 'test' } as any

      directive.ngOnChanges()

      expect(mockLogger.error).toHaveBeenCalled()
      expect(mockWidgetResolverSvc.resolveWidget).not.toHaveBeenCalled()
    })

    it('should proceed when isInitialized is true', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.isInitialized = true
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'test' } as any

      directive.ngOnChanges()

      expect(mockLogger.error).not.toHaveBeenCalled()
      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should log correct error message', () => {
      mockWidgetResolverSvc.isInitialized = false
      const widget = { widgetType: 'card', widgetSubType: 'test' } as any
      directive.wsResolverWidget = widget

      directive.ngOnChanges()

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Widgets Registration Not Done. Used Before Initialization.',
        widget
      )
    })

    it('should pass widget config to error logger', () => {
      mockWidgetResolverSvc.isInitialized = false
      const widgetConfig = {
        widgetType: 'custom',
        widgetData: { key: 'value' },
      } as any
      directive.wsResolverWidget = widgetConfig

      directive.ngOnChanges()

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect(String),
        widgetConfig
      )
    })

    it('should handle null wsResolverWidget gracefully', () => {
      mockWidgetResolverSvc.isInitialized = true
      directive.wsResolverWidget = null

      expect(() => directive.ngOnChanges()).not.toThrow()
      expect(mockWidgetResolverSvc.resolveWidget).not.toHaveBeenCalled()
    })
  })

  describe('component reference handling', () => {
    it('should call detectChanges when compRef has changeDetectorRef', () => {
      const detectChangesMock = jest.fn()
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: detectChangesMock,
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'card' } as any

      directive.ngOnChanges()

      expect(detectChangesMock).toHaveBeenCalled()
    })

    it('should not throw when compRef is falsy', () => {
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(null)
      directive.wsResolverWidget = { widgetType: 'card' } as any

      expect(() => directive.ngOnChanges()).not.toThrow()
    })

    it('should handle compRef with additional properties', () => {
      const detectChangesMock = jest.fn()
      const mockCompRef: any = {
        instance: { data: 'test' },
        location: {},
        changeDetectorRef: {
          detectChanges: detectChangesMock,
          markForCheck: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'card' } as any

      directive.ngOnChanges()

      expect(detectChangesMock).toHaveBeenCalled()
    })
  })

  describe('integration scenarios', () => {
    it('should handle full widget lifecycle', () => {
      const detectChangesMock = jest.fn()
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: detectChangesMock,
        },
      }

      // Not initialized first
      mockWidgetResolverSvc.isInitialized = false
      directive.wsResolverWidget = { widgetType: 'card' } as any
      directive.ngOnChanges()
      expect(mockLogger.error).toHaveBeenCalled()

      // Then initialized
      jest.clearAllMocks()
      mockWidgetResolverSvc.isInitialized = true
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.ngOnChanges()
      expect(detectChangesMock).toHaveBeenCalled()
    })

    it('should handle widget change from null to valid config', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)

      directive.wsResolverWidget = null
      directive.ngOnChanges()
      expect(mockWidgetResolverSvc.resolveWidget).not.toHaveBeenCalled()

      directive.wsResolverWidget = { widgetType: 'card' } as any
      directive.ngOnChanges()
      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should handle widget change from valid config to null', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)

      directive.wsResolverWidget = { widgetType: 'card' } as any
      directive.ngOnChanges()
      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalledTimes(1)

      directive.wsResolverWidget = null
      directive.ngOnChanges()
      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty widget type', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: '' } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should handle widget with only widgetType', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'minimal' } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should handle very long widgetType string', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = { widgetType: 'a'.repeat(1000) } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should handle special characters in widget configuration', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = {
        widgetType: 'widget@#$%',
        widgetSubType: 'sub!@#',
      } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })

    it('should handle nested widgetData objects', () => {
      const mockCompRef: any = {
        changeDetectorRef: {
          detectChanges: jest.fn(),
        },
      }
      mockWidgetResolverSvc.resolveWidget.mockReturnValue(mockCompRef)
      directive.wsResolverWidget = {
        widgetType: 'card',
        widgetData: {
          level1: {
            level2: {
              level3: {
                data: 'deep',
              },
            },
          },
        },
      } as any

      directive.ngOnChanges()

      expect(mockWidgetResolverSvc.resolveWidget).toHaveBeenCalled()
    })
  })

  describe('Input property', () => {
    it('should accept wsResolverWidget input', () => {
      const config = { widgetType: 'test', widgetSubType: 'test-sub' } as any
      directive.wsResolverWidget = config

      expect(directive.wsResolverWidget).toBe(config)
    })

    it('should allow null assignment', () => {
      directive.wsResolverWidget = null

      expect(directive.wsResolverWidget).toBeNull()
    })

    it('should allow reassignment', () => {
      const config1 = { widgetType: 'test1' } as any
      const config2 = { widgetType: 'test2' } as any

      directive.wsResolverWidget = config1
      expect(directive.wsResolverWidget).toBe(config1)

      directive.wsResolverWidget = config2
      expect(directive.wsResolverWidget).toBe(config2)
    })
  })
})
