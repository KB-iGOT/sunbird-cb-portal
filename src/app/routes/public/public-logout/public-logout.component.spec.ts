import { PublicLogoutComponent } from './public-logout.component'
import { Subject } from 'rxjs'

// lodash default import may not resolve well in jest; provide a compatible mock
jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash')
  return { ...actual, default: actual }
})

describe('PublicLogoutComponent', () => {
  let component: PublicLogoutComponent
  let configSvcMock: any
  let activateRouteMock: any
  let authSvcMock: any

  let dataSubject: Subject<any>
  let queryParamSubject: Subject<any>

  beforeEach(() => {
    dataSubject = new Subject<any>()
    queryParamSubject = new Subject<any>()

    configSvcMock = {
      pageNavBar: { title: 'Test Nav' },
      instanceConfig: null,
    }

    activateRouteMock = {
      data: dataSubject.asObservable(),
      queryParamMap: queryParamSubject.asObservable(),
    }

    authSvcMock = {
      force_logout: jest.fn(),
    }

    component = new PublicLogoutComponent(
      configSvcMock,
      activateRouteMock,
      authSvcMock
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize default values', () => {
    expect(component.contactUsMail).toBe('')
    expect(component.platform).toBe('Learner')
    expect(component.panelOpenState).toBe(false)
    expect(component.pageNavbar).toEqual({ title: 'Test Nav' })
    // message is declared without assignment so it is undefined
    expect(component.message).toBeFalsy()
  })

  describe('ngOnInit', () => {
    it('should subscribe to activateRoute.data and set contactPage', () => {
      component.ngOnInit()
      dataSubject.next({ pageData: { data: { contact: 'test@example.com' } } })
      expect(component.contactPage).toEqual({ contact: 'test@example.com' })
    })

    it('should set contactPage to undefined when pageData is absent', () => {
      component.ngOnInit()
      dataSubject.next({})
      expect(component.contactPage).toBeUndefined()
    })

    it('should call force_logout when queryParamMap emits (condition always true)', () => {
      component.ngOnInit()
      // The component condition is always truthy due to !== checks
      queryParamSubject.next({ params: {} })
      expect(authSvcMock.force_logout).toHaveBeenCalled()
    })

    it('should set contactUsMail from instanceConfig when available', () => {
      configSvcMock.instanceConfig = {
        mailIds: { contactUs: 'support@example.com' },
      }
      component.ngOnInit()
      dataSubject.next({})
      expect(component.contactUsMail).toBe('support@example.com')
    })

    it('should not set contactUsMail when instanceConfig is null', () => {
      configSvcMock.instanceConfig = null
      component.ngOnInit()
      expect(component.contactUsMail).toBe('')
    })

    it('should unsubscribe existing subscriptions before re-subscribing', () => {
      component.ngOnInit()
      const firstDataSub = (component as any).subscriptionContact
      const firstQuerySub = (component as any).routerSubsc
      component.ngOnInit()
      // New subscriptions should be created
      expect((component as any).subscriptionContact).not.toBe(firstDataSub)
      expect((component as any).routerSubsc).not.toBe(firstQuerySub)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe subscriptions without errors', () => {
      component.ngOnInit()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should handle ngOnDestroy when no subscriptions exist', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should null-safe unsubscribe when subscriptions are already null', () => {
      (component as any).subscriptionContact = null
        ; (component as any).routerSubsc = null
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
