import { ClickOutsideDirective } from './clickoutside.directive'
import { ElementRef } from '@angular/core'
import { EventEmitter } from '@angular/core'

describe('ClickOutsideDirective', () => {
  let directive: ClickOutsideDirective
  let mockElementRef: ElementRef
  let mockEventEmitter: EventEmitter<any>

  beforeEach(() => {
    // Create a mock ElementRef
    mockElementRef = { nativeElement: { contains: jest.fn() } } as unknown as ElementRef
    // Create a mock EventEmitter
    mockEventEmitter = { emit: jest.fn() } as unknown as EventEmitter<any>
    // Instantiate the directive with mock ElementRef
    directive = new ClickOutsideDirective(mockElementRef)
    // Assign the mock EventEmitter to the directive
    directive.clickOutside = mockEventEmitter
  })

  it('should create', () => {
    expect(directive).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set captured to true after document click event', () => {
      // Setup mock function to simulate document click event
      const documentClick = new Event('click')
      document.dispatchEvent(documentClick)

      // Call ngOnInit manually
      directive.ngOnInit()

      expect(directive.captured).toBe(true)
    })
  })

  describe('onClick', () => {
    it('should emit clickOutside event when clicked outside the element', () => {
      // Simulate a click outside of the element
      mockElementRef.nativeElement.contains.mockReturnValue(false) // simulate not being inside the element

      // Call onClick method manually
      directive.onClick({ target: {} })

      expect(mockEventEmitter.emit).toHaveBeenCalled()
    })

    it('should not emit clickOutside event when clicked inside the element', () => {
      // Simulate a click inside the element
      mockElementRef.nativeElement.contains.mockReturnValue(true) // simulate being inside the element

      // Call onClick method manually
      directive.onClick({ target: {} })

      expect(mockEventEmitter.emit).not.toHaveBeenCalled()
    })

    it('should not emit clickOutside event if captured is false', () => {
      // Simulate a click outside of the element with captured being false
      directive.captured = false
      mockElementRef.nativeElement.contains.mockReturnValue(false)

      // Call onClick method manually
      directive.onClick({ target: {} })

      expect(mockEventEmitter.emit).not.toHaveBeenCalled()
    })
  })
})
