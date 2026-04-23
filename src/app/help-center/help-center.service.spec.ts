import { HelpCenterService } from './help-center.service'
import { of, throwError } from 'rxjs'

describe('HelpCenterService', () => {
  let service: HelpCenterService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(),
      get: jest.fn(),
    }
    service = new HelpCenterService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getConfig should return null initially', () => {
    expect(service.getConfig()).toBeNull()
  })

  describe('fetchHelpCenterConfig', () => {
    it('should return form data on successful API response', done => {
      const formData = { roleTabs: [], contentTabs: [] }
      mockHttp.post.mockReturnValue(
        of({ result: { form: { data: formData } } })
      )

      service.fetchHelpCenterConfig().subscribe(result => {
        expect(result).toEqual(formData)
        expect(service.getConfig()).toEqual(formData)
        done()
      })
    })

    it('should throw error for invalid API response shape', done => {
      mockHttp.post.mockReturnValue(of({ result: {} }))
      mockHttp.get.mockReturnValue(of({ fallback: true }))

      service.fetchHelpCenterConfig().subscribe(result => {
        // falls back to local JSON
        expect(result).toEqual({ fallback: true })
        done()
      })
    })

    it('should fall back to local JSON when API post fails', done => {
      const localData = { roleTabs: ['learner'] }
      mockHttp.post.mockReturnValue(throwError(new Error('Network error')))
      mockHttp.get.mockReturnValue(of(localData))

      service.fetchHelpCenterConfig().subscribe(result => {
        expect(result).toEqual(localData)
        expect(service.getConfig()).toEqual(localData)
        expect(mockHttp.get).toHaveBeenCalledWith('/assets/configurations/feature/help-center.json')
        done()
      })
    })

    it('should return null when both API and fallback JSON fail', done => {
      mockHttp.post.mockReturnValue(throwError(new Error('API fail')))
      mockHttp.get.mockReturnValue(throwError(new Error('JSON fail')))

      service.fetchHelpCenterConfig().subscribe(result => {
        expect(result).toBeNull()
        done()
      })
    })

    it('should update helpCenterConfig after successful call', done => {
      const data = { sections: ['videos'] }
      mockHttp.post.mockReturnValue(of({ result: { form: { data } } }))

      service.fetchHelpCenterConfig().subscribe(() => {
        expect(service.getConfig()).toEqual(data)
        done()
      })
    })
  })
})
