import { SamuhikCharchaService } from './samuhik-charcha.service'
import { of } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class {
    sitePath = '/assets'
  },
}), { virtual: true })

describe('SamuhikCharchaService', () => {
  let service: SamuhikCharchaService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockHttp = { post: jest.fn(() => of({ result: [] })), get: jest.fn(() => of({})) }
    mockConfigSvc = { sitePath: '/assets' }
    service = new SamuhikCharchaService(mockHttp, mockConfigSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchConfigFile calls http.get with sitePath', () => {
    service.fetchConfigFile()
    expect(mockHttp.get).toHaveBeenCalledWith('/assets/feature/samuhik-charcha.json')
  })

  it('getSearchV6Results calls http.post with body', () => {
    const body = { query: 'test', limit: 10 }
    service.getSearchV6Results(body)
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('sunbirdigot/search'), body
    )
  })

  it('getSearchV6Results returns observable', done => {
    const result = { hits: [] }
    mockHttp.post.mockReturnValue(of(result))
    service.getSearchV6Results({}).subscribe((res: any) => {
      expect(res).toEqual(result)
      done()
    })
  })
})
