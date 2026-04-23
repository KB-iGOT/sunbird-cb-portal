jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { ...actual, default: actual }
})

import { PublicLoginWComponent } from './public-login-w.component'
import { Subject } from 'rxjs'
import { of } from 'rxjs'

describe('PublicLoginWComponent', () => {
  let component: PublicLoginWComponent
  let activateRouteMock: any
  let httpClientMock: any
  let queryParamSubject: Subject<any>

  beforeEach(() => {
    queryParamSubject = new Subject<any>()

    activateRouteMock = {
      queryParamMap: queryParamSubject.asObservable(),
    }

    httpClientMock = {
      get: jest.fn().mockReturnValue(of({ status: 'success' })),
    }

    component = new PublicLoginWComponent(activateRouteMock, httpClientMock)
  })

  afterEach(() => {
    queryParamSubject.complete()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize default values', () => {
    expect(component.userMail).toBe('')
    expect(component.platform).toBe('Learner')
    expect(component.data).toBeUndefined()
  })

  describe('ngOnInit', () => {
    it('should subscribe to queryParamMap', () => {
      component.ngOnInit()
      queryParamSubject.next({ params: {} })
      expect(component.data).toEqual({})
    })

    it('should call httpClient.get with callback URL when code param exists', () => {
      component.ngOnInit()
      queryParamSubject.next({ params: { code: 'auth-code-123', state: 'state-abc' } })
      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/public/v8/parichay/callback',
        { params: { code: 'auth-code-123', state: 'state-abc' } }
      )
    })

    it('should not call httpClient.get when code param is absent', () => {
      component.ngOnInit()
      queryParamSubject.next({ params: { state: 'state-only' } })
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })

    it('should not call httpClient.get when code is empty string', () => {
      component.ngOnInit()
      queryParamSubject.next({ params: { code: '', state: '' } })
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe without errors after ngOnInit', () => {
      component.ngOnInit()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should handle ngOnDestroy when subscription is null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('login', () => {
    it('should set window.location.href to resource URL', () => {
      const originalLocation = window.location
      delete (window as any).location
        ; (window as any).location = { origin: 'https://example.com', href: '' }

      component.login()

      expect(window.location.href).toBe('https://example.com/protected/v8/resource')
        ; (window as any).location = originalLocation
    })
  })
})
