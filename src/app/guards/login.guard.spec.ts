import { LoginGuard } from './login.guard'

describe('LoginGuard', () => {
  let guard: LoginGuard
  let routerMock: any
  let configSvcMock: any

  function buildRoute(hasRef: boolean, refValue = '') {
    return {
      queryParamMap: {
        has: (key: string) => key === 'ref' && hasRef,
        get: (key: string) => key === 'ref' ? refValue : null,
      },
    } as any
  }

  const stateMock: any = {}

  beforeEach(() => {
    routerMock = {
      parseUrl: jest.fn((url: string) => ({ url })),
    }
    configSvcMock = {
      isAuthenticated: false,
      instanceConfig: null,
      pageNavBar: {},
    }
    guard = new LoginGuard(routerMock, configSvcMock)
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  describe('canActivate - not authenticated', () => {
    it('should return true when not authenticated and no keycloak login hidden config', () => {
      configSvcMock.isAuthenticated = false
      configSvcMock.instanceConfig = null

      const result = guard.canActivate(buildRoute(false), stateMock)
      expect(result).toBe(true)
    })

    it('should return false when not authenticated and keycloak isLoginHidden is true', () => {
      configSvcMock.isAuthenticated = false
      configSvcMock.instanceConfig = {
        keycloak: { isLoginHidden: true, defaultidpHint: 'hint' },
      }

      const result = guard.canActivate(buildRoute(false), stateMock)
      expect(result).toBe(false)
    })

    it('should return true when not authenticated and keycloak isLoginHidden is false', () => {
      configSvcMock.isAuthenticated = false
      configSvcMock.instanceConfig = {
        keycloak: { isLoginHidden: false },
      }

      const result = guard.canActivate(buildRoute(false), stateMock)
      expect(result).toBe(true)
    })
  })

  describe('canActivate - authenticated', () => {
    beforeEach(() => {
      configSvcMock.isAuthenticated = true
    })

    it('should redirect to ref URL when authenticated and ref query param exists', () => {
      const route = buildRoute(true, '/app/dashboard')
      routerMock.parseUrl.mockReturnValue({ url: '/app/dashboard' })

      const result = guard.canActivate(route, stateMock)

      expect(routerMock.parseUrl).toHaveBeenCalledWith('/app/dashboard')
      expect(result).toEqual({ url: '/app/dashboard' })
    })

    it('should redirect to page/home when authenticated and no ref param', () => {
      routerMock.parseUrl.mockReturnValue({ url: 'page/home' })

      const result = guard.canActivate(buildRoute(false), stateMock)

      expect(routerMock.parseUrl).toHaveBeenCalledWith('page/home')
      expect(result).toEqual({ url: 'page/home' })
    })

    it('should decode the ref param before parsing', () => {
      const encoded = encodeURIComponent('/app/profile?tab=settings')
      const route = buildRoute(true, encoded)
      routerMock.parseUrl.mockReturnValue({ url: '/app/profile?tab=settings' })

      guard.canActivate(route, stateMock)

      expect(routerMock.parseUrl).toHaveBeenCalledWith('/app/profile?tab=settings')
    })

    it('should parse empty string when ref param is empty', () => {
      const route = buildRoute(true, '')
      routerMock.parseUrl.mockReturnValue({ url: '' })

      guard.canActivate(route, stateMock)

      expect(routerMock.parseUrl).toHaveBeenCalledWith('')
    })
  })
})
