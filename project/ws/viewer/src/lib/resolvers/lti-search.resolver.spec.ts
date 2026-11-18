import { inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'

import { ltiSearchResolver } from './lti-search.resolver'

jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  inject: jest.fn(),
}))

describe('ltiSearchResolver', () => {
  const API = 'apis/proxies/v8/cios-enroll/lti/redirect'
  let mockHttp: any
  const mockInject: any = inject

  const buildRoute = (query: { [key: string]: any }): any => ({
    queryParamMap: {
      get: jest.fn((key: string) => (key in query ? query[key] : null)),
    },
  })

  const run = (query: { [key: string]: any }): any =>
    (ltiSearchResolver as any)(buildRoute(query), {} as any)

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ ok: true })),
    }
    mockInject.mockImplementation((token: any) => (token === HttpClient ? mockHttp : undefined))
  })

  it('should call the redirect api with partnerId and id and return the response', done => {
    run({ id: 'abc', partnerId: 'ext_1' }).subscribe((res: any) => {
      expect(res).toEqual({ ok: true })
      expect(mockInject).toHaveBeenCalledWith(HttpClient)
      expect(mockHttp.get).toHaveBeenCalledTimes(1)
      expect(mockHttp.get).toHaveBeenCalledWith(`${API}/ext_1/abc`)
      done()
    })
  })

  it('should url-encode the partnerId and id', done => {
    run({ id: 'a b/c', partnerId: 'p&1' }).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(`${API}/p%261/a%20b%2Fc`)
      done()
    })
  })

  it('should return null when the api call fails', done => {
    mockHttp.get.mockReturnValue(throwError(() => new Error('network error')))
    run({ id: 'abc', partnerId: 'ext_1' }).subscribe((res: any) => {
      expect(res).toBeNull()
      done()
    })
  })

  it('should return null without calling the api when id is missing', done => {
    run({ partnerId: 'ext_1' }).subscribe((res: any) => {
      expect(res).toBeNull()
      expect(mockInject).not.toHaveBeenCalled()
      expect(mockHttp.get).not.toHaveBeenCalled()
      done()
    })
  })

  it('should return null without calling the api when partnerId is missing', done => {
    run({ id: 'abc' }).subscribe((res: any) => {
      expect(res).toBeNull()
      expect(mockHttp.get).not.toHaveBeenCalled()
      done()
    })
  })

  it('should return null without calling the api when params are empty strings', done => {
    run({ id: '', partnerId: '' }).subscribe((res: any) => {
      expect(res).toBeNull()
      expect(mockHttp.get).not.toHaveBeenCalled()
      done()
    })
  })
})
