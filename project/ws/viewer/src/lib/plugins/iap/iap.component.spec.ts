import { IapComponent } from './iap.component'

describe('IapComponent', () => {
  let component: IapComponent
  let sanitizer: any
  let logger: any
  let postMessage: jest.Mock

  beforeEach(() => {
    sanitizer = { bypassSecurityTrustResourceUrl: jest.fn((url: string) => `safe:${url}`) }
    logger = { log: jest.fn() }
    postMessage = jest.fn()
    document.body.innerHTML = '<iframe id="iap-iframe"></iframe>'
    Object.defineProperty(document.getElementById('iap-iframe'), 'contentWindow', {
      configurable: true,
      value: { postMessage },
    })
    component = new IapComponent(sanitizer, logger)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('sanitizes artifact url and clears missing content', () => {
    component.iapContent = { artifactUrl: 'https://example.com/iap' } as any
    component.ngOnChanges()
    expect(component.iframeUrl).toBe('safe:https://example.com/iap')

    component.iapContent = null
    component.ngOnChanges()
    expect(component.iframeUrl).toBeNull()
  })

  it('handles proctoring messages from iframe', () => {
    component.ngAfterViewInit()

    window.dispatchEvent(new MessageEvent('message', { data: null }))
    window.dispatchEvent(new MessageEvent('message', { data: { functionToExecute: 'turnOnProctoring' } }))
    expect(logger.log).toHaveBeenCalledWith('data unavailable')
    expect(component.proctoringStarted).toBe(true)
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'none' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'fullScreen' }, '*')
    expect(component.proctoringWarning).toBe(true)

    window.dispatchEvent(new MessageEvent('message', { data: { functionToExecute: 'turnOffProctoring' } }))
    expect(component.proctoringStarted).toBe(false)
    expect(component.proctoringWarning).toBe(false)
  })

  it('sends proctoring events for protected actions', () => {
    const preventDefault = jest.fn()

    component.contextCheck({ preventDefault })
    component.copyCheck({ preventDefault })
    component.cutCheck({ preventDefault })
    component.pasteCheck({ preventDefault })
    component.beforeUnload({ returnValue: '' })
    component.visibilityCheck()
    component.fullscreenCheck()

    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'rightClick' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'copy' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'cut' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'paste' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'beforeunload' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'visibilitychange' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'fullScreen' }, '*')
    expect(preventDefault).toHaveBeenCalledTimes(4)
  })

  it('handles keyboard proctoring shortcuts and normal keys', () => {
    const preventDefault = jest.fn()

    component.keydownCheck({ altKey: true, preventDefault } as any)
    component.keydownCheck({ ctrlKey: true, preventDefault } as any)
    ;['tab', 'esc', 'window', 'f1', 'f8', 'f12', 'a'].forEach(key => {
      component.keydownCheck({ key, preventDefault } as any)
    })

    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'alt' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'ctrl' }, '*')
    expect(postMessage).toHaveBeenCalledWith({ proctoring: 'f12' }, '*')
    expect(preventDefault).toHaveBeenCalledTimes(8)
  })

  it('clears warning and turns off active proctoring on destroy', () => {
    const removeWindow = jest.spyOn(window, 'removeEventListener')
    const removeBody = jest.spyOn(document.body, 'removeEventListener')
    const removeDoc = jest.spyOn(document, 'removeEventListener')

    component.proctoringWarning = true
    component.proctoringStarted = true
    component.enterFullScreen()
    expect(component.proctoringWarning).toBe(false)

    component.ngOnDestroy()
    expect(removeWindow).toHaveBeenCalled()
    expect(removeBody).toHaveBeenCalled()
    expect(removeDoc).toHaveBeenCalled()
  })
})
