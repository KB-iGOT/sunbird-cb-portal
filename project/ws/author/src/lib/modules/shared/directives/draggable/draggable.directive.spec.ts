import { TemplateRef, ViewContainerRef } from '@angular/core';
import {  Overlay } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { DraggableDirective } from './draggable.directive';
import { DraggableHelperDirective } from './draggable-helper.directive';

// Mock dependencies
class MockDraggableDirective {
  dragStart = new Subject<PointerEvent>();
  dragMove = new Subject<PointerEvent>();
  dragEnd = new Subject<void>();
  element = {
    nativeElement: {
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 100,
        top: 100,
        width: 200,
        height: 200
      })
    }
  };
}

class MockOverlay {
  create = jest.fn();
}

class MockOverlayRef {
  overlayElement = {
    style: {
      width: ''
    },
    firstChild: {
      style: {
        width: '',
        boxSizing: ''
      }
    }
  };
  
  hasAttached = jest.fn();
  attach = jest.fn();
  detach = jest.fn();
  dispose = jest.fn();
}

class MockTemplateRef {}

class MockViewContainerRef {}

class MockGlobalPositionStrategy {
  left = jest.fn().mockReturnThis();
  top = jest.fn().mockReturnThis();
  apply = jest.fn();
}

describe('DraggableHelperDirective', () => {
  let directive: DraggableHelperDirective;
  let draggable: MockDraggableDirective;
  let overlay: MockOverlay;
  let overlayRef: MockOverlayRef;
  let positionStrategy: MockGlobalPositionStrategy;
  let templateRef: MockTemplateRef;
  let viewContainerRef: MockViewContainerRef;

  beforeEach(() => {
    draggable = new MockDraggableDirective();
    templateRef = new MockTemplateRef();
    viewContainerRef = new MockViewContainerRef();
    positionStrategy = new MockGlobalPositionStrategy();
    overlayRef = new MockOverlayRef();
    overlay = new MockOverlay();
    overlay.create.mockReturnValue(overlayRef);

    // We need to manually spy and replace the GlobalPositionStrategy constructor
    //jest.spyOn(global, 'GlobalPositionStrategy').mockImplementation(() => positionStrategy);

    directive = new DraggableHelperDirective(
      draggable as unknown as DraggableDirective,
      templateRef as unknown as TemplateRef<any>,
      viewContainerRef as unknown as ViewContainerRef,
      overlay as unknown as Overlay
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      directive.ngOnInit();
    });

    it('should create overlay with position strategy', () => {
      expect(overlay.create).toHaveBeenCalledWith({
        positionStrategy: positionStrategy,
      });
    });

    it('should subscribe to dragStart, dragMove, and dragEnd events', () => {
      expect(directive.subscriptions.length).toBe(3);
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      directive.ngOnInit();
      directive.ngOnDestroy();
    });

    it('should unsubscribe from all subscriptions', () => {
      const unsubscribeSpy = jest.spyOn(directive.subscriptions[0], 'unsubscribe');
      directive.unSubscribeEvents();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should dispose overlay', () => {
      expect(overlayRef.dispose).toHaveBeenCalled();
    });
  });

  describe('onDragStart', () => {
    const mockEvent = {
      clientX: 150,
      clientY: 150
    } as PointerEvent;

    beforeEach(() => {
      directive.ngOnInit();
      draggable.dragStart.next(mockEvent);
    });

    it('should calculate start position based on event and element rect', () => {
      // The private property can't be accessed directly in TypeScript, but we can check the effects
      expect(draggable.element.nativeElement.getBoundingClientRect).toHaveBeenCalled();
      expect(overlayRef.overlayElement.style.width).toBe('200px');
    });
  });

  describe('onDragMove', () => {
    const mockEvent = {
      clientX: 200,
      clientY: 200
    } as PointerEvent;

    beforeEach(() => {
      directive.ngOnInit();
      
      // First trigger dragStart to set the startPosition
      draggable.dragStart.next({
        clientX: 150,
        clientY: 150
      } as PointerEvent);
      
      // Mock hasAttached to return false first time, true after
      let hasAttachedCalled = false;
      overlayRef.hasAttached.mockImplementation(() => {
        const result = hasAttachedCalled;
        hasAttachedCalled = true;
        return result;
      });
      
      draggable.dragMove.next(mockEvent);
    });

    it('should attach template portal if not already attached', () => {
      expect(overlayRef.attach).toHaveBeenCalled();
      expect(overlayRef.overlayElement.firstChild.style.width).toBe('100%');
      expect(overlayRef.overlayElement.firstChild.style.boxSizing).toBe('border-box');
    });

    it('should update position based on event and start position', () => {
      expect(positionStrategy.left).toHaveBeenCalledWith('50px'); // 200 - (150 - 100) = 50
      expect(positionStrategy.top).toHaveBeenCalledWith('50px');  // 200 - (150 - 100) = 50
      expect(positionStrategy.apply).toHaveBeenCalled();
    });
  });

  describe('onDragEnd', () => {
    beforeEach(() => {
      directive.ngOnInit();
      draggable.dragEnd.next();
    });

    it('should detach overlay', () => {
      expect(overlayRef.detach).toHaveBeenCalled();
    });
  });

  describe('unSubscribeEvents', () => {
    beforeEach(() => {
      directive.ngOnInit();
    });

    it('should unsubscribe from all subscriptions', () => {
      const unsubscribeSpy1 = jest.spyOn(directive.subscriptions[0], 'unsubscribe');
      const unsubscribeSpy2 = jest.spyOn(directive.subscriptions[1], 'unsubscribe');
      const unsubscribeSpy3 = jest.spyOn(directive.subscriptions[2], 'unsubscribe');
      
      directive.unSubscribeEvents();
      
      expect(unsubscribeSpy1).toHaveBeenCalled();
      expect(unsubscribeSpy2).toHaveBeenCalled();
      expect(unsubscribeSpy3).toHaveBeenCalled();
    });
  });
});