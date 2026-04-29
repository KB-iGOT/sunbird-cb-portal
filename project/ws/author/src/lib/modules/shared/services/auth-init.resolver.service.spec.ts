import { of } from 'rxjs'

jest.mock('@ws/author/src/lib/constants/apiEndpoints', () => ({
  INIT: '/api/author/v1/init/',
}), { virtual: true })

jest.mock('./api.service', () => ({
  ApiService: jest.fn(),
}), { virtual: true })

jest.mock('./access-control.service', () => ({
  AccessControlService: jest.fn(),
}), { virtual: true })

jest.mock('@angular/core', () => ({
  Injectable: () => () => { },
  Inject: () => () => { },
}), { virtual: true })

import { AuthInitResolver } from './auth-init.resolver.service'

describe('AuthInitResolver', () => {
  let resolver: AuthInitResolver
  let mockSvc: any
  let mockAccessService: any

  beforeEach(() => {
    mockSvc = { get: jest.fn().mockReturnValue(of({ success: true })) }
    mockAccessService = {
      orgRootOrgAsQuery: '?rootOrg=testRoot&org=TestOrg',
      locale: 'en',
    }
    resolver = new AuthInitResolver(mockSvc, mockAccessService)
  })

  it('should create', () => {
    expect(resolver).toBeTruthy()
  })

  it('resolve() calls svc.get with correct URL', done => {
    resolver.resolve().subscribe(result => {
      expect(result).toEqual({ success: true })
      expect(mockSvc.get).toHaveBeenCalledWith(
        '/api/author/v1/init/?rootOrg=testRoot&org=TestOrg&lang=en',
      )
      done()
    })
  })

  it('resolve() includes locale in URL', done => {
    mockAccessService.locale = 'hi'
    mockAccessService.orgRootOrgAsQuery = '?rootOrg=r&org=o'
    resolver.resolve().subscribe(() => {
      const calledUrl: string = mockSvc.get.mock.calls[0][0]
      expect(calledUrl).toContain('lang=hi')
      done()
    })
  })
})
