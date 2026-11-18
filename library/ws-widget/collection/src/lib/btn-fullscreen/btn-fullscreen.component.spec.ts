import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BtnFullscreenComponent } from './btn-fullscreen.component'

describe('BtnFullscreenComponent', () => {
  let component: BtnFullscreenComponent
  let fixture: ComponentFixture<BtnFullscreenComponent>
  let container: HTMLElement
  let currentFsElement: HTMLElement | null

  const fireFullscreenChange = (el: HTMLElement | null) => {
    currentFsElement = el
    document.dispatchEvent(new Event('fullscreenchange'))
  }

  beforeAll(() => {
    // jsdom does not implement the Fullscreen API, so stub what the component relies on
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => currentFsElement,
    })
  })

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BtnFullscreenComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: true, rethrowErrors: false },
    })
    // the template is stubbed out so these tests focus on the component logic
    .overrideTemplate(BtnFullscreenComponent, '')
    .compileComponents()
  }))

  beforeEach(() => {
    currentFsElement = null
    container = document.createElement('section')
    container.requestFullscreen = jest.fn().mockReturnValue(Promise.resolve())
    document.exitFullscreen = jest.fn().mockReturnValue(Promise.resolve())

    fixture = TestBed.createComponent(BtnFullscreenComponent)
    component = fixture.componentInstance
    component.widgetData = { fsContainer: container }
  })

  afterEach(() => {
    component.ngOnDestroy()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should do nothing when no fullscreen container is provided', () => {
      component.widgetData = { fsContainer: null }
      component.ngOnInit()
      expect(component.fsChangeSubs).toBeNull()
      expect(component.isFullScreenSupported).toBe(false)
    })

    it('should detect fullscreen support and the initial state', () => {
      currentFsElement = container
      component.ngOnInit()
      expect(component.isFullScreenSupported).toBe(true)
      expect(component.isInFs).toBe(true)
    })

    it('should emit true when its own container enters fullscreen', () => {
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.ngOnInit()

      fireFullscreenChange(container)

      expect(component.isInFs).toBe(true)
      expect(emitSpy).toHaveBeenCalledWith(true)
    })

    it('should emit false when fullscreen is exited (e.g. via Esc)', () => {
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.ngOnInit()

      fireFullscreenChange(container)
      fireFullscreenChange(null)

      expect(component.isInFs).toBe(false)
      const calls = emitSpy.mock.calls
      expect(calls[calls.length - 1]).toEqual([false])
    })

    it('should emit false when some other element goes fullscreen', () => {
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.ngOnInit()

      fireFullscreenChange(document.createElement('video'))

      expect(component.isInFs).toBe(true)
      expect(emitSpy).toHaveBeenCalledWith(false)
    })
  })

  describe('toggleFs', () => {
    it('should request fullscreen on the container when not in fullscreen', () => {
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.toggleFs()

      expect(container.requestFullscreen).toHaveBeenCalled()
      expect(container.classList.contains('mat-app-background')).toBe(true)
      // state is reported from the fullscreenchange event, not from the click
      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should exit fullscreen when already in fullscreen', () => {
      currentFsElement = container
      component.toggleFs()

      expect(document.exitFullscreen).toHaveBeenCalled()
      expect(container.requestFullscreen).not.toHaveBeenCalled()
    })

    it('should do nothing when there is no container and not in fullscreen', () => {
      component.widgetData = { fsContainer: null }
      component.toggleFs()

      expect(container.requestFullscreen).not.toHaveBeenCalled()
      expect(document.exitFullscreen).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should stop listening to fullscreen changes', () => {
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.ngOnInit()
      component.ngOnDestroy()

      fireFullscreenChange(container)

      expect(emitSpy).not.toHaveBeenCalled()
    })
  })
})
