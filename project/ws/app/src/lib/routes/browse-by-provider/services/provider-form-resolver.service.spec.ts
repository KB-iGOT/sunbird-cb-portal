import { ProviderFormResolverService } from './provider-form-resolver.service'
import { of, throwError } from 'rxjs'

jest.mock('src/app/services/form-ext.service', () => ({
  FormExtService: class { formReadData = jest.fn(() => of({ result: { form: { rootOrgId: 'org1' } } })) },
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({ IResolveResponse: {} }), { virtual: true })

describe('ProviderFormResolverService', () => {
  let service: ProviderFormResolverService
  let mockRouter: any
  let mockFormSvc: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    mockFormSvc = { formReadData: jest.fn(() => of({ result: { form: { rootOrgId: 'org1' } } })) }
    service = new ProviderFormResolverService(mockRouter, mockFormSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('resolve calls formSvc.formReadData with correct payload', done => {
    const route: any = {
      params: { orgId: 'org1', provider: 'provider1' },
      data: {},
    }
    service.resolve(route, {} as any).subscribe(res => {
      expect(mockFormSvc.formReadData).toHaveBeenCalled()
      expect(res.data).toBeDefined()
      done()
    })
  })

  it('resolve uses subType microsite-v2 when pageId contains v2', done => {
    const route: any = {
      params: { orgId: 'org1', provider: 'provider1' },
      data: { pageId: 'provider-v2' },
    }
    service.resolve(route, {} as any).subscribe(() => {
      const callBody = mockFormSvc.formReadData.mock.calls[0][0]
      expect(callBody.request.subType).toBe('microsite-v2')
      done()
    })
  })

  it('resolve defaults to subType microsite when pageId has no v2', done => {
    const route: any = {
      params: { orgId: 'org1', provider: 'provider1' },
      data: { pageId: 'provider' },
    }
    service.resolve(route, {} as any).subscribe(() => {
      const callBody = mockFormSvc.formReadData.mock.calls[0][0]
      expect(callBody.request.subType).toBe('microsite')
      done()
    })
  })

  it('resolve navigates when rootOrgId does not match orgId', done => {
    mockFormSvc.formReadData.mockReturnValue(of({ result: { form: { rootOrgId: 'different' } } }))
    const route: any = {
      params: { orgId: 'org1', provider: 'provider1' },
      data: {},
    }
    service.resolve(route, {} as any).subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalled()
      done()
    })
  })

  it('resolve returns error wrapper on formSvc failure', done => {
    mockFormSvc.formReadData.mockReturnValue(throwError(() => new Error('fail')))
    const route: any = { params: { orgId: 'org1', provider: 'p1' }, data: {} }
    service.resolve(route, {} as any).subscribe(res => {
      expect(res.error).toBeTruthy()
      expect(res.data).toBeNull()
      done()
    })
  })

  it('resolve handles empty params gracefully', done => {
    const route: any = { params: {}, data: {} }
    service.resolve(route, {} as any).subscribe(res => {
      expect(res).toBeDefined()
      done()
    })
  })
})
