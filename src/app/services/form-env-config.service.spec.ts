import { of, Subject, throwError } from 'rxjs'
import { FormEnvConfigService, matchesCurrentPortal } from './form-env-config.service'

jest.mock('../../../src/environments/environment', () => ({ environment: {} }))
jest.mock('@sunbird-cb/consumption', () => ({ FormConfigService: class { } }))

// tslint:disable-next-line: no-var-requires
const { environment } = require('../../../src/environments/environment')

describe('FormEnvConfigService', () => {
  let service: FormEnvConfigService
  let http: any
  let formConfigSvc: any

  beforeEach(() => {
    Object.keys(environment).forEach(key => delete environment[key])
    ;(window as any).env = {}
    http = { post: jest.fn(), get: jest.fn() }
    formConfigSvc = { getForm: jest.fn() }
    service = new FormEnvConfigService(http, formConfigSvc)
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => jest.restoreAllMocks())

  describe('loadEnvironmentConfig', () => {
    it('resolves only after the env values are applied', async () => {
      const response$ = new Subject<any>()
      formConfigSvc.getForm.mockReturnValue(response$)
      let settled = false
      const pending = service.loadEnvironmentConfig().then(() => { settled = true })

      await Promise.resolve()
      expect(settled).toBe(false)

      response$.next({ result: { data: { name: 'prod', apiKey: 'k' } } })
      response$.complete()
      await pending
      expect(formConfigSvc.getForm).toHaveBeenCalledWith(null, 'portal', 'globalenv', 1)
      expect(environment.name).toBe('prod')
      expect((window as any).env.apiKey).toBe('k')
    })

    it('falls back to the static global.env.json when the form read fails', async () => {
      formConfigSvc.getForm.mockReturnValue(throwError(() => new Error('419')))
      http.get.mockReturnValue(of({ name: 'static' }))
      await service.loadEnvironmentConfig()
      expect(http.get).toHaveBeenCalledWith('/assets/configurations/global.env.json')
      expect(environment.name).toBe('static')
    })

    it('keeps the existing values when both reads fail', async () => {
      environment.name = 'from-env-json'
      formConfigSvc.getForm.mockReturnValue(throwError(() => new Error('419')))
      http.get.mockReturnValue(throwError(() => new Error('404')))
      await service.loadEnvironmentConfig()
      expect(environment.name).toBe('from-env-json')
      expect(environment.error).toBeUndefined()
      expect(environment.data).toBeUndefined()
    })
  })

  describe('on a deployed portal (portal.uat.karmayogibharat.net)', () => {
    const realLocation = window.location
    const uat = { name: 'uat', sitePath: 'portal.uat.karmayogibharat.net', staticHomePageUrl: 'https://uat.karmayogibharat.net/' }
    const prod = { name: 'prod', sitePath: 'portal.igotkarmayogi.gov.in' }

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...realLocation, host: 'portal.uat.karmayogibharat.net', hostname: 'portal.uat.karmayogibharat.net' },
      })
    })

    afterEach(() => Object.defineProperty(window, 'location', { configurable: true, value: realLocation }))

    it('matchesCurrentPortal compares sitePath with this host, ignoring scheme, path and case', () => {
      expect(matchesCurrentPortal(uat)).toBe(true)
      expect(matchesCurrentPortal({ sitePath: 'https://PORTAL.uat.karmayogibharat.net/' })).toBe(true)
      expect(matchesCurrentPortal(prod)).toBe(false)
      expect(matchesCurrentPortal({})).toBe(false)
      expect(matchesCurrentPortal(null)).toBe(false)
    })

    it('keeps the protected read when it is this portal\'s, without a second request', async () => {
      formConfigSvc.getForm.mockReturnValue(of({ result: { data: uat } }))
      await service.loadEnvironmentConfig()
      expect(http.post).not.toHaveBeenCalled()
      expect(environment.name).toBe('uat')
    })

    it('no session: the static file is another environment\'s, so the public globalenv read for this portal wins', async () => {
      formConfigSvc.getForm.mockReturnValue(throwError(() => new Error('419')))
      http.get.mockReturnValue(of(prod))
      http.post.mockReturnValue(of({ result: { form: { data: uat } } }))
      await service.loadEnvironmentConfig()
      expect(http.post).toHaveBeenCalledWith('/apis/v1/form/read', expect.objectContaining({
        request: expect.objectContaining({ subType: 'globalenv', action: 'portal_global_env_config' }),
      }))
      expect(environment.name).toBe('uat')
      expect(environment.staticHomePageUrl).toBe('https://uat.karmayogibharat.net/')
    })

    it('keeps the first result when the public read fails or is not this portal\'s either', async () => {
      formConfigSvc.getForm.mockReturnValue(throwError(() => new Error('419')))
      http.get.mockReturnValue(of(prod))
      http.post.mockReturnValue(throwError(() => new Error('500')))
      await service.loadEnvironmentConfig()
      expect(environment.name).toBe('prod')
    })

    it('uses the public read when nothing else loaded', async () => {
      formConfigSvc.getForm.mockReturnValue(throwError(() => new Error('419')))
      http.get.mockReturnValue(throwError(() => new Error('404')))
      http.post.mockReturnValue(of({ result: { form: { data: { name: 'public-only' } } } }))
      await service.loadEnvironmentConfig()
      expect(environment.name).toBe('public-only')
    })
  })
})
