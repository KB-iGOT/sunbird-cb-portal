/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DragDropDirective } from './drag-drop.directive'

describe('DragDropDirective', () => {
  let directive: DragDropDirective

  beforeEach(() => {
    directive = new DragDropDirective()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(directive).toBeTruthy()
    })

    it('should initialize with default opacity', () => {
      expect(directive.opacity).toBe('1')
    })

    it('should initialize fileDropped EventEmitter', () => {
      expect(directive.fileDropped).toBeDefined()
      expect(directive.fileDropped.observers).toBeDefined()
    })
  })

  describe('onDragOver', () => {
    let mockEvent: any

    beforeEach(() => {
      mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }
    })

    it('should call preventDefault on event', () => {
      directive.onDragOver(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should call stopPropagation on event', () => {
      directive.onDragOver(mockEvent)

      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    it('should set opacity to 0.4', () => {
      directive.onDragOver(mockEvent)

      expect(directive.opacity).toBe('0.4')
    })

    it('should change opacity from initial value', () => {
      expect(directive.opacity).toBe('1')

      directive.onDragOver(mockEvent)

      expect(directive.opacity).toBe('0.4')
    })

    it('should call both preventDefault and stopPropagation', () => {
      directive.onDragOver(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple dragover events', () => {
      directive.onDragOver(mockEvent)
      expect(directive.opacity).toBe('0.4')

      directive.onDragOver(mockEvent)
      expect(directive.opacity).toBe('0.4')

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(2)
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(2)
    })

    it('should maintain opacity at 0.4 for consecutive calls', () => {
      directive.onDragOver(mockEvent)
      const firstOpacity = directive.opacity

      directive.onDragOver(mockEvent)
      const secondOpacity = directive.opacity

      expect(firstOpacity).toBe('0.4')
      expect(secondOpacity).toBe('0.4')
    })
  })

  describe('onDragLeave', () => {
    let mockEvent: any

    beforeEach(() => {
      mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }
    })

    it('should call preventDefault on event', () => {
      directive.onDragLeave(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should call stopPropagation on event', () => {
      directive.onDragLeave(mockEvent)

      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    it('should set opacity to 1.0', () => {
      directive.onDragLeave(mockEvent)

      expect(directive.opacity).toBe('1.0')
    })

    it('should reset opacity after dragover', () => {
      const dragOverEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      directive.onDragOver(dragOverEvent as any)
      expect(directive.opacity).toBe('0.4')

      directive.onDragLeave(mockEvent)
      expect(directive.opacity).toBe('1.0')
    })

    it('should call both preventDefault and stopPropagation', () => {
      directive.onDragLeave(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple dragleave events', () => {
      directive.onDragLeave(mockEvent)
      expect(directive.opacity).toBe('1.0')

      directive.onDragLeave(mockEvent)
      expect(directive.opacity).toBe('1.0')

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(2)
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(2)
    })
  })

  describe('ondrop', () => {
    let mockEvent: any
    let mockFile: any

    beforeEach(() => {
      mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })

      mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: {
          files: [mockFile],
        },
      }
    })

    it('should call preventDefault on event', () => {
      directive.ondrop(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should call stopPropagation on event', () => {
      directive.ondrop(mockEvent)

      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    it('should set opacity to 1.0', () => {
      directive.ondrop(mockEvent)

      expect(directive.opacity).toBe('1.0')
    })

    it('should emit fileDropped with the first file', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')

      directive.ondrop(mockEvent)

      expect(emitSpy).toHaveBeenCalledWith(mockFile)
    })

    it('should emit only the first file when multiple files are dropped', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })
      mockEvent.dataTransfer.files = [mockFile, file2]

      directive.ondrop(mockEvent)

      expect(emitSpy).toHaveBeenCalledWith(mockFile)
      expect(emitSpy).not.toHaveBeenCalledWith(file2)
    })

    it('should not emit fileDropped when no files are dropped', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      mockEvent.dataTransfer.files = []

      directive.ondrop(mockEvent)

      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should not emit fileDropped when files array is null', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      mockEvent.dataTransfer.files = [null]

      directive.ondrop(mockEvent)

      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should not emit fileDropped when files array is undefined', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      mockEvent.dataTransfer.files = [undefined]

      directive.ondrop(mockEvent)

      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should reset opacity after dragover', () => {
      const dragOverEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      directive.onDragOver(dragOverEvent as any)
      expect(directive.opacity).toBe('0.4')

      directive.ondrop(mockEvent)
      expect(directive.opacity).toBe('1.0')
    })

    it('should handle different file types', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      const imageFile = new File(['image'], 'test.png', { type: 'image/png' })
      mockEvent.dataTransfer.files = [imageFile]

      directive.ondrop(mockEvent)

      expect(emitSpy).toHaveBeenCalledWith(imageFile)
    })

    it('should handle large files', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      const largeContent = 'a'.repeat(1024 * 1024) // 1MB
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' })
      mockEvent.dataTransfer.files = [largeFile]

      directive.ondrop(mockEvent)

      expect(emitSpy).toHaveBeenCalledWith(largeFile)
    })

    it('should call both preventDefault and stopPropagation', () => {
      directive.ondrop(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
    })

    it('should handle drop without dataTransfer', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      const invalidEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: null,
      }

      expect(() => directive.ondrop(invalidEvent)).toThrow()
      expect(invalidEvent.preventDefault).toHaveBeenCalled()
      expect(invalidEvent.stopPropagation).toHaveBeenCalled()
      expect(emitSpy).not.toHaveBeenCalled()
    })
  })

  describe('drag and drop workflow', () => {
    it('should handle complete drag and drop workflow', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })

      const dragOverEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      const dropEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: {
          files: [mockFile],
        },
      }

      // Initial state
      expect(directive.opacity).toBe('1')

      // Drag over
      directive.onDragOver(dragOverEvent as any)
      expect(directive.opacity).toBe('0.4')

      // Drop
      directive.ondrop(dropEvent as any)
      expect(directive.opacity).toBe('1.0')
      expect(emitSpy).toHaveBeenCalledWith(mockFile)
    })

    it('should handle drag over and drag leave without drop', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')

      const dragOverEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      const dragLeaveEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      // Initial state
      expect(directive.opacity).toBe('1')

      // Drag over
      directive.onDragOver(dragOverEvent as any)
      expect(directive.opacity).toBe('0.4')

      // Drag leave
      directive.onDragLeave(dragLeaveEvent as any)
      expect(directive.opacity).toBe('1.0')

      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should handle multiple drag over events before drop', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })

      const dragOverEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      const dropEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: {
          files: [mockFile],
        },
      }

      directive.onDragOver(dragOverEvent as any)
      directive.onDragOver(dragOverEvent as any)
      directive.onDragOver(dragOverEvent as any)
      expect(directive.opacity).toBe('0.4')

      directive.ondrop(dropEvent as any)
      expect(directive.opacity).toBe('1.0')
      expect(emitSpy).toHaveBeenCalledWith(mockFile)
    })
  })

  describe('edge cases', () => {
    it('should handle event without preventDefault method', () => {
      const invalidEvent = {
        stopPropagation: jest.fn(),
      } as any

      expect(() => directive.onDragOver(invalidEvent)).toThrow()
    })

    it('should handle event without stopPropagation method', () => {
      const invalidEvent = {
        preventDefault: jest.fn(),
      } as any

      expect(() => directive.onDragOver(invalidEvent)).toThrow()
    })

    it('should handle empty dataTransfer files array', () => {
      const emitSpy = jest.spyOn(directive.fileDropped, 'emit')
      const dropEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: {
          files: [],
        },
      }

      directive.ondrop(dropEvent)

      expect(emitSpy).not.toHaveBeenCalled()
      expect(directive.opacity).toBe('1.0')
    })

    it('should maintain opacity consistency across operations', () => {
      const dragOverEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      const dragLeaveEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }

      expect(directive.opacity).toBe('1')

      directive.onDragOver(dragOverEvent as any)
      expect(directive.opacity).toBe('0.4')

      directive.onDragLeave(dragLeaveEvent as any)
      expect(directive.opacity).toBe('1.0')

      directive.onDragOver(dragOverEvent as any)
      expect(directive.opacity).toBe('0.4')

      directive.onDragLeave(dragLeaveEvent as any)
      expect(directive.opacity).toBe('1.0')
    })
  })
})
