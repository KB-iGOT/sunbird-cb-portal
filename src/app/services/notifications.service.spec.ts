import { NotificationsService } from './notifications.service'
import { of } from 'rxjs'

// NotificationsService uses plain constructor injection, so it can be
// instantiated directly with mocked dependencies — no TestBed needed.
describe('NotificationsService', () => {
  let service: NotificationsService
  let mockHttp: any
  let mockRouter: any
  let mockConfigSvc: any
  let mockSnackBar: any
  let mockCommonMethodsSvc: any
  let openSpy: jest.SpyInstance

  const environment = {
    portalsForNotifications: {
      cbp: 'https://cbp.example.com',
      mdo: 'https://mdo.example.com',
    },
  }

  const buildNotification = (subCategory: string) => ({
    category: 'CONTENT',
    sub_category: subCategory,
    message: { data: { id: 'do_123', batchId: 'batch_1' } },
  })

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
    }
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn().mockReturnValue(Promise.resolve(true)),
    }
    mockConfigSvc = {
      unMappedUser: { profileDetails: { employmentDetails: { departmentName: 'Org A' } } },
    }
    mockSnackBar = { open: jest.fn() }

    mockCommonMethodsSvc = {
      isApiCacheValid: jest.fn().mockReturnValue(false),
      saveApiCacheTime: jest.fn(),
      clearApiCacheTime: jest.fn(),
    }

    service = new NotificationsService(mockHttp, mockRouter, mockConfigSvc, mockCommonMethodsSvc)
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    localStorage.removeItem('notificationUnreadCount')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getNotificationsData - unread count cache', () => {
    const countResponse = (unread: number) => ({ result: { unread } })

    beforeEach(() => {
      mockConfigSvc.userProfile = { userId: 'user_1' }
      mockConfigSvc.globalConfig = { apis: { notification: { unreadCount: { enabled: true, url: '/unread/count' } } } }
    })

    it('calls the API and saves the count when there is no valid cache', () => {
      mockHttp.get.mockReturnValue(of(countResponse(3)))
      let result: any
      service.getNotificationsData().subscribe(res => result = res)

      expect(mockHttp.get).toHaveBeenCalledWith('/unread/count')
      expect(result).toEqual(countResponse(3))
      expect(mockCommonMethodsSvc.isApiCacheValid).toHaveBeenCalledWith('notificationCountTime', 'user_1')
      expect(mockCommonMethodsSvc.saveApiCacheTime).toHaveBeenCalledWith('notificationCountTime', 'user_1')
      expect(JSON.parse(localStorage.getItem('notificationUnreadCount') as string))
        .toEqual({ userId: 'user_1', response: countResponse(3) })
    })

    it('returns the saved count without calling the API while the cache is valid', () => {
      localStorage.setItem('notificationUnreadCount', JSON.stringify({ userId: 'user_1', response: countResponse(5) }))
      mockCommonMethodsSvc.isApiCacheValid.mockReturnValue(true)
      let result: any
      service.getNotificationsData().subscribe(res => result = res)

      expect(mockHttp.get).not.toHaveBeenCalled()
      expect(result).toEqual(countResponse(5))
    })

    it('ignores a count saved for another user', () => {
      localStorage.setItem('notificationUnreadCount', JSON.stringify({ userId: 'user_2', response: countResponse(5) }))
      mockCommonMethodsSvc.isApiCacheValid.mockReturnValue(true)
      mockHttp.get.mockReturnValue(of(countResponse(1)))
      let result: any
      service.getNotificationsData().subscribe(res => result = res)

      expect(mockHttp.get).toHaveBeenCalled()
      expect(result).toEqual(countResponse(1))
    })

    it('calls the API when forceRefresh is set, even with a valid cache', () => {
      localStorage.setItem('notificationUnreadCount', JSON.stringify({ userId: 'user_1', response: countResponse(5) }))
      mockCommonMethodsSvc.isApiCacheValid.mockReturnValue(true)
      mockHttp.get.mockReturnValue(of(countResponse(0)))
      let result: any
      service.getNotificationsData(true).subscribe(res => result = res)

      expect(mockHttp.get).toHaveBeenCalled()
      expect(result).toEqual(countResponse(0))
    })

    it('does not save a response without a result', () => {
      mockHttp.get.mockReturnValue(of({}))
      service.getNotificationsData().subscribe()

      expect(mockCommonMethodsSvc.saveApiCacheTime).not.toHaveBeenCalled()
      expect(localStorage.getItem('notificationUnreadCount')).toBeNull()
    })

    it('returns null without calling the API when the unread count API is disabled', () => {
      mockConfigSvc.globalConfig.apis.notification.unreadCount.enabled = false
      let result: any = 'unset'
      service.getNotificationsData().subscribe(res => result = res)

      expect(mockHttp.get).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('clears the saved count when the count is reset', () => {
      localStorage.setItem('notificationUnreadCount', JSON.stringify({ userId: 'user_1', response: countResponse(5) }))
      mockHttp.get.mockReturnValue(of({}))
      service.resetNotificationsCount().subscribe()

      expect(mockCommonMethodsSvc.clearApiCacheTime).toHaveBeenCalledWith('notificationCountTime')
      expect(localStorage.getItem('notificationUnreadCount')).toBeNull()
    })
  })

  it('should be defined and set orgName from the user profile', () => {
    expect(service).toBeDefined()
    expect(service.orgName).toBe('Org A')
  })

  describe('handleRedirection - Live content', () => {
    const mockContent = (content: any) => {
      jest.spyOn(service, 'getContentData').mockReturnValue(of({ status: 'Live', ...content }))
    }

    it('should open the MDO comprehensive assessment preview for CONTENT_PUBLISHED with Comprehensive Assessment category', () => {
      mockContent({ courseCategory: 'Comprehensive Assessment' })

      service.handleRedirection(buildNotification('CONTENT_PUBLISHED'), environment, [], mockSnackBar)

      expect(service.getContentData).toHaveBeenCalledWith('do_123')
      expect(openSpy).toHaveBeenCalledWith(
        'https://mdo.example.com/app/home/comprehensive-assessment/edit/do_123?mode=view&preview=true&editMode=true&pathUrl=live&step=preview',
        '_blank'
      )
    })

    it('should open the CBP overview for CONTENT_PUBLISHED when category is not Comprehensive Assessment', () => {
      mockContent({ courseCategory: 'Course' })

      service.handleRedirection(buildNotification('CONTENT_PUBLISHED'), environment, [], mockSnackBar)

      expect(openSpy).toHaveBeenCalledWith(
        'https://cbp.example.com/author/content-detail/do_123/overview-v2?isStandaloneResource=false',
        '_blank'
      )
    })

    it('should open the CBP overview for other sub categories even when category is Comprehensive Assessment', () => {
      mockContent({ courseCategory: 'Comprehensive Assessment' })

      service.handleRedirection(buildNotification('CONTENT_REVIEWED'), environment, [], mockSnackBar)

      expect(openSpy).toHaveBeenCalledWith(
        'https://cbp.example.com/author/content-detail/do_123/overview-v2?isStandaloneResource=false',
        '_blank'
      )
    })

    it('should open the batch assignments page for BP_ASSIGNMENT_SUBMIT', () => {
      mockContent({ courseCategory: 'Blended Program' })

      service.handleRedirection(buildNotification('BP_ASSIGNMENT_SUBMIT'), environment, [], mockSnackBar)

      expect(openSpy).toHaveBeenCalledWith(
        'https://cbp.example.com/author/content-detail/do_123/batches/batch_1/assignments',
        '_blank'
      )
    })

    it('should pass isStandaloneResource=true for standalone learning resources', () => {
      mockContent({ primaryCategory: 'Learning Resource', resourceCategory: 'Video' })

      service.handleRedirection(buildNotification('CONTENT_PUBLISHED'), environment, [], mockSnackBar)

      expect(openSpy).toHaveBeenCalledWith(
        'https://cbp.example.com/author/content-detail/do_123/overview-v2?isStandaloneResource=true',
        '_blank'
      )
    })
  })

  describe('handleRedirection - non-Live content', () => {
    it('should show a snackbar when content is retired', () => {
      jest.spyOn(service, 'getContentData').mockReturnValue(of({ status: 'Retired' }))

      service.handleRedirection(buildNotification('CONTENT_PUBLISHED'), environment, [], mockSnackBar)

      expect(openSpy).not.toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('This content is retired.')
    })

    it('should open my-content list for retire related sub categories without fetching content', () => {
      const getContentSpy = jest.spyOn(service, 'getContentData')

      service.handleRedirection(buildNotification('RETIRE_APPROVED'), environment, [], mockSnackBar)

      expect(getContentSpy).not.toHaveBeenCalled()
      expect(openSpy).toHaveBeenCalledWith('https://cbp.example.com/author/cbp/me?status=live', '_blank')
    })
  })
})
