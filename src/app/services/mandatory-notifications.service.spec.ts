import { MandatoryNotificationsService } from './mandatory-notifications.service'
import { of, throwError } from 'rxjs'

describe('MandatoryNotificationsService', () => {
  let service: MandatoryNotificationsService
  let httpMock: any
  let configSvcMock: any

  beforeEach(() => {
    httpMock = {
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
    }
    configSvcMock = {
      userProfile: { id: 'user1' },
    }
    service = new MandatoryNotificationsService(httpMock as any, configSvcMock as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('formReadData', () => {
    it('should call http.post with FORM_READ endpoint and request body', () => {
      const request = { request: { type: 'form', subType: 'mandatory' } }
      const mockResponse = { result: { form: {} } }
      httpMock.post.mockReturnValue(of(mockResponse))

      let result: any
      service.formReadData(request).subscribe(res => (result = res))

      expect(httpMock.post).toHaveBeenCalledWith('/apis/v1/form/read', request)
      expect(result).toEqual(mockResponse)
    })

    it('should return observable from http.post', () => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      let result: any
      service.formReadData({}).subscribe(res => (result = res))
      expect(result).toEqual({ ok: true })
    })
  })

  describe('getMandatoryNotification', () => {
    it('should call http.get with MANDATE_NOTIFICATION_READ endpoint', () => {
      const mockResponse = { result: { notification: { id: 'n1', title: 'Notice' } } }
      httpMock.get.mockReturnValue(of(mockResponse))

      let result: any
      service.getMandatoryNotification().subscribe(res => (result = res))

      expect(httpMock.get).toHaveBeenCalledWith(
        'apis/proxies/v8/v1/notifications/mandatory'
      )
      expect(result).toEqual({ id: 'n1', title: 'Notice' })
    })

    it('should extract notification from result using lodash get', () => {
      const notification = { id: 'n2', message: 'Important update' }
      httpMock.get.mockReturnValue(of({ result: { notification } }))

      let result: any
      service.getMandatoryNotification().subscribe(res => (result = res))

      expect(result).toEqual(notification)
    })

    it('should return error object when http.get throws', () => {
      const error = new Error('Server Error')
      httpMock.get.mockReturnValue(throwError(error))

      let result: any
      service.getMandatoryNotification().subscribe(res => (result = res))

      expect(result).toEqual({ data: null, error })
    })

    it('should return undefined notification when result.notification is missing', () => {
      httpMock.get.mockReturnValue(of({ result: {} }))

      let result: any
      service.getMandatoryNotification().subscribe(res => (result = res))

      expect(result).toBeUndefined()
    })

    it('should not propagate error to subscriber (uses catchError)', () => {
      httpMock.get.mockReturnValue(throwError(new Error('Network Error')))

      let completed = false
      service.getMandatoryNotification().subscribe({
        next: () => { completed = true },
        error: () => { throw new Error('Should not reach error handler') },
        complete: () => { completed = true },
      })

      expect(completed).toBe(true)
    })
  })

  describe('markMandatoryAsRead', () => {
    it('should call http.patch with MARK_MANDATORY_AS_READ endpoint and request', () => {
      const request = { notificationId: 'n1' }
      const mockResponse = { success: true }
      httpMock.patch.mockReturnValue(of(mockResponse))

      let result: any
      service.markMandatoryAsRead(request).subscribe(res => (result = res))

      expect(httpMock.patch).toHaveBeenCalledWith(
        'apis/proxies/v8/v1/notifications/mandatory/read',
        request
      )
      expect(result).toEqual(mockResponse)
    })

    it('should return observable from http.patch', () => {
      httpMock.patch.mockReturnValue(of({ marked: true }))
      let result: any
      service.markMandatoryAsRead({}).subscribe(res => (result = res))
      expect(result).toEqual({ marked: true })
    })
  })
})
