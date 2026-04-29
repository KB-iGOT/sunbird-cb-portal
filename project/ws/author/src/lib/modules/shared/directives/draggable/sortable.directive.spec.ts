import { SortableDirective } from './sortable.directive'
import { ElementRef } from '@angular/core'

describe('SortableDirective', () => {
  let mockElementRef: ElementRef

  beforeEach(() => {
    mockElementRef = { nativeElement: document.createElement('div') } as ElementRef
  })

  it('should create an instance', () => {
    const directive = new SortableDirective(mockElementRef)
    expect(directive).toBeTruthy()
  })

  it('should have sortable class binding set to true', () => {
    const directive = new SortableDirective(mockElementRef)
    expect(directive.sortable).toBe(true)
  })

  it('should extend DraggableDirective', () => {
    const directive = new SortableDirective(mockElementRef)
    expect(directive.dragStart).toBeDefined()
    expect(directive.dragMove).toBeDefined()
    expect(directive.dragEnd).toBeDefined()
  })

  it('should have element reference accessible', () => {
    const directive = new SortableDirective(mockElementRef)
    expect(directive.element).toBe(mockElementRef)
  })

  it('should have dragging set to false initially', () => {
    const directive = new SortableDirective(mockElementRef)
    expect(directive.dragging).toBe(false)
  })
})

