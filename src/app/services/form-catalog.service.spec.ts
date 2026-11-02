import { of, throwError } from 'rxjs'
import { FormCatalogService } from './form-catalog.service'
import { FORM_CATALOG_SAMPLE } from './__fixtures__/form-catalog.sample'

const CATALOG_URL = '/apis/proxies/v8/formsConfig/v1/readFormDetails'
const USER_URL = '/apis/proxies/v8/api/user/v2/read'

describe('FormCatalogService', () => {
  let http: any
  let service: FormCatalogService
  let routes: { [url: string]: any }

  const userRead = {
    result: { response: { userId: 'u1', roles: ['PUBLIC'], rootOrgId: 'org-1',
      profileDetails: { ministryOrStateType: 'ministry', professionalDetails: [{ designation: 'Director' }] } } },
  }

  beforeEach(() => {
    routes = {
      [CATALOG_URL]: { result: FORM_CATALOG_SAMPLE },
      [USER_URL]: userRead,
    }
    http = {
      get: jest.fn((url: string) => {
        if (routes[url] instanceof Error) { return throwError(() => routes[url]) }
        if (url.startsWith('/apis/proxies/v8/formsConfig/v1/read/')) {
          return of({ result: { data: { formId: Number(url.split('/').pop()) } } })
        }
        return of(routes[url])
      }),
    }
    service = new FormCatalogService(http)
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => jest.restoreAllMocks())

  it('loads catalogue and user read in one go and hands the user read over once', async () => {
    await expect(service.load()).resolves.toBe(true)
    expect(service.loaded).toBe(true)
    expect(http.get).toHaveBeenCalledWith(CATALOG_URL)
    expect(http.get).toHaveBeenCalledWith(USER_URL)
    expect(service.takeUserRead()).toBe(userRead)
    expect(service.takeUserRead()).toBeNull()
  })

  it('is not loaded when the catalogue call fails, and read() returns null', async () => {
    routes[CATALOG_URL] = new Error('503')
    await expect(service.load()).resolves.toBe(false)
    expect(service.loaded).toBe(false)
    expect(service.takeUserRead()).toBeNull()
    expect(service.read({ request: { type: 'page', subType: 'home', portal: 'portal', clientVersion: 2 } })).toBeNull()
  })

  it('is not loaded when the user read fails', async () => {
    routes[USER_URL] = new Error('419')
    await expect(service.load()).resolves.toBe(false)
    expect(service.loaded).toBe(false)
  })

  it('read() resolves the request against the catalogue and reads the form by id', async () => {
    await service.load()
    const obs = service.read({ request: { type: 'page', subType: 'home', portal: 'portal', clientVersion: 2.0 } })!
    const res = await obs.toPromise()
    expect(res.result.data.formId).toBe(40)
    expect(http.get).toHaveBeenCalledWith('/apis/proxies/v8/formsConfig/v1/read/40')
  })

  it('read() handles the globalenv (name-scoped) request like any other subType', async () => {
    await service.load()
    const res = await service.read({ request: { name: 'portal_global_env_config', type: 'page', subType: 'globalenv', portal: 'portal', clientVersion: 1.0 } })!.toPromise()
    expect(res.result.data.formId).toBe(55)
  })

  it('read() returns null for a subType that is not in the catalogue so the caller can fall back', async () => {
    await service.load()
    expect(service.read({ request: { type: 'page', subType: 'not-there', portal: 'portal', clientVersion: 1 } })).toBeNull()
    expect(service.read({ request: {} })).toBeNull()
  })

  it('readById is memoised per id for the session', async () => {
    await service.load()
    const calls = http.get.mock.calls.length
    await service.readById(30).toPromise()
    await service.readById(30).toPromise()
    await service.readById(4).toPromise()
    expect(http.get.mock.calls.length).toBe(calls + 2)
  })
})
