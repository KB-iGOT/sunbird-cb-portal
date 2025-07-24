import { NotificationsService } from './notifications.service'
import { of, throwError } from 'rxjs'

const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn()
}

const mockRouter = {
  navigate: jest.fn()
}

const mockConfigService = {
  unMappedUser: {
    profileDetails: {
      employmentDetails: {
        departmentName: 'Test Department'
      }
    }
  }
}

describe('NotificationsService', () => {
  let service: NotificationsService

  beforeEach(() => {
    service = new NotificationsService(
      mockHttpClient as any,
      mockRouter as any,
      mockConfigService as any
    )
  })

  it('should initialize orgName from configService', () => {
    expect(service.orgName).toBe('Test Department')
  })

  it('should get notifications count', () => {
    mockHttpClient.get.mockReturnValue(of({ count: 5 }))
    service.getNotificationsData().subscribe(data => {
      expect(data).toEqual({ count: 5 })
    })
    expect(mockHttpClient.get).toHaveBeenCalledWith('apis/proxies/v8/v1/notifications/unread/count')
  })

  it('should reset notifications count', () => {
    mockHttpClient.get.mockReturnValue(of({ success: true }))
    service.resetNotificationsCount().subscribe(data => {
      expect(data).toEqual({ success: true })
    })
    expect(mockHttpClient.get).toHaveBeenCalledWith('apis/proxies/v8/v1/notifications/reset/unread/count', {})
  })

  it('should get content data and return mapped content', () => {
    const contentMock = { result: { content: { id: '123' } } }
    mockHttpClient.get.mockReturnValue(of(contentMock))

    service.getContentData('123').subscribe(data => {
      expect(data).toEqual(contentMock.result.content)
    })
  })

  it('should search workflow with given payload', () => {
    const req = { a: 1 }
    const response = { result: { data: [] } }
    mockHttpClient.post.mockReturnValue(of(response))

    service.searchWorkflowSearch(req).subscribe(data => {
      expect(data).toEqual(response)
    })
    expect(mockHttpClient.post).toHaveBeenCalledWith('apis/protected/v8/workflowhandler/profileApprovalSearch', req)
  })

  it('should construct payload for PROFILE_VERIFICATION', () => {
    const payload = service.constrctPayload({ sub_category: 'PROFILE_VERIFICATION' })
    expect(payload.requestType).toEqual(['GROUP_CHANGE', 'DESIGNATION_CHANGE'])
  })

  it('should construct payload for USER_TRANSFER', () => {
    const payload = service.constrctPayload({ sub_category: 'USER_TRANSFER' })
    expect(payload.requestType).toEqual(['ORG_TRANSFER'])
  })

  it('should handle redirection for category LEARN', () => {
    const notification = {
      category: 'LEARN',
      message: { data: { id: 'abc' } }
    }
    service.handleRedirection(notification, {}, [], null as any)
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/abc'])
  })

  it('should open snackBar for unauthorized content in handleReviewStatus', () => {
    const notification = {
      message: { data: { id: 'xyz' } }
    }
    const environment = {
      portalsForNotifications: { cbp: 'http://test-cbp.com' }
    }
    const snackBar = { open: jest.fn() }

    service.handleReviewStatus({ reviewStatus: 'InReview' }, notification, false, ['SOME_ROLE'], environment, snackBar)
    expect(snackBar.open).toHaveBeenCalledWith('You are not authorized to view this content.')
  })

  it('should open author URL if role includes CONTENT_REVIEWER in handleReviewStatus', () => {
    window.open = jest.fn()
    const notification = {
      message: { data: { id: 'xyz' } }
    }
    const environment = {
      portalsForNotifications: { cbp: 'http://test-cbp.com' }
    }
    const snackBar = { open: jest.fn() }

    service.handleReviewStatus({ reviewStatus: 'InReview' }, notification, true, ['CONTENT_REVIEWER'], environment, snackBar)
    expect(window.open).toHaveBeenCalledWith(
      'http://test-cbp.com/author/editor/xyz/collectionV2?isStandaloneResource=true&preview=true&editMode=true&status=Review&reviewStatus=InReview',
      '_blank'
    )
  })

  it('should open connection page if connection found in getMyRequests', () => {
    const notification = {
      sub_category: 'SEND_CONNECTION_REQUEST',
      message: { data: { id: 'u1' } }
    }

    const snackBar = { open: jest.fn() }
    jest.spyOn(service, 'getMyRequests').mockReturnValue(of([{ userId: 'u1' }]))

    service.handleNetworkRedirection(notification, snackBar)
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/network-v2/connections'])
  })

  it('should show snackbar if connection not found in getMyRequests', () => {
    const notification = {
      sub_category: 'SEND_CONNECTION_REQUEST',
      message: { data: { id: 'u2' } }
    }
    const snackBar = { open: jest.fn() }
    jest.spyOn(service, 'getMyRequests').mockReturnValue(of([{ userId: 'other' }]))

    service.handleNetworkRedirection(notification, snackBar)
    expect(snackBar.open).toHaveBeenCalledWith('This request has been resolved or is no longer available.')
  })

  it('should show snackbar on workflow search error in PROFILE redirection', () => {
    const notification = {
      category: 'PROFILE',
      sub_category: 'PROFILE_VERIFICATION',
      message: { data: { id: 'user1' } }
    }

    const snackBar = { open: jest.fn() }
    jest.spyOn(service, 'searchWorkflowSearch').mockReturnValue(throwError(() => new Error('error')))

    service.handleRedirection(notification, { portalsForNotifications: { mdo: 'http://mdo' } }, [], snackBar)
    expect(snackBar.open).toHaveBeenCalledWith('Error while fetching approval data')
  })
})
