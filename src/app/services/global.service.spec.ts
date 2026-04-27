import { GlobalService } from './global.service'
import { of, throwError } from 'rxjs'

describe('GlobalService', () => {
  let service: GlobalService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(),
      get: jest.fn(),
    }
    mockConfigSvc = {
      sitePath: '/assets',
    }
    service = new GlobalService(mockHttp, mockConfigSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('formReadData', () => {
    it('should POST to FORM_READ endpoint', done => {
      const payload = { request: { type: 'page' } }
      mockHttp.post.mockReturnValue(of({ result: { form: { data: {} } } }))

      service.formReadData(payload).subscribe(res => {
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/v1/form/read', payload)
        expect(res).toBeTruthy()
        done()
      })
    })
  })

  describe('globalConfigReadData', () => {
    it('should return form data on successful API response', done => {
      const formData = { theme: 'dark' }
      mockHttp.post.mockReturnValue(of({ result: { form: { data: formData } } }))

      service.globalConfigReadData({ request: {} }).subscribe(result => {
        expect(result).toEqual(formData)
        done()
      })
    })

    it('should fall back to global.config.json when API fails', done => {
      const fallbackData = { fallback: true }
      mockHttp.post.mockReturnValue(throwError(new Error('Network error')))
      mockHttp.get.mockReturnValue(of(fallbackData))

      service.globalConfigReadData({ request: {} }).subscribe(result => {
        expect(result).toEqual(fallbackData)
        expect(mockHttp.get).toHaveBeenCalledWith('/assets/global.config.json')
        done()
      })
    })

    it('should return error object when both API and fallback fail', done => {
      const fallbackErr = new Error('JSON not found')
      mockHttp.post.mockReturnValue(throwError(new Error('API fail')))
      mockHttp.get.mockReturnValue(throwError(fallbackErr))

      service.globalConfigReadData({ request: {} }).subscribe(result => {
        expect(result).toEqual({ data: null, error: fallbackErr })
        done()
      })
    })

    it('should use configSvc.sitePath when building fallback URL', done => {
      mockConfigSvc.sitePath = '/custom/path'
      mockHttp.post.mockReturnValue(throwError(new Error('fail')))
      mockHttp.get.mockReturnValue(of({ custom: true }))

      service.globalConfigReadData({}).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/custom/path/global.config.json')
        done()
      })
    })

    it('should handle null form data gracefully', done => {
      mockHttp.post.mockReturnValue(of({ result: { form: { data: null } } }))

      service.globalConfigReadData({}).subscribe(result => {
        expect(result).toBeNull()
        done()
      })
    })
  })
})
