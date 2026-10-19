import { of, Subject, throwError } from 'rxjs'
import { FormEnvConfigService } from './form-env-config.service'

jest.mock('../../../src/environments/environment', () => ({ environment: {} }))

// tslint:disable-next-line: no-var-requires
const { environment } = require('../../../src/environments/environment')

describe('FormEnvConfigService', () => {
  let service: FormEnvConfigService
  let http: any

  beforeEach(() => {
    Object.keys(environment).forEach(key => delete environment[key])
    ;(window as any).env = {}
    http = { post: jest.fn(), get: jest.fn() }
    service = new FormEnvConfigService(http)
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => jest.restoreAllMocks())

  describe('loadEnvironmentConfig', () => {
    it('resolves only after the env values are applied', async () => {
      const response$ = new Subject<any>()
      http.post.mockReturnValue(response$)
      let settled = false
      const pending = service.loadEnvironmentConfig().then(() => { settled = true })

      await Promise.resolve()
      expect(settled).toBe(false)

      response$.next({ result: { data: { name: 'prod', apiKey: 'k' } } })
      response$.complete()
      await pending
      expect(environment.name).toBe('prod')
      expect((window as any).env.apiKey).toBe('k')
    })

    it('falls back to the static global.env.json when the form read fails', async () => {
      http.post.mockReturnValue(throwError(() => new Error('419')))
      http.get.mockReturnValue(of({ name: 'static' }))
      await service.loadEnvironmentConfig()
      expect(http.get).toHaveBeenCalledWith('/assets/configurations/global.env.json')
      expect(environment.name).toBe('static')
    })

    it('keeps the existing values when both reads fail', async () => {
      environment.name = 'from-env-json'
      http.post.mockReturnValue(throwError(() => new Error('419')))
      http.get.mockReturnValue(throwError(() => new Error('404')))
      await service.loadEnvironmentConfig()
      expect(environment.name).toBe('from-env-json')
      expect(environment.error).toBeUndefined()
      expect(environment.data).toBeUndefined()
    })
  })
})
