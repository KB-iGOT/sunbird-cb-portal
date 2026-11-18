import { DestroyRef, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DomainConfService } from '@sunbird-cb/utils-v2'
import { Subject } from 'rxjs'

import { ExtCourseViewComponent } from './ext-course-view.component'

jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  inject: jest.fn(),
}))

jest.mock('@sunbird-cb/toc', () => ({
  AppTocIframePageComponent: class AppTocIframePageComponent { },
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  DomainConfService: class DomainConfService { },
}))

describe('ExtCourseViewComponent', () => {
  let component: ExtCourseViewComponent
  let mockRoute: any
  let mockDomainConfSvc: any
  let mockDestroyRef: any
  let routeData$: Subject<any>
  let destroyCallbacks: any[]
  let queryParams: { [key: string]: any }
  const mockInject: any = inject

  beforeEach(() => {
    jest.clearAllMocks()
    routeData$ = new Subject<any>()
    destroyCallbacks = []
    queryParams = { id: 'do_123' }

    mockRoute = {
      data: routeData$.asObservable(),
      snapshot: {
        queryParamMap: {
          get: jest.fn((key: string) => (key in queryParams ? queryParams[key] : null)),
        },
      },
    }
    mockDomainConfSvc = {
      getDomainAppLogo: jest.fn().mockReturnValue('/assets/logo.png'),
    }
    mockDestroyRef = {
      destroyed: false,
      onDestroy: jest.fn((cb: any) => {
        destroyCallbacks.push(cb)
        return jest.fn()
      }),
    }

    mockInject.mockImplementation((token: any) => {
      if (token === ActivatedRoute) {
        return mockRoute
      }
      if (token === DomainConfService) {
        return mockDomainConfSvc
      }
      if (token === DestroyRef) {
        return mockDestroyRef
      }
      return undefined
    })

    component = new ExtCourseViewComponent()
  })

  it('should create with default values', () => {
    expect(component).toBeTruthy()
    expect(component.ltiLaunchUrl).toBe('')
    expect(component.appIcon).toBe('')
    expect(component.previewUrl).toBe('')
  })

  it('should set the app icon from the domain config service', () => {
    component.ngOnInit()
    expect(mockDomainConfSvc.getDomainAppLogo).toHaveBeenCalled()
    expect(component.appIcon).toBe('/assets/logo.png')
  })

  it('should fall back to an empty app icon when no logo is configured', () => {
    mockDomainConfSvc.getDomainAppLogo.mockReturnValue(undefined)
    component.ngOnInit()
    expect(component.appIcon).toBe('')
  })

  it('should set the launch url and preview url from the resolved page data', () => {
    component.ngOnInit()
    routeData$.next({ pageData: { result: { ltiLaunchUrl: 'https://lti.example.com/launch' } } })

    expect(mockRoute.snapshot.queryParamMap.get).toHaveBeenCalledWith('id')
    expect(component.previewUrl).toBe('/app/toc/ext/do_123')
    expect(component.ltiLaunchUrl).toBe('https://lti.example.com/launch')
  })

  it('should default the launch url to empty when page data is missing', () => {
    component.ngOnInit()
    routeData$.next({ pageData: null })
    expect(component.ltiLaunchUrl).toBe('')

    routeData$.next({})
    expect(component.ltiLaunchUrl).toBe('')
  })

  it('should set an empty preview url when id query param is missing', () => {
    queryParams = {}
    component.ngOnInit()
    routeData$.next({ pageData: { result: { ltiLaunchUrl: 'https://lti.example.com/launch' } } })

    expect(component.previewUrl).toBe('')
    expect(component.ltiLaunchUrl).toBe('https://lti.example.com/launch')
  })

  it('should update the view when route data changes', () => {
    component.ngOnInit()
    routeData$.next({ pageData: { result: { ltiLaunchUrl: 'url-1' } } })
    expect(component.ltiLaunchUrl).toBe('url-1')

    queryParams = { id: 'do_456' }
    routeData$.next({ pageData: { result: { ltiLaunchUrl: 'url-2' } } })
    expect(component.ltiLaunchUrl).toBe('url-2')
    expect(component.previewUrl).toBe('/app/toc/ext/do_456')
  })

  it('should stop listening to route data once destroyed', () => {
    component.ngOnInit()
    expect(mockDestroyRef.onDestroy).toHaveBeenCalled()

    destroyCallbacks.forEach((cb: any) => cb())
    routeData$.next({ pageData: { result: { ltiLaunchUrl: 'after-destroy' } } })

    expect(component.ltiLaunchUrl).toBe('')
  })
})
