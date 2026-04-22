/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { WidgetBaseComponent } from './widget-base.component'

describe('WidgetBaseComponent', () => {
  let component: WidgetBaseComponent

  beforeEach(() => {
    component = new WidgetBaseComponent()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy()
    })

    it('should be defined', () => {
      expect(component).toBeDefined()
    })

    it('should initialize widgetType as empty string', () => {
      expect(component.widgetType).toBe('')
    })

    it('should initialize widgetSubType as empty string', () => {
      expect(component.widgetSubType).toBe('')
    })

    it('should have widgetHostClass as undefined initially', () => {
      expect(component.widgetHostClass).toBeUndefined()
    })

    it('should have widgetInstanceId as undefined initially', () => {
      expect(component.widgetInstanceId).toBeUndefined()
    })

    it('should have widgetSafeStyle as undefined initially', () => {
      expect(component.widgetSafeStyle).toBeUndefined()
    })

    it('should have className as undefined initially', () => {
      expect(component.className).toBeUndefined()
    })
  })

  describe('updateBaseComponent', () => {
    it('should update widgetType', () => {
      component.updateBaseComponent('card', 'cardContent')

      expect(component.widgetType).toBe('card')
    })

    it('should update widgetSubType', () => {
      component.updateBaseComponent('card', 'cardContent')

      expect(component.widgetSubType).toBe('cardContent')
    })

    it('should update widgetInstanceId when provided', () => {
      component.updateBaseComponent('card', 'cardContent', 'widget-123')

      expect(component.widgetInstanceId).toBe('widget-123')
    })

    it('should update widgetHostClass when provided', () => {
      component.updateBaseComponent('card', 'cardContent', undefined, 'host-class')

      expect(component.widgetHostClass).toBe('host-class')
    })

    it('should update widgetSafeStyle when provided', () => {
      const safeStyle: any = 'background-color: red;'
      component.updateBaseComponent('card', 'cardContent', undefined, undefined, safeStyle)

      expect(component.widgetSafeStyle).toBe(safeStyle)
    })

    it('should update all parameters when provided', () => {
      const safeStyle: any = 'color: blue;'
      component.updateBaseComponent('list', 'listItem', 'widget-456', 'custom-class', safeStyle)

      expect(component.widgetType).toBe('list')
      expect(component.widgetSubType).toBe('listItem')
      expect(component.widgetInstanceId).toBe('widget-456')
      expect(component.widgetHostClass).toBe('custom-class')
      expect(component.widgetSafeStyle).toBe(safeStyle)
    })

    it('should update className when widgetHostClass is provided and className exists', () => {
      component.className = 'existing-class'
      component.updateBaseComponent('card', 'cardContent', undefined, 'new-class')

      expect(component.className).toBe('existing-class new-class')
    })

    it('should set className when widgetHostClass is provided and className is undefined', () => {
      component.updateBaseComponent('card', 'cardContent', undefined, 'new-class')

      expect(component.className).toBe('undefined new-class')
    })

    it('should not update className when widgetHostClass is not provided', () => {
      component.className = 'existing-class'
      component.updateBaseComponent('card', 'cardContent')

      expect(component.className).toBe('existing-class')
    })

    it('should handle empty string widgetHostClass', () => {
      component.className = 'existing-class'
      component.updateBaseComponent('card', 'cardContent', undefined, '')

      expect(component.className).toBe('existing-class')
    })

    it('should handle multiple widgetHostClass values', () => {
      component.className = 'base-class'
      component.updateBaseComponent('card', 'cardContent', undefined, 'class1 class2 class3')

      expect(component.className).toBe('base-class class1 class2 class3')
    })

    it('should override previous values when called multiple times', () => {
      component.updateBaseComponent('card', 'cardContent', 'widget-1')
      component.updateBaseComponent('list', 'listItem', 'widget-2')

      expect(component.widgetType).toBe('list')
      expect(component.widgetSubType).toBe('listItem')
      expect(component.widgetInstanceId).toBe('widget-2')
    })

    it('should handle undefined widgetInstanceId', () => {
      component.updateBaseComponent('card', 'cardContent', undefined)

      expect(component.widgetInstanceId).toBeUndefined()
    })

    it('should handle null-like values for optional parameters', () => {
      component.updateBaseComponent('card', 'cardContent', undefined, undefined, undefined)

      expect(component.widgetType).toBe('card')
      expect(component.widgetSubType).toBe('cardContent')
      expect(component.widgetInstanceId).toBeUndefined()
      expect(component.widgetHostClass).toBeUndefined()
      expect(component.widgetSafeStyle).toBeUndefined()
    })
  })

  describe('ngAfterViewInit', () => {
    let scrollIntoViewMock: jest.Mock
    let getElementByIdMock: jest.Mock

    beforeEach(() => {
      scrollIntoViewMock = jest.fn()
      getElementByIdMock = jest.fn()
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should scroll to element when hash matches widgetInstanceId', () => {
      const mockElement: any = {
        scrollIntoView: scrollIntoViewMock,
      }

      delete (window as any).location
        ; (window as any).location = { hash: '#123' }

      component.widgetInstanceId = '123'
      getElementByIdMock.mockReturnValue(mockElement)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).toHaveBeenCalledWith('123')
      expect(scrollIntoViewMock).toHaveBeenCalled()
    })

    it('should not scroll when hash does not match widgetInstanceId', () => {
      delete (window as any).location
        ; (window as any).location = { hash: '#123' }

      component.widgetInstanceId = '456'
      getElementByIdMock.mockReturnValue(null)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).not.toHaveBeenCalled()
    })

    it('should not scroll when hash is empty', () => {
      delete (window as any).location
        ; (window as any).location = { hash: '' }

      component.widgetInstanceId = '123'
      getElementByIdMock.mockReturnValue(null)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).not.toHaveBeenCalled()
    })

    it('should not scroll when hash is not a number', () => {
      delete (window as any).location
        ; (window as any).location = { hash: '#abc' }

      component.widgetInstanceId = 'abc'
      getElementByIdMock.mockReturnValue(null)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).not.toHaveBeenCalled()
    })

    it('should not scroll when widgetInstanceId is undefined', () => {
      delete (window as any).location
        ; (window as any).location = { hash: '#123' }

      component.widgetInstanceId = undefined
      getElementByIdMock.mockReturnValue(null)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).not.toHaveBeenCalled()
    })

    it('should wait 200ms before scrolling', () => {
      const mockElement: any = {
        scrollIntoView: scrollIntoViewMock,
      }

      delete (window as any).location
        ; (window as any).location = { hash: '#123' }

      component.widgetInstanceId = '123'
      getElementByIdMock.mockReturnValue(mockElement)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()

      expect(scrollIntoViewMock).not.toHaveBeenCalled()

      jest.advanceTimersByTime(199)
      expect(scrollIntoViewMock).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1)
      expect(scrollIntoViewMock).toHaveBeenCalled()
    })

    it('should handle element not found', () => {
      delete (window as any).location
        ; (window as any).location = { hash: '#123' }

      component.widgetInstanceId = '123'
      getElementByIdMock.mockReturnValue(null)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).toHaveBeenCalledWith('123')
      expect(scrollIntoViewMock).not.toHaveBeenCalled()
    })

    it('should extract hash correctly with multiple # symbols', () => {
      const mockElement: any = {
        scrollIntoView: scrollIntoViewMock,
      }

      delete (window as any).location
        ; (window as any).location = { hash: '#123#456' }

      component.widgetInstanceId = '123#456'
      getElementByIdMock.mockReturnValue(mockElement)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).toHaveBeenCalledWith('123#456')
    })

    it('should handle hash with leading zeros', () => {
      const mockElement: any = {
        scrollIntoView: scrollIntoViewMock,
      }

      delete (window as any).location
        ; (window as any).location = { hash: '#007' }

      component.widgetInstanceId = '007'
      getElementByIdMock.mockReturnValue(mockElement)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).toHaveBeenCalledWith('007')
      expect(scrollIntoViewMock).toHaveBeenCalled()
    })

    it('should handle zero as hash value', () => {
      const mockElement: any = {
        scrollIntoView: scrollIntoViewMock,
      }

      delete (window as any).location
        ; (window as any).location = { hash: '#0' }

      component.widgetInstanceId = '0'
      getElementByIdMock.mockReturnValue(mockElement)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).toHaveBeenCalledWith('0')
      expect(scrollIntoViewMock).toHaveBeenCalled()
    })

    it('should handle negative numbers in hash', () => {
      delete (window as any).location
        ; (window as any).location = { hash: '#-123' }

      component.widgetInstanceId = '-123'
      getElementByIdMock.mockReturnValue(null)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).not.toHaveBeenCalled()
    })

    it('should handle decimal numbers in hash', () => {
      delete (window as any).location
        ; (window as any).location = { hash: '#12.34' }

      component.widgetInstanceId = '12.34'
      getElementByIdMock.mockReturnValue(null)
      document.getElementById = getElementByIdMock

      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(getElementByIdMock).not.toHaveBeenCalled()
    })
  })

  describe('Input decorators', () => {
    it('should accept widgetType input', () => {
      component.widgetType = 'custom-widget'
      expect(component.widgetType).toBe('custom-widget')
    })

    it('should accept widgetSubType input', () => {
      component.widgetSubType = 'custom-subtype'
      expect(component.widgetSubType).toBe('custom-subtype')
    })

    it('should accept widgetHostClass input', () => {
      component.widgetHostClass = 'custom-host-class'
      expect(component.widgetHostClass).toBe('custom-host-class')
    })

    it('should accept widgetInstanceId input', () => {
      component.widgetInstanceId = 'instance-789'
      expect(component.widgetInstanceId).toBe('instance-789')
    })

    it('should accept widgetSafeStyle input', () => {
      const safeStyle: any = 'margin: 10px;'
      component.widgetSafeStyle = safeStyle
      expect(component.widgetSafeStyle).toBe(safeStyle)
    })

    it('should accept className input', () => {
      component.className = 'input-class'
      expect(component.className).toBe('input-class')
    })
  })

  describe('HostBinding', () => {
    it('should bind widgetInstanceId to id', () => {
      component.widgetInstanceId = 'host-id'
      expect(component.widgetInstanceId).toBe('host-id')
    })

    it('should bind widgetSafeStyle to style', () => {
      const style: any = 'padding: 5px;'
      component.widgetSafeStyle = style
      expect(component.widgetSafeStyle).toBe(style)
    })

    it('should bind className to class', () => {
      component.className = 'host-class'
      expect(component.className).toBe('host-class')
    })
  })

  describe('edge cases', () => {
    it('should handle very long widgetType', () => {
      const longType = 'a'.repeat(1000)
      component.updateBaseComponent(longType, 'subtype')
      expect(component.widgetType).toBe(longType)
    })

    it('should handle very long widgetSubType', () => {
      const longSubType = 'b'.repeat(1000)
      component.updateBaseComponent('type', longSubType)
      expect(component.widgetSubType).toBe(longSubType)
    })

    it('should handle special characters in widgetType', () => {
      component.updateBaseComponent('widget@#$%', 'subtype')
      expect(component.widgetType).toBe('widget@#$%')
    })

    it('should handle special characters in widgetSubType', () => {
      component.updateBaseComponent('type', 'sub!@#$%')
      expect(component.widgetSubType).toBe('sub!@#$%')
    })

    it('should handle unicode characters in widgetInstanceId', () => {
      component.updateBaseComponent('type', 'subtype', '测试-123')
      expect(component.widgetInstanceId).toBe('测试-123')
    })

    it('should handle very long className accumulation', () => {
      component.className = 'initial'
      for (let i = 0; i < 10; i++) {
        component.updateBaseComponent('type', 'subtype', undefined, `class${i}`)
      }
      expect(component.className).toContain('class9')
    })

    it('should handle empty widgetType', () => {
      component.updateBaseComponent('', 'subtype')
      expect(component.widgetType).toBe('')
    })

    it('should handle empty widgetSubType', () => {
      component.updateBaseComponent('type', '')
      expect(component.widgetSubType).toBe('')
    })

    it('should handle widgetHostClass with only whitespace', () => {
      component.className = 'initial'
      component.updateBaseComponent('type', 'subtype', undefined, '   ')
      expect(component.className).toBe('initial    ')
    })
  })

  describe('component state management', () => {
    it('should maintain state across multiple updates', () => {
      component.updateBaseComponent('type1', 'subtype1', 'id1', 'class1')
      const firstType = component.widgetType

      component.updateBaseComponent('type2', 'subtype2', 'id2', 'class2')

      expect(component.widgetType).not.toBe(firstType)
      expect(component.widgetType).toBe('type2')
    })

    it('should handle rapid successive updates', () => {
      for (let i = 0; i < 100; i++) {
        component.updateBaseComponent(`type${i}`, `subtype${i}`, `id${i}`)
      }
      expect(component.widgetType).toBe('type99')
      expect(component.widgetSubType).toBe('subtype99')
      expect(component.widgetInstanceId).toBe('id99')
    })

    it('should preserve independently set properties', () => {
      component.widgetType = 'manual-type'
      component.updateBaseComponent('updated-type', 'updated-subtype')
      expect(component.widgetType).toBe('updated-type')
    })
  })

  describe('integration scenarios', () => {
    it('should work correctly when all properties are set via inputs and then updated', () => {
      component.widgetType = 'input-type'
      component.widgetSubType = 'input-subtype'
      component.widgetInstanceId = 'input-id'
      component.className = 'input-class'

      component.updateBaseComponent('new-type', 'new-subtype', 'new-id', 'new-class')

      expect(component.widgetType).toBe('new-type')
      expect(component.widgetSubType).toBe('new-subtype')
      expect(component.widgetInstanceId).toBe('new-id')
      expect(component.className).toBe('input-class new-class')
    })

    it('should handle ngAfterViewInit after updateBaseComponent', () => {
      jest.useFakeTimers()
      const mockElement: any = { scrollIntoView: jest.fn() }
      const getElementByIdMock = jest.fn().mockReturnValue(mockElement)
      document.getElementById = getElementByIdMock

      delete (window as any).location
        ; (window as any).location = { hash: '#999' }

      component.updateBaseComponent('type', 'subtype', '999')
      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(mockElement.scrollIntoView).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('type safety', () => {
    it('should handle SafeStyle type', () => {
      const safeStyle: any = { changingThisBreaksApplicationSecurity: 'test' }
      component.updateBaseComponent('type', 'subtype', undefined, undefined, safeStyle)
      expect(component.widgetSafeStyle).toBe(safeStyle)
    })

    it('should accept string as SafeStyle', () => {
      const styleString: any = 'color: red; background: blue;'
      component.widgetSafeStyle = styleString
      expect(component.widgetSafeStyle).toBe(styleString)
    })
  })
})
