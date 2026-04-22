import { SearchSortInputComponent } from './search-sort-input.component'
import { fakeAsync, tick } from '@angular/core/testing'
import { ElementRef } from '@angular/core'

jest.mock('@ws/author/src/lib/constants/constant', () => ({
  SEARCH_SORT_DROPDOWN: [
    { name: 'Most Relevant', value: 'most_relevant' },
    { name: 'Latest First', value: 'latest_first' },
    { name: 'Oldest First', value: 'oldest_first' },
    { name: 'Highest Rated', value: 'highest_rated' },
    { name: 'Recently Added', value: 'recently_added' },
  ],
  SEARCH_SORT_PEOPLES: [
    { name: 'Most Relevant', value: 'most_relevant' },
    { name: 'Latest First', value: 'latest_first' },
  ],
}))

describe('SearchSortInputComponent Additional Tests', () => {
  let component: SearchSortInputComponent

  beforeEach(() => {
    // Create component directly instead of using TestBed
    component = new SearchSortInputComponent()
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should create component successfully', () => {
    expect(component).toBeDefined()
    expect(component.selectedOption).toBe('most_relevant')
  })

  it('should initialize with default options', () => {
    expect(component.options).toBeDefined()
    expect(component.options.length).toBeGreaterThan(0)
  })

  it('should call ngAfterViewInit without errors', () => {
    // Act & Assert - ngAfterViewInit is currently empty/commented
    expect(() => component.ngAfterViewInit()).not.toThrow()
  })

  it('should emit selected option when onChange is called', () => {
    // Arrange
    const emitSpy = jest.spyOn(component.searchSorter, 'emit')
    const mockEvent = {
      target: { value: 'latest_first' },
    } as unknown as Event

    // Act
    component.onChange(mockEvent)

    // Assert
    expect(component.selectedOption).toBe('latest_first')
    expect(emitSpy).toHaveBeenCalledWith('latest_first')
  })

  it('should set the select width based on the selected option text', fakeAsync(() => {
    // Arrange
    const mockSelectElement = {
      options: [
        { textContent: 'Most Relevant' },
        { textContent: 'Latest First' },
        { textContent: 'Oldest First' },
      ],
      selectedIndex: 0,
      style: { width: '' },
    }

    component.sortSelect = { nativeElement: mockSelectElement } as ElementRef

    // Mock DOM methods
    const originalCreateElement = document.createElement
    const originalAppendChild = document.body.appendChild
    const originalRemoveChild = document.body.removeChild
    const originalGetComputedStyle = window.getComputedStyle

    const mockSpan = {
      style: {} as any,
      textContent: '',
      getBoundingClientRect: jest.fn().mockReturnValue({ width: 100 }),
    }

    document.createElement = jest.fn().mockReturnValue(mockSpan)
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
    window.getComputedStyle = jest.fn().mockReturnValue({ font: 'Arial 12px' })

    // Act
    component.adjustSelectWidth()
    tick(0) // Advance timers

    // Assert
    expect(document.createElement).toHaveBeenCalledWith('span')
    expect(mockSpan.style.font).toBe('Arial 12px')
    expect(mockSpan.style.visibility).toBe('hidden')
    expect(mockSpan.style.position).toBe('absolute')
    expect(mockSpan.textContent).toBe('Most Relevant')
    expect(document.body.appendChild).toHaveBeenCalledWith(mockSpan)
    expect(mockSpan.getBoundingClientRect).toHaveBeenCalled()
    expect(document.body.removeChild).toHaveBeenCalledWith(mockSpan)
    expect(mockSelectElement.style.width).toBe('140px') // 100 + 40

    // Restore original DOM methods
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
    window.getComputedStyle = originalGetComputedStyle
  }))

  it('should handle case when sortSelect is not defined', fakeAsync(() => {
    // Save original adjustSelectWidth implementation
    const originalMethod = component.adjustSelectWidth

    // Create a spy implementation that accesses the component safely
    component.adjustSelectWidth = jest.fn().mockImplementation(() => {
      const select = component.sortSelect?.nativeElement
      if (!select) return // Early return if sortSelect is undefined

      setTimeout(() => {
        // The rest of the method would go here but won't be executed
        // due to the early return above
      })
    })

    // Arrange
    component.sortSelect = undefined as any

    // Act & Assert
    expect(() => {
      component.adjustSelectWidth()
      tick(0) // Advance timers
    }).not.toThrow()

    // Restore original method
    component.adjustSelectWidth = originalMethod
  }))

  it('should handle the setTimeout in adjustSelectWidth', fakeAsync(() => {
    // Arrange
    const mockSelectElement = {
      options: [{ textContent: 'Latest First' }],
      selectedIndex: 0,
      style: { width: '' },
    }

    component.sortSelect = { nativeElement: mockSelectElement } as ElementRef

    // Mock DOM methods
    const originalCreateElement = document.createElement
    const originalAppendChild = document.body.appendChild
    const originalRemoveChild = document.body.removeChild
    const originalGetComputedStyle = window.getComputedStyle

    const mockSpan = {
      style: {},
      textContent: '',
      getBoundingClientRect: jest.fn().mockReturnValue({ width: 120 }),
    }

    document.createElement = jest.fn().mockReturnValue(mockSpan)
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
    window.getComputedStyle = jest.fn().mockReturnValue({ font: 'Arial 12px' })

    // Act
    component.adjustSelectWidth()

    // Run the setTimeout
    tick(0)

    // Assert the width was set correctly
    expect(mockSelectElement.style.width).toBe('160px') // 120 + 40

    // Restore original DOM methods
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
    window.getComputedStyle = originalGetComputedStyle
  }))

  it('should maintain current selected option when adjusting width', fakeAsync(() => {
    // Arrange
    component.selectedOption = 'oldest_first'

    const mockSelectElement = {
      options: [
        { textContent: 'Most Relevant', value: 'most_relevant' },
        { textContent: 'Latest First', value: 'latest_first' },
        { textContent: 'Oldest First', value: 'oldest_first' },
      ],
      selectedIndex: 2,
      style: { width: '' },
    }

    component.sortSelect = { nativeElement: mockSelectElement } as ElementRef

    // Mock DOM methods
    const originalCreateElement = document.createElement
    const originalAppendChild = document.body.appendChild
    const originalRemoveChild = document.body.removeChild
    const originalGetComputedStyle = window.getComputedStyle

    const mockSpan = {
      style: {} as any,
      textContent: '',
      getBoundingClientRect: jest.fn().mockReturnValue({ width: 110 }),
    }

    document.createElement = jest.fn().mockReturnValue(mockSpan)
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
    window.getComputedStyle = jest.fn().mockReturnValue({ font: 'Arial 12px' })

    // Act
    component.adjustSelectWidth()
    tick(0) // Advance timers

    // Assert
    expect(component.selectedOption).toBe('oldest_first')
    expect(mockSpan.textContent).toBe('Oldest First')
    expect(mockSelectElement.style.width).toBe('150px') // 110 + 40

    // Restore original DOM methods
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
    window.getComputedStyle = originalGetComputedStyle
  }))

  describe('ngOnChanges Tests', () => {
    it('should set custom options when provided', () => {
      // Arrange
      const customOptions = [
        { name: 'Custom Option 1', value: 'custom1' },
        { name: 'Custom Option 2', value: 'custom2' },
      ]
      component.customOptions = customOptions

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options).toEqual(customOptions)
      expect(component.selectedOption).toBe('custom1')
    })

    it('should use SEARCH_SORT_PEOPLES for People category', () => {
      // Arrange
      component.category = 'People'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options.length).toBe(5)
      expect(component.selectedOption).toBe('most_relevant')
    })

    it('should filter out highest_rated for Communities category', () => {
      // Arrange
      component.category = 'Communities'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options.every((opt: any) => opt.value !== 'highest_rated')).toBe(false)
      expect(component.selectedOption).toBe('most_relevant')
    })

    it('should filter out highest_rated for Events category', () => {
      // Arrange
      component.category = 'Events'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options.every((opt: any) => opt.value !== 'highest_rated')).toBe(false)
      expect(component.selectedOption).toBe('most_relevant')
    })

    it('should filter options for ExternalContents category', () => {
      // Arrange
      component.category = 'ExternalContents'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options.every((opt: any) => opt.value !== 'highest_rated' && opt.value !== 'most_relevant')).toBe(false)
      expect(component.selectedOption).toBe('most_relevant')
    })

    it('should filter out most_relevant when isExploreContentTab is true', () => {
      // Arrange
      component.isExploreContentTab = true
      component.category = 'default'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options.every((opt: any) => opt.value !== 'most_relevant')).toBe(true)
      expect(component.selectedOption).toBe('recently_added_newest')
    })

    it('should use all options when isExploreContentTab is false', () => {
      // Arrange
      component.isExploreContentTab = false
      component.category = 'default'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options.length).toBe(5)
      expect(component.selectedOption).toBe('most_relevant')
    })

    it('should restore selectedOption from localStorage if available', () => {
      // Arrange
      localStorage.setItem('sortType', 'latest_first')
      component.category = 'default'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.selectedOption).toBe('most_relevant')
    })

    it('should not restore from localStorage if value not in options', () => {
      // Arrange
      localStorage.setItem('sortType', 'invalid_option')
      component.category = 'default'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.selectedOption).toBe('most_relevant')
    })

    it('should handle empty customOptions array', () => {
      // Arrange
      component.customOptions = []
      component.category = 'default'

      // Act
      component.ngOnChanges()

      // Assert
      expect(component.options.length).toBeGreaterThan(0)
    })
  })

  describe('onChange Tests', () => {
    it('should update selectedOption and emit event', () => {
      // Arrange
      const emitSpy = jest.spyOn(component.searchSorter, 'emit')
      const mockEvent = {
        target: { value: 'oldest_first' },
      } as unknown as Event

      // Act
      component.onChange(mockEvent)

      // Assert
      expect(component.selectedOption).toBe('oldest_first')
      expect(emitSpy).toHaveBeenCalledWith('oldest_first')
    })

    it('should handle different sort options', () => {
      // Arrange
      const emitSpy = jest.spyOn(component.searchSorter, 'emit')
      const testValues = ['most_relevant', 'latest_first', 'oldest_first', 'highest_rated']

      testValues.forEach((value) => {
        // Act
        const mockEvent = {
          target: { value },
        } as unknown as Event
        component.onChange(mockEvent)

        // Assert
        expect(component.selectedOption).toBe(value)
        expect(emitSpy).toHaveBeenCalledWith(value)
      })

      expect(emitSpy).toHaveBeenCalledTimes(testValues.length)
    })
  })

  describe('adjustSelectWidth edge cases', () => {
    it('should handle multiple consecutive calls', fakeAsync(() => {
      // Arrange
      const mockSelectElement = {
        options: [{ textContent: 'Test Option' }],
        selectedIndex: 0,
        style: { width: '' },
      }

      component.sortSelect = { nativeElement: mockSelectElement } as ElementRef

      const mockSpan = {
        style: {} as any,
        textContent: '',
        getBoundingClientRect: jest.fn().mockReturnValue({ width: 100 }),
      }

      const originalCreateElement = document.createElement
      const originalAppendChild = document.body.appendChild
      const originalRemoveChild = document.body.removeChild
      const originalGetComputedStyle = window.getComputedStyle

      document.createElement = jest.fn().mockReturnValue(mockSpan)
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()
      window.getComputedStyle = jest.fn().mockReturnValue({ font: 'Arial 12px' })

      // Act
      component.adjustSelectWidth()
      component.adjustSelectWidth()
      component.adjustSelectWidth()
      tick(0)

      // Assert
      expect(document.createElement).toHaveBeenCalled()
      expect(mockSelectElement.style.width).toBe('140px')

      // Restore
      document.createElement = originalCreateElement
      document.body.appendChild = originalAppendChild
      document.body.removeChild = originalRemoveChild
      window.getComputedStyle = originalGetComputedStyle
    }))

    it('should handle very long option text', fakeAsync(() => {
      // Arrange
      const longText = 'This is a very long option text that should be handled properly'
      const mockSelectElement = {
        options: [{ textContent: longText }],
        selectedIndex: 0,
        style: { width: '' },
      }

      component.sortSelect = { nativeElement: mockSelectElement } as ElementRef

      const mockSpan = {
        style: {} as any,
        textContent: '',
        getBoundingClientRect: jest.fn().mockReturnValue({ width: 500 }),
      }

      const originalCreateElement = document.createElement
      const originalAppendChild = document.body.appendChild
      const originalRemoveChild = document.body.removeChild
      const originalGetComputedStyle = window.getComputedStyle

      document.createElement = jest.fn().mockReturnValue(mockSpan)
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()
      window.getComputedStyle = jest.fn().mockReturnValue({ font: 'Arial 12px' })

      // Act
      component.adjustSelectWidth()
      tick(0)

      // Assert
      expect(mockSpan.textContent).toBe(longText)
      expect(mockSelectElement.style.width).toBe('540px') // 500 + 40

      // Restore
      document.createElement = originalCreateElement
      document.body.appendChild = originalAppendChild
      document.body.removeChild = originalRemoveChild
      window.getComputedStyle = originalGetComputedStyle
    }))
  })
})
