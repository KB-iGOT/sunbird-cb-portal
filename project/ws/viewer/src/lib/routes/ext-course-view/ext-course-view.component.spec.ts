import { DestroyRef, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DomainConfService } from '@sunbird-cb/utils-v2'
import { Subject } from 'rxjs'

import { ExtCourseViewComponent, canBeFramed, toIframeUrl } from './ext-course-view.component'

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

  it('should fall back to redirectUrl when ltiLaunchUrl is missing', () => {
    component.ngOnInit()
    routeData$.next({
      pageData: { result: { redirectUrl: 'https://igot.myhbp.org/hmm12/content/strategic_thinking/landingpage.html' } },
    })
    expect(component.ltiLaunchUrl).toBe('https://igot.myhbp.org/hmm12/content/strategic_thinking/landingpage.html')
  })

  it('should prefer ltiLaunchUrl over redirectUrl when both are present', () => {
    component.ngOnInit()
    routeData$.next({
      pageData: { result: { ltiLaunchUrl: 'https://lti.example.com/launch', redirectUrl: 'https://other.example.com' } },
    })
    expect(component.ltiLaunchUrl).toBe('https://lti.example.com/launch')
  })

  it('should normalise redirectUrl for use in an iframe', () => {
    expect(toIframeUrl('https%3A%2F%2Figot.myhbp.org%2Fhmm12%2Flandingpage.html'))
      .toBe('https://igot.myhbp.org/hmm12/landingpage.html')
    expect(toIframeUrl('https%253A%252F%252Fa.com%252Fx')).toBe('https://a.com/x')
    expect(toIframeUrl('//igot.myhbp.org/x.html')).toBe('https://igot.myhbp.org/x.html')
    expect(toIframeUrl('igot.myhbp.org/x.html')).toBe('https://igot.myhbp.org/x.html')
    expect(toIframeUrl('http://igot.myhbp.org/x.html')).toBe('https://igot.myhbp.org/x.html')
    expect(toIframeUrl('  https://a.com/x  ')).toBe('https://a.com/x')
    expect(toIframeUrl('javascript:alert(1)')).toBe('')
    expect(toIframeUrl('')).toBe('')
    expect(toIframeUrl(undefined)).toBe('')
    expect(toIframeUrl(123)).toBe('')
  })

  it('should open coursera launch urls in a new tab instead of the iframe', () => {
    const courseraUrl = 'https://www.coursera.org/api/rest/v1/tool-lti/login?iss=x&lti_message_hint=%7B%22a%22:1%7D'
    component.ngOnInit()
    routeData$.next({ pageData: { result: { ltiLaunchUrl: courseraUrl } } })
    expect(component.openInNewTab).toBe(true)

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    component.openCourse()
    expect(openSpy).toHaveBeenCalledWith(courseraUrl, '_blank', 'noopener')
    openSpy.mockRestore()
  })

  it('should keep frameable urls in the iframe', () => {
    component.ngOnInit()
    routeData$.next({ pageData: { result: { ltiLaunchUrl: 'https://lti.example.com/launch' } } })
    expect(component.openInNewTab).toBe(false)

    routeData$.next({ pageData: null })
    expect(component.openInNewTab).toBe(false)
  })

  it('should not open a tab when there is no launch url', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    component.openCourse()
    expect(openSpy).not.toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it('should detect hosts that block framing, including subdomains', () => {
    expect(canBeFramed('https://www.coursera.org/learn/x')).toBe(false)
    expect(canBeFramed('https://coursera.org/x')).toBe(false)
    expect(canBeFramed('https://notcoursera.org/x')).toBe(true)
    expect(canBeFramed('https://igot.myhbp.org/x.html')).toBe(true)
    expect(canBeFramed('not a url')).toBe(true)
  })

  it('should stop listening to route data once destroyed', () => {
    component.ngOnInit()
    expect(mockDestroyRef.onDestroy).toHaveBeenCalled()

    destroyCallbacks.forEach((cb: any) => cb())
    routeData$.next({ pageData: { result: { ltiLaunchUrl: 'after-destroy' } } })

    expect(component.ltiLaunchUrl).toBe('')
  })
})
