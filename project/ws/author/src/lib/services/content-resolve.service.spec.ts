import { ContentTOCResolver } from './content-resolve.service'
import { of, throwError } from 'rxjs'

jest.mock('../constants/apiEndpoints', () => ({
  CONTENT_READ: '/apis/proxies/v8/action/content/hierarchy/',
  AUTHORING_CONTENT_BASE: '/authoring/v1/',
}), { virtual: true })
jest.mock('@ws/author/src/lib/modules/shared/services/access-control.service', () => ({
  AccessControlService: jest.fn(),
}), { virtual: true })

function buildResolver(overrides: any = {}) {
  const mockApiService: any = {
    get: jest.fn().mockReturnValue(of({ identifier: 'content1', name: 'Test' })),
    ...overrides.apiService,
  }
  const mockAccessService: any = {
    orgRootOrgAsQuery: '?rootOrg=dopt&org=DOPT',
    ...overrides.accessService,
  }
  const mockRouter: any = {
    navigateByUrl: jest.fn(),
    ...overrides.router,
  }
  const resolver = new ContentTOCResolver(mockApiService, mockAccessService, mockRouter)
  return { resolver, mockApiService, mockAccessService, mockRouter }
}

function buildRoute(id: string) {
  return { params: { id } } as any
}

describe('ContentTOCResolver', () => {
  it('should create', () => {
    const { resolver } = buildResolver()
    expect(resolver).toBeTruthy()
  })

  it('resolve - calls apiService.get with correct URL', (done) => {
    const { resolver, mockApiService } = buildResolver()
    resolver.resolve(buildRoute('content1')).subscribe(() => {
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/action/content/hierarchy/content1?rootOrg=dopt&org=DOPT',
      )
      done()
    })
  })

  it('resolve - returns content on success', (done) => {
    const { resolver } = buildResolver()
    resolver.resolve(buildRoute('content123')).subscribe((result: any) => {
      expect(result.identifier).toBe('content1')
      done()
    })
  })

  it('resolve - navigates to error page on API error', (done) => {
    const { resolver, mockRouter } = buildResolver({
      apiService: { get: jest.fn().mockReturnValue(throwError('Not Found')) },
    })
    resolver.resolve(buildRoute('bad-id')).subscribe(() => {
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error-somethings-wrong')
      done()
    })
  })

  it('resolve - returns error value on error', (done) => {
    const errorVal = new Error('Not Found')
    const { resolver } = buildResolver({
      apiService: { get: jest.fn().mockReturnValue(throwError(errorVal)) },
    })
    resolver.resolve(buildRoute('bad-id')).subscribe((result: any) => {
      expect(result).toBe(errorVal)
      done()
    })
  })

  it('resolve - uses route id param in URL', (done) => {
    const { resolver, mockApiService } = buildResolver()
    resolver.resolve(buildRoute('abc-123')).subscribe(() => {
      const callArg: string = mockApiService.get.mock.calls[0][0]
      expect(callArg).toContain('abc-123')
      done()
    })
  })
})
