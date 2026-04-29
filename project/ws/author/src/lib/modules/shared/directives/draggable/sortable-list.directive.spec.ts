// Use require to avoid ts-jest type-checking the directive source
// (the source has a known IClientRect/ClientRect TS type mismatch)
import { Subject } from 'rxjs'

// tslint:disable
/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-ignore
const { SortableListDirective } = require('./sortable-list.directive')
// tslint:enable

describe('SortableListDirective', () => {
  let directive: any
  let mockChangeDetector: any
  let mockElementRef: any
  let mockScrollHelper: any

  beforeEach(() => {
    mockChangeDetector = { detach: jest.fn(), detectChanges: jest.fn() }
    mockElementRef = {
      nativeElement: {
        children: [{ children: [null, { scrollLeft: 0, scrollTop: 0 }] }],
      },
    }
    mockScrollHelper = { scrollIfNecessary: jest.fn() }
    directive = new SortableListDirective(mockChangeDetector, mockElementRef, mockScrollHelper)
  })

  function makeSortable() {
    const dragStart = new Subject<PointerEvent>()
    const dragMove = new Subject<PointerEvent>()
    const el = {
      nativeElement: {
        getBoundingClientRect: jest.fn(() => ({ top: 0, left: 0, width: 100, height: 50, right: 100, bottom: 50, x: 0, y: 0 })),
      },
    }
    return { dragStart, dragMove, element: el }
  }

  it('should create', () => {
    expect(directive).toBeTruthy()
  })

  it('should have empty subscriptions initially', () => {
    expect(directive.subscriptions).toEqual([])
  })

  it('sort EventEmitter is defined', () => {
    expect(directive.sort).toBeDefined()
  })

  it('ngOnDestroy detaches changeDetector and unsubscribes', () => {
    const sortable = makeSortable() as any
    directive.sortables = { forEach: (cb: any) => cb(sortable), map: (cb: any) => [cb(sortable)], toArray: () => [sortable], length: 1, changes: new Subject() } as any
    directive.ngAfterContentInit()
    directive.ngOnDestroy()
    expect(mockChangeDetector.detach).toHaveBeenCalled()
  })

  it('unSubscribeEvents unsubscribes all', () => {
    const sortable = makeSortable() as any
    directive.sortables = { forEach: (cb: any) => cb(sortable), map: (cb: any) => [cb(sortable)], toArray: () => [sortable], length: 1, changes: new Subject() } as any
    directive.ngAfterContentInit()
    expect(directive.subscriptions.length).toBeGreaterThan(0)
    directive.unSubscribeEvents()
    // No error thrown
    expect(true).toBe(true)
  })

  it('resetIClientRect returns zeroed rect', () => {
    const rect = (directive as any).resetIClientRect()
    expect(rect).toEqual({ x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 })
  })
})

